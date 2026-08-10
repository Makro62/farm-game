'use client';

import { logger } from './logger';

// ─── Settings persistence ─────────────────────────────────────────
function loadConfig() {
  return { volume: 0.5, musicVolume: 0.25, enabled: true, musicEnabled: true };
}

// ─── Musical Constants ────────────────────────────────────────────
// Note frequencies (Hz)
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50,
};

// Scales
const MAJOR = [0, 2, 4, 5, 7, 9, 11]; // intervals in semitones
const PENTATONIC = [0, 2, 4, 7, 9];

function noteFreq(root: number, semitones: number): number {
  return root * Math.pow(2, semitones / 12);
}

// ─── Web Audio Synth Engine ───────────────────────────────────────
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

// ─── SFX Definitions ─────────────────────────────────────────────
const SYNTH_SOUNDS: Record<string, (ctx: AudioContext, master: AudioNode) => void> = {
  harvest: (ctx, master) => {
    arpeggio(ctx, master, [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], 'sine', 0.08, 0.12);
  },

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

  sell: (ctx, master) => {
    const t = ctx.currentTime;
    createOsc(ctx, master, 1200, 'sine', t, 0.08, 0.12);
    createOsc(ctx, master, 1500, 'sine', t + 0.06, 0.12, 0.10);
    createOsc(ctx, master, 2400, 'sine', t + 0.1, 0.15, 0.06);
  },

  buy: (ctx, master) => {
    const t = ctx.currentTime;
    createOsc(ctx, master, NOTE.A4, 'sine', t, 0.1, 0.10);
    createOsc(ctx, master, NOTE.C5, 'sine', t + 0.08, 0.12, 0.10);
  },

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

  hover: (ctx, master) => {
    const t = ctx.currentTime;
    createOsc(ctx, master, 1000, 'sine', t, 0.03, 0.04);
  },

  success: (ctx, master) => {
    arpeggio(ctx, master, [NOTE.C5, NOTE.E5, NOTE.G5], 'sine', 0.1, 0.14);
  },

  error: (ctx, master) => {
    const t = ctx.currentTime;
    createOsc(ctx, master, 300, 'square', t, 0.12, 0.08);
    createOsc(ctx, master, 200, 'square', t + 0.1, 0.15, 0.06);
  },

  coin: (ctx, master) => {
    const t = ctx.currentTime;
    createOsc(ctx, master, NOTE.C6, 'sine', t, 0.06, 0.10);
    createOsc(ctx, master, NOTE.E5, 'sine', t + 0.05, 0.08, 0.10);
    createOsc(ctx, master, NOTE.G5, 'sine', t + 0.10, 0.10, 0.08);
  },

  levelup: (ctx, master) => {
    const notes = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6];
    const t = ctx.currentTime;
    notes.forEach((freq, i) => {
      createOsc(ctx, master, freq, 'sine', t + i * 0.12, 0.18, 0.14);
      createOsc(ctx, master, freq * 1.5, 'sine', t + i * 0.12, 0.14, 0.05);
    });
  },

  achievement: (ctx, master) => {
    const t = ctx.currentTime;
    const notes = [NOTE.G4, NOTE.B4, NOTE.D5, NOTE.G5, NOTE.B5];
    notes.forEach((freq, i) => {
      createOsc(ctx, master, freq, 'sine', t + i * 0.1, 0.2, 0.12);
      createOsc(ctx, master, freq * 1.25, 'triangle', t + i * 0.1, 0.15, 0.06);
    });
  },

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

  wheel: (ctx, master) => {
    const t = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const delay = i * 0.06;
      createOsc(ctx, master, 600 + i * 50, 'sine', t + delay, 0.04, 0.08);
    }
  },
};

// ─── Synthesized Music Engine ─────────────────────────────────────
// Generates pleasant background music using Web Audio API oscillators.
// No external MP3 files needed — music is created in real-time.

interface MusicPattern {
  // Melody notes (semitone offsets from root)
  melody: number[];
  // Bass notes (semitone offsets from root)
  bass: number[];
  // Chord notes (semitone offsets from root)
  chords: number[];
  // Tempo in BPM
  tempo: number;
  // Root note frequency
  root: number;
  // Scale intervals
  scale: number[];
  // Bar length (number of melody notes per bar)
  barLength: number;
  // Number of bars before loop
  loopBars: number;
}

