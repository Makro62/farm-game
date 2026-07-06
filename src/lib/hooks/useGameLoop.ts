'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/store';

interface GameLoopConfig {
  tickRate?: number; // ms per tick
  enabled?: boolean;
}

/**
 * Custom hook untuk game loop yang terpisah dari React render cycle.
 * Menggunakan requestAnimationFrame dan useRef untuk menghindari re-render berlebihan.
 */
export function useGameLoop(config: GameLoopConfig = {}) {
  const { tickRate = 1000, enabled = true } = config;
  const [isRunning, setIsRunning] = useState(false);
  const lastTickRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const storeRef = useRef(useGameStore.getState());

  // Update store reference tanpa trigger re-render
  const getStore = useCallback(() => useGameStore.getState(), []);

  // Tick function - dipanggil setiap interval
  const tick = useCallback((timestamp: number) => {
    if (!enabled) return;

    if (timestamp - lastTickRef.current >= tickRate) {
      lastTickRef.current = timestamp;
      
      const state = getStore();
      
      // Panggil fungsi update game state
      if (state.advanceSeasonTick) state.advanceSeasonTick();
      if (state.changeWeather) state.changeWeather();
      if (state.syncMiningNodes) state.syncMiningNodes();
      if (state.syncPlots) state.syncPlots();
    }

    animationFrameIdRef.current = requestAnimationFrame(tick);
  }, [enabled, tickRate, getStore]);

  // Start game loop
  const start = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    lastTickRef.current = performance.now();
    animationFrameIdRef.current = requestAnimationFrame(tick);
    
    console.log('🎮 Game loop started');
  }, [isRunning, tick]);

  // Stop game loop
  const stop = useCallback(() => {
    if (!isRunning || !animationFrameIdRef.current) return;
    
    cancelAnimationFrame(animationFrameIdRef.current);
    animationFrameIdRef.current = null;
    setIsRunning(false);
    
    console.log('⏸️ Game loop stopped');
  }, [isRunning]);

  // Toggle game loop
  const toggle = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  // Auto-start/stop based on enabled flag
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [enabled, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    start,
    stop,
    toggle,
    tick: () => {
      const state = getStore();
      if (state.advanceSeasonTick) state.advanceSeasonTick();
      if (state.changeWeather) state.changeWeather();
      if (state.syncMiningNodes) state.syncMiningNodes();
      if (state.syncPlots) state.syncPlots();
    }
  };
}

/**
 * Hook untuk auto-save dengan debouncing
 * Mencegah penyimpanan terlalu sering ke localStorage
 */
export function useAutoSave(debounceMs: number = 30000) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasChangesRef = useRef(false);

  const save = useCallback(() => {
    // Zustand persist middleware akan otomatis menyimpan
    // Kita hanya perlu track kapan terakhir save
    setLastSaved(new Date());
    console.log('💾 Game saved');
    hasChangesRef.current = false;
  }, []);

  // Schedule save dengan debounce
  const scheduleSave = useCallback(() => {
    hasChangesRef.current = true;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);
  }, [debounceMs, save]);

  // Save immediately (misal saat beforeunload)
  const saveImmediate = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    save();
  }, [save]);

  // Setup listener untuk visibility change dan beforeunload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasChangesRef.current) {
        saveImmediate();
        console.log('💾 Game saved on tab switch');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        saveImmediate();
        console.log('💾 Game saved before unload');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveImmediate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    lastSaved,
    scheduleSave,
    saveImmediate,
    hasChanges: hasChangesRef.current
  };
}
