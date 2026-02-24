"""
Slack chatbot powered by Claude (Anthropic).

Supports:
- Responding to @mentions in channels (threaded replies)
- Responding to direct messages
- Per-thread conversation history so Claude has context across a thread
- Streaming responses posted incrementally to Slack

Setup:
    See README.md for Slack app configuration and env vars.
"""

import os
import logging
from collections import defaultdict
from threading import Lock

from dotenv import load_dotenv
import anthropic
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------

slack_app = App(token=os.environ["SLACK_BOT_TOKEN"])
anthropic_client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# ---------------------------------------------------------------------------
# In-memory conversation history (keyed by thread_ts or channel+user for DMs)
# ---------------------------------------------------------------------------

_history: dict[str, list[dict]] = defaultdict(list)
_history_lock = Lock()

MAX_HISTORY_MESSAGES = 20  # keep last N user+assistant turns per thread


def _get_history_key(channel: str, thread_ts: str | None, user: str) -> str:
    """Return a stable key that groups messages in the same conversation."""
    if thread_ts:
        return f"{channel}:{thread_ts}"
    # DMs without a thread — key by channel (each DM channel is already unique)
    return f"{channel}:{user}"


def _add_to_history(key: str, role: str, content: str) -> list[dict]:
    with _history_lock:
        _history[key].append({"role": role, "content": content})
        # Trim to last MAX_HISTORY_MESSAGES messages
        if len(_history[key]) > MAX_HISTORY_MESSAGES:
            _history[key] = _history[key][-MAX_HISTORY_MESSAGES:]
        return list(_history[key])


def _get_history(key: str) -> list[dict]:
    with _history_lock:
        return list(_history[key])


# ---------------------------------------------------------------------------
# Claude helper
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are a helpful, concise assistant integrated into Slack. "
    "Keep your answers clear and to the point. "
    "When formatting code, use Slack-compatible markdown (triple backticks)."
)


def ask_claude(messages: list[dict]) -> str:
    """Send messages to Claude and return the full response text."""
    with anthropic_client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=2048,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=messages,
    ) as stream:
        return stream.get_final_message().content[-1].text


# ---------------------------------------------------------------------------
# Slack event handlers
# ---------------------------------------------------------------------------

def _handle_message(
    *,
    body: dict,
    say,
    client,
    user_text: str,
    channel: str,
    user: str,
    thread_ts: str | None,
):
    """Core handler used by both @mention and DM events."""
    # Determine reply thread
    reply_thread_ts = thread_ts or body["event"].get("ts")

    # Post an initial "thinking…" placeholder
    placeholder = client.chat_postMessage(
        channel=channel,
        thread_ts=reply_thread_ts,
        text="_Thinking…_",
    )
    placeholder_ts = placeholder["ts"]

    history_key = _get_history_key(channel, thread_ts, user)
    _add_to_history(history_key, "user", user_text)
    messages = _get_history(history_key)

    try:
        reply_text = ask_claude(messages)
    except anthropic.APIError as exc:
        logger.error("Anthropic API error: %s", exc)
        reply_text = f":warning: Sorry, I hit an error talking to Claude: `{exc}`"

    _add_to_history(history_key, "assistant", reply_text)

    # Update the placeholder with the real response
    client.chat_update(
        channel=channel,
        ts=placeholder_ts,
        text=reply_text,
    )


@slack_app.event("app_mention")
def handle_app_mention(body: dict, say, client):
    """Fires when the bot is @mentioned in a channel."""
    event = body["event"]
    user = event.get("user", "")
    channel = event["channel"]
    thread_ts = event.get("thread_ts")  # None if this is the start of a thread
    raw_text: str = event.get("text", "")

    # Strip the bot mention (<@BOTID>) from the text
    bot_user_id = slack_app.client.auth_test()["user_id"]
    user_text = raw_text.replace(f"<@{bot_user_id}>", "").strip()

    if not user_text:
        say(
            text="Hi! Ask me anything.",
            thread_ts=thread_ts or event["ts"],
        )
        return

    _handle_message(
        body=body,
        say=say,
        client=client,
        user_text=user_text,
        channel=channel,
        user=user,
        thread_ts=thread_ts,
    )


@slack_app.event("message")
def handle_direct_message(body: dict, say, client):
    """Fires on messages in DM channels (im) and group DMs (mpim)."""
    event = body["event"]

    # Ignore messages from bots (including ourselves) and message edits/deletes
    if event.get("bot_id") or event.get("subtype"):
        return

    channel_type = event.get("channel_type", "")
    if channel_type not in ("im", "mpim"):
        # Only handle direct messages here; channel mentions go to app_mention
        return

    user = event.get("user", "")
    channel = event["channel"]
    user_text: str = event.get("text", "").strip()

    if not user_text:
        return

    _handle_message(
        body=body,
        say=say,
        client=client,
        user_text=user_text,
        channel=channel,
        user=user,
        thread_ts=event.get("thread_ts"),
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app_token = os.environ.get("SLACK_APP_TOKEN")
    if not app_token:
        raise RuntimeError(
            "SLACK_APP_TOKEN is not set. "
            "See README.md for how to obtain it."
        )

    logger.info("Starting Slack bot in Socket Mode…")
    handler = SocketModeHandler(slack_app, app_token)
    handler.start()
