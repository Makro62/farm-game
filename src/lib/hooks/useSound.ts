'use client';

import { useCallback } from 'react';
import audioManager from '@/lib/audio';

/**
 * Hook to play a synthesized SFX.
 * Respects the global audio enabled state managed by AudioManager.
 */
export function useSound(soundName) {
  const play = useCallback(() => {
    audioManager.play(soundName);
  }, [soundName]);

  return { play };
}

// Pre-defined sound hooks
export const useHarvestSound = () => useSound('harvest');
export const usePlantSound = () => useSound('plant');
export const useSellSound = () => useSound('sell');
export const useBuySound = () => useSound('buy');
export const useClickSound = () => useSound('click');
export const useSuccessSound = () => useSound('success');
export const useErrorSound = () => useSound('error');
export const useCoinSound = () => useSound('coin');
export const useLevelUpSound = () => useSound('levelup');
export const useAchievementSound = () => useSound('achievement');
export const useComboSound = () => useSound('combo');

/**
 * Hook to control background music tracks.
 */
export function useMusic(musicName) {
  const play = useCallback(() => {
    audioManager.playMusic(musicName);
  }, [musicName]);

  const stop = useCallback(() => {
    audioManager.stopMusic();
  }, []);

  const pause = useCallback(() => {
    audioManager.pauseMusic();
  }, []);

  const resume = useCallback(() => {
    audioManager.resumeMusic();
  }, []);

  return { play, stop, pause, resume };
}

export const useMainMenuMusic = () => useMusic('main');
export const useMenuMusic = () => useMusic('menu');
export const useEventMusic = () => useMusic('event');
