'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Konstanta game
import { GAME_CONSTANTS } from './constants';

// Helpers and utilities for persist logic
import { 
  normalizePlots, 
  normalizeAnimal, 
  migrateLegacyWorkers, 
  safeCoins,
  rollMineralType
} from './store/utils';

// Slices
import { createFarmingSlice } from './store/slices/createFarmingSlice';
import { createMiningSlice } from './store/slices/createMiningSlice';
import { createRanchingSlice } from './store/slices/createRanchingSlice';
import { createPlayerSlice } from './store/slices/createPlayerSlice';
import { createTownSlice } from './store/slices/createTownSlice';
import { createSystemSlice } from './store/slices/createSystemSlice';

const { PLOTS_COUNT, MINING_NODES_COUNT } = GAME_CONSTANTS;

/**
 * Membuat array plots dengan format default
 * @returns {Array} Array plot objects
 */
const createDefaultPlots = () => 
  Array.from({ length: PLOTS_COUNT }, (_, i) => ({
    id: i,
    status: 'empty',
    crop: null,
    plantedAt: null,
    growTime: null
  }));

/**
 * Membuat array mining nodes dengan tipe mineral acak
 * Menggunakan fungsi rollMineralType untuk konsistensi
 * @returns {Array} Array mining node objects
 */
const createDefaultMiningNodes = () =>
  Array.from({ length: MINING_NODES_COUNT }, (_, i) => ({
    id: i,
    status: 'ready',
    type: rollMineralType(1, false, null),
    regenAt: null
  }));

/**
 * Initial state - single source of truth untuk struktur state
 * Hanya berisi struktur default, tidak ada logika bisnis
 */
