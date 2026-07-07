'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { SHOP_SEEDS, SHOP_ANIMALS, FISHES, getItemSellPrice, RECIPES, ORDER_TEMPLATES } from './utils';

const MINING_REGEN_MS = { 1: 120000, 2: 90000, 3: 60000 };

function getMiningRegenMs(mining) {
  let ms = MINING_REGEN_MS[mining?.pickaxeLevel] || MINING_REGEN_MS[1];
  if (mining?.lanternUntil && mining.lanternUntil > Date.now()) {
    ms = Math.floor(ms * 0.5);
  }
  return ms;
}

function rollMineralType(pickaxeLevel = 1, lanternActive = false) {
  const bonus = (lanternActive ? 0.05 : 0) + (pickaxeLevel >= 3 ? 0.08 : pickaxeLevel >= 2 ? 0.04 : 0);
  const r = Math.random();
  if (r < 0.05 + bonus) return 'berlian';
  if (r < 0.15 + bonus) return 'emas';
  if (r < 0.3 + (pickaxeLevel >= 2 ? 0.05 : 0)) return 'besi';
  if (r < 0.5) return 'tembaga';
  return 'batu';
}

function pickAutoSeed(inventory, selectedSeed, season) {
  if (selectedSeed) {
    const seed = SHOP_SEEDS.find((s) => s.id === selectedSeed);
    if (seed && (inventory[selectedSeed] || 0) > 0) {
      if (seed.season === 'all' || seed.season === season) return seed;
    }
  }
  const available = SHOP_SEEDS.filter(
    (s) => (inventory[s.id] || 0) > 0 && (s.season === 'all' || s.season === season)
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function getGrowthMultiplier(state) {
  const mult = state?.growthMultiplier;
  return mult > 0 ? mult : 1;
}

function consumeInventoryItem(inventory, itemId) {
  const next = (inventory[itemId] || 0) - 1;
  if (next <= 0) {
    delete inventory[itemId];
  } else {
    inventory[itemId] = next;
  }
}

function safeCoins(value, fallback = 100) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

function safePositiveNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const WORKER_AUTO_KEYS = {
  farmer: 'autoFarmer',
  rancher: 'autoRancher',
  fisher: 'autoFisher',
  miner: 'autoMiner',
};

function isWorkerActive(state, type) {
  if (!state?.workers?.[type]) return false;
  const autoKey = WORKER_AUTO_KEYS[type];
  if (!autoKey) return false;
  return state[autoKey] !== false;
}

const PLOT_STATE_MAP = {
  empty: 'empty',
  growing: 'growing',
  ready: 'ready',
  grass: 'empty',
  depleted: 'empty',
};

function normalizePlot(plot, index = 0) {
  if (!plot || typeof plot !== 'object') {
    return { id: index, status: 'empty', crop: null, plantedAt: null, growTime: null };
  }

  const legacyState = plot.state;
  const status = plot.status || (legacyState ? PLOT_STATE_MAP[legacyState] || legacyState : 'empty');

  return {
    id: plot.id ?? index,
    status,
    crop: plot.crop ?? null,
    plantedAt: plot.plantedAt ?? null,
    growTime: plot.growTime > 0 ? plot.growTime : null,
  };
}

function normalizePlots(plots) {
  if (!Array.isArray(plots)) {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      status: 'empty',
      crop: null,
      plantedAt: null,
      growTime: null,
    }));
  }

  const normalized = plots.map((p, i) => normalizePlot(p, i));
  while (normalized.length < 30) {
    normalized.push({
      id: normalized.length,
      status: 'empty',
      crop: null,
      plantedAt: null,
      growTime: null,
    });
  }
  return normalized.slice(0, 30);
}

function normalizeAnimal(animal) {
  if (!animal || typeof animal !== 'object') return animal;

  const produceTime = animal.produceTime > 0 ? animal.produceTime : 20000;

  if (animal.readyToCollect) {
    return {
      ...animal,
      status: animal.status || 'producing',
      lastCollected: 0,
      produceTime,
    };
  }

  return {
    ...animal,
    status: animal.status || 'producing',
    lastCollected: animal.lastCollected ?? Date.now(),
    produceTime,
  };
}

