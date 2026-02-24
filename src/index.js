/**
 * Slack Voice Volume Booster
 *
 * A utility to manage and increase voice volume settings for Slack
 * calls and huddles.
 */

const VolumeManager = require('./volume-manager');
const config = require('./config');

async function main() {
  console.log('Slack Voice Volume Booster');
  console.log('==========================\n');

  const volumeManager = new VolumeManager(config);

  // Display current settings
  const currentSettings = volumeManager.getCurrentSettings();
  console.log('Current Volume Settings:');
  console.log(`  Input Volume:  ${currentSettings.inputVolume}%`);
  console.log(`  Output Volume: ${currentSettings.outputVolume}%`);
  console.log(`  Voice Boost:   ${currentSettings.voiceBoost ? 'Enabled' : 'Disabled'}`);
  console.log(`  Boost Level:   +${currentSettings.boostLevel}dB\n`);

  // Apply volume boost
  if (config.autoBoost) {
    console.log('Applying voice volume boost...');
    const result = await volumeManager.applyBoost();

    if (result.success) {
      console.log(`Voice volume increased to ${result.newLevel}%`);
      console.log('You should now be heard loud and clear!');
    } else {
      console.log(`Could not apply boost: ${result.error}`);
    }
  }

  console.log('\nTip: Run "npm run configure" to adjust your volume settings.');
}

main().catch(console.error);
