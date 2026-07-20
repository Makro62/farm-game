import { RECIPES, ORDER_TEMPLATES } from "@/lib/data/recipes";
import { FISHES } from "@/lib/data/fishes";
import { SHOP_SEEDS } from "@/lib/data/crops";
import { SHOP_BAIT } from "@/lib/data/shop";
import { GAME_CONSTANTS } from "@/lib/constants";
import { safeCoins, safePositiveNumber } from "@/lib/store/utils";

const INV = {
  has: (cat, itemId) => {
    const state = get();
    return !!state.inventoryByCategory[cat]?.[itemId]?.qty;
  },
  get: (cat, itemId) => {
    const state = get();
    return state.inventoryByCategory[cat]?.[itemId]?.qty || 0;
  },
  add: (cat, itemId, qty = 1, quality = "normal") => {
    set((draft) => {
      if (!draft.inventoryByCategory[cat][itemId]) {
        draft.inventoryByCategory[cat][itemId] = {
          qty: 0,
          quality,
          acquiredAt: Date.now(),
        };
      }
      draft.inventoryByCategory[cat][itemId].qty += qty;
    });
  },
  remove: (cat, itemId, qty = 1) => {
    let success = false;
    set((draft) => {
      const item = draft.inventoryByCategory[cat]?.[itemId];
      if (!item || item.qty < qty) return;
      item.qty -= qty;
      if (item.qty === 0) delete draft.inventoryByCategory[cat][itemId];
      success = true;
    });
    return success;
  },
  hasReq: (requirements) => {
    const state = get();
    for (const [key, amount] of Object.entries(requirements)) {
      const [cat, itemId] = key.split(".");
      if ((state.inventoryByCategory[cat]?.[itemId]?.qty || 0) < amount)
        return false;
    }
    return true;
  },
  consumeReq: (requirements) => {
    const state = get();
    for (const [key, amount] of Object.entries(requirements)) {
      const [cat, itemId] = key.split(".");
      if ((state.inventoryByCategory[cat]?.[itemId]?.qty || 0) < amount)
        return false;
    }
    set((draft) => {
      for (const [key, amount] of Object.entries(requirements)) {
        const [cat, itemId] = key.split(".");
        const item = draft.inventoryByCategory[cat]?.[itemId];
        if (!item) continue;
        item.qty -= amount;
        if (item.qty <= 0) delete draft.inventoryByCategory[cat][itemId];
      }
    });
    return true;
  },
  getFlat: () => {
    const state = get();
    const flat = {};
    for (const [cat, items] of Object.entries(state.inventoryByCategory)) {
      for (const [itemId, data] of Object.entries(items)) {
        flat[itemId] = (flat[itemId] || 0) + (data.qty || 0);
        if (data.qty > 0) {
          const qualityKey = `${itemId}_${data.quality}`;
          flat[qualityKey] = (flat[qualityKey] || 0) + data.qty;
        }
      }
    }
    return flat;
  },
};