function migrateLegacyWorkers(merged) {
  if (typeof window === 'undefined') return merged;

  try {
    const legacyRaw = localStorage.getItem('farmTycoonSave');
    if (!legacyRaw) return merged;

    const payload = JSON.parse(legacyRaw);
    const dataStr = payload.data ?? legacyRaw;
    const legacy = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
    if (!legacy || typeof legacy !== 'object') return merged;

    merged.workers = {
      farmer: !!(merged.workers?.farmer || legacy.gnomeFarmOwned),
      rancher: !!(merged.workers?.rancher || legacy.gnomeAnimalOwned),
      fisher: !!(merged.workers?.fisher || legacy.merchantOwned),
      miner: !!merged.workers?.miner,
    };

    if (legacy.gnomeFarmOwned && legacy.gnomeFarmActive !== false) merged.autoFarmer = true;
    if (legacy.gnomeAnimalOwned && legacy.gnomeAnimalActive !== false) merged.autoRancher = true;
    if (legacy.merchantOwned && legacy.merchantActive !== false) merged.autoFisher = true;
  } catch {
    // abaikan save lama yang rusak
  }

  return merged;
}

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
  plots: Array.from({ length: 30 }, (_, i) => ({
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
    fisher: false,
    miner: false,
  },
  
  autoFarmer: false,
  autoRancher: false,
  autoFisher: false,
  autoMiner: false,
  selectedSeed: null,
  selectedMiningTool: null,
  
  // UI Modals
  modals: {
    prompt: { isOpen: false, title: '', msg: '', onConfirm: null },
    confirm: { isOpen: false, title: '', msg: '', onConfirm: null },
    npcGift: { isOpen: false, npcId: null }
  },

  combo: {
    count: 0,
    multiplier: 1,
    lastAction: 0
  },
  
  // Mega Update Phase 1
  season: { current: 'spring', day: 1, tick: 0 },
  weather: { current: '☀️ Cerah', nextChangeIn: 300 },
  mining: {
    nodes: Array.from({ length: 30 }, (_, i) => ({
      id: i,
      status: 'ready',
      type: Math.random() < 0.05 ? 'berlian' : Math.random() < 0.15 ? 'emas' : Math.random() < 0.3 ? 'besi' : Math.random() < 0.5 ? 'tembaga' : 'batu',
      regenAt: null
    })),
    pickaxeLevel: 1,
    lanternUntil: null
  },
  
  // Mega Update Phase 2
  npcs: {
    maria: { level: 1, points: 0 },
    botan: { level: 1, points: 0 },
    hadi:  { level: 1, points: 0 }
  },
  activeEvent: null,
  
  // Quests
  dailyQuests: [],
  lastQuestDate: null,
  workerAutoMigrated: false,
  
  // Crafting & Orders
  craftingQueue: [],
  orders: [],
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
      
      openNpcGift: (npcId) => {
        set((state) => ({
          modals: {
            ...state.modals,
            npcGift: { isOpen: true, npcId }
          }
        }));
      },
      
      closeModals: () => {
        set((state) => ({
          modals: {
            prompt: { isOpen: false, title: '', msg: '', onConfirm: null },
            confirm: { isOpen: false, title: '', msg: '', onConfirm: null },
            npcGift: { isOpen: false, npcId: null }
          }
        }));
      },

      // ===== AUTO WORKERS TOGGLES =====
      toggleAutoFarmer: () => set(state => ({ autoFarmer: !state.autoFarmer })),
      toggleAutoRancher: () => set(state => ({ autoRancher: !state.autoRancher })),
      toggleAutoFisher: () => set(state => ({ autoFisher: !state.autoFisher })),
      toggleAutoMiner: () => set(state => ({ autoMiner: !state.autoMiner })),
      setSelectedSeed: (seedId) => set({ selectedSeed: seedId }),
      setSelectedMiningTool: (toolId) => set({ selectedMiningTool: toolId }),
      
      // ===== COIN MANAGEMENT =====
      
      buyItem: (itemId, amount, unitPrice) => {
        const state = get();
        const qty = safePositiveNumber(amount, 0);
        const price = safePositiveNumber(unitPrice, 0);
        const totalCost = price * qty;

        if (qty <= 0 || totalCost <= 0) return false;

        const currentCoins = safeCoins(state.coins);
        if (currentCoins < totalCost) return false;

        set((state) => ({
          coins: currentCoins - totalCost,
          inventory: {
            ...state.inventory,
            [itemId]: (state.inventory[itemId] || 0) + qty,
          },
        }));
        return true;
      },

      buyMultipleAnimals: (animalType, amount, unitPrice, produceTime) => {
        const state = get();
        const qty = safePositiveNumber(amount, 0);
        const price = safePositiveNumber(unitPrice, 0);
        const totalCost = price * qty;

        if (qty <= 0 || totalCost <= 0) return false;

        const currentCoins = safeCoins(state.coins);
        if (currentCoins < totalCost) return false;

        const newAnimals = Array.from({ length: qty }, () => ({
          id: Date.now() + Math.random().toString(36).substr(2, 5),
          type: animalType,
          status: 'producing',
          lastCollected: Date.now(),
          produceTime: safePositiveNumber(produceTime, 20000),
        }));

        set((state) => ({
          coins: currentCoins - totalCost,
          animals: [...state.animals, ...newAnimals],
        }));
        return true;
      },

      addCoins: (amount) => {
        const delta = Number(amount);
        if (!Number.isFinite(delta) || delta <= 0) return;
        set((state) => ({ coins: safeCoins(state.coins) + Math.floor(delta) }));
      },
      
      spendCoins: (amount) => {
        const cost = Number(amount);
        if (!Number.isFinite(cost) || cost <= 0) return false;

        const currentCoins = safeCoins(get().coins);
        if (currentCoins < cost) return false;

        set({ coins: currentCoins - Math.floor(cost) });
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
        get().progressQuest('harvest', crop, 1);

        return crop;
      },

      // Sinkronkan status petak: ubah 'growing' menjadi 'ready' saat waktunya tiba.
      // Dipanggil oleh game loop agar efek visual & auto-worker konsisten.
      syncPlots: () => {
        const now = Date.now();
        let changed = false;

        const plots = normalizePlots(get().plots).map((p, index) => {
          const plot = normalizePlot(p, index);
          const growTime = plot.growTime > 0 ? plot.growTime : null;

          if (
            plot.status === 'growing' &&
            plot.plantedAt &&
            growTime != null &&
            now - plot.plantedAt >= growTime
          ) {
            changed = true;
            return { ...plot, status: 'ready' };
          }

          return plot;
        });

        if (changed) {
          set({ plots });
        }
      },
      
      completeQuest: (id) => {
        set((state) => ({
          dailyQuests: state.dailyQuests.map(q => 
            q.id === id ? { ...q, completed: true } : q
          )
        }));
      },

      // ===== CRAFTING =====
      startCrafting: (recipeId) => {
        const state = get();
        if (state.craftingQueue.length >= 5) {
          toast.error("Antrean dapur penuh! Maksimal 5 antrean.");
          return false;
        }

        const recipe = RECIPES.find(r => r.id === recipeId);
        if (!recipe) return false;

        // Check ingredients
        const inv = { ...state.inventory };
        for (const [item, qty] of Object.entries(recipe.req)) {
          if ((inv[item] || 0) < qty) {
            toast.error(`Bahan tidak cukup: ${qty}x ${item}`);
            return false;
          }
        }

        // Deduct ingredients
        for (const [item, qty] of Object.entries(recipe.req)) {
          inv[item] -= qty;
          if (inv[item] <= 0) delete inv[item];
        }

        const id = Math.random().toString(36).substring(2, 9);
        const startTime = Date.now();
        const duration = (recipe.time * 1000); 

        set(s => ({
          inventory: inv,
          craftingQueue: [...s.craftingQueue, { id, recipeId, startTime, duration }]
        }));

        toast.success(`Mulai membuat ${recipe.name}!`, { icon: '🍳' });
        return true;
      },

      removeCraftingQueue: (queueId) => {
        set(s => ({
          craftingQueue: s.craftingQueue.filter(q => q.id !== queueId)
        }));
      },

      // ===== ORDERS =====
      generateOrders: () => {
        const state = get();
        const level = state.level || 1;
        const templates = ORDER_TEMPLATES.filter(t => {
          if (level < 5) return t.tier === 1;
          if (level < 10) return t.tier <= 2;
          return true;
        });

        const newOrders = [];
        for (let i = 0; i < 3; i++) {
          const t = templates[Math.floor(Math.random() * templates.length)];
          newOrders.push({
            id: Math.random().toString(36).substring(2, 9),
            ...t,
            createdAt: Date.now()
          });
        }
        
        set({ orders: newOrders });
      },

      fulfillOrder: (orderId) => {
        const state = get();
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return false;
        
        const order = state.orders[orderIndex];
        const inv = { ...state.inventory };

        for (const item of order.items) {
          if ((inv[item.id] || 0) < item.qty) {
            toast.error(`Bahan tidak cukup: ${item.qty}x ${item.id}`);
            return false;
          }
        }

        for (const item of order.items) {
          inv[item.id] -= item.qty;
          if (inv[item.id] <= 0) delete inv[item.id];
        }

        get().addCoins(order.coins);
        get().addXP(order.xp);
        
        const updatedOrders = [...state.orders];
        updatedOrders.splice(orderIndex, 1);
        
        set({ inventory: inv, orders: updatedOrders });
        toast.success(`Pesanan selesai! +${order.coins} 💰`, { icon: '📦' });
        return true;
      },
      
      updatePlotStatus: (plotId, status) => {
        set((state) => ({
          plots: state.plots.map(p =>
            p.id === plotId ? { ...p, status } : p
          )
        }));
      },
      
      swapPlots: (id1, id2) => {
        set((state) => {
          const newPlots = [...state.plots];
          const idx1 = newPlots.findIndex(p => p.id === id1);
          const idx2 = newPlots.findIndex(p => p.id === id2);
          if (idx1 !== -1 && idx2 !== -1) {
            const temp = newPlots[idx1];
            newPlots[idx1] = newPlots[idx2];
            newPlots[idx2] = temp;
          }
          return { plots: newPlots };
        });
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
        
        set((state) => {
          const newInventory = { ...state.inventory };
          const next = current - quantity;
          if (next <= 0) {
            delete newInventory[itemId];
          } else {
            newInventory[itemId] = next;
          }
          return { inventory: newInventory };
        });
        
        return true;
      },

      sellAllInventory: () => {
        const state = get();
        let totalEarned = 0;
        const newInventory = { ...state.inventory };

        Object.entries(newInventory).forEach(([itemId, amount]) => {
          const qty = Number(amount);
          if (!Number.isFinite(qty) || qty <= 0) return;
          const sellPrice = getItemSellPrice(itemId);
          if (sellPrice == null || !Number.isFinite(sellPrice)) return;
          totalEarned += sellPrice * qty;
          delete newInventory[itemId];
        });

        if (totalEarned <= 0) return 0;

        const multiplier = safePositiveNumber(state.coinMultiplier, 1) || 1;
        const finalEarned = Math.round(totalEarned * multiplier);
        set({
          inventory: newInventory,
          coins: safeCoins(state.coins) + finalEarned,
        });
        return finalEarned;
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
        get().progressQuest('collect', productType, 1);

        return true;
      },
      
      swapAnimals: (id1, id2) => {
        set((state) => {
          const newAnimals = [...state.animals];
          const idx1 = newAnimals.findIndex(a => a.id === id1);
          const idx2 = newAnimals.findIndex(a => a.id === id2);
          if (idx1 !== -1 && idx2 !== -1) {
            const temp = newAnimals[idx1];
            newAnimals[idx1] = newAnimals[idx2];
            newAnimals[idx2] = temp;
          }
          return { animals: newAnimals };
        });
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
        const reward = rewards[Math.min(newStreak - 1, 6)] ?? 100;

        set({
          streak: newStreak,
          lastLogin: today,
          coins: safeCoins(state.coins) + reward,
        });
        
        return {
          claimed: true,
          streak: newStreak,
          reward,
          message: `🔥 Streak ${newStreak} hari! +${reward} 💰`
        };
      },

      // ===== QUEST SYSTEM =====
      
      generateDailyQuests: () => {
        const today = new Date().toDateString();
        const state = get();
        
        if (state.lastQuestDate === today && Array.isArray(state.dailyQuests) && state.dailyQuests.length > 0) {
          return; // Already generated for today
        }
        
        // Randomly generate 3 quests
        const possibleQuests = [
          { type: 'harvest', action: 'Panen', targetId: 'wortel', targetName: 'Wortel', count: 0, required: 10, rewardCoins: 100, rewardXp: 50, claimed: false },
          { type: 'harvest', action: 'Panen', targetId: 'tomat', targetName: 'Tomat', count: 0, required: 15, rewardCoins: 150, rewardXp: 80, claimed: false },
          { type: 'harvest', action: 'Panen', targetId: 'gandum', targetName: 'Gandum', count: 0, required: 20, rewardCoins: 200, rewardXp: 100, claimed: false },
          { type: 'mine', action: 'Tambang', targetId: 'batu', targetName: 'Batu', count: 0, required: 15, rewardCoins: 120, rewardXp: 60, claimed: false },
          { type: 'mine', action: 'Tambang', targetId: 'tembaga', targetName: 'Tembaga', count: 0, required: 5, rewardCoins: 180, rewardXp: 90, claimed: false },
          { type: 'mine', action: 'Tambang', targetId: 'besi', targetName: 'Besi', count: 0, required: 3, rewardCoins: 250, rewardXp: 120, claimed: false },
          { type: 'fish', action: 'Pancing', targetId: 'ikan_teri', targetName: 'Ikan Teri', count: 0, required: 5, rewardCoins: 100, rewardXp: 50, claimed: false },
          { type: 'fish', action: 'Pancing', targetId: 'ikan_lele', targetName: 'Ikan Lele', count: 0, required: 3, rewardCoins: 150, rewardXp: 80, claimed: false },
          { type: 'collect', action: 'Kumpulkan', targetId: 'telur', targetName: 'Telur Ayam', count: 0, required: 5, rewardCoins: 100, rewardXp: 50, claimed: false }
        ];
        
        // Shuffle and pick 3
        const shuffled = [...possibleQuests].sort(() => 0.5 - Math.random());
        const selectedQuests = shuffled.slice(0, 3).map((q, i) => ({ ...q, id: `q_${Date.now()}_${i}` }));
        
        set({ dailyQuests: selectedQuests, lastQuestDate: today });
      },
      
      progressQuest: (type, targetId, amount = 1) => {
        set((state) => {
          const quests = state.dailyQuests;
          if (!Array.isArray(quests) || quests.length === 0) return state;

          let updated = false;
          const newQuests = quests.map((q) => {
            if (!q.claimed && q.type === type && q.targetId === targetId && q.count < q.required) {
              updated = true;
              return { ...q, count: Math.min(q.required, q.count + amount) };
            }
            return q;
          });

          return updated ? { dailyQuests: newQuests } : state;
        });
      },

      batchProgressQuest: (entries = []) => {
        if (!entries.length) return;
        set((state) => {
          const quests = state.dailyQuests;
          if (!Array.isArray(quests) || quests.length === 0) return state;

          const deltas = new Map();
          for (const { type, targetId, amount = 1 } of entries) {
            const key = `${type}:${targetId}`;
            deltas.set(key, { type, targetId, amount: (deltas.get(key)?.amount || 0) + amount });
          }

          let updated = false;
          const newQuests = quests.map((q) => {
            const key = `${q.type}:${q.targetId}`;
            const delta = deltas.get(key);
            if (!delta || q.claimed || q.count >= q.required) return q;
            updated = true;
            return { ...q, count: Math.min(q.required, q.count + delta.amount) };
          });

          return updated ? { dailyQuests: newQuests } : state;
        });
      },
      
      claimQuestReward: (questId) => {
        const state = get();
        const quest = state.dailyQuests.find(q => q.id === questId);
        
        if (!quest || quest.claimed || quest.count < quest.required) {
          return false;
        }
        
        const rewardCoins = safePositiveNumber(quest.rewardCoins, 0);
        set((state) => ({
          dailyQuests: state.dailyQuests.map(q => q.id === questId ? { ...q, claimed: true } : q),
          coins: safeCoins(state.coins) + rewardCoins,
        }));
        
        get().addXP(quest.rewardXp);
        return true;
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
          coins: safeCoins(state.coins) + reward,
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
      buyGrowthBooster: (cost = 50) => {
        const state = get();
        const price = safePositiveNumber(cost, 50);
        if (state.growthMultiplier > 1) return false;
        const currentCoins = safeCoins(state.coins);
        if (currentCoins < price) return false;
        set({ coins: currentCoins - price, growthMultiplier: 1.5 });
        return true;
      },

      // ===== WORKERS (AUTO) =====

      hireWorker: (type, cost) => {
        const state = get();
        if (state.workers[type]) return false;
        const price = safePositiveNumber(cost, 0);
        if (price <= 0) return false;
        const currentCoins = safeCoins(state.coins);
        if (currentCoins < price) return false;

        const autoFlags = {
          farmer: { autoFarmer: true },
          rancher: { autoRancher: true },
          fisher: { autoFisher: true },
          miner: { autoMiner: true },
        };

        set({
          coins: currentCoins - price,
          workers: { ...state.workers, [type]: true },
          ...(autoFlags[type] || {}),
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
      
      // ===== PHASE 1 LOGIC =====
      
      advanceSeasonTick: () => {
        set((state) => {
          if (!state.season) return state;
          let { tick, day, current } = state.season;
          let activeEvent = state.activeEvent;
          tick += 1;
          
          if (tick >= 180) { // 3 real minutes per day for testing
            tick = 0;
            day += 1;
            
            // Random Event Check on new day
            const eventChance = Math.random();
            if (eventChance < 0.3) {
              const events = [
                { id: 'panen', name: '🎊 Festival Panen', desc: 'Harga jual semua tanaman x2 hari ini!' },
                { id: 'bahari', name: '🎣 Hari Bahari', desc: 'Ikan terjual dengan harga x2!' },
                { id: 'tambang', name: '💎 Demam Emas', desc: 'Peluang mendapat Emas & Berlian meningkat!' }
              ];
              activeEvent = events[Math.floor(Math.random() * events.length)];
            } else {
              activeEvent = null;
            }

            if (day > 7) { // 7 days per season
              day = 1;
              const seasons = ['spring', 'summer', 'autumn', 'winter'];
              const idx = seasons.indexOf(current);
              current = seasons[(idx + 1) % 4];
            }
          }
          return { season: { current, day, tick }, activeEvent };
        });
      },

      changeWeather: () => {
        set((state) => {
          if (!state.weather) return state;
          let { nextChangeIn } = state.weather;
          nextChangeIn -= 1;
          if (nextChangeIn <= 0) {
            const weathers = ['☀️ Cerah', '⛅ Berawan', '🌧️ Hujan', '⛈️ Badai', '💨 Berangin'];
            const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
            return { weather: { current: randomWeather, nextChangeIn: 300 } };
          }
          return { weather: { ...state.weather, nextChangeIn } };
        });
      },

      mineNode: (nodeId) => {
        const state = get();
        const node = state.mining.nodes.find(n => n.id === nodeId);
        if (!node || node.status !== 'ready') return null;

        const regenTime = getMiningRegenMs(state.mining);
        
        set((state) => ({
          mining: {
            ...state.mining,
            nodes: state.mining.nodes.map(n => 
              n.id === nodeId ? { ...n, status: 'cooldown', regenAt: Date.now() + regenTime } : n
            )
          },
          inventory: {
            ...state.inventory,
            [node.type]: (state.inventory[node.type] || 0) + 1
          }
        }));

        get().addXP(15);
        get().progressQuest('mine', node.type, 1);
        return node.type;
      },

      useMiningTool: (itemId, nodeId = null) => {
        const state = get();
        const count = state.inventory[itemId] || 0;
        if (count <= 0) {
          return { ok: false, message: 'Kamu tidak punya alat ini. Beli di shop kanan.' };
        }

        const mining = state.mining;
        const lanternActive = mining.lanternUntil && mining.lanternUntil > Date.now();

        if (itemId === 'pickaxe_besi') {
          if (mining.pickaxeLevel >= 2) {
            return { ok: false, message: 'Pickaxe ini sudah terpasang atau ada yang lebih baik.' };
          }
          if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
          set({ mining: { ...get().mining, pickaxeLevel: 2 }, selectedMiningTool: null });
          return { ok: true, message: '⛏️ Pickaxe Besi terpasang! Regen tambang 90 detik.' };
        }

        if (itemId === 'pickaxe_emas') {
          if (mining.pickaxeLevel >= 3) {
            return { ok: false, message: 'Pickaxe Emas sudah terpasang.' };
          }
          if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
          set({ mining: { ...get().mining, pickaxeLevel: 3 }, selectedMiningTool: null });
          return { ok: true, message: '🛠️ Pickaxe Emas terpasang! Regen 60 detik + bonus mineral langka.' };
        }

        if (itemId === 'senter') {
          if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
          set({
            mining: { ...get().mining, lanternUntil: Date.now() + 300000 },
            selectedMiningTool: null
          });
          return { ok: true, message: '🔦 Senter aktif 5 menit! Regen 2× lebih cepat + bonus ore.' };
        }

        if (itemId === 'bom_besar') {
          const readyNodes = mining.nodes.filter(n => n.status === 'ready');
          if (readyNodes.length === 0) {
            return { ok: false, message: 'Tidak ada petak siap ditambang.' };
          }
          if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
          const regenTime = getMiningRegenMs(get().mining);
          const newInventory = { ...get().inventory };
          let mined = 0;
          const newNodes = get().mining.nodes.map(n => {
            if (n.status !== 'ready') return n;
            newInventory[n.type] = (newInventory[n.type] || 0) + 1;
            mined++;
            get().progressQuest('mine', n.type, 1);
            return { ...n, status: 'cooldown', regenAt: Date.now() + regenTime };
          });
          set({
            mining: { ...get().mining, nodes: newNodes },
            inventory: newInventory,
            selectedMiningTool: null
          });
          get().addXP(mined * 15);
          return { ok: true, message: `💣 Bom Besar meledak! ${mined} petak ditambang sekaligus.` };
        }

        if (nodeId === null || nodeId === undefined) {
          return { ok: false, needTarget: true, message: 'Pilih petak tambang dulu.' };
        }

        const node = mining.nodes.find(n => n.id === nodeId);
        if (!node) return { ok: false, message: 'Petak tidak ditemukan.' };

        if (itemId === 'bom_kecil') {
          if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
          const regenTime = getMiningRegenMs(get().mining);
          const newInventory = { ...get().inventory };

          if (node.status === 'ready') {
            newInventory[node.type] = (newInventory[node.type] || 0) + 2;
            get().progressQuest('mine', node.type, 1);
            set({
              mining: {
                ...get().mining,
                nodes: get().mining.nodes.map(n =>
                  n.id === nodeId ? { ...n, status: 'cooldown', regenAt: Date.now() + regenTime } : n
                )
              },
              inventory: newInventory,
              selectedMiningTool: null
            });
            get().addXP(20);
            return { ok: true, message: '🧨 Bom Kecil! Hasil tambang ×2 dari petak ini.' };
          }

          // Ledakkan batuan yang masih cooldown → langsung siap
          const newType = rollMineralType(mining.pickaxeLevel, lanternActive);
          set({
            mining: {
              ...get().mining,
              nodes: get().mining.nodes.map(n =>
                n.id === nodeId ? { ...n, status: 'ready', regenAt: null, type: newType } : n
              )
            },
            selectedMiningTool: null
          });
          return { ok: true, message: '🧨 Bom Kecil membuka petak yang tertutup!' };
        }

        if (itemId === 'tali') {
          if (node.status === 'ready') {
            return { ok: false, message: 'Petak ini sudah siap — tidak perlu tali.' };
          }
          if (!get().removeItem(itemId, 1)) return { ok: false, message: 'Gagal memakai alat.' };
          const newType = rollMineralType(mining.pickaxeLevel, lanternActive);
          set({
            mining: {
              ...get().mining,
              nodes: get().mining.nodes.map(n =>
                n.id === nodeId ? { ...n, status: 'ready', regenAt: null, type: newType } : n
              )
            },
            selectedMiningTool: null
          });
          return { ok: true, message: '🪢 Tali mempercepat pemulihan petak tambang!' };
        }

        return { ok: false, message: 'Alat tidak dikenali.' };
      },

      syncMiningNodes: () => {
        const now = Date.now();
        const state = get();
        if (!state.mining) return;
        let changed = false;
        
        let newNodes = state.mining.nodes.map(n => {
          if ((n.status === 'cooldown' || n.status === 'depleted') && n.regenAt && now >= n.regenAt) {
            changed = true;
            const lanternActive = state.mining.lanternUntil && state.mining.lanternUntil > Date.now();
            return { 
              ...n, 
              status: 'ready', 
              regenAt: null,
              type: rollMineralType(state.mining.pickaxeLevel, lanternActive)
            };
          }
          return n;
        });

        if (isWorkerActive(state, 'miner')) {
          const readyNodes = newNodes.filter(n => n.status === 'ready');
          if (readyNodes.length > 0 && Math.random() < 0.2) {
            const nodeToMine = readyNodes[0];
            const minedType = nodeToMine.type;
            const lanternActive = state.mining.lanternUntil && state.mining.lanternUntil > Date.now();
            const regenTime = getMiningRegenMs(state.mining);

            newNodes = newNodes.map(n =>
              n.id === nodeToMine.id
                ? {
                    ...n,
                    status: 'cooldown',
                    regenAt: now + regenTime,
                    type: rollMineralType(state.mining.pickaxeLevel, lanternActive),
                  }
                : n
            );
            changed = true;

            set({
              mining: { ...state.mining, nodes: newNodes },
              inventory: {
                ...state.inventory,
                [minedType]: (state.inventory[minedType] || 0) + 1,
              },
            });
            get().addXP(15);
            get().progressQuest('mine', minedType, 1);
            return;
          }
        }

        if (changed) {
          set({ mining: { ...state.mining, nodes: newNodes } });
        }
      },

      giveGift: (npcId, itemId, isLiked) => {
        const state = get();
        if (!state.inventory[itemId] || state.inventory[itemId] <= 0) return null;

        // Decrease item
        const newInventory = { ...state.inventory, [itemId]: state.inventory[itemId] - 1 };
        
        // Add points
        const currentNpc = state.npcs[npcId] || { level: 1, points: 0 };
        const pointsGained = isLiked ? 50 : 10;
        let newPoints = currentNpc.points + pointsGained;
        let newLevel = currentNpc.level;
        let leveledUp = false;

        const maxPoints = currentNpc.level * 100;
        if (newPoints >= maxPoints && newLevel < 5) { // max level 5
          newPoints -= maxPoints;
          newLevel += 1;
          leveledUp = true;
          // Reward user
          get().addXP(100 * newLevel);
        }

        set({
          inventory: newInventory,
          npcs: {
            ...state.npcs,
            [npcId]: { level: newLevel, points: newPoints }
          }
        });

        return { leveledUp, newLevel, pointsGained };
      },

      processGameTick: () => {
        const actions = [
          () => get().advanceSeasonTick(),
          () => get().changeWeather(),
          () => get().syncPlots(),
          () => get().syncMiningNodes(),
          () => get().runAutoWorkers(),
          () => get().processCraftingQueue(),
          () => get().checkOrders(),
        ];

        for (const action of actions) {
          try {
            action();
          } catch (error) {
            console.error('Game tick error:', error);
          }
        }
      },

      processCraftingQueue: () => {
        const state = get();
        if (!state.craftingQueue || state.craftingQueue.length === 0) return;

        const now = Date.now();
        let changed = false;
        const newQueue = [...state.craftingQueue];
        const inv = { ...state.inventory };
        let xpGained = 0;

        for (let i = newQueue.length - 1; i >= 0; i--) {
          const item = newQueue[i];
          if (now - item.startTime >= item.duration) {
            const recipe = RECIPES.find(r => r.id === item.recipeId);
            if (recipe) {
              inv[recipe.id] = (inv[recipe.id] || 0) + 1;
              xpGained += recipe.xp || 0;
            }
            newQueue.splice(i, 1);
            changed = true;
          }
        }

        if (changed) {
          set({ craftingQueue: newQueue, inventory: inv });
          if (xpGained > 0) get().addXP(xpGained);
        }
      },

      checkOrders: () => {
        const state = get();
        // Generate orders if none exist
        if (!state.orders || state.orders.length === 0) {
          get().generateOrders();
          return;
        }

        // Expire orders if timer is up
        const now = Date.now();
        let changed = false;
        const newOrders = [...state.orders];
        
        for (let i = newOrders.length - 1; i >= 0; i--) {
          const order = newOrders[i];
          if (now - order.createdAt > order.timer * 1000) {
            newOrders.splice(i, 1);
            changed = true;
          }
        }

        if (changed) {
          set({ orders: newOrders });
          // If we expired all of them, generate new ones
          if (newOrders.length === 0) {
            get().generateOrders();
          }
        }
      },

      runAutoWorkers: () => {
        const state = get();
        const now = Date.now();
        const growthMult = getGrowthMultiplier(state);
        let plots = normalizePlots(state.plots);
        let animals = Array.isArray(state.animals) ? state.animals.map(normalizeAnimal) : [];
        let inventory = { ...state.inventory };
        let xpGain = 0;
        let harvested = 0;
        let planted = 0;
        let collected = 0;
        let plotsChanged = false;
        let animalsChanged = false;
        const questEntries = [];

        // --- 1. KURCACI PETANI ---
        if (isWorkerActive(state, 'farmer')) {
          plots = [...plots];

          for (let i = 0; i < plots.length; i++) {
            const p = normalizePlot(plots[i], i);
            const growTime = p.growTime > 0 ? p.growTime : null;
            const isReady = p.crop && (
              p.status === 'ready' ||
              (p.status === 'growing' && p.plantedAt && growTime != null && now - p.plantedAt >= growTime)
            );

            if (isReady) {
              const crop = p.crop;
              plots[i] = { id: p.id, status: 'empty', crop: null, plantedAt: null, growTime: null };
              inventory[crop] = (inventory[crop] || 0) + 1;
              harvested++;
              plotsChanged = true;
              xpGain += 10;
              questEntries.push({ type: 'harvest', targetId: crop, amount: 1 });
            }

            if (plots[i].status === 'empty') {
              const seedData = pickAutoSeed(inventory, state.selectedSeed, state.season?.current);
              if (seedData) {
                consumeInventoryItem(inventory, seedData.id);
                plots[i] = {
                  id: plots[i].id,
                  status: 'growing',
                  crop: seedData.cropId,
                  plantedAt: now,
                  growTime: (seedData.time * 1000) / growthMult,
                };
                planted++;
                plotsChanged = true;
              }
            }
          }
        }

        // --- 2. KURCACI PETERNAK ---
        if (isWorkerActive(state, 'rancher')) {
          animals = [...animals];

          for (let i = 0; i < animals.length; i++) {
            const a = normalizeAnimal(animals[i]);
            const data = SHOP_ANIMALS.find((s) => s.id === a.type);
            if (data && a.status === 'producing' && now - a.lastCollected >= a.produceTime) {
              animals[i] = { ...a, lastCollected: now };
              inventory[data.product] = (inventory[data.product] || 0) + 1;
              collected++;
              animalsChanged = true;
              xpGain += 8;
              questEntries.push({ type: 'collect', targetId: data.product, amount: 1 });
            } else {
              animals[i] = a;
            }
          }
        }

        if (plotsChanged || animalsChanged) {
          set({
            ...(plotsChanged ? { plots } : {}),
            ...(animalsChanged ? { animals } : {}),
            inventory,
          });
          if (xpGain > 0) get().addXP(xpGain);
          if (questEntries.length > 0) get().batchProgressQuest(questEntries);
          if (harvested > 0 || planted > 0) {
            toast.success(`👨‍🌾 Petani Budi panen ${harvested} & tanam ${planted}!`, { id: 'auto-farm' });
          }
          if (collected > 0) {
            toast.success(`👩‍🌾 Peternak Siti ambil ${collected} hasil ternak!`, { id: 'auto-rancher' });
          }
        }

        // --- 3. KURCACI PEMANCING (FISHER) ---
        if (isWorkerActive(state, 'fisher')) {
          if (Math.random() < 0.1) {
            const rand = Math.random();
            let cumulative = 0;
            let caughtFish = FISHES[0];
            for (const fish of FISHES) {
              cumulative += fish.chance;
              if (rand <= cumulative) {
                caughtFish = fish;
                break;
              }
            }
            set((s) => ({
              inventory: { ...s.inventory, [caughtFish.id]: (s.inventory[caughtFish.id] || 0) + 1 },
            }));
            get().addXP(15);
            get().progressQuest('fish', caughtFish.id, 1);
            toast.success(`🎣 Nelayan Mamat mendapat ${caughtFish.emoji} ${caughtFish.name}!`, { id: 'auto-fisher', duration: 2000 });
          }
        }
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
        workers: state.workers,
        autoFarmer: state.autoFarmer,
        autoRancher: state.autoRancher,
        autoFisher: state.autoFisher,
        autoMiner: state.autoMiner,
        selectedSeed: state.selectedSeed,
        season: state.season,
        weather: state.weather,
        mining: state.mining,
        npcs: state.npcs,
        activeEvent: state.activeEvent,
        dailyQuests: state.dailyQuests,
        lastQuestDate: state.lastQuestDate,
        workerAutoMigrated: state.workerAutoMigrated,
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
