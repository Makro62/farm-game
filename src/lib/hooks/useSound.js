import { useCallback, useRef } from 'react';
import audioManager from '../audio';

export function useSound(soundName, options = {}) {
  const soundRef = useRef(null);
  
  const play = useCallback((sprite = null) => {
    soundRef.current = audioManager.play(soundName, sprite);
    return soundRef.current;
  }, [soundName]);
  
  const stop = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
    }
  }, []);
  
  return { play, stop };
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

// Music hook
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
