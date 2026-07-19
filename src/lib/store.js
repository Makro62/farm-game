'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Helpers and utilities for persist logic
import { partializeState, migrateState } from './store/migrations';
import { logger } from './logger';

// Slices
import { createFarmingSlice } from './store/slices/createFarmingSlice';
import { createMiningSlice } from './store/slices/createMiningSlice';
import { createRanchingSlice } from './store/slices/createRanchingSlice';
import { createEconomySlice } from './store/slices/createEconomySlice';
import { createPlayerSlice } from './store/slices/createPlayerSlice';
import { createTownSlice } from './store/slices/createTownSlice';
import { createSystemSlice } from './store/slices/createSystemSlice';
import { createCustomerSlice } from './store/slices/createCustomerSlice';
import { createAchievementSlice } from './store/slices/createAchievementSlice';

import { initialState } from './store/initialState';

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Base State
      ...initialState,
      
      // Feature Slices
      ...createFarmingSlice(set, get),
      ...createMiningSlice(set, get),
      ...createRanchingSlice(set, get),
      ...createEconomySlice(set, get),
      ...createPlayerSlice(set, get),
      ...createTownSlice(set, get),
      ...createSystemSlice(set, get),
      ...createCustomerSlice(set, get),
      ...createAchievementSlice(set, get),

      // Reset tanpa reload penuh — cegah loop refresh
      resetGame: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('farm-game-storage');
        }
        set({
          ...initialState,
          plots: initialState.plots.map((p) => ({ ...p })),
          mining: {
            ...initialState.mining,
            nodes: initialState.mining.nodes.map((n) => ({ ...n })),
          },
          lastSavedAt: Date.now(),
          offlineReport: null,
        });
        return true;
      },
      
      // Dev override (Cheats)
      dev: {
        addCoins: (amount) => {
          set((s) => ({ coins: s.coins + amount }));
        },
        addEnergy: (amount) => {
          set((s) => ({ energy: Math.min(s.energy + amount, s.maxEnergy) }));
        },
        setLevel: (level) => {
          set({ level, xp: 0 });
        },
        resetPlots: () => {
          set({ plots: initialState.plots });
        },
        instantGrow: () => {
          set((s) => ({
            plots: s.plots.map(p => p.status === 'growing' ? { ...p, plantedAt: 0 } : p)
          }));
        },
        unlockAll: () => {
          set({
            workers: { farmer: true, rancher: true, fisher: true, miner: true, chef: true },
            buildings: { silo: true, greenhouse: true },
          });
        }
      }
    }),
    {
      name: 'farm-game-storage',
      skipHydration: true,
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: partializeState,
      merge: migrateState,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          logger.error('Failed to rehydrate store:', error);
          return;
        }
        if (state && !Number.isFinite(state.coins)) {
          useGameStore.setState({ coins: 100 });
        }
      }
    }
  )
);

// Selector hooks untuk performa optimal
export const useCoins = () => useGameStore((s) => s.coins);
export const useLevel = () => useGameStore((s) => s.level);
export const useXP = () => useGameStore((s) => s.xp);
export const useDay = () => useGameStore((s) => s.day);
export const useStreak = () => useGameStore((s) => s.streak);
export const usePlots = () => useGameStore((s) => s.plots);
export const useInventory = () => useGameStore((s) => s.inventory);
export const useSettings = () => useGameStore((s) => ({
  soundEnabled: s.soundEnabled,
  musicEnabled: s.musicEnabled,
  notificationsEnabled: s.notificationsEnabled
}));
export const useSeason = () => useGameStore((s) => s.season);
export const useWeather = () => useGameStore((s) => s.weather);
export const useMining = () => useGameStore((s) => s.mining);
export const useNpcs = () => useGameStore((s) => s.npcs);
export const useActiveEvent = () => useGameStore((s) => s.activeEvent);
