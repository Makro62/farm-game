"use client";

import { useEffect, type ReactNode } from "react";
import { useGameStore } from "./store";
import { logger } from "./logger";

type GameProviderProps = {
  children: ReactNode;
};

export function GameProvider({ children }: GameProviderProps) {
  useEffect(() => {
    try {
      const state = useGameStore.getState();
      if (!state.todayPrices || Object.keys(state.todayPrices).length === 0) {
        state.updateMarket?.();
      }
      state.generateDailyQuests?.();
    } catch (err) {
      logger.error("Boot effect failed:", err);
    }
  }, []);

  useEffect(() => {
    const tick = () => {
      try {
        useGameStore.getState().processGameTick?.();
      } catch (err) {
        logger.error("Game tick error:", err);
      }
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
