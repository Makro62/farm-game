'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Initial state
const initialState = {
  // Player stats
  coins: 100,
  level: 1,
  xp: 0,
  day: 1,
  streak: 0,
  lastLogin: null,
  
  // Farm
  plots: Array.from({ length: 16 }, (_, i) => ({
    id: i,
    status: 'empty',
    crop: null,
    plantedAt: null,
    growTime: null
  })),
  
  // Inventory
  inventory: {},
  
  // Animals
  animals: [],
  
  // Settings
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  
  // Market
  todayPrices: {},
  marketTrend: {},
  
  // Systems
  lastWheelSpin: null,
  coinMultiplier: 1,
  growthMultiplier: 1,

  // Auto workers (hired with coins)
  workers: {
    farmer: false,
    rancher: false,
    fisher: false
  },
  
  // UI Modals
  modals: {
    prompt: { isOpen: false, title: '', msg: '', onConfirm: null },
    confirm: { isOpen: false, title: '', msg: '', onConfirm: null }
  },

  combo: {
    count: 0,
    multiplier: 1,
    lastAction: 0
  }
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ===== UI MODALS =====
      
      openPrompt: (title, msg, onConfirm) => {
        set((state) => ({
          modals: {
            ...state.modals,
            prompt: { isOpen: true, title, msg, onConfirm }
          }
        }));
      },
      
      openConfirm: (title, msg, onConfirm) => {
        set((state) => ({
          modals: {
            ...state.modals,
            confirm: { isOpen: true, title, msg, onConfirm }
          }
        }));
      },
      
      closeModals: () => {
        set((state) => ({
          modals: {
            prompt: { isOpen: false, title: '', msg: '', onConfirm: null },
            confirm: { isOpen: false, title: '', msg: '', onConfirm: null }
          }
        }));
      },
      
      // ===== COIN MANAGEMENT =====
      
      buyItem: (itemId, amount, unitPrice) => {
        const state = get();
        const totalCost = unitPrice * amount;
        
        if (state.coins >= totalCost) {
          set((state) => ({
            coins: state.coins - totalCost,
            inventory: {
              ...state.inventory,
              [itemId]: (state.inventory[itemId] || 0) + amount
            }
          }));
          return true;
        }
        return false;
      },

      buyMultipleAnimals: (animalType, amount, unitPrice, produceTime) => {
        const state = get();
        const totalCost = unitPrice * amount;
        
        if (state.coins >= totalCost) {
          const newAnimals = Array.from({ length: amount }, () => ({
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            type: animalType,
            status: 'producing',
            lastCollected: Date.now(),
            produceTime
          }));
          
          set((state) => ({
            coins: state.coins - totalCost,
            animals: [...state.animals, ...newAnimals]
          }));
          return true;
        }
        return false;
      },

      addCoins: (amount) => {
        if (amount <= 0) return;
        set((state) => ({ coins: state.coins + amount }));
      },
      
      spendCoins: (amount) => {
        const state = get();
        if (state.coins < amount) {
          return false;
        }
        set({ coins: state.coins - amount });
        return true;
      },
      
      // ===== XP & LEVEL =====
      
      addXP: (amount) => {
        if (amount <= 0) return false;

        const prevLevel = get().level;

        set((state) => {
          let newXP = state.xp + amount;
          let newLevel = state.level;

          // Check level up
          while (newXP >= newLevel * 100) {
            newXP -= newLevel * 100;
            newLevel++;
          }

          return {
            xp: newXP,
            level: newLevel
          };
        });

        return get().level > prevLevel; // Return true if leveled up
      },
      
      // ===== PLOT MANAGEMENT =====
      
      plant: (plotId, crop, growTime) => {
        const state = get();
        const plot = state.plots.find(p => p.id === plotId);
        
        if (!plot || plot.status !== 'empty') {
          return false;
        }
        
        set((state) => ({
          plots: state.plots.map(p =>
            p.id === plotId
              ? {
                  ...p,
                  status: 'growing',
                  crop,
                  plantedAt: Date.now(),
                  growTime
                }
              : p
          )
        }));
        
        return true;
      },
      
      harvest: (plotId) => {
        const state = get();
        const plot = state.plots.find(p => p.id === plotId);

        if (!plot || !plot.crop) {
          return null;
        }

        // Petak dianggap siap panen jika statusnya 'ready' ATAU waktu tumbuh
        // sudah terlewati (tanpa bergantung pada game loop yang mengubah status).
        const isReady =
          plot.status === 'ready' ||
          (plot.status === 'growing' &&
            plot.plantedAt &&
            Date.now() - plot.plantedAt >= plot.growTime);

        if (!isReady) {
          return null;
        }

        const crop = plot.crop;

        set((state) => ({
          plots: state.plots.map(p =>
            p.id === plotId
              ? {
                  id: p.id,
                  status: 'empty',
                  crop: null,
                  plantedAt: null,
                  growTime: null
                }
              : p
          ),
          inventory: {
            ...state.inventory,
            [crop]: (state.inventory[crop] || 0) + 1
          }
        }));

        get().addXP(10);

        return crop;
      },

      // Sinkronkan status petak: ubah 'growing' menjadi 'ready' saat waktunya tiba.
      // Dipanggil oleh game loop agar efek visual & auto-worker konsisten.
      syncPlots: () => {
        const now = Date.now();
        let changed = false;

        const plots = get().plots.map(p => {
          if (
            p.status === 'growing' &&
            p.plantedAt &&
            now - p.plantedAt >= p.growTime
          ) {
            changed = true;
            return { ...p, status: 'ready' };
          }
          return p;
        });

        if (changed) {
          set({ plots });
        }
      },
      
      updatePlotStatus: (plotId, status) => {
        set((state) => ({
          plots: state.plots.map(p =>
            p.id === plotId ? { ...p, status } : p
          )
        }));
      },
      
      // ===== INVENTORY =====
      
      addItem: (itemId, quantity = 1) => {
        set((state) => ({
          inventory: {
            ...state.inventory,
            [itemId]: (state.inventory[itemId] || 0) + quantity
          }
        }));
      },
      
      removeItem: (itemId, quantity = 1) => {
        const state = get();
        const current = state.inventory[itemId] || 0;
        
        if (current < quantity) {
          return false;
        }
        
        set((state) => ({
          inventory: {
            ...state.inventory,
            [itemId]: current - quantity
          }
        }));
        
        return true;
      },
      
      // ===== ANIMALS =====
      
      buyAnimal: (animalType, produceTime) => {
        set((state) => ({
          animals: [
            ...state.animals,
            {
              id: Date.now() + Math.random().toString(36).substr(2, 5),
              type: animalType,
              status: 'producing',
              lastCollected: Date.now(),
              produceTime
            }
          ]
        }));
      },
      
      collectAnimal: (animalId, productType) => {
        const state = get();
        const animal = state.animals.find(a => a.id === animalId);
        
        if (!animal) return false;
        
        set((state) => ({
          animals: state.animals.map(a => 
            a.id === animalId 
              ? { ...a, lastCollected: Date.now() } 
              : a
          ),
          inventory: {
            ...state.inventory,
            [productType]: (state.inventory[productType] || 0) + 1
          }
        }));

        get().addXP(8);

        return true;
      },
      
      // ===== STREAK SYSTEM =====
      
      checkStreak: () => {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const state = get();
        
        if (state.lastLogin === today) {
          return { claimed: false, message: 'Sudah klaim hari ini' };
        }
        
        let newStreak = 1;
        if (state.lastLogin === yesterday) {
          newStreak = state.streak + 1;
        }
        
        const rewards = [100, 200, 300, 400, 500, 750, 1500];
        const reward = rewards[Math.min(newStreak - 1, 6)];
        
        set({
          streak: newStreak,
          lastLogin: today,
          coins: state.coins + reward
        });
        
        return {
          claimed: true,
          streak: newStreak,
          reward,
          message: `🔥 Streak ${newStreak} hari! +${reward} 💰`
        };
      },
      
      // ===== WHEEL SYSTEM =====
      
      spinWheel: () => {
        const today = new Date().toDateString();
        const state = get();
        
        if (state.lastWheelSpin === today) {
          return { success: false, message: 'Sudah spin hari ini' };
        }
        
        const roll = Math.random() * 100;
        let reward = 100;
        
        if (roll < 60) reward = 100 + Math.floor(Math.random() * 200);
        else if (roll < 85) reward = 500;
        else if (roll < 95) reward = 2000;
        else reward = 5000;
        
        set({
          lastWheelSpin: today,
          coins: state.coins + reward
        });
        
        return {
          success: true,
          reward,
          message: `🎡 Dapat ${reward} 💰!`
        };
      },
      
      // ===== BOOSTERS =====
      
      activateCoinBooster: () => {
        set({ coinMultiplier: 2 });
      },

      // Beli booster kecepatan tumbuh (mempercepat tanaman yang ditanam setelahnya).
      buyGrowthBooster: (cost) => {
        const state = get();
        if (state.growthMultiplier > 1) return false; // sudah aktif
        if (state.coins < cost) return false;
        set({ coins: state.coins - cost, growthMultiplier: 1.5 });
        return true;
      },

      // ===== WORKERS (AUTO) =====

      hireWorker: (type, cost) => {
        const state = get();
        if (state.workers[type]) return false; // sudah dimiliki
        if (state.coins < cost) return false;
        set({
          coins: state.coins - cost,
          workers: { ...state.workers, [type]: true }
        });
        return true;
      },
      
      // ===== COMBO SYSTEM =====
      
      registerCombo: () => {
        const now = Date.now();
        const state = get();
        const timeSinceLast = now - state.combo.lastAction;
        
        let newCount = 1;
        if (timeSinceLast < 2500) {
          newCount = state.combo.count + 1;
        }
        
        const multiplier = Math.min(1 + (newCount - 1) * 0.25, 4.0);
        
        set({
          combo: {
            count: newCount,
            multiplier,
            lastAction: now
          }
        });
        
        return { count: newCount, multiplier };
      },
      
      resetCombo: () => {
        set({
          combo: {
            count: 0,
            multiplier: 1,
            lastAction: 0
          }
        });
      },
      
      // ===== SETTINGS =====
      
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
      toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      
      // ===== MARKET =====
      
      updateMarket: () => {
        const crops = ['wortel', 'jagung', 'tomat', 'stroberi', 'nanas', 'labu'];
        const basePrices = {
          wortel: 15,
          jagung: 20,
          tomat: 35,
          stroberi: 75,
          nanas: 90,
          labu: 110
        };
        
        const newPrices = {};
        const newTrend = {};
        
        crops.forEach(crop => {
          const base = basePrices[crop];
          const fluctuation = 0.7 + Math.random() * 0.6;
          newPrices[crop] = Math.round(base * fluctuation);
          newTrend[crop] = newPrices[crop] > base ? 'up' : 'down';
        });
        
        set({
          todayPrices: newPrices,
          marketTrend: newTrend,
          day: get().day + 1
        });
      },
      
      // ===== UTILITY =====
      
      resetGame: () => {
        set(initialState);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('farm-game-storage');
        }
        return true;
      },
      
      // Development only - cheat functions
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
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
      ),
      partialize: (state) => ({
        // Hanya simpan data penting
        coins: state.coins,
        level: state.level,
        xp: state.xp,
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
        workers: state.workers
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate store:', error);
        } else if (state) {
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
