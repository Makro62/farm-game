'use client';

import { Howl, Howler } from 'howler';

export interface AudioConfig {
  volume: number;
  musicVolume: number;
  enabled: boolean;
  musicEnabled: boolean;
}

interface SoundConfig {
  src: string[];
  volume?: number;
  sprite?: Record<string, [number, number]>;
  loop?: boolean;
}

export type SoundName = 
  | 'harvest' | 'plant' | 'sell' | 'buy' 
  | 'click' | 'hover' | 'success' | 'error' 
  | 'coin' | 'levelup' | 'achievement' | 'combo' | 'wheel';

export type MusicName = 'main' | 'menu' | 'event';

const getInitialConfig = (): AudioConfig => {
  if (typeof window === 'undefined') {
    return { volume: 0.5, musicVolume: 0.3, enabled: true, musicEnabled: true };
  }
  const savedSettings = JSON.parse(localStorage.getItem('audio-settings') || '{}');
  return {
    volume: savedSettings.volume ?? 0.5,
    musicVolume: savedSettings.musicVolume ?? 0.3,
    enabled: savedSettings.enabled ?? true,
    musicEnabled: savedSettings.musicEnabled ?? true
  };
};

let AUDIO_CONFIG = getInitialConfig();

const SOUNDS: Record<SoundName, SoundConfig> = {
  harvest: { src: ['/sounds/harvest.mp3'], volume: 0.6, sprite: { default: [0, 400], critical: [400, 600] } },
  plant: { src: ['/sounds/plant.mp3'], volume: 0.5 },
  sell: { src: ['/sounds/sell.mp3'], volume: 0.7 },
  buy: { src: ['/sounds/buy.mp3'], volume: 0.6 },
  click: { src: ['/sounds/click.mp3'], volume: 0.4 },
  hover: { src: ['/sounds/hover.mp3'], volume: 0.3 },
  success: { src: ['/sounds/success.mp3'], volume: 0.7 },
  error: { src: ['/sounds/error.mp3'], volume: 0.5 },
  coin: { src: ['/sounds/coin.mp3'], volume: 0.6, sprite: { small: [0, 300], medium: [300, 400], large: [700, 500] } },
  levelup: { src: ['/sounds/levelup.mp3'], volume: 0.8 },
  achievement: { src: ['/sounds/achievement.mp3'], volume: 0.9 },
  combo: { src: ['/sounds/combo.mp3'], volume: 0.7 },
  wheel: { src: ['/sounds/wheel.mp3'], volume: 0.6 }
};

const MUSIC: Record<MusicName, SoundConfig> = {
  main: { src: ['/music/farm-theme.mp3'], volume: AUDIO_CONFIG.musicVolume, loop: true },
  menu: { src: ['/music/menu-theme.mp3'], volume: AUDIO_CONFIG.musicVolume, loop: true },
  event: { src: ['/music/event-theme.mp3'], volume: AUDIO_CONFIG.musicVolume, loop: true }
};

class AudioManager {
  private sounds: Record<string, Howl> = {};
  private music: Record<string, Howl> = {};
  private currentMusic: Howl | null = null;
  private initialized = false;
  private userInteracted = false;

  init() {
    if (this.initialized) return;
    Object.entries(SOUNDS).forEach(([name, config]) => {
      this.sounds[name] = new Howl({
        ...config,
        volume: (config.volume ?? 1) * AUDIO_CONFIG.volume,
        onload: () => console.log(`✓ Sound loaded: ${name}`),
        onloaderror: (_, err) => console.error(`✗ Sound error: ${name}`, err)
      });
    });
    Object.entries(MUSIC).forEach(([name, config]) => {
      this.music[name] = new Howl({
        ...config,
        volume: config.volume ?? AUDIO_CONFIG.musicVolume,
        onload: () => console.log(`✓ Music loaded: ${name}`),
        onloaderror: (_, err) => console.error(`✗ Music error: ${name}`, err)
      });
    });
    this.initialized = true;
    console.log('🎵 Audio Manager initialized');
  }

  ensureInitialized() {
    if (!this.userInteracted) {
      this.userInteracted = true;
      this.init();
    }
  }

  play(name: SoundName, sprite: string | null = null) {
    this.ensureInitialized();
    if (!AUDIO_CONFIG.enabled) return;
    const sound = this.sounds[name];
    if (!sound) { console.warn(`Sound not found: ${name}`); return; }
    if (sprite && sound.sprite()) { sound.play(sprite); } else { sound.play(); }
    return sound;
  }

  playMusic(name: MusicName, fadeDuration = 1000) {
    this.ensureInitialized();
    if (!AUDIO_CONFIG.musicEnabled) return;
    const music = this.music[name];
    if (!music) { console.warn(`Music not found: ${name}`); return; }
    if (this.currentMusic && this.currentMusic !== music) {
      this.currentMusic.fade(AUDIO_CONFIG.musicVolume, 0, fadeDuration);
      setTimeout(() => this.currentMusic?.pause(), fadeDuration);
    }
    music.play();
    music.fade(0, AUDIO_CONFIG.musicVolume, fadeDuration);
    this.currentMusic = music;
    return music;
  }

  stopMusic(fadeDuration = 1000) {
    if (this.currentMusic) {
      this.currentMusic.fade(AUDIO_CONFIG.musicVolume, 0, fadeDuration);
      setTimeout(() => { this.currentMusic?.pause(); this.currentMusic = null; }, fadeDuration);
    }
  }

  pauseMusic() { this.currentMusic?.pause(); }
  resumeMusic() { this.currentMusic?.play(); }

  setVolume(volume: number) {
    AUDIO_CONFIG.volume = Math.max(0, Math.min(1, volume));
    Howler.volume(AUDIO_CONFIG.volume);
    this.saveSettings();
  }

  setMusicVolume(volume: number) {
    AUDIO_CONFIG.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) { this.currentMusic.volume(AUDIO_CONFIG.musicVolume); }
    this.saveSettings();
  }

  toggleSound(): boolean {
    AUDIO_CONFIG.enabled = !AUDIO_CONFIG.enabled;
    this.saveSettings();
    return AUDIO_CONFIG.enabled;
  }

  toggleMusic(): boolean {
    AUDIO_CONFIG.musicEnabled = !AUDIO_CONFIG.musicEnabled;
    if (!AUDIO_CONFIG.musicEnabled) { this.stopMusic(); }
    else if (this.currentMusic) { this.resumeMusic(); }
    this.saveSettings();
    return AUDIO_CONFIG.musicEnabled;
  }

  private saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio-settings', JSON.stringify(AUDIO_CONFIG));
    }
  }

  getSettings() { return { ...AUDIO_CONFIG }; }
  stopAll() { Howler.stop(); }

  unload() {
    Object.values(this.sounds).forEach(sound => sound.unload());
    Object.values(this.music).forEach(music => music.unload());
    this.sounds = {};
    this.music = {};
    this.initialized = false;
  }
}

export const audioManager = new AudioManager();

if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    audioManager.ensureInitialized();
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('touchstart', initOnInteraction);
  };
  document.addEventListener('click', initOnInteraction, { once: true });
  document.addEventListener('touchstart', initOnInteraction, { once: true });
}

export default audioManager;
