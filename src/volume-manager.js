/**
 * VolumeManager - Handles voice volume adjustments for Slack
 */

class VolumeManager {
  constructor(config) {
    this.config = config;
    this.defaultInputVolume = 75;
    this.defaultOutputVolume = 80;
    this.maxVolume = 150; // Allow boost beyond 100%
  }

  /**
   * Get current volume settings
   */
  getCurrentSettings() {
    return {
      inputVolume: this.config.inputVolume || this.defaultInputVolume,
      outputVolume: this.config.outputVolume || this.defaultOutputVolume,
      voiceBoost: this.config.voiceBoost || false,
      boostLevel: this.config.boostLevel || 6
    };
  }

  /**
   * Apply volume boost for better voice clarity
   */
  async applyBoost() {
    const settings = this.getCurrentSettings();

    if (!settings.voiceBoost) {
      return { success: false, error: 'Voice boost is disabled in config' };
    }

    const boostMultiplier = 1 + (settings.boostLevel / 20);
    let newOutputLevel = Math.round(settings.outputVolume * boostMultiplier);

    // Cap at maximum volume
    if (newOutputLevel > this.maxVolume) {
      newOutputLevel = this.maxVolume;
    }

    // Simulate applying the boost (in real implementation, this would
    // interface with system audio APIs or Slack's audio settings)
    return {
      success: true,
      previousLevel: settings.outputVolume,
      newLevel: newOutputLevel,
      boostApplied: settings.boostLevel
    };
  }

  /**
   * Set input (microphone) volume
   */
  setInputVolume(level) {
    if (level < 0 || level > this.maxVolume) {
      throw new Error(`Volume must be between 0 and ${this.maxVolume}`);
    }
    this.config.inputVolume = level;
    return level;
  }

  /**
   * Set output (speaker) volume
   */
  setOutputVolume(level) {
    if (level < 0 || level > this.maxVolume) {
      throw new Error(`Volume must be between 0 and ${this.maxVolume}`);
    }
    this.config.outputVolume = level;
    return level;
  }

  /**
   * Enable or disable voice boost
   */
  setVoiceBoost(enabled, level = 6) {
    this.config.voiceBoost = enabled;
    this.config.boostLevel = level;
    return { enabled, level };
  }

  /**
   * Get recommended settings for being heard clearly
   */
  getRecommendedSettings() {
    return {
      inputVolume: 85,
      outputVolume: 100,
      voiceBoost: true,
      boostLevel: 12,
      tips: [
        'Position your microphone 6-12 inches from your mouth',
        'Enable noise cancellation in Slack settings',
        'Use headphones to prevent echo',
        'Close background applications that might use audio'
      ]
    };
  }
}

module.exports = VolumeManager;