const initialState = {
  // ===== PLAYER STATS =====
  coins: 100,
  level: 1,
  xp: 0,
  day: 1,
  streak: 0,
  lastLogin: null,
  lastSavedAt: Date.now(),
  offlineReport: null,
  
  // ===== FARM =====
  plots: createDefaultPlots(),
  
  // ===== INVENTORY =====
  inventory: {},
  
  // ===== ANIMALS =====
  animals: [],
  
  // ===== SETTINGS =====
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  
  // ===== MARKET =====
  todayPrices: {},
  marketTrend: {},
  
  // ===== SYSTEMS =====
  lastWheelSpin: null,
  coinMultiplier: 1,
  growthMultiplier: 1,

  // ===== AUTO WORKERS =====
  workers: {
    farmer: false,
    rancher: false,
    fisher: false,
    miner: false,
  },
  
  autoFarmer: false,
  autoRancher: false,
  autoFisher: false,
  autoMiner: false,
  selectedSeed: null,
  selectedMiningTool: null,
  selectedBait: null,
  
  // ===== UI MODALS =====
  modals: {
    prompt: { isOpen: false, title: '', msg: '', onConfirm: null },
    confirm: { isOpen: false, title: '', msg: '', onConfirm: null },
    npcGift: { isOpen: false, npcId: null }
  },

  // ===== COMBO SYSTEM =====
  combo: {
    count: 0,
    multiplier: 1,
    lastAction: 0
  },
  
  // ===== ENVIRONMENT =====
  season: { current: 'spring', day: 1, tick: 0 },
  weather: { current: '☀️ Cerah', nextChangeIn: 300 },
  
  // ===== MINING =====
  mining: {
    nodes: createDefaultMiningNodes(),
    pickaxeLevel: 1,
    lanternUntil: null
  },
  
  // ===== NPCS =====
  npcs: {
    maria: { level: 1, points: 0 },
    botan: { level: 1, points: 0 },
    hadi:  { level: 1, points: 0 }
  },
  activeEvent: null,
  
  // ===== QUESTS =====
  dailyQuests: [],
  lastQuestDate: null,
  workerAutoMigrated: false,
  
  // ===== CRAFTING & ORDERS =====
  craftingQueue: [],
  orders: [],

  // ===== KOTA UPGRADES =====
  buildings: {
    silo: false,
    greenhouse: false,
  },
  decorations: [],
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      // ===== BASE STATE (dari initialState) =====
      ...initialState,
      
      // ===== FEATURE SLICES =====
      ...createFarmingSlice(set, get),
      ...createMiningSlice(set, get),
      ...createRanchingSlice(set, get),
      ...createPlayerSlice(set, get),
      ...createTownSlice(set, get),
      ...createSystemSlice(set, get),

      // ===== RESET GAME =====
      /**
       * Reset game ke initial state dan hapus localStorage
       * @returns {boolean} true jika berhasil
       */
      resetGame: () => {
        set(initialState);
        // SSR guard: hanya di browser
        if (typeof window !== 'undefined') {
          localStorage.removeItem('farm-game-storage');
          window.location.reload();
        }
        return true;
      },
      
      // ===== DEV TOOLS (hanya di development) =====
      dev: {
        addCoins: (amount) => {
          if (process.env.NODE_ENV === 'development') {
            set((s) => ({ coins: s.coins + amount }));
          }
        },
        setLevel: (level) => {
          if (process.env.NODE_ENV === 'development') {
            set({ level, xp: 0 });
          }
        },
        resetPlots: () => {
          if (process.env.NODE_ENV === 'development') {
            set({ plots: initialState.plots });
          }
        }
      }
    }),
    {
      name: 'farm-game-storage',
      /**
       * SSR-safe storage adapter
       * Menggunakan noop storage di server untuk menghindari error
       */
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
      ),
      /**
       * Filter state yang akan dipersist ke localStorage
       * Hanya menyimpan data penting untuk mengurangi ukuran save
       */
      partialize: (state) => ({
        // Player progress
        coins: state.coins,
        level: state.level,
        xp: state.xp,
        day: state.day,
        streak: state.streak,
        lastLogin: state.lastLogin,
        
        // Farm & Animals
        plots: state.plots,
        animals: state.animals,
        
        // Settings
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        notificationsEnabled: state.notificationsEnabled,
        
        // Market
        todayPrices: state.todayPrices,
        marketTrend: state.marketTrend,
        
        // Systems & Boosters
        lastWheelSpin: state.lastWheelSpin,
        coinMultiplier: state.coinMultiplier,
        growthMultiplier: state.growthMultiplier,
        
        // Workers
        workers: state.workers,
        autoFarmer: state.autoFarmer,
        autoRancher: state.autoRancher,
        autoFisher: state.autoFisher,
        autoMiner: state.autoMiner,
        
        // Selections
        selectedSeed: state.selectedSeed,
        selectedBait: state.selectedBait,
        
        // Environment
        season: state.season,
        weather: state.weather,
        
        // Mining
        mining: state.mining,
        
        // NPCs & Events
        npcs: state.npcs,
        activeEvent: state.activeEvent,
        
        // Quests
        dailyQuests: state.dailyQuests,
        lastQuestDate: state.lastQuestDate,
        workerAutoMigrated: state.workerAutoMigrated,
        
        // Timestamps
        lastSavedAt: state.lastSavedAt,
        
        // Crafting & Orders
        craftingQueue: state.craftingQueue,
        orders: state.orders,
        
        // Booster expiry
        coinMultiplierExpireAt: state.coinMultiplierExpireAt,
        growthMultiplierExpireAt: state.growthMultiplierExpireAt,
        
        // Kota upgrades
        buildings: state.buildings,
        decorations: state.decorations,
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

        if (!merged.workerAutoMigrated) {
          if (merged.workers.farmer && merged.autoFarmer === false) merged.autoFarmer = true;
          if (merged.workers.rancher && merged.autoRancher === false) merged.autoRancher = true;
          if (merged.workers.fisher && merged.autoFisher === false) merged.autoFisher = true;
          if (merged.workers.miner && merged.autoMiner === false) merged.autoMiner = true;
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
        
        return merged;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate store:', error);
        } else if (state) {
          if (!Number.isFinite(state.coins)) {
            useGameStore.setState({ coins: 100 });
          }
          console.log('✓ Game loaded from localStorage');
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
