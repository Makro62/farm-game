import { useCallback } from 'react';
import confettiManager from '../confetti';

export function useConfetti() {
  const basic = useCallback((options) => {
    confettiManager.basic(options);
  }, []);
  
  const celebration = useCallback((options) => {
    confettiManager.celebration(options);
  }, []);
  
  const explosion = useCallback((options) => {
    confettiManager.explosion(options);
  }, []);
  
  const fireworks = useCallback((options) => {
    confettiManager.fireworks(options);
  }, []);
  
  const stars = useCallback((options) => {
    confettiManager.stars(options);
  }, []);
  
  const snow = useCallback((options) => {
    confettiManager.snow(options);
  }, []);
  
  const hearts = useCallback((options) => {
    confettiManager.hearts(options);
  }, []);
  
  const rainbow = useCallback((options) => {
    confettiManager.rainbow(options);
  }, []);
  
  const cannonLeft = useCallback((options) => {
    confettiManager.cannonLeft(options);
  }, []);
  
  const cannonRight = useCallback((options) => {
    confettiManager.cannonRight(options);
  }, []);
  
  const stop = useCallback(() => {
    confettiManager.stop();
  }, []);
  
  return {
    basic,
    celebration,
    explosion,
    fireworks,
    stars,
    snow,
    hearts,
    rainbow,
    cannonLeft,
    cannonRight,
    stop
  };
}

// Pre-defined triggers
export function useHarvestConfetti() {
  const { basic } = useConfetti();
  
  return useCallback((amount = 1) => {
    if (amount >= 10) {
      basic({ particleCount: 150, spread: 100 });
    } else if (amount >= 5) {
      basic({ particleCount: 80 });
    } else {
      basic({ particleCount: 30 });
    }
  }, [basic]);
}

export function useLevelUpConfetti() {
  const { celebration } = useConfetti();
  
  return useCallback(() => {
    celebration({
      colors: ['#fbbf24', '#34d399', '#60a5fa', '#a78bfa']
    });
  }, [celebration]);
}

export function useAchievementConfetti() {
  const { fireworks } = useConfetti();
  
  return useCallback(() => {
    fireworks({
      colors: ['#ffd700', '#ffa500', '#ff8c00']
    });
  }, [fireworks]);
}

export function useMegaRewardConfetti() {
  const { explosion, stars } = useConfetti();
  
  return useCallback(() => {
    explosion({ count: 300 });
    setTimeout(() => stars({ count: 100 }), 500);
  }, [explosion, stars]);
}
