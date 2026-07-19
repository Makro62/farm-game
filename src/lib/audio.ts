'use client';

import { Howl, Howler } from 'howler';
import { logger } from './logger';

// ─── Types ────────────────────────────────────────────────────────
export interface AudioConfig {
  volume: number;
  musicVolume: number;
  enabled: boolean;      // SFX enabled
  musicEnabled: boolean; // Music enabled
}

export type SoundName =
  | 'harvest' | 'plant' | 'sell' | 'buy'
  | 'click' | 'hover' | 'success' | 'error'
  | 'coin' | 'levelup' | 'achievement' | 'combo' | 'wheel';

export type MusicName = 'main' | 'menu' | 'event';

// ─── Settings persistence ─────────────────────────────────────────
// Settings are now managed by Zustand store persist.
// AudioManager reads from a config object passed in or uses defaults.
function loadConfig(): AudioConfig {
  return { volume: 0.5, musicVolume: 0.25, enabled: true, musicEnabled: true };
}

// ─── Web Audio Synth Engine ───────────────────────────────────────
// Each sound is synthesized on-the-fly using Web Audio API oscillators,
// gain envelopes and filters. No external audio files needed.

type SynthFn = (ctx: AudioContext, masterGain: GainNode) => void;

function createOsc(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  volume: number,
  fadeOut = true,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  }
  osc.connect(gain);
  gain.connect(dest);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

// Arpeggio helper
function arpeggio(
  ctx: AudioContext,
  dest: AudioNode,
  notes: number[],
  type: OscillatorType,
  noteLen: number,
  volume: number,
  startOffset = 0,
) {
  const t = ctx.currentTime + startOffset;
  notes.forEach((freq, i) => {
    createOsc(ctx, dest, freq, type, t + i * noteLen, noteLen * 1.2, volume);
  });
}

const SYNTH_SOUNDS: Record<SoundName, SynthFn> = {
  // 🌾 Harvest — cheerful ascending arpeggio
  harvest: (ctx, master) => {
    arpeggio(ctx, master, [523, 659, 784, 1047], 'sine', 0.08, 0.12);
  },

  // 🌱 Plant — soft bubbly pop
  plant: (ctx, master) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.12);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.16);
  },

  // 💰 Sell — cash register ka-ching
  sell: (ctx, master) => {
    const t = ctx.currentTime;
    // Bright bell
    createOsc(ctx, master, 1200, 'sine', t, 0.08, 0.12);
    createOsc(ctx, master, 1500, 'sine', t + 0.06, 0.12, 0.10);
    // Coin jingle
    createOsc(ctx, master, 2400, 'sine', t + 0.1, 0.15, 0.06);
  },

  // 🛒 Buy — soft confirmation
  buy: (ctx, master) => {
    const t = ctx.currentTime;
    createOsc(ctx, master, 440, 'sine', t, 0.1, 0.10);
    createOsc(ctx, master, 554, 'sine', t + 0.08, 0.12, 0.10);
  },

  // 👆 Click — subtle tap
  click: (ctx, master) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(500, t + 0.04);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.06);
  },

  // Hover — very soft tick
  hover: (ctx, master) => {
    const t = ctx.currentTime;
    createOsc(ctx, master, 1000, 'sine', t, 0.03, 0.04);
  },

  // ✅ Success — triumphant 3-note
  success: (ctx, master) => {
    arpeggio(ctx, master, [523, 659, 784], 'sine', 0.1, 0.14);
  },

  // ❌ Error — descending buzz
  error: (ctx, master) => {
    const t = ctx.currentTime;
    createOsc(ctx, master, 300, 'square', t, 0.12, 0.08);
    createOsc(ctx, master, 200, 'square', t + 0.1, 0.15, 0.06);
  },

  // 🪙 Coin — bright jingle
  coin: (ctx, master) => {
    const t = ctx.currentTime;
    createOsc(ctx, master, 1047, 'sine', t, 0.06, 0.10);
    createOsc(ctx, master, 1319, 'sine', t + 0.05, 0.08, 0.10);
    createOsc(ctx, master, 1568, 'sine', t + 0.10, 0.10, 0.08);
  },

  // 🎉 Level Up — epic 4-note fanfare
  levelup: (ctx, master) => {
    const notes = [523, 659, 784, 1047];
    const t = ctx.currentTime;
    notes.forEach((freq, i) => {
      createOsc(ctx, master, freq, 'sine', t + i * 0.12, 0.18, 0.14);
      // Harmony layer
      createOsc(ctx, master, freq * 1.5, 'sine', t + i * 0.12, 0.14, 0.05);
    });
  },

  // 🏆 Achievement — celebration fanfare
  achievement: (ctx, master) => {
    const t = ctx.currentTime;
    const notes = [392, 494, 587, 784, 988];
    notes.forEach((freq, i) => {
      createOsc(ctx, master, freq, 'sine', t + i * 0.1, 0.2, 0.12);
      createOsc(ctx, master, freq * 1.25, 'triangle', t + i * 0.1, 0.15, 0.06);
    });
  },

  // ⚡ Combo — power-up whoosh
  combo: (ctx, master) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.setValueAtTime(0.10, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.22);
  },

  // 🎡 Wheel — ratchet spin ticking
  wheel: (ctx, master) => {
    const t = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const delay = i * 0.06;
      createOsc(ctx, master, 600 + i * 50, 'sine', t + delay, 0.04, 0.08);
    }
  },
};

// ─── Music config ─────────────────────────────────────────────────
const MUSIC_TRACKS: Record<MusicName, string> = {
  main: '/music/farm-theme.mp3',
  menu: '/music/menu-theme.mp3',
  event: '/music/event-theme.mp3',
};

