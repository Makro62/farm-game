import { Howl, Howler } from 'howler';

// Konfigurasi audio
const AUDIO_CONFIG = {
  volume: 0.5,
  musicVolume: 0.3,
  enabled: true,
  musicEnabled: true
};

// Load settings dari localStorage
const savedSettings = JSON.parse(localStorage.getItem('audio-settings') || '{}');
Object.assign(AUDIO_CONFIG, savedSettings);

// Sound definitions
const SOUNDS = {
  // Game actions
  harvest: {
    src: ['/sounds/harvest.mp3'],
    volume: 0.6,
    sprite: {
      default: [0, 400],
      critical: [400, 600]
    }
  },
  
  plant: {
    src: ['/sounds/plant.mp3'],
    volume: 0.5
  },
  
  sell: {
    src: ['/sounds/sell.mp3'],
    volume: 0.7
  },
  
  buy: {
    src: ['/sounds/buy.mp3'],
    volume: 0.6
  },
  
  // UI sounds
  click: {
    src: ['/sounds/click.mp3'],
    volume: 0.4
  },
  
  hover: {
    src: ['/sounds/hover.mp3'],
    volume: 0.3
  },
  
  success: {
    src: ['/sounds/success.mp3'],
    volume: 0.7
  },
  
  error: {
    src: ['/sounds/error.mp3'],
    volume: 0.5
  },
  
  // Rewards
  coin: {
    src: ['/sounds/coin.mp3'],
    volume: 0.6,
    sprite: {
      small: [0, 300],
      medium: [300, 400],
      large: [700, 500]
    }
  },
  
  levelup: {
    src: ['/sounds/levelup.mp3'],
    volume: 0.8
  },
  
  achievement: {
    src: ['/sounds/achievement.mp3'],
    volume: 0.9
  },
  
  // Special
  combo: {
    src: ['/sounds/combo.mp3'],
    volume: 0.7
  },
  
  wheel: {
    src: ['/sounds/wheel.mp3'],
    volume: 0.6
  }
};

// Music definitions
const MUSIC = {
  main: {
    src: ['/music/farm-theme.mp3'],
    volume: AUDIO_CONFIG.musicVolume,
    loop: true
  },
  
  menu: {
    src: ['/music/menu-theme.mp3'],
    volume: AUDIO_CONFIG.musicVolume,
    loop: true
  },
  
  event: {
    src: ['/music/event-theme.mp3'],
    volume: AUDIO_CONFIG.musicVolume,
    loop: true
  }
};

class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = {};
    this.currentMusic = null;
    this.initialized = false;
  }
  
  // Initialize semua sounds
  init() {
    if (this.initialized) return;
    
    // Load sounds
    Object.entries(SOUNDS).forEach(([name, config]) => {
      this.sounds[name] = new Howl({
        ...config,
        volume: config.volume * AUDIO_CONFIG.volume,
        onload: () => console.log(`✓ Sound loaded: ${name}`),
        onloaderror: (_, err) => console.error(`✗ Sound error: ${name}`, err)
      });
    });
    
    // Load music
    Object.entries(MUSIC).forEach(([name, config]) => {
      this.music[name] = new Howl({
        ...config,
        volume: config.volume,
        onload: () => console.log(`✓ Music loaded: ${name}`),
        onloaderror: (_, err) => console.error(`✗ Music error: ${name}`, err)
      });
    });
    
    this.initialized = true;
    console.log('🎵 Audio Manager initialized');
  }
  
  // Play sound effect
  play(name, sprite = null) {
    if (!AUDIO_CONFIG.enabled) return;
    
    const sound = this.sounds[name];
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return;
    }
    
    if (sprite && sound.sprite) {
      sound.play(sprite);
    } else {
      sound.play();
    }
    
    return sound;
  }
  
  // Play music
  playMusic(name, fadeDuration = 1000) {
    if (!AUDIO_CONFIG.musicEnabled) return;
    
    const music = this.music[name];
    if (!music) {
      console.warn(`Music not found: ${name}`);
      return;
    }
    
    // Stop current music with fade
    if (this.currentMusic && this.currentMusic !== music) {
      this.currentMusic.fade(AUDIO_CONFIG.musicVolume, 0, fadeDuration);
      setTimeout(() => {
        this.currentMusic.pause();
      }, fadeDuration);
    }
    
    // Play new music
    music.play();
    music.fade(0, AUDIO_CONFIG.musicVolume, fadeDuration);
    this.currentMusic = music;
    
    return music;
  }
  
  // Stop music
  stopMusic(fadeDuration = 1000) {
    if (this.currentMusic) {
      this.currentMusic.fade(AUDIO_CONFIG.musicVolume, 0, fadeDuration);
      setTimeout(() => {
        this.currentMusic.pause();
        this.currentMusic = null;
      }, fadeDuration);
    }
  }
  
  // Pause music
  pauseMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }
  
  // Resume music
  resumeMusic() {
    if (this.currentMusic) {
      this.currentMusic.play();
    }
  }
  
  // Set volume
  setVolume(volume) {
    AUDIO_CONFIG.volume = Math.max(0, Math.min(1, volume));
    Howler.volume(AUDIO_CONFIG.volume);
    this.saveSettings();
  }
  
  // Set music volume
  setMusicVolume(volume) {
    AUDIO_CONFIG.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume(AUDIO_CONFIG.musicVolume);
    }
    this.saveSettings();
  }
  
  // Toggle sound
  toggleSound() {
    AUDIO_CONFIG.enabled = !AUDIO_CONFIG.enabled;
    this.saveSettings();
    return AUDIO_CONFIG.enabled;
  }
  
  // Toggle music
  toggleMusic() {
    AUDIO_CONFIG.musicEnabled = !AUDIO_CONFIG.musicEnabled;
    if (!AUDIO_CONFIG.musicEnabled) {
      this.stopMusic();
    } else if (this.currentMusic) {
      this.resumeMusic();
    }
    this.saveSettings();
    return AUDIO_CONFIG.musicEnabled;
  }
  
  // Save settings
  saveSettings() {
    localStorage.setItem('audio-settings', JSON.stringify(AUDIO_CONFIG));
  }
  
  // Get settings
  getSettings() {
    return { ...AUDIO_CONFIG };
  }
  
  // Stop all sounds
  stopAll() {
    Howler.stop();
  }
  
  // Unload all sounds (cleanup)
  unload() {
    Object.values(this.sounds).forEach(sound => sound.unload());
    Object.values(this.music).forEach(music => music.unload());
    this.sounds = {};
    this.music = {};
    this.initialized = false;
  }
}

// Singleton instance
export const audioManager = new AudioManager();

// Initialize on import
if (typeof window !== 'undefined') {
  audioManager.init();
}

export default audioManager;
