'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from './store';

export function GameProvider({ children }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Initialize game
    const state = useGameStore.getState();
    
    // Check streak
    const streakResult = state.checkStreak();
    if (streakResult.claimed) {
      console.log(streakResult.message);
    }
    
    // Initialize market if needed
    if (!state.todayPrices || Object.keys(state.todayPrices).length === 0) {
      state.updateMarket();
    }
    
    setIsInitialized(true);
  }, []);
  
  // Loading state
  if (!isMounted || !isInitialized) {
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
