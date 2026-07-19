import { getItemSellPrice, isSellableProduce } from '../../data/item-helpers';
import { RECIPES, ORDER_TEMPLATES } from '../../data/recipes';
import { FISHES } from '../../data/fishes';
import { SHOP_SEEDS } from '../../data/crops';
import { GAME_CONSTANTS } from '../../constants';
import { safeCoins, safePositiveNumber } from '../utils';
import toast from 'react-hot-toast';

export const createPlayerSlice = (set, get) => ({


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


  // ===== XP & LEVEL =====
  addXP: (amount) => {
    if (amount <= 0) return false;

    const prevLevel = get().level;

    set((state) => {
      let newXP = state.xp + amount;
      let newLevel = state.level;
      let newMaxEnergy = state.maxEnergy || 100;

      // Check level up
      while (newXP >= newLevel * 100) {
        newXP -= newLevel * 100;
        newLevel++;
      }

      if (newLevel > state.level) {
        newMaxEnergy = 100 + (newLevel - 1) * 10;
        if (newMaxEnergy > 200) newMaxEnergy = 200; // Cap at 200 (Level 11)
      }

      return {
        xp: newXP,
        level: newLevel,
        maxEnergy: newMaxEnergy,
        ...(newLevel > state.level ? { energy: newMaxEnergy } : {}) // Refill on level up
      };
    });

    if (get().level > prevLevel) {
      toast.success(`Level Up! Level ${get().level} 🌟\nEnergy Maksimal naik!`, { icon: '🎉', duration: 4000 });
      return true;
    }
    return false;
  },

  // ===== ENERGY =====
  consumeEnergy: (amount) => {
    const state = get();
    if (state.energy >= amount) {
      set({ energy: state.energy - amount });
      return true;
    }
    toast.error('Energy tidak cukup! Tunggu besok atau makan sesuatu.', { icon: '😴' });
    return false;
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



  // ===== BOOSTERS =====
  activateCoinBooster: () => {
    set({
      coinMultiplier: GAME_CONSTANTS.MULTIPLIERS.COIN_BOOSTER,
      coinMultiplierExpireAt: Date.now() + 30 * 60 * 1000,
    });
  },

  buyGrowthBooster: (cost = GAME_CONSTANTS.COSTS.GROWTH_BOOSTER) => {
    const state = get();
    const price = safePositiveNumber(cost, GAME_CONSTANTS.COSTS.GROWTH_BOOSTER);
    if (state.growthMultiplier > 1) return false;
    const currentCoins = safeCoins(state.coins);
    if (currentCoins < price) return false;
    set({
      coins: currentCoins - price,
      growthMultiplier: GAME_CONSTANTS.MULTIPLIERS.GROWTH_BOOSTER,
      growthMultiplierExpireAt: Date.now() + 30 * 60 * 1000,
    });
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

  // ===== COMBO SYSTEM =====
  registerCombo: () => {
    const now = Date.now();
    const state = get();
    const timeSinceLast = now - state.combo.lastAction;
    
    let newCount = 1;
    if (timeSinceLast < GAME_CONSTANTS.COMBO.WINDOW_MS) {
      newCount = state.combo.count + 1;
    }
    
    const multiplier = Math.min(1 + (newCount - 1) * GAME_CONSTANTS.COMBO.MULTIPLIER_STEP, GAME_CONSTANTS.COMBO.MAX_MULTIPLIER);
    
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

  // ===== QUEST SYSTEM =====
  generateDailyQuests: () => {
    const today = new Date().toDateString();
    const state = get();
    
    if (state.lastQuestDate === today && Array.isArray(state.dailyQuests) && state.dailyQuests.length > 0) {
      return; 
    }
    
    const possibleQuests = [
      { type: 'harvest', action: 'Panen', targetId: 'wortel', targetName: 'Wortel', count: 0, required: 10, rewardCoins: 100, rewardXp: 50, claimed: false },
      { type: 'harvest', action: 'Panen', targetId: 'tomat', targetName: 'Tomat', count: 0, required: 15, rewardCoins: 150, rewardXp: 80, claimed: false },
      { type: 'harvest', action: 'Panen', targetId: 'gandum', targetName: 'Gandum', count: 0, required: 20, rewardCoins: 200, rewardXp: 100, claimed: false },
      { type: 'mine', action: 'Tambang', targetId: 'batu', targetName: 'Batu', count: 0, required: 15, rewardCoins: 120, rewardXp: 60, claimed: false },
      { type: 'mine', action: 'Tambang', targetId: 'tembaga', targetName: 'Tembaga', count: 0, required: 5, rewardCoins: 180, rewardXp: 90, claimed: false },
      { type: 'mine', action: 'Tambang', targetId: 'besi', targetName: 'Besi', count: 0, required: 3, rewardCoins: 250, rewardXp: 120, claimed: false },
      { type: 'fish', action: 'Pancing', targetId: 'ikan_mas', targetName: 'Ikan Mas', count: 0, required: 5, rewardCoins: 100, rewardXp: 50, claimed: false },
      { type: 'fish', action: 'Pancing', targetId: 'lele', targetName: 'Lele', count: 0, required: 3, rewardCoins: 150, rewardXp: 80, claimed: false },
      { type: 'collect', action: 'Kumpulkan', targetId: 'telur', targetName: 'Telur Ayam', count: 0, required: 5, rewardCoins: 100, rewardXp: 50, claimed: false }
    ];
    
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
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;

    const typeQueue = (state.craftingQueue || []).filter(
      (q) => RECIPES.find((r) => r.id === q.recipeId)?.type === recipe.type
    );
    if (typeQueue.length >= GAME_CONSTANTS.CRAFTING.MAX_QUEUE_PER_TYPE) {
      toast.error(`Antrean dapur ini penuh! Maksimal ${GAME_CONSTANTS.CRAFTING.MAX_QUEUE_PER_TYPE} antrean per jenis.`);
      return false;
    }

    const inv = { ...state.inventory };
    for (const [item, qty] of Object.entries(recipe.req)) {
      if ((inv[item] || 0) < qty) {
        toast.error(`Bahan tidak cukup: ${qty}x ${item}`);
        return false;
      }
    }

    for (const [item, qty] of Object.entries(recipe.req)) {
      inv[item] -= qty;
      if (inv[item] <= 0) delete inv[item];
    }

    const id = Math.random().toString(36).substring(2, 9);
    const startTime = Date.now();
    const duration = recipe.time * 1000;

    set((s) => ({
      inventory: inv,
      craftingQueue: [...s.craftingQueue, { id, recipeId, startTime, duration }],
    }));

    toast.success(`Mulai membuat ${recipe.name}!`, { icon: '🍳' });
    return true;
  },

  removeCraftingQueue: (queueId) => {
    const state = get();
    const queueItem = state.craftingQueue.find(q => q.id === queueId);
    if (!queueItem) return;

    const recipe = RECIPES.find(r => r.id === queueItem.recipeId);
    if (!recipe) return;

    // Refund ingredients
    const newInventory = { ...state.inventory };
    for (const [item, qty] of Object.entries(recipe.req)) {
      newInventory[item] = (newInventory[item] || 0) + qty;
    }

    set(s => ({
      inventory: newInventory,
      craftingQueue: s.craftingQueue.filter(q => q.id !== queueId)
    }));
    toast.success('Dibatalkan, bahan dikembalikan!');
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
        const recipe = RECIPES.find((r) => r.id === item.recipeId);
        if (recipe) {
          inv[recipe.id] = (inv[recipe.id] || 0) + 1;
          xpGained += recipe.xp || 0;
          if (recipe.type === 'restaurant') {
            get().progressQuest?.('craft', recipe.id, 1);
          }
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

  collectCraftedItem: (queueId) => {
    const state = get();
    const index = state.craftingQueue.findIndex(q => q.id === queueId);
    if (index === -1) return false;

    const item = state.craftingQueue[index];
    if (Date.now() - item.startTime < item.duration) return false;

    const recipe = RECIPES.find((r) => r.id === item.recipeId);
    if (!recipe) {
        const newQueue = [...state.craftingQueue];
        newQueue.splice(index, 1);
        set({ craftingQueue: newQueue });
        return false;
    }

    const inv = { ...state.inventory };
    inv[recipe.id] = (inv[recipe.id] || 0) + 1;
    
    const newQueue = [...state.craftingQueue];
    newQueue.splice(index, 1);

    set({ craftingQueue: newQueue, inventory: inv });
    get().addXP(recipe.xp || 0);
    if (recipe.type === 'restaurant') {
      get().progressQuest?.('craft', recipe.id, 1);
    }
    // ===== Stats & Achievement tracking =====
    set(s => ({
      stats: {
        ...s.stats,
        totalCooked: (s.stats?.totalCooked || 0) + 1,
        ...(recipe.id === 'sushi_emas' ? { totalSushiEmasMade: (s.stats?.totalSushiEmasMade || 0) + 1 } : {}),
      }
    }));
    get().markSessionAction?.('cooked');
    get().checkAchievements?.();
    return true;
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
    
    set({
      inventory: inv,
      orders: updatedOrders,
      stats: { ...state.stats, totalOrdersFulfilled: (state.stats?.totalOrdersFulfilled || 0) + 1 },
    });
    get().checkAchievements?.();
    toast.success(`Pesanan selesai! +${order.coins} 💰`, { icon: '📦' });
    return true;
  },

  checkOrders: () => {
    const state = get();
    if (!state.orders || state.orders.length === 0) {
      get().generateOrders();
      return;
    }

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
      if (newOrders.length === 0) {
        get().generateOrders();
      }
    }
  },

  // ===== TUTORIAL =====
  completeTutorialStep: (step) => {
    const state = get();
    if (state.tutorialStep === step) {
      set({ tutorialStep: step + 1 });
    }
  },
  
  skipTutorial: () => {
    set({ tutorialStep: -1 });
  },
});
