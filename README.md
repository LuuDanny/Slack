# Slack Claude Chatbot

A Slack bot powered by [Claude](https://www.anthropic.com/claude) (Anthropic).
Uses **Socket Mode** so no public URL or reverse proxy is needed.

## Features

- Responds to `@mention`s in channels (replies in the same thread)
- Responds to direct messages (DMs) and group DMs
- Maintains per-thread conversation history so Claude has context
- Streams Claude's response, posting it once complete

---

## 1. Create a Slack App

1. Go to <https://api.slack.com/apps> → **Create New App** → **From scratch**.
2. Give it a name and pick your workspace.

### Bot Token Scopes (OAuth & Permissions)

Add these **Bot Token Scopes**:

| Scope | Reason |
|---|---|
| `app_mentions:read` | Receive @mention events |
| `channels:history` | Read channel messages |
| `chat:write` | Post messages |
| `groups:history` | Read private-channel messages |
| `im:history` | Read DM messages |
| `im:read` | Receive DM events |
| `mpim:history` | Read group DM messages |
| `mpim:read` | Receive group DM events |

Click **Install to Workspace** and copy the **Bot User OAuth Token** (`xoxb-…`).

### Enable Socket Mode

1. **Socket Mode** (left sidebar) → Enable Socket Mode.
2. Create an **App-Level Token** with the `connections:write` scope → copy the token (`xapp-…`).

### Subscribe to Events (Event Subscriptions)

Enable **Event Subscriptions** and subscribe to these **Bot Events**:

- `app_mention`
- `message.im`
- `message.mpim`

Save changes and reinstall the app if prompted.

---

## 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env and fill in the three values
```

| Variable | Where to find it |
|---|---|
| `SLACK_BOT_TOKEN` | OAuth & Permissions → Bot User OAuth Token |
| `SLACK_APP_TOKEN` | Basic Information → App-Level Tokens |
| `ANTHROPIC_API_KEY` | <https://console.anthropic.com/> |

---

## 3. Install Dependencies & Run

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The bot connects via Socket Mode — no port-forwarding or public URL needed.

---

## Usage

**In a channel:** `@YourBot What is the capital of France?`

**In a DM:** Just send a message directly to the bot.

The bot replies in a thread and maintains conversation context per thread.

---

## Architecture

```
Slack ──(Socket Mode)──► slack_bolt
                              │
                    app_mention / message events
                              │
                         app.py
                              │
                    anthropic.Anthropic.messages.stream
                              │
                         Claude claude-opus-4-6
```

Conversation history is stored in memory (per thread). Restart the process to clear it. For persistence across restarts, replace `_history` with a database.
