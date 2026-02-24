/**
 * Configuration for Slack Voice Volume Booster
 *
 * Adjust these settings to increase your voice volume in Slack calls.
 */

module.exports = {
  // Input (microphone) volume percentage (0-150)
  inputVolume: 85,

  // Output (speaker) volume percentage (0-150)
  outputVolume: 100,

  // Enable voice boost for extra volume
  voiceBoost: true,

  // Boost level in dB (recommended: 6-12)
  boostLevel: 12,

  // Automatically apply boost on startup
  autoBoost: true,

  // Noise reduction settings
  noiseReduction: {
    enabled: true,
    level: 'moderate' // 'low', 'moderate', 'high'
  },

  // Echo cancellation
  echoCancellation: true,

  // Automatic gain control - helps maintain consistent volume
  automaticGainControl: true
};
