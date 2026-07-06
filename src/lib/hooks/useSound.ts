'use client';

import { useCallback } from 'react';
import audioManager, { type SoundName, type MusicName } from '../audio';

export function useSound(soundName: SoundName) {
  const play = useCallback((sprite: string | null = null) => {
    audioManager.ensureInitialized();
    return audioManager.play(soundName, sprite);
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

export function useMusic(musicName: MusicName) {
  const play = useCallback(() => {
    audioManager.ensureInitialized();
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
