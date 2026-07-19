'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from './store';
import { logger } from './logger';

export function GameProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;

    const timeout = setTimeout(() => {
      if (!ready) {
        setError(true);
        setReady(true);
      }
    }, 15000);

    (async () => {
      try {
        await useGameStore.persist.rehydrate();
      } catch (err) {
        logger.error('Store hydrate failed:', err);
        if (alive) {
          setError(true);
          setReady(true);
          return;
        }
      } finally {
        if (alive) setReady(true);
      }
    })();

    return () => {
      alive = false;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!ready || error) return;

    try {
      const state = useGameStore.getState();
      if (!state.todayPrices || Object.keys(state.todayPrices).length === 0) {
        state.updateMarket?.();
      }
      state.generateDailyQuests?.();
    } catch (err) {
      logger.error('Boot effect failed:', err);
    }
  }, [ready, error]);

  useEffect(() => {
    if (!ready || error) return;

    const tick = () => {
      try {
        useGameStore.getState().processGameTick?.();
      } catch (err) {
        logger.error('Game tick error:', err);
      }
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [ready, error]);

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C8E8FF] to-[#9FD67F]">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-bold text-[var(--text-primary)] mb-2">Gagal memuat data game</div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Mungkin ada masalah dengan penyimpanan lokal.</p>
          <button
            type="button"
            onClick={() => {
              try { localStorage.clear(); } catch { /* ignore */ }
              window.location.reload();
            }}
            className="btn-gold btn-size-sm"
          >
            Reset & Reload
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