const MUSIC_PATTERNS: Record<string, MusicPattern> = {
  farm: {
    // Cheerful farm melody — sunny countryside vibes
    melody: [0, 2, 4, 7, 4, 2, 0, -1, 0, 4, 7, 9, 7, 4, 2, 0],
    bass: [0, 0, 4, 4, 5, 5, 7, 7, 0, 0, 4, 4, 5, 7, 4, 0],
    chords: [0, 4, 7, 4, 0, 4, 7, 4],
    tempo: 120,
    root: NOTE.C4,
    scale: MAJOR,
    barLength: 8,
    loopBars: 2,
  },
  animal: {
    // Warm, cozy animal barn — gentle and nurturing
    melody: [0, 2, 4, 2, 0, 4, 2, 0, 5, 4, 2, 4, 5, 7, 4, 2],
    bass: [0, 0, 4, 4, 7, 7, 4, 4],
    chords: [0, 4, 7, 5],
    tempo: 100,
    root: NOTE.G4,
    scale: MAJOR,
    barLength: 8,
    loopBars: 2,
  },
  mine: {
    // Deep adventurous mine — mysterious and rhythmic
    melody: [0, 3, 5, 7, 5, 3, 0, -1, 0, 5, 7, 10, 7, 5, 3, 0],
    bass: [0, 0, 3, 3, 5, 5, 7, 7],
    chords: [0, 3, 5, 7],
    tempo: 110,
    root: NOTE.A3,
    scale: [0, 2, 3, 5, 7, 8, 10],
    barLength: 8,
    loopBars: 2,
  },
  restaurant: {
    // Upbeat cooking vibes — energetic kitchen
    melody: [0, 4, 7, 4, 0, 5, 7, 5, 0, 4, 7, 12, 7, 4, 0, 2],
    bass: [0, 0, 5, 5, 7, 7, 4, 4],
    chords: [0, 5, 7, 4],
    tempo: 130,
    root: NOTE.C4,
    scale: MAJOR,
    barLength: 8,
    loopBars: 2,
  },
  town: {
    // Peaceful town plaza — community gathering
    melody: [0, 2, 4, 2, 7, 4, 2, 0, 4, 7, 9, 7, 4, 2, 0, -1],
    bass: [0, 0, 4, 4, 5, 5, 7, 7],
    chords: [0, 4, 5, 7],
    tempo: 95,
    root: NOTE.G4,
    scale: MAJOR,
    barLength: 8,
    loopBars: 2,
  },
  museum: {
    // Mysterious ancient artifacts — slow and wonderous
    melody: [0, 3, 7, 5, 3, 0, -1, 0, 7, 5, 3, 0, 5, 3, 0, -1],
    bass: [0, 0, 5, 5, 3, 3, 7, 7],
    chords: [0, 3, 5, 7],
    tempo: 80,
    root: NOTE.C4,
    scale: [0, 2, 3, 5, 7, 8, 10],
    barLength: 8,
    loopBars: 2,
  },
  menu: {
    // Calm, peaceful menu music
    melody: [0, 2, 4, 2, 0, -1, 0, 2, 4, 7, 4, 2, 0, 4, 2, 0],
    bass: [0, 0, 5, 5, 7, 7, 4, 4],
    chords: [0, 5, 7, 4],
    tempo: 90,
    root: NOTE.G4,
    scale: MAJOR,
    barLength: 8,
    loopBars: 2,
  },
  event: {
    // Exciting event music — faster, more energetic
    melody: [0, 4, 7, 12, 7, 4, 0, 5, 7, 12, 14, 12, 7, 5, 0, 4],
    bass: [0, 0, 5, 5, 7, 7, 12, 12],
    chords: [0, 5, 7, 12],
    tempo: 140,
    root: NOTE.C4,
    scale: PENTATONIC,
    barLength: 8,
    loopBars: 2,
  },
};

