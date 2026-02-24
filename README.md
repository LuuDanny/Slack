# Slack Voice Volume Booster

A utility to increase and manage voice volume settings for Slack calls and huddles.

## The Problem

"So I have to be louder to get your attention?"

No! Let the software handle that for you.

## Features

- **Volume Boost**: Increase your voice volume beyond standard levels
- **Configurable Settings**: Adjust input/output volumes and boost levels
- **Audio Optimization**: Built-in noise reduction and echo cancellation settings
- **Automatic Gain Control**: Maintains consistent volume levels

## Quick Start

```bash
# Install and run
npm start

# Configure your settings interactively
npm run configure
```

## Configuration

Edit `src/config.js` to adjust your settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `inputVolume` | 85 | Microphone volume (0-150%) |
| `outputVolume` | 100 | Speaker volume (0-150%) |
| `voiceBoost` | true | Enable volume amplification |
| `boostLevel` | 12 | Boost amount in dB (6-12 recommended) |
| `autoBoost` | true | Apply boost automatically on startup |

## Tips for Being Heard

1. **Microphone Position**: Keep your mic 6-12 inches from your mouth
2. **Use Headphones**: Prevents echo and feedback
3. **Enable Noise Cancellation**: In Slack's audio settings
4. **Close Background Apps**: Reduces audio conflicts
5. **Check Your Input Device**: Make sure Slack is using the right microphone

## Usage

```javascript
const VolumeManager = require('./src/volume-manager');
const config = require('./src/config');

const manager = new VolumeManager(config);

// Get recommended settings
const recommended = manager.getRecommendedSettings();
console.log(recommended);

// Apply volume boost
const result = await manager.applyBoost();
console.log(`Volume boosted to ${result.newLevel}%`);
```

## License

MIT