// ─── AudioManager ─────────────────────────────────────────────────
class AudioManager {
  private config: AudioConfig;
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicTracks: Partial<Record<MusicName, Howl>> = {};
  private currentMusicName: MusicName | null = null;
  private currentMusic: Howl | null = null;
  private initialized = false;

  constructor() {
    this.config = loadConfig();
  }

  // Lazy-init Web Audio context (must happen after user gesture)
  private initAudioContext() {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.config.volume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    } catch (e) {
      logger.warn('Web Audio API not available:', e);
    }
  }

  // Lazy-init a single Howl for a music track
  private getMusicTrack(name: MusicName): Howl {
    if (!this.musicTracks[name]) {
      this.musicTracks[name] = new Howl({
        src: [MUSIC_TRACKS[name]],
        loop: true,
        volume: this.config.musicVolume,
        html5: true, // streaming, no full preload
      });
    }
    return this.musicTracks[name]!;
  }

  /** Call once on first user interaction to unlock audio */
  ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;
    this.initAudioContext();
    // Resume suspended context (browser autoplay policy)
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // ─── SFX ──────────────────────────────────────────────

  play(name: SoundName) {
    if (!this.config.enabled) return;
    this.ensureInitialized();
    if (!this.audioCtx || !this.masterGain) return;
    // Resume if needed
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    const synthFn = SYNTH_SOUNDS[name];
    if (synthFn) {
      try {
        synthFn(this.audioCtx, this.masterGain);
      } catch (e) {
        logger.warn(`SFX error [${name}]:`, e);
      }
    }
  }

  // ─── Music ────────────────────────────────────────────

  playMusic(name: MusicName, fadeDuration = 1000) {
    if (!this.config.musicEnabled) return;
    this.ensureInitialized();

    const track = this.getMusicTrack(name);

    // If same track is already playing, do nothing
    if (this.currentMusicName === name && track.playing()) return;

    // Fade out current music
    if (this.currentMusic && this.currentMusic !== track) {
      const old = this.currentMusic;
      old.fade(this.config.musicVolume, 0, fadeDuration);
      setTimeout(() => old.pause(), fadeDuration);
    }

    // Fade in new track
    track.volume(0);
    track.play();
    track.fade(0, this.config.musicVolume, fadeDuration);

    this.currentMusic = track;
    this.currentMusicName = name;
  }

  stopMusic(fadeDuration = 1000) {
    if (!this.currentMusic) return;
    const music = this.currentMusic;
    music.fade(this.config.musicVolume, 0, fadeDuration);
    setTimeout(() => {
      music.pause();
    }, fadeDuration);
    this.currentMusic = null;
    this.currentMusicName = null;
  }

  pauseMusic() {
    this.currentMusic?.pause();
  }

  resumeMusic() {
    if (this.config.musicEnabled && this.currentMusic) {
      this.currentMusic.play();
    }
  }

  // ─── Volume controls ─────────────────────────────────

  setVolume(volume: number) {
    this.config.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.config.volume, this.audioCtx.currentTime);
    }
  }

  setMusicVolume(volume: number) {
    this.config.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume(this.config.musicVolume);
    }
  }

  // ─── Toggle ───────────────────────────────────────────

  /** Toggle ALL audio (SFX + Music). Returns new enabled state. */
  toggleAll(): boolean {
    const newState = !this.config.enabled;
    this.config.enabled = newState;
    this.config.musicEnabled = newState;

    if (!newState) {
      this.stopMusic(300);
    } else {
      // Re-start background music
      this.playMusic(this.currentMusicName || 'main');
    }

    return newState;
  }

  toggleSound(): boolean {
    this.config.enabled = !this.config.enabled;
    return this.config.enabled;
  }

  toggleMusic(): boolean {
    this.config.musicEnabled = !this.config.musicEnabled;
    if (!this.config.musicEnabled) {
      this.stopMusic(300);
    } else {
      this.playMusic(this.currentMusicName || 'main');
    }
    return this.config.musicEnabled;
  }

  // ─── Getters ──────────────────────────────────────────

  getSettings(): AudioConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  isMusicEnabled(): boolean {
    return this.config.musicEnabled;
  }

  syncFromStore(settings: { soundEnabled?: boolean; musicEnabled?: boolean }) {
    if (settings.soundEnabled !== undefined) {
      this.config.enabled = settings.soundEnabled;
    }
    if (settings.musicEnabled !== undefined) {
      const wasEnabled = this.config.musicEnabled;
      this.config.musicEnabled = settings.musicEnabled;
      if (!wasEnabled && settings.musicEnabled) {
        this.playMusic(this.currentMusicName || 'main');
      } else if (wasEnabled && !settings.musicEnabled) {
        this.stopMusic(300);
      }
    }
  }

  stopAll() {
    Howler.stop();
  }

  unload() {
    Object.values(this.musicTracks).forEach(track => track?.unload());
    this.musicTracks = {};
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
    this.audioCtx = null;
    this.masterGain = null;
    this.initialized = false;
  }
}

// ─── Singleton ────────────────────────────────────────────────────
export const audioManager = new AudioManager();

// Auto-init on first user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    audioManager.ensureInitialized();
    // Only auto-play music if enabled
    if (audioManager.isMusicEnabled()) {
      audioManager.playMusic('main');
    }
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('touchstart', initOnInteraction);
  };
  document.addEventListener('click', initOnInteraction, { once: true });
  document.addEventListener('touchstart', initOnInteraction, { once: true });
}

export default audioManager;