class SynthMusicPlayer {
  private ctx: AudioContext;
  private dest: AudioNode;
  private gainNode: GainNode;
  private isPlaying = false;
  private currentPattern: string | null = null;
  private nextNoteTime = 0;
  private melodyIndex = 0;
  private bassIndex = 0;
  private chordIndex = 0;
  private barCount = 0;
  private lookAhead = 0.1; // seconds
  private scheduleInterval: ReturnType<typeof setInterval> | null = null;
  private volume = 0.25;

  constructor(ctx: AudioContext, dest: AudioNode) {
    this.ctx = ctx;
    this.dest = dest;
    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);
    this.gainNode.connect(dest);
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  play(patternName: string) {
    const pattern = MUSIC_PATTERNS[patternName];
    if (!pattern) {
      logger.warn(`Unknown music pattern: ${patternName}`);
      return;
    }

    if (this.isPlaying && this.currentPattern === patternName) return;

    this.stop();
    this.isPlaying = true;
    this.currentPattern = patternName;
    this.melodyIndex = 0;
    this.bassIndex = 0;
    this.chordIndex = 0;
    this.barCount = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    // Schedule notes
    this.scheduleInterval = setInterval(() => this.scheduleNotes(), 50);
  }

  stop() {
    this.isPlaying = false;
    this.currentPattern = null;
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }
  }

  fadeOut(duration: number = 1000) {
    if (!this.isPlaying) return;
    this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, duration / 3000);
    setTimeout(() => this.stop(), duration);
  }

  fadeIn(duration: number = 1000) {
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, duration / 3000);
  }

  private scheduleNotes() {
    if (!this.isPlaying || !this.currentPattern) return;

    const pattern = MUSIC_PATTERNS[this.currentPattern];
    const beatDuration = 60 / pattern.tempo;
    const noteDuration = beatDuration * 0.8;

    while (this.nextNoteTime < this.ctx.currentTime + this.lookAhead) {
      // Schedule melody note
      const melodySemitone = pattern.melody[this.melodyIndex % pattern.melody.length];
      if (melodySemitone >= 0) {
        const melodyFreq = noteFreq(pattern.root, pattern.scale[melodySemitone % pattern.scale.length] || 0);
        createOsc(this.ctx, this.gainNode, melodyFreq, 'sine', this.nextNoteTime, noteDuration, 0.08);
        // Add a soft triangle layer for warmth
        createOsc(this.ctx, this.gainNode, melodyFreq * 0.5, 'triangle', this.nextNoteTime, noteDuration * 0.6, 0.03);
      }
      this.melodyIndex++;

      // Schedule bass note (every 2 beats)
      if (this.melodyIndex % 2 === 0) {
        const bassSemitone = pattern.bass[this.bassIndex % pattern.bass.length];
        const bassFreq = noteFreq(pattern.root * 0.5, pattern.scale[bassSemitone % pattern.scale.length] || 0);
        createOsc(this.ctx, this.gainNode, bassFreq, 'triangle', this.nextNoteTime, beatDuration * 1.8, 0.06);
        this.bassIndex++;
      }

      // Schedule chord pad (every bar)
      if (this.melodyIndex % pattern.barLength === 0) {
        const chordRoot = pattern.chords[this.chordIndex % pattern.chords.length];
        const chordNotes = [0, 4, 7].map(interval =>
          noteFreq(pattern.root, (pattern.scale[chordRoot % pattern.scale.length] || 0) + interval)
        );
        chordNotes.forEach(freq => {
          createOsc(this.ctx, this.gainNode, freq, 'sine', this.nextNoteTime, beatDuration * pattern.barLength * 0.9, 0.025, false);
        });
        this.chordIndex++;
        this.barCount++;

        // Loop check
        if (this.barCount >= pattern.loopBars) {
          this.barCount = 0;
          this.melodyIndex = 0;
          this.bassIndex = 0;
          this.chordIndex = 0;
        }
      }

      this.nextNoteTime += beatDuration;
    }
  }

  get isCurrentlyPlaying() {
    return this.isPlaying;
  }
}

