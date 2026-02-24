/**
 * Interactive configuration for Slack Voice Volume Booster
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const configPath = path.join(__dirname, 'config.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function configure() {
  console.log('Slack Voice Volume Booster - Configuration');
  console.log('==========================================\n');
  console.log('Let\'s make sure you\'re heard loud and clear!\n');

  const inputVolume = await question('Input (microphone) volume (0-150, default 85): ');
  const outputVolume = await question('Output (speaker) volume (0-150, default 100): ');
  const boostLevel = await question('Voice boost level in dB (0-20, default 12): ');
  const enableBoost = await question('Enable auto-boost on startup? (y/n, default y): ');

  const config = {
    inputVolume: parseInt(inputVolume) || 85,
    outputVolume: parseInt(outputVolume) || 100,
    voiceBoost: true,
    boostLevel: parseInt(boostLevel) || 12,
    autoBoost: enableBoost.toLowerCase() !== 'n',
    noiseReduction: {
      enabled: true,
      level: 'moderate'
    },
    echoCancellation: true,
    automaticGainControl: true
  };

  const configContent = `/**
 * Configuration for Slack Voice Volume Booster
 *
 * Adjust these settings to increase your voice volume in Slack calls.
 */

module.exports = {
  // Input (microphone) volume percentage (0-150)
  inputVolume: ${config.inputVolume},

  // Output (speaker) volume percentage (0-150)
  outputVolume: ${config.outputVolume},

  // Enable voice boost for extra volume
  voiceBoost: ${config.voiceBoost},

  // Boost level in dB (recommended: 6-12)
  boostLevel: ${config.boostLevel},

  // Automatically apply boost on startup
  autoBoost: ${config.autoBoost},

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
`;

  fs.writeFileSync(configPath, configContent);

  console.log('\nConfiguration saved!');
  console.log('Your new settings:');
  console.log(`  Input Volume:  ${config.inputVolume}%`);
  console.log(`  Output Volume: ${config.outputVolume}%`);
  console.log(`  Boost Level:   +${config.boostLevel}dB`);
  console.log(`  Auto-boost:    ${config.autoBoost ? 'Enabled' : 'Disabled'}`);
  console.log('\nRun "npm start" to apply these settings.');

  rl.close();
}

configure().catch(err => {
  console.error('Configuration error:', err);
  rl.close();
  process.exit(1);
});