export const createPlayerSlice = (set, get) => ({
  // ===== INVENTORY HELPERS (public API) =====
  invAdd: (cat, itemId, qty, quality) => INV.add(cat, itemId, qty, quality),
  invRemove: (cat, itemId, qty) => INV.remove(cat, itemId, qty),
  invGet: (cat, itemId) => {
    const state = get();
    return state.inventoryByCategory[cat]?.[itemId]?.qty || 0;
  },
  invHasReq: (requirements) => INV.hasReq(requirements),
  invConsumeReq: (requirements) => INV.consumeReq(requirements),
  invGetFlat: () => INV.getFlat(),

  // Legacy aliases for backward compat
  addItem: (itemId, quantity = 1, category = null) => {
    const cat = category || getItemCategory(itemId) || "collectibles";
    INV.add(cat, itemId, quantity);
  },

  removeItem: (itemId, quantity = 1) => {
    const cat = getItemCategory(itemId);
    if (!cat) return false;
    return INV.remove(cat, itemId, quantity);
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
      status: "producing",
      lastCollected: Date.now(),
      produceTime: safePositiveNumber(produceTime, 20000),
    }));

    set((draft) => {
      draft.coins = currentCoins - totalCost;
      draft.animals.push(...newAnimals);
    });
    return true;
  },

  eatFood: (recipeId) => {
    const state = get();
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) {
      get().enqueueNotification("Makanan tidak dikenal!", { type: "error" });
      return false;
    }
    if (!INV.get("cooked", recipeId) && !INV.get("processed", recipeId)) {
      get().enqueueNotification(
        `Tidak punya ${recipe.name}! Masak dulu di restoran.`,
        { type: "error" },
      );
      return false;
    }
    const energyRestore = Math.min(recipe.xp || 20, 100);
    if (
      !INV.remove(
        recipe.type === "processing" ? "processed" : "cooked",
        recipeId,
        1,
      )
    )
      return false;
    set((draft) => {
      draft.energy = Math.min(
        draft.energy + energyRestore,
        draft.maxEnergy || 200,
      );
    });
    get().enqueueNotification(
      `Memakan ${recipe.emoji} ${recipe.name}! +${energyRestore} ⚡ Energi`,
      { icon: "🍽️", type: "success" },
    );
    return true;
  },

  addXP: (amount) => {
    if (amount <= 0) return false;
    const prevLevel = get().level;
    set((draft) => {
      let newXP = draft.xp + amount;
      let newLevel = draft.level;
      let newMaxEnergy = draft.maxEnergy || 100;
      while (newXP >= newLevel * 100) {
        newXP -= newLevel * 100;
        newLevel++;
      }
      if (newLevel > draft.level) {
        newMaxEnergy = 100 + (newLevel - 1) * 10;
        if (newMaxEnergy > 200) newMaxEnergy = 200;
      }
      draft.xp = newXP;
      draft.level = newLevel;
      draft.maxEnergy = newMaxEnergy;
      if (newLevel > prevLevel) draft.energy = newMaxEnergy;
    });
    if (get().level > prevLevel) {
      get().enqueueNotification(
        `Level Up! Level ${get().level} 🌟\nEnergy Maksimal naik!`,
        { icon: "🎉", duration: 4000, type: "success" },
      );
      return true;
    }
    return false;
  },

  consumeEnergy: (amount) => {
    const state = get();
    if (state.energy >= amount) {
      set((draft) => {
        draft.energy -= amount;
      });
      return true;
    }
    get().enqueueNotification(
      "Energy tidak cukup! Tunggu besok atau makan sesuatu.",
      { icon: "😴", type: "error" },
    );
    return false;
  },

  // ===== COIN MANAGEMENT =====
  buyItem: (itemId, amount, unitPrice) => {
    const qty = safePositiveNumber(amount, 0);
    const price = safePositiveNumber(unitPrice, 0);
    const totalCost = price * qty;
    if (qty <= 0 || totalCost <= 0) return false;
    const state = get();
    const currentCoins = safeCoins(state.coins);
    if (currentCoins < totalCost) return false;
    const cat = getItemCategory(itemId) || "collectibles";
    set((draft) => {
      draft.coins = currentCoins - totalCost;
      if (!draft.inventoryByCategory[cat][itemId]) {
        draft.inventoryByCategory[cat][itemId] = {
          qty: 0,
          quality: "normal",
          acquiredAt: Date.now(),
        };
      }
      draft.inventoryByCategory[cat][itemId].qty += qty;
    });
    return true;
  },

  addCoins: (amount) => {
    const delta = Number(amount);
    if (!Number.isFinite(delta) || delta <= 0) return;
    set((draft) => {
      draft.coins = safeCoins(draft.coins) + Math.floor(delta);
    });
  },

  spendCoins: (amount) => {
    const cost = Number(amount);
    if (!Number.isFinite(cost) || cost <= 0) return false;
    const currentCoins = safeCoins(get().coins);
    if (currentCoins < cost) return false;
    set((draft) => {
      draft.coins = currentCoins - Math.floor(cost);
    });
    return true;
  },

  sellItem: (itemId, quantity) => {
    const state = get();
    const cat = getItemCategory(itemId);
    if (!cat) return 0;
    const have = state.inventoryByCategory[cat]?.[itemId]?.qty || 0;
    const qty = Math.min(have, Math.max(0, Number(quantity) || 0));
    if (qty <= 0) return 0;

    let sellPrice = getItemSellPrice(itemId);
    if (sellPrice == null || !Number.isFinite(sellPrice)) return 0;

    const todayPrices = state.todayPrices || {};
    const activeEvent = state.activeEvent;
    if (todayPrices[itemId]) sellPrice = todayPrices[itemId];
    if (
      activeEvent?.id === "panen" &&
      SHOP_SEEDS.some((s) => s.cropId === itemId)
    )
      sellPrice *= 2;
    if (activeEvent?.id === "bahari" && FISHES.some((f) => f.id === itemId))
      sellPrice *= 2;
    if (
      state.buildings?.silo?.unlocked &&
      SHOP_SEEDS.some((s) => s.cropId === itemId)
    )
      sellPrice *= 1.15;

    const multiplier = safePositiveNumber(state.coinMultiplier, 1) || 1;
    const finalEarned = Math.round(sellPrice * qty * multiplier);

    INV.remove(cat, itemId, qty);
    set((draft) => {
      draft.coins = safeCoins(draft.coins) + finalEarned;
    });
    return finalEarned;
  },

  sellAllInventory: () => {
    const state = get();
    let totalEarned = 0;
    const todayPrices = state.todayPrices || {};
    const activeEvent = state.activeEvent;

    const toSell = {};
    for (const [cat, items] of Object.entries(state.inventoryByCategory)) {
      for (const [itemId, data] of Object.entries(items)) {
        if (!isSellableProduce(itemId)) continue;
        let sellPrice = getItemSellPrice(itemId);
        if (sellPrice == null) continue;
        if (todayPrices[itemId]) sellPrice = todayPrices[itemId];
        if (
          activeEvent?.id === "panen" &&
          SHOP_SEEDS.some((s) => s.cropId === itemId)
        )
          sellPrice *= 2;
        else if (
          activeEvent?.id === "bahari" &&
          FISHES.some((f) => f.id === itemId)
        )
          sellPrice *= 2;
        if (
          state.buildings?.silo?.unlocked &&
          SHOP_SEEDS.some((s) => s.cropId === itemId)
        )
          sellPrice *= 1.15;
        totalEarned += sellPrice * data.qty;
        toSell[`${cat}.${itemId}`] = true;
      }
    }

    if (totalEarned <= 0) return 0;
    const multiplier = safePositiveNumber(state.coinMultiplier, 1) || 1;
    const finalEarned = Math.round(totalEarned * multiplier);

    set((draft) => {
      for (const key of Object.keys(toSell)) {
        const [cat, itemId] = key.split(".");
        delete draft.inventoryByCategory[cat]?.[itemId];
      }
      draft.coins = safeCoins(draft.coins) + finalEarned;
    });
    return finalEarned;
  },

  activateCoinBooster: () => {
    set((draft) => {
      draft.coinMultiplier = GAME_CONSTANTS.MULTIPLIERS.COIN_BOOSTER;
      draft.coinMultiplierExpireAt = Date.now() + 30 * 60 * 1000;
    });
  },

  buyGrowthBooster: (cost = GAME_CONSTANTS.COSTS.GROWTH_BOOSTER) => {
    const price = safePositiveNumber(cost, GAME_CONSTANTS.COSTS.GROWTH_BOOSTER);
    const state = get();
    if (state.growthMultiplier > 1) return false;
    const currentCoins = safeCoins(state.coins);
    if (currentCoins < price) return false;
    set((draft) => {
      draft.coins = currentCoins - price;
      draft.growthMultiplier = GAME_CONSTANTS.MULTIPLIERS.GROWTH_BOOSTER;
      draft.growthMultiplierExpireAt = Date.now() + 30 * 60 * 1000;
    });
    return true;
  },

  checkStreak: () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const state = get();
    if (state.lastLogin === today)
      return { claimed: false, message: "Sudah klaim hari ini" };
    let newStreak = 1;
    if (state.lastLogin === yesterday) newStreak = state.streak + 1;
    const rewards = [100, 200, 300, 400, 500, 750, 1500];
    const reward = rewards[Math.min(newStreak - 1, 6)] ?? 100;
    set((draft) => {
      draft.streak = newStreak;
      draft.lastLogin = today;
      draft.coins = safeCoins(draft.coins) + reward;
    });
    return {
      claimed: true,
      streak: newStreak,
      reward,
      message: `🔥 Streak ${newStreak} hari! +${reward} 💰`,
    };
  },

  registerCombo: () => {
    const now = Date.now();
    const state = get();
    const timeSinceLast = now - state.combo.lastAction;
    let newCount = 1;
    if (timeSinceLast < GAME_CONSTANTS.COMBO.WINDOW_MS)
      newCount = state.combo.count + 1;
    const multiplier = Math.min(
      1 + (newCount - 1) * GAME_CONSTANTS.COMBO.MULTIPLIER_STEP,
      GAME_CONSTANTS.COMBO.MAX_MULTIPLIER,
    );
    set((draft) => {
      draft.combo.count = newCount;
      draft.combo.multiplier = multiplier;
      draft.combo.lastAction = now;
    });
    return { count: newCount, multiplier };
  },

  resetCombo: () => {
    set((draft) => {
      draft.combo.count = 0;
      draft.combo.multiplier = 1;
      draft.combo.lastAction = 0;
    });
  },

  generateDailyQuests: () => {
    const today = new Date().toDateString();
    const state = get();
    if (
      state.lastQuestDate === today &&
      Array.isArray(state.dailyQuests) &&
      state.dailyQuests.length > 0
    )
      return;
    const level = state.level || 1;
    const possibleQuests = [
      {
        type: "harvest",
        action: "Panen",
        targetId: "wortel",
        targetName: "Wortel",
        count: 0,
        required: 10,
        rewardCoins: 100,
        rewardXp: 50,
        claimed: false,
      },
      {
        type: "harvest",
        action: "Panen",
        targetId: "tomat",
        targetName: "Tomat",
        count: 0,
        required: 15,
        rewardCoins: 150,
        rewardXp: 80,
        claimed: false,
      },
      {
        type: "harvest",
        action: "Panen",
        targetId: "gandum",
        targetName: "Gandum",
        count: 0,
        required: 20,
        rewardCoins: 200,
        rewardXp: 100,
        claimed: false,
      },
      {
        type: "mine",
        action: "Tambang",
        targetId: "batu",
        targetName: "Batu",
        count: 0,
        required: 15,
        rewardCoins: 120,
        rewardXp: 60,
        claimed: false,
      },
      {
        type: "mine",
        action: "Tambang",
        targetId: "tembaga",
        targetName: "Tembaga",
        count: 0,
        required: 5,
        rewardCoins: 180,
        rewardXp: 90,
        claimed: false,
      },
      {
        type: "mine",
        action: "Tambang",
        targetId: "besi",
        targetName: "Besi",
        count: 0,
        required: 3,
        rewardCoins: 250,
        rewardXp: 120,
        claimed: false,
      },
      {
        type: "fish",
        action: "Pancing",
        targetId: "ikan_mas",
        targetName: "Ikan Mas",
        count: 0,
        required: 5,
        rewardCoins: 100,
        rewardXp: 50,
        claimed: false,
      },
      {
        type: "fish",
        action: "Pancing",
        targetId: "lele",
        targetName: "Lele",
        count: 0,
        required: 3,
        rewardCoins: 150,
        rewardXp: 80,
        claimed: false,
      },
      {
        type: "collect",
        action: "Kumpulkan",
        targetId: "telur",
        targetName: "Telur Ayam",
        count: 0,
        required: 5,
        rewardCoins: 100,
        rewardXp: 50,
        claimed: false,
      },
    ];
    if (level >= 5) {
      possibleQuests.push(
        {
          type: "chain",
          action: "Rantai Produksi",
          targetId: "gandum_ke_roti",
          targetName: "Gandum → Roti",
          count: 0,
          required: 1,
          rewardCoins: 500,
          rewardXp: 200,
          claimed: false,
          chain: [
            { type: "harvest", targetId: "gandum", amount: 3 },
            { type: "craft", targetId: "roti_gandum", amount: 1 },
          ],
        },
        {
          type: "chain",
          action: "Rantai Produksi",
          targetId: "wortel_ke_sup",
          targetName: "Wortel → Sup Wortel",
          count: 0,
          required: 1,
          rewardCoins: 400,
          rewardXp: 180,
          claimed: false,
          chain: [
            { type: "harvest", targetId: "wortel", amount: 4 },
            { type: "craft", targetId: "sup_wortel", amount: 1 },
          ],
        },
        {
          type: "chain",
          action: "Rantai Produksi",
          targetId: "ternak_ke_keju",
          targetName: "Susu → Keju",
          count: 0,
          required: 1,
          rewardCoins: 600,
          rewardXp: 250,
          claimed: false,
          chain: [
            { type: "collect", targetId: "susu", amount: 3 },
            { type: "craft", targetId: "keju", amount: 1 },
          ],
        },
      );
    }
    if (level >= 10) {
      possibleQuests.push(
        {
          type: "chain",
          action: "Rantai Produksi",
          targetId: "farm_to_table",
          targetName: "Farm to Table",
          count: 0,
          required: 1,
          rewardCoins: 1000,
          rewardXp: 400,
          claimed: false,
          chain: [
            { type: "harvest", targetId: "gandum", amount: 2 },
            { type: "collect", targetId: "telur", amount: 1 },
            { type: "craft", targetId: "roti_gandum", amount: 1 },
          ],
        },
        {
          type: "chain",
          action: "Rantai Produksi",
          targetId: "tambang_ke_sushi",
          targetName: "Tambang → Sushi Emas",
          count: 0,
          required: 1,
          rewardCoins: 2000,
          rewardXp: 800,
          claimed: false,
          chain: [
            { type: "mine", targetId: "emas", amount: 1 },
            { type: "fish", targetId: "ikan_mas", amount: 2 },
            { type: "craft", targetId: "sushi_emas", amount: 1 },
          ],
        },
      );
    }
    const shuffled = [...possibleQuests].sort(() => 0.5 - Math.random());
    const selectedQuests = shuffled
      .slice(0, 3)
      .map((q, i) => ({ ...q, id: `q_${Date.now()}_${i}` }));
    set((draft) => {
      draft.dailyQuests = selectedQuests;
      draft.lastQuestDate = today;
    });
  },

  progressQuest: (type, targetId, amount = 1) => {
    set((draft) => {
      const quests = draft.dailyQuests;
      if (!Array.isArray(quests) || quests.length === 0) return;
      for (let i = 0; i < quests.length; i++) {
        const q = quests[i];
        if (q.claimed) continue;
        if (q.type === "chain" && q.chain) {
          if (q.chain.some((c) => c.type === type && c.targetId === targetId)) {
            quests[i] = { ...q, count: q.count + (amount || 1) };
          }
        } else if (
          q.type === type &&
          q.targetId === targetId &&
          q.count < q.required
        ) {
          quests[i] = { ...q, count: Math.min(q.required, q.count + amount) };
        }
      }
    });
  },

  batchProgressQuest: (entries = []) => {
    if (!entries.length) return;
    set((draft) => {
      const quests = draft.dailyQuests;
      if (!Array.isArray(quests) || quests.length === 0) return;
      for (const { type, targetId, amount = 1 } of entries) {
        for (let i = 0; i < quests.length; i++) {
          const q = quests[i];
          if (q.claimed || q.count >= q.required) continue;
          if (q.type === type && q.targetId === targetId) {
            quests[i] = { ...q, count: Math.min(q.required, q.count + amount) };
          }
        }
      }
    });
  },

  claimQuestReward: (questId) => {
    const state = get();
    const quest = state.dailyQuests.find((q) => q.id === questId);
    if (!quest || quest.claimed || quest.count < quest.required) return false;
    const rewardCoins = safePositiveNumber(quest.rewardCoins, 0);
    set((draft) => {
      for (let i = 0; i < draft.dailyQuests.length; i++) {
        if (draft.dailyQuests[i].id === questId) {
          draft.dailyQuests[i].claimed = true;
          break;
        }
      }
      draft.coins = safeCoins(draft.coins) + rewardCoins;
    });
    get().addXP(quest.rewardXp);
    return true;
  },

  completeQuest: (id) => {
    set((draft) => {
      for (let i = 0; i < draft.dailyQuests.length; i++) {
        if (draft.dailyQuests[i].id === id) {
          draft.dailyQuests[i].completed = true;
          break;
        }
      }
    });
  },

  // ===== CRAFTING =====
  startCrafting: (recipeId) => {
    const state = get();
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;

    const typeQueue = (state.craftingQueue || []).filter(
      (q) => RECIPES.find((r) => r.id === q.recipeId)?.type === recipe.type,
    );
    if (typeQueue.length >= GAME_CONSTANTS.CRAFTING.MAX_QUEUE_PER_TYPE) {
      get().enqueueNotification(
        `Antrean penuh! Maksimal ${GAME_CONSTANTS.CRAFTING.MAX_QUEUE_PER_TYPE} antrean per fasilitas.`,
        { type: "error" },
      );
      return false;
    }

    if (!INV.hasReq(recipe.req)) {
      const missing = Object.entries(recipe.req).filter(([key, amt]) => {
        const [cat, itemId] = key.split(".");
        return (state.inventoryByCategory[cat]?.[itemId]?.qty || 0) < amt;
      });
      get().enqueueNotification(
        `Bahan tidak cukup: ${missing.map(([k]) => k.split(".")[1]).join(", ")}`,
        { type: "error" },
      );
      return false;
    }

    INV.consumeReq(recipe.req);

    const id = Math.random().toString(36).substring(2, 9);
    const startTime = Date.now();
    const duration = recipe.time * 1000;

    set((draft) => {
      draft.craftingQueue.push({ id, recipeId, startTime, duration });
    });

    const verb = recipe.type === "processing" ? "memproses" : "membuat";
    get().enqueueNotification(`Mulai ${verb} ${recipe.name}!`, {
      icon: recipe.type === "processing" ? "⚙️" : "🍳",
      type: "success",
    });
    return true;
  },

  removeCraftingQueue: (queueId) => {
    const state = get();
    const queueItem = state.craftingQueue.find((q) => q.id === queueId);
    if (!queueItem) return;
    const recipe = RECIPES.find((r) => r.id === queueItem.recipeId);
    if (!recipe) return;

    // Refund ingredients
    for (const [key, qty] of Object.entries(recipe.req)) {
      const [cat, itemId] = key.split(".");
      INV.add(cat, itemId, qty);
    }

    set((draft) => {
      draft.craftingQueue = draft.craftingQueue.filter((q) => q.id !== queueId);
    });
    get().enqueueNotification("Dibatalkan, bahan dikembalikan!", {
      type: "success",
    });
  },

  processCraftingQueue: () => {
    const state = get();
    if (!state.craftingQueue || state.craftingQueue.length === 0) return;
    const now = Date.now();
    let changed = false;
    const completed = [];
    let xpGained = 0;

    for (const item of state.craftingQueue) {
      if (now - item.startTime >= item.duration) {
        const recipe = RECIPES.find((r) => r.id === item.recipeId);
        if (recipe) {
          const cat = recipe.type === "processing" ? "processed" : "cooked";
          INV.add(cat, recipe.id, 1);
          xpGained += recipe.xp || 0;
          if (recipe.type === "restaurant")
            get().progressQuest?.("craft", recipe.id, 1);
        }
        completed.push(item.id);
        changed = true;
      }
    }

    if (changed) {
      set((draft) => {
        draft.craftingQueue = draft.craftingQueue.filter(
          (q) => !completed.includes(q.id),
        );
      });
      if (xpGained > 0) get().addXP(xpGained);
      let totalCooked = completed.length;
      let totalSushiEmas = completed.filter((id) => {
        const item = state.craftingQueue.find((q) => q.id === id);
        return item?.recipeId === "sushi_emas";
      }).length;
      if (totalCooked > 0) {
        set((draft) => {
          draft.stats.totalCooked =
            (draft.stats.totalCooked || 0) + totalCooked;
          if (totalSushiEmas > 0)
            draft.stats.totalSushiEmasMade =
              (draft.stats.totalSushiEmasMade || 0) + totalSushiEmas;
        });
        get().markSessionAction?.("cooked");
        get().checkAchievements?.();
      }
    }
  },

  collectCraftedItem: (queueId) => {
    const state = get();
    const index = state.craftingQueue.findIndex((q) => q.id === queueId);
    if (index === -1) return false;
    const item = state.craftingQueue[index];
    if (Date.now() - item.startTime < item.duration) return false;
    const recipe = RECIPES.find((r) => r.id === item.recipeId);
    if (!recipe) {
      set((draft) => {
        draft.craftingQueue.splice(index, 1);
      });
      return false;
    }

    const cat = recipe.type === "processing" ? "processed" : "cooked";
    INV.add(cat, recipe.id, 1);

    set((draft) => {
      draft.craftingQueue.splice(index, 1);
    });
    get().addXP(recipe.xp || 0);
    if (recipe.type === "restaurant")
      get().progressQuest?.("craft", recipe.id, 1);
    set((draft) => {
      draft.stats.totalCooked = (draft.stats.totalCooked || 0) + 1;
      if (recipe.id === "sushi_emas")
        draft.stats.totalSushiEmasMade =
          (draft.stats.totalSushiEmasMade || 0) + 1;
    });
    get().markSessionAction?.("cooked");
    get().checkAchievements?.();
    return true;
  },

  generateOrders: () => {
    const state = get();
    const level = state.level || 1;
    const templates = ORDER_TEMPLATES.filter((t) => {
      if (level < 5) return t.tier === 1;
      if (level < 10) return t.tier <= 2;
      return true;
    });
    const isCookedItem = (itemId) => RECIPES.some((r) => r.id === itemId);
    const filteredTemplates = templates.filter((t) => {
      if (t.tier === 1) return true;
      return t.items.every((item) => isCookedItem(item.id));
    });
    const newOrders = [];
    for (let i = 0; i < 3; i++) {
      const pool = filteredTemplates.length > 0 ? filteredTemplates : templates;
      const t = pool[Math.floor(Math.random() * pool.length)];
      newOrders.push({
        id: Math.random().toString(36).substring(2, 9),
        ...t,
        createdAt: Date.now(),
      });
    }
    set((draft) => {
      draft.orders = newOrders;
    });
  },

  fulfillOrder: (orderId) => {
    const state = get();
    const orderIndex = state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return false;
    const order = state.orders[orderIndex];

    for (const item of order.items) {
      const cat = getItemCategory(item.id);
      if (
        !cat ||
        (state.inventoryByCategory[cat]?.[item.id]?.qty || 0) < item.qty
      ) {
        get().enqueueNotification(
          `Bahan tidak cukup: ${item.qty}x ${item.id}`,
          { type: "error" },
        );
        return false;
      }
    }

    for (const item of order.items) {
      const cat = getItemCategory(item.id);
      INV.remove(cat, item.id, item.qty);
    }

    get().addCoins(order.coins);
    get().addXP(order.xp);

    set((draft) => {
      draft.orders.splice(orderIndex, 1);
      draft.stats.totalOrdersFulfilled =
        (draft.stats.totalOrdersFulfilled || 0) + 1;
    });
    get().checkAchievements?.();
    get().enqueueNotification(`Pesanan selesai! +${order.coins} 💰`, {
      icon: "📦",
      type: "success",
    });
    return true;
  },

  checkOrders: () => {
    const state = get();
    if (!state.orders || state.orders.length === 0) {
      get().generateOrders();
      return;
    }
    const now = Date.now();
    const newOrders = state.orders.filter(
      (o) => now - o.createdAt <= o.timer * 1000,
    );
    if (newOrders.length !== state.orders.length) {
      set((draft) => {
        draft.orders = newOrders;
      });
      if (newOrders.length === 0) get().generateOrders();
    }
  },

  craftBait: (baitId) => {
    const state = get();
    const bait = SHOP_BAIT.find((b) => b.id === baitId);
    if (!bait?.craftable || !bait?.mineralReq) {
      get().enqueueNotification("Item ini tidak bisa di-craft!", {
        type: "error",
      });
      return false;
    }
    for (const [mineral, qty] of Object.entries(bait.mineralReq)) {
      if ((state.inventoryByCategory.minerals?.[mineral]?.qty || 0) < qty) {
        get().enqueueNotification(
          `Bahan tidak cukup! Butuh ${qty}x ${mineral}`,
          { type: "error" },
        );
        return false;
      }
    }
    for (const [mineral, qty] of Object.entries(bait.mineralReq)) {
      INV.remove("minerals", mineral, qty);
    }
    INV.add("bait", baitId, 1);
    get().enqueueNotification(`Berhasil membuat ${bait.emoji} ${bait.name}!`, {
      type: "success",
    });
    return true;
  },

  recordFishingCatch: (caughtFish, bait) => {
    const cat = "fish";
    INV.add(cat, caughtFish.id, 1);
    get().addXP(15 + (bait ? 5 : 0));
    get().progressQuest("fish", caughtFish.id, 1);
    set((draft) => {
      draft.stats.totalFished = (draft.stats.totalFished || 0) + 1;
    });
    get().markSessionAction?.("fished");
    get().checkAchievements?.();
  },

  recordBaitUsage: (bait) => {
    if (bait?.id === "umpan_cacing") {
      set((draft) => {
        draft.stats.totalWormBaitUsed =
          (draft.stats.totalWormBaitUsed || 0) + 1;
      });
    }
  },

  completeTutorialStep: (step) => {
    const state = get();
    if (state.tutorialStep === step)
      set((draft) => {
        draft.tutorialStep = step + 1;
      });
  },

  skipTutorial: () => {
    set((draft) => {
      draft.tutorialStep = -1;
    });
  },
});
