'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from './store';

export function GameProvider({ children }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isStoreReady, setIsStoreReady] = useState(
    () => useGameStore.persist.hasHydrated()
  );

  useEffect(() => {
    setIsMounted(true);

    if (useGameStore.persist.hasHydrated()) {
      setIsStoreReady(true);
      return;
    }

    return useGameStore.persist.onFinishHydration(() => {
      setIsStoreReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isStoreReady) return;

    const state = useGameStore.getState();
    const streakResult = state.checkStreak();
    if (streakResult.claimed) {
      console.log(streakResult.message);
    }

    if (!state.todayPrices || Object.keys(state.todayPrices).length === 0) {
      state.updateMarket();
    }

    state.generateDailyQuests();
  }, [isStoreReady]);

  useEffect(() => {
    if (!isStoreReady) return;

    const tick = () => useGameStore.getState().processGameTick();
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isStoreReady]);

  if (!isMounted || !isStoreReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-dark)] to-[var(--bg-light)]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌾</div>
          <div className="text-xl font-bold text-white animate-pulse">
            Loading Farm...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
