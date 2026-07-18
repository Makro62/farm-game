'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Helpers and utilities for persist logic
import { normalizePlots, normalizeAnimal, migrateLegacyWorkers, safeCoins } from './store/utils';
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
      partialize: (state) => ({
        // Hanya simpan data penting (SAMA PERSIS DENGAN SEBELUMNYA)
        coins: state.coins,
        level: state.level,
        xp: state.xp,
        energy: state.energy,
        maxEnergy: state.maxEnergy,
        day: state.day,
        streak: state.streak,
        lastLogin: state.lastLogin,
        plots: state.plots,
        inventory: state.inventory,
        animals: state.animals,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        notificationsEnabled: state.notificationsEnabled,
        todayPrices: state.todayPrices,
        marketTrend: state.marketTrend,
        lastWheelSpin: state.lastWheelSpin,
        coinMultiplier: state.coinMultiplier,
        growthMultiplier: state.growthMultiplier,
        workers: state.workers,
        autoFarmer: state.autoFarmer,
        autoRancher: state.autoRancher,
        autoFisher: state.autoFisher,
        autoMiner: state.autoMiner,
        autoChef: state.autoChef,
        selectedSeed: state.selectedSeed,
        selectedBait: state.selectedBait,
        selectedRecipe: state.selectedRecipe,
        season: state.season,
        weather: state.weather,
        mining: state.mining,
        npcs: state.npcs,
        activeEvent: state.activeEvent,
        dailyQuests: state.dailyQuests,
        lastQuestDate: state.lastQuestDate,
        workerAutoMigrated: state.workerAutoMigrated,
        lastSavedAt: state.lastSavedAt,
        craftingQueue: state.craftingQueue,
        orders: state.orders,
        coinMultiplierExpireAt: state.coinMultiplierExpireAt,
        growthMultiplierExpireAt: state.growthMultiplierExpireAt,
        buildings: state.buildings,
        decorations: state.decorations,
        activeCustomers: state.activeCustomers,
        achievements: state.achievements,
        stats: state.stats,
        sessionActions: state.sessionActions,
        weatherEffects: state.weatherEffects,
      }),
      merge: (persistedState, currentState) => {
        let merged = { ...currentState, ...persistedState };
        
        merged.plots = normalizePlots(merged.plots);

        if (merged.mining) {
          if (merged.mining.pickaxeLevel == null) merged.mining.pickaxeLevel = 1;
          if (merged.mining.lanternUntil == null) merged.mining.lanternUntil = null;
        }

        merged.workers = {
          farmer: false,
          rancher: false,
          fisher: false,
          miner: false,
          chef: false,
          ...(merged.workers || {}),
        };

        merged = migrateLegacyWorkers(merged);

        if (!Array.isArray(merged.dailyQuests)) {
          merged.dailyQuests = [];
        }

        if (!merged.growthMultiplier || merged.growthMultiplier <= 0) {
          merged.growthMultiplier = 1;
        }

        if (!Number.isFinite(Number(merged.coins))) {
          merged.coins = 100;
        } else {
          merged.coins = safeCoins(merged.coins);
        }

        if (!Number.isFinite(Number(merged.coinMultiplier)) || merged.coinMultiplier <= 0) {
          merged.coinMultiplier = 1;
        }

        if (merged.energy == null) merged.energy = 100;
        if (merged.maxEnergy == null) merged.maxEnergy = 100;

        merged.buildings = {
          silo: false,
          greenhouse: false,
          ...(merged.buildings || {}),
        };
        if (!Array.isArray(merged.decorations)) {
          merged.decorations = [];
        }

        if (Array.isArray(merged.animals) && merged.animals.length > 0) {
          merged.animals = merged.animals.map(normalizeAnimal);
        }

        if (!Array.isArray(merged.activeCustomers)) {
          merged.activeCustomers = [];
        }

        if (!merged.workerAutoMigrated) {
          if (merged.workers.farmer && merged.autoFarmer === false) merged.autoFarmer = true;
          if (merged.workers.rancher && merged.autoRancher === false) merged.autoRancher = true;
          if (merged.workers.fisher && merged.autoFisher === false) merged.autoFisher = true;
          if (merged.workers.miner && merged.autoMiner === false) merged.autoMiner = true;
          if (merged.workers.chef && merged.autoChef === false) merged.autoChef = true;
          merged.workerAutoMigrated = true;
        }

        if (merged.mining && merged.mining.nodes && merged.mining.nodes.length < 30) {
          const newNodes = [...merged.mining.nodes];
          while (newNodes.length < 30) {
            newNodes.push({
              id: newNodes.length, status: 'ready', regenAt: null,
              type: Math.random() < 0.05 ? 'berlian' : Math.random() < 0.15 ? 'emas' : Math.random() < 0.3 ? 'besi' : Math.random() < 0.5 ? 'tembaga' : 'batu'
            });
          }
          merged.mining.nodes = newNodes;
        }

        // MIGRATION: normalisasi tipe hewan dari save lama (chicken -> ayam)
        const legacyAnimalTypes = {
          chicken: 'ayam', duck: 'bebek', cow: 'sapi',
          sheep: 'domba', pig: 'babi', horse: 'kuda',
        };
        if (Array.isArray(merged.animals) && merged.animals.length > 0) {
          merged.animals = merged.animals.map((a) => ({
            ...a,
            type: legacyAnimalTypes[a.type] || a.type,
          }));
        }

        // MIGRATION: achievements, stats, sessionActions (new fields)
        if (!merged.achievements || typeof merged.achievements !== 'object') {
          merged.achievements = {};
        }
        if (!merged.stats || typeof merged.stats !== 'object') {
          merged.stats = {};
        }
        // Ensure all stat keys exist
        const defaultStats = {
          totalHarvested: 0, totalMined: 0, totalFished: 0, totalCooked: 0,
          totalServed: 0, totalCollected: 0, totalOrdersFulfilled: 0,
          totalGiftsGiven: 0, totalFertilizerUsed: 0, totalFertilizerDropped: 0,
          totalAnimalsFed: 0, totalAnimalsOwned: 0, totalWormsFound: 0,
          totalWormBaitUsed: 0, totalDiamondsMined: 0, totalSushiEmasMade: 0,
        };
        merged.stats = { ...defaultStats, ...merged.stats };
        merged.sessionActions = merged.sessionActions || {};
        merged.weatherEffects = merged.weatherEffects || {
          cropGrowth: 1.0,
          miningRegen: 1.0,
          animalProduce: 1.0,
          fishingRare: 1.0,
          customerRate: 1.0,
        };

        // MIGRATION: NPC baru (bejo, dodi) — jika save lama tidak punya
        merged.npcs = {
          maria: { level: 1, points: 0 },
          botan: { level: 1, points: 0 },
          hadi: { level: 1, points: 0 },
          bejo: { level: 1, points: 0 },
          dodi: { level: 1, points: 0 },
          ...(merged.npcs || {}),
        };
        
        return merged;

      },
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
