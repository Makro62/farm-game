'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { SHOP_SEEDS, SHOP_ANIMALS, FISHES } from './utils';

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
    fisher: false
  },
  
  autoFarmer: false,
  autoRancher: false,
  autoFisher: false,
  selectedSeed: null,
  
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
    pickaxeLevel: 1
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
  lastQuestDate: null
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
      setSelectedSeed: (seedId) => set({ selectedSeed: seedId }),
      
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

      // ===== QUEST SYSTEM =====
      
      generateDailyQuests: () => {
        const today = new Date().toDateString();
        const state = get();
        
        if (state.lastQuestDate === today && state.dailyQuests.length > 0) {
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
        set(state => {
          let updated = false;
          const newQuests = state.dailyQuests.map(q => {
            if (!q.claimed && q.type === type && q.targetId === targetId && q.count < q.required) {
              updated = true;
              return { ...q, count: Math.min(q.required, q.count + amount) };
            }
            return q;
          });
          
          if (updated) {
            return { dailyQuests: newQuests };
          }
          return {};
        });
      },
      
      claimQuestReward: (questId) => {
        const state = get();
        const quest = state.dailyQuests.find(q => q.id === questId);
        
        if (!quest || quest.claimed || quest.count < quest.required) {
          return false;
        }
        
        set(state => ({
          dailyQuests: state.dailyQuests.map(q => q.id === questId ? { ...q, claimed: true } : q),
          coins: state.coins + quest.rewardCoins
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

        const regenTime = 120 * 1000; // 2 minutes regen
        
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
          },
          xp: state.xp + 15
        }));

        get().progressQuest('mine', node.type, 1);
        return node.type;
      },

      syncMiningNodes: () => {
        const now = Date.now();
        const state = get();
        if (!state.mining) return;
        let changed = false;
        
        let newNodes = state.mining.nodes.map(n => {
          if ((n.status === 'cooldown' || n.status === 'depleted') && n.regenAt && now >= n.regenAt) {
            changed = true;
            return { 
              ...n, 
              status: 'ready', 
              regenAt: null,
              type: Math.random() < 0.05 ? 'berlian' : Math.random() < 0.15 ? 'emas' : Math.random() < 0.3 ? 'besi' : Math.random() < 0.5 ? 'tembaga' : 'batu'
            };
          }
          return n;
        });

        if (state.workers.miner) {
          const readyNodes = newNodes.filter(n => n.status === 'ready');
          if (readyNodes.length > 0 && Math.random() < 0.2) { // 20% chance
            const nodeToMine = readyNodes[0];
            const rand = Math.random();
            let minedType = 'batu';
            if (rand < 0.05) minedType = 'berlian';
            else if (rand < 0.15) minedType = 'emas';
            else if (rand < 0.3) minedType = 'besi';
            else if (rand < 0.5) minedType = 'tembaga';
            
            newNodes = newNodes.map(n => 
              n.id === nodeToMine.id 
                ? { ...n, status: 'depleted', regenAt: now + 120000 }
                : n
            );
            changed = true;
            
            setTimeout(() => {
              useGameStore.getState().addItem(minedType, 1);
            }, 0);
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

      runAutoWorkers: () => {
        const state = get();
        const now = Date.now();
        let changed = false;

        // --- 1. KURCACI PETANI ---
        if (state.workers.farmer && state.autoFarmer) {
          let harvested = 0;
          let planted = 0;
          const newPlots = [...state.plots];
          const newInventory = { ...state.inventory };
          
          for (let i = 0; i < newPlots.length; i++) {
            const p = newPlots[i];
            const isReady = p.crop && (p.status === 'ready' || (p.status === 'growing' && p.plantedAt && now - p.plantedAt >= p.growTime));
            
            // Harvest
            if (isReady) {
              const crop = p.crop;
              newPlots[i] = { id: p.id, status: 'empty', crop: null, plantedAt: null, growTime: null };
              newInventory[crop] = (newInventory[crop] || 0) + 1;
              harvested++;
              changed = true;
              // quest progress done outside loop to avoid many state updates? Actually let's just do it inside loop via direct mutation of state if we want, or just call action which calls set. Calling action in loop is fine for zustand, but we can aggregate. Actually, calling `get().progressQuest` directly in the loop is safe because it's a small array.
              get().progressQuest('harvest', crop, 1);
            } 
            
            // Plant (dapat langsung dilakukan setelah panen)
            if (newPlots[i].status === 'empty' && state.selectedSeed) {
              const seedData = SHOP_SEEDS.find(s => s.id === state.selectedSeed);
              if (seedData && (newInventory[state.selectedSeed] || 0) > 0) {
                newInventory[state.selectedSeed] -= 1;
                newPlots[i] = {
                  id: newPlots[i].id,
                  status: 'growing',
                  crop: seedData.cropId,
                  plantedAt: now,
                  growTime: (seedData.time * 1000) / state.growthMultiplier
                };
                planted++;
                changed = true;
              }
            }
          }
          if (changed) {
            set({ plots: newPlots, inventory: newInventory, xp: state.xp + (harvested * 10) });
            if (harvested > 0 || planted > 0) toast.success(`👨‍🌾 Petani Budi panen ${harvested} & tanam ${planted}!`, { id: 'auto-farm' });
          }
        }

        // --- 2. KURCACI PETERNAK ---
        if (state.workers.rancher && state.autoRancher) {
          let collected = 0;
          let rancherChanged = false;
          const newAnimals = [...state.animals];
          const newInventory = { ...state.inventory };

          for (let i = 0; i < newAnimals.length; i++) {
            const a = newAnimals[i];
            const data = SHOP_ANIMALS.find((s) => s.id === a.type);
            if (data && a.status === 'producing' && now - a.lastCollected >= a.produceTime) {
              newAnimals[i] = { ...a, lastCollected: now };
              newInventory[data.product] = (newInventory[data.product] || 0) + 1;
              collected++;
              rancherChanged = true;
              get().progressQuest('collect', data.product, 1);
            }
          }
          if (rancherChanged) {
            set({ animals: newAnimals, inventory: newInventory, xp: get().xp + (collected * 8) });
            if (collected > 0) toast.success(`👩‍🌾 Peternak Siti ambil ${collected} hasil ternak!`, { id: 'auto-rancher' });
            changed = true;
          }
        }

        // --- 3. KURCACI PEMANCING (FISHER) ---
        if (state.workers.fisher && state.autoFisher) {
          // 10% chance per tick to catch a fish
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
            set(s => ({
              inventory: { ...s.inventory, [caughtFish.id]: (s.inventory[caughtFish.id] || 0) + 1 },
              xp: s.xp + 15
            }));
            get().progressQuest('fish', caughtFish.id, 1);
            toast.success(`🎣 Nelayan Mamat mendapat ${caughtFish.emoji} ${caughtFish.name}!`, { id: 'auto-fisher', duration: 2000 });
            changed = true;
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
        selectedSeed: state.selectedSeed,
        season: state.season,
        weather: state.weather,
        mining: state.mining,
        npcs: state.npcs,
        activeEvent: state.activeEvent,
        dailyQuests: state.dailyQuests,
        lastQuestDate: state.lastQuestDate
      }),
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...persistedState };
        
        // MIGRATION: Pastikan array selalu 30 petak walau user punya save lama
        if (merged.plots && merged.plots.length < 30) {
          const newPlots = [...merged.plots];
          while (newPlots.length < 30) {
            newPlots.push({ id: newPlots.length, status: 'empty', crop: null, plantedAt: null, growTime: null });
          }
          merged.plots = newPlots;
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