// ─── AudioManager ─────────────────────────────────────────────────
class AudioManager {
  config: ReturnType<typeof loadConfig>;
  audioCtx: AudioContext | null;
  masterGain: GainNode | null;
  synthMusic: SynthMusicPlayer | null;
  currentMusicName: string | null;
  initialized: boolean;
  private fadeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.config = loadConfig();
    this.audioCtx = null;
    this.masterGain = null;
    this.synthMusic = null;
    this.currentMusicName = null;
    this.initialized = false;
  }

  initAudioContext() {
    if (this.audioCtx) return;
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AC();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.config.volume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // Initialize synth music player
      this.synthMusic = new SynthMusicPlayer(this.audioCtx, this.masterGain);
    } catch (e) {
      logger.warn('Web Audio API not available:', e);
    }
  }

  ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;
    this.initAudioContext();
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // ─── SFX ──────────────────────────────────────────────
  play(name: string) {
    if (!this.config.enabled) return;
    this.ensureInitialized();
    if (!this.audioCtx || !this.masterGain) return;
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
  playMusic(name: string, fadeDuration = 1000) {
    if (!this.config.musicEnabled) return;
    this.ensureInitialized();

    if (!this.synthMusic) return;

    // If same track is already playing, do nothing
    if (this.currentMusicName === name && this.synthMusic.isCurrentlyPlaying) return;

    // Clear any pending fade timeout
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }

    // Fade out current music
    if (this.synthMusic.isCurrentlyPlaying && this.currentMusicName !== name) {
      this.synthMusic.fadeOut(fadeDuration);
      this.fadeTimeout = setTimeout(() => {
        this.synthMusic?.setVolume(this.config.musicVolume);
        this.synthMusic?.play(name);
        this.currentMusicName = name;
      }, fadeDuration);
    } else {
      // Start immediately
      this.synthMusic.setVolume(this.config.musicVolume);
      this.synthMusic.play(name);
      this.currentMusicName = name;
    }
  }

  stopMusic(fadeDuration = 1000) {
    if (!this.synthMusic?.isCurrentlyPlaying) return;
    this.synthMusic.fadeOut(fadeDuration);
    this.currentMusicName = null;
  }

  pauseMusic() {
    this.synthMusic?.stop();
  }

  resumeMusic() {
    if (this.config.musicEnabled && this.currentMusicName) {
      this.synthMusic?.play(this.currentMusicName);
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
    this.synthMusic?.setVolume(this.config.musicVolume);
  }

  // ─── Toggle ───────────────────────────────────────────
  toggleAll() {
    const newState = !this.config.enabled;
    this.config.enabled = newState;
    this.config.musicEnabled = newState;

    if (!newState) {
      this.stopMusic(300);
    } else {
      this.playMusic(this.currentMusicName || 'menu');
    }
    return newState;
  }

  toggleSound() {
    this.config.enabled = !this.config.enabled;
    return this.config.enabled;
  }

  toggleMusic() {
    this.config.musicEnabled = !this.config.musicEnabled;
    if (!this.config.musicEnabled) {
      this.stopMusic(300);
    } else {
      this.playMusic(this.currentMusicName || 'menu');
    }
    return this.config.musicEnabled;
  }

  // ─── Getters ──────────────────────────────────────────
  getSettings() {
    return { ...this.config };
  }

  isEnabled() {
    return this.config.enabled;
  }

  isMusicEnabled() {
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
        this.playMusic(this.currentMusicName || 'menu');
      } else if (wasEnabled && !settings.musicEnabled) {
        this.stopMusic(300);
      }
    }
  }

  stopAll() {
    this.synthMusic?.stop();
    this.currentMusicName = null;
  }

  unload() {
    this.synthMusic?.stop();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
    this.audioCtx = null;
    this.masterGain = null;
    this.synthMusic = null;
    this.initialized = false;
  }
}

// ─── Singleton ────────────────────────────────────────────────────
export const audioManager = new AudioManager();

// Auto-init on first user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    audioManager.ensureInitialized();
    if (audioManager.isMusicEnabled()) {
      audioManager.playMusic('menu');
    }
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('touchstart', initOnInteraction);
  };
  document.addEventListener('click', initOnInteraction, { once: true });
  document.addEventListener('touchstart', initOnInteraction, { once: true });
}

export default audioManager;
