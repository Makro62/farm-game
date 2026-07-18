'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from './store';
import { logger } from './logger';

export function GameProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await useGameStore.persist.rehydrate();
      } catch (err) {
        logger.error('Store hydrate failed:', err);
      } finally {
        if (alive) setReady(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    try {
      const state = useGameStore.getState();
      if (!state.todayPrices || Object.keys(state.todayPrices).length === 0) {
        state.updateMarket?.();
      }
      state.generateDailyQuests?.();
    } catch (err) {
      logger.error('Boot effect failed:', err);
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    const tick = () => {
      try {
        useGameStore.getState().processGameTick?.();
      } catch (err) {
        logger.error('Game tick error:', err);
      }
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [ready]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C8E8FF] to-[#9FD67F]">
        <div className="text-center">
          <div className="text-6xl mb-4">🌾</div>
          <div className="text-xl font-bold text-[var(--text-primary)]">Loading Farm...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
