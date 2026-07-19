import { getMiningRegenMs, isWorkerActive, getGrowthMultiplier, normalizePlot, normalizePlots, normalizeAnimal, consumeInventoryItem, pickAutoSeed, safeCoins, safePositiveNumber, getAnimalProduceTime, rollMineralType } from '../utils';
import { SHOP_ANIMALS, ANIMAL_FEED } from '../../data/shop';
import { FISHES } from '../../data/fishes';
import { RECIPES } from '../../data/recipes';
import { getItemSellPrice } from '../../data/item-helpers';
import { GAME_CONSTANTS } from '../../constants';
import { logger } from '../../logger';
// Removed toast import

export const createSystemSlice = (set, get) => ({
  // ===== NOTIFICATIONS =====
  enqueueNotification: (message, options = {}) => {
    set((state) => ({
      notificationsQueue: [
        ...state.notificationsQueue,
        { id: Date.now() + Math.random().toString(), message, options }
      ]
    }));
  },

  dequeueNotification: (id) => {
    set((state) => ({
      notificationsQueue: state.notificationsQueue.filter(n => n.id !== id)
    }));
  },

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

  // ===== SETTINGS =====
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),

  // ===== AUTO WORKERS TOGGLES =====
  toggleAutoFarmer: () => set(state => ({ autoFarmer: !state.autoFarmer })),
  toggleAutoRancher: () => set(state => ({ autoRancher: !state.autoRancher })),
  toggleAutoFisher: () => set(state => ({ autoFisher: !state.autoFisher })),
  toggleAutoMiner: () => set(state => ({ autoMiner: !state.autoMiner })),
  toggleAutoChef: () => set(state => ({ autoChef: !state.autoChef })),
  setSelectedRecipe: (recipeId) => set({ selectedRecipe: recipeId }),

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
      chef: { autoChef: true },
    };

    set({
      coins: currentCoins - price,
      workers: { ...state.workers, [type]: true },
      ...(autoFlags[type] || {}),
    });
    return true;
  },

  // ===== DAILY REWARDS =====
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

  // ===== ENVIRONMENT & TICK =====
  advanceSeasonTick: () => {
    const ticksPerDay = GAME_CONSTANTS.SYSTEM.SEASON_TICKS_PER_DAY;
    const eventChanceThreshold = GAME_CONSTANTS.SYSTEM.RANDOM_EVENT_CHANCE;

    set((state) => {
      if (!state.season) return state;
      let { tick, day, current } = state.season;
      let activeEvent = state.activeEvent;
      tick += 1;

      if (tick >= ticksPerDay) {
        tick = 0;
        day += 1;

        const eventChance = Math.random();
        if (eventChance < eventChanceThreshold) {
          const events = [
            { id: 'panen', name: '🎊 Festival Panen', desc: 'Harga jual semua tanaman x2 hari ini!' },
            { id: 'bahari', name: '🎣 Hari Bahari', desc: 'Ikan terjual dengan harga x2!' },
            { id: 'tambang', name: '💎 Demam Emas', desc: 'Peluang mendapat Emas & Berlian meningkat!' },
          ];
          activeEvent = events[Math.floor(Math.random() * events.length)];
        } else {
          activeEvent = null;
        }

        if (day > 7) {
          day = 1;
          const seasons = ['spring', 'summer', 'autumn', 'winter'];
          const idx = seasons.indexOf(current);
          current = seasons[(idx + 1) % 4];
        }

        setTimeout(() => get().updateMarket?.(), 0);
        return { season: { current, day, tick }, activeEvent, energy: state.maxEnergy || 100 };
      }
      return { season: { current, day, tick }, activeEvent };
    });
  },

  changeWeather: () => {
    const state = get();
    if (!state.weather) return;
    
    let { nextChangeIn } = state.weather;
    nextChangeIn -= 1;
    
    if (nextChangeIn <= 0) {
      const season = state.season?.current || 'spring';
      
      let weathers = ['☀️ Cerah', '⛅ Berawan', '🌧️ Hujan', '⛈️ Badai', '🌫️ Berkabut', '🌬️ Berangin'];
      if (season === 'winter') {
        weathers = ['☀️ Cerah', '⛅ Berawan', '☃️ Bersalju', '🌬️ Berangin', '🌫️ Berkabut'];
      }
      
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      
      // Tentukan efek yang akan di-cache dan digunakan oleh slice lain
      const effects = {
        cropGrowth: newWeather === '🌬️ Berangin' ? 1.1 : 1.0,
        miningRegen: newWeather === '⛈️ Badai' ? 0.5 : 1.0,
        animalProduce: newWeather === '⛈️ Badai' ? 0.8 : 1.0,
        fishingRare: newWeather === '🌧️ Hujan' ? 1.15 : (newWeather === '🌫️ Berkabut' ? 0.7 : 1.0),
        customerRate: newWeather === '🌫️ Berkabut' ? 1.2 : 1.0,
      };
      
      // Efek Instan: Hujan -> Siram tanaman
      if (newWeather === '🌧️ Hujan' || newWeather === '⛈️ Badai') {
        const plots = state.plots || [];
        const wateredPlots = plots.map(p => ({ ...p, watered: true }));
        set({ plots: wateredPlots });
        get().enqueueNotification('Cuaca memburuk! Semua tanaman tersiram otomatis 🌧️', { icon: '☔', type: 'info' });
      }
      
      // Efek Instan: Salju -> Tanaman layu (kecuali ready)
      if (newWeather === '☃️ Bersalju') {
        const plots = state.plots || [];
        const deadPlots = plots.map(p => {
          if (p.crop && p.status === 'growing') {
            return { ...p, status: 'dead', growTime: null };
          }
          return p;
        });
        set({ plots: deadPlots });
        get().enqueueNotification('Salju turun! Tanaman yang tumbuh menjadi layu ❄️', { icon: '⛄', type: 'info' });
      }
      
      set({ 
        weather: { current: newWeather, nextChangeIn: 300 },
        weatherEffects: effects
      });
    } else {
      set({ weather: { ...state.weather, nextChangeIn } });
    }
  },

  touchSaveTimestamp: () => {
    set({ lastSavedAt: Date.now() });
  },

  processGameTick: () => {
    // Jangan update lastSavedAt di sini — itu merusak offline progress.
    const actions = [
      () => get().advanceSeasonTick(),
      () => get().changeWeather(),
      () => get().syncPlots(),
      () => get().syncMiningNodes(),
      () => get().runAutoWorkers(),
      () => get().processCraftingQueue(),
      () => get().checkOrders(),
      () => {
        get().tickCustomers(1000);
        if (Math.random() < 0.1 * (get().weatherEffects?.customerRate || 1)) get().spawnCustomer(); // 10% chance * multiplier to spawn every second
      },
      () => {
        const state = get();
        const now = Date.now();
        let changed = false;
        let newCoinMult = state.coinMultiplier;
        if (state.coinMultiplierExpireAt && now > state.coinMultiplierExpireAt) {
          newCoinMult = 1;
          changed = true;
          if (state.coinMultiplier > 1) {
            get().enqueueNotification('Booster Koin telah habis.', { icon: '⏳', type: 'info' });
          }
        }
        let newGrowthMult = state.growthMultiplier;
        if (state.growthMultiplierExpireAt && now > state.growthMultiplierExpireAt) {
          newGrowthMult = 1;
          changed = true;
          if (state.growthMultiplier > 1) {
            get().enqueueNotification('Booster Pertumbuhan telah habis.', { icon: '⏳', type: 'info' });
          }
        }
        
        if (changed) {
          set({
            coinMultiplier: newCoinMult,
            growthMultiplier: newGrowthMult,
            ...(newCoinMult === 1 && { coinMultiplierExpireAt: null }),
            ...(newGrowthMult === 1 && { growthMultiplierExpireAt: null })
          });
        }
      }
    ];

    for (const action of actions) {
      try {
        action();
      } catch (error) {
        logger.error('Game tick error:', error);
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
    let craftingQueue = [...(state.craftingQueue || [])];
    let xpGain = 0;
    let harvested = 0;
    let planted = 0;
    let collected = 0;
    let plotsChanged = false;
    let animalsChanged = false;
    let queueChanged = false;
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
          xpGain += GAME_CONSTANTS.XP.HARVEST;
          questEntries.push({ type: 'harvest', targetId: crop, amount: 1 });
        }

        if (plots[i].status === 'empty') {
          const seedData = pickAutoSeed(
            inventory,
            state.selectedSeed,
            state.season?.current,
            !!state.buildings?.greenhouse
          );
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
        const produceTime = getAnimalProduceTime(a, state.weatherEffects);
        if (data && a.status === 'producing' && now - a.lastCollected >= produceTime) {
          // Auto-feed if not fed
          if (!a.fed) {
            const feedData = ANIMAL_FEED[a.type];
            if (feedData && (inventory[feedData.feedItem] || 0) >= feedData.feedQty) {
              inventory[feedData.feedItem] -= feedData.feedQty;
              if (inventory[feedData.feedItem] <= 0) delete inventory[feedData.feedItem];
              animals[i] = { ...a, fed: true };
              animalsChanged = true;
            } else {
              // Can't feed — skip this animal
              animals[i] = a;
              continue;
            }
          }
          animals[i] = { ...animals[i], lastCollected: now, fed: false };
          inventory[data.product] = (inventory[data.product] || 0) + 1;
          collected++;
          animalsChanged = true;
          xpGain += GAME_CONSTANTS.XP.COLLECT;
          questEntries.push({ type: 'collect', targetId: data.product, amount: 1 });
        } else {
          animals[i] = a;
        }
      }
    }

    if (plotsChanged || animalsChanged || queueChanged) {
      set({
        ...(plotsChanged ? { plots } : {}),
        ...(animalsChanged ? { animals } : {}),
        ...(queueChanged ? { craftingQueue } : {}),
        inventory,
      });
      if (xpGain > 0) get().addXP(xpGain);
      if (questEntries.length > 0) get().batchProgressQuest(questEntries);
      if (harvested > 0 || planted > 0) {
        get().enqueueNotification(`👨‍🌾 Petani Budi panen ${harvested} & tanam ${planted}!`, { id: 'auto-farm', type: 'success' });
      }
      if (collected > 0) {
        get().enqueueNotification(`👩‍🌾 Peternak Siti ambil ${collected} hasil ternak!`, { id: 'auto-rancher', type: 'success' });
      }
    }

    // --- 3. KURCACI PEMANCING (FISHER) ---
    if (isWorkerActive(state, 'fisher')) {
      if (Math.random() < GAME_CONSTANTS.CHANCES.FISHER_TICK) {
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
          stats: { ...s.stats, totalFished: (s.stats?.totalFished || 0) + 1 },
        }));
        get().addXP(GAME_CONSTANTS.XP.FISH);
        get().progressQuest('fish', caughtFish.id, 1);
        get().markSessionAction?.('fished');
        get().checkAchievements?.();
        get().enqueueNotification(`🎣 Nelayan Mamat mendapat ${caughtFish.emoji} ${caughtFish.name}!`, { id: 'auto-fisher', type: 'success' });
      }
    }

    // --- 4. KOKI JUNA (CHEF) ---
    if (isWorkerActive(state, 'chef') && state.selectedRecipe) {
      const recipe = RECIPES.find(r => r.id === state.selectedRecipe);
      if (recipe) {
        const typeQueue = craftingQueue.filter(
          (q) => RECIPES.find((r) => r.id === q.recipeId)?.type === recipe.type
        );
        
        if (typeQueue.length < 3) {
          let canCook = true;
          for (const [item, qty] of Object.entries(recipe.req)) {
            if ((inventory[item] || 0) < qty) {
              canCook = false;
              break;
            }
          }
          
          if (canCook) {
            for (const [item, qty] of Object.entries(recipe.req)) {
              inventory[item] -= qty;
              if (inventory[item] <= 0) delete inventory[item];
            }
            const id = Math.random().toString(36).substring(2, 9);
            const startTime = Date.now();
            const duration = recipe.time * 1000;
            
            craftingQueue.push({ id, recipeId: recipe.id, startTime, duration });
            queueChanged = true;
            get().enqueueNotification(`👨‍🍳 Koki Juna memasak ${recipe.name}!`, { id: 'auto-chef', type: 'success' });
          }
        }
      }
    }
  },

  clearOfflineReport: () => {
    set({ offlineReport: null });
  },

  calculateOfflineProgress: () => {
    const state = get();
    if (!state.lastSavedAt) return;
    
    const now = Date.now();
    const deltaSeconds = Math.floor((now - state.lastSavedAt) / 1000);
    
    if (deltaSeconds < GAME_CONSTANTS.OFFLINE.MIN_SECONDS) return;
    
    let earnedCoins = 0;
    let harvestedCrops = 0;
    let collectedProducts = 0;
    let newInventory = { ...state.inventory };
    let newPlots = [...state.plots];
    let newAnimals = Array.isArray(state.animals) ? [...state.animals] : [];
    
    // 1. Simulasikan panen (Auto Farmer)
    if (isWorkerActive(state, 'farmer')) {
      for (let i = 0; i < newPlots.length; i++) {
        const p = newPlots[i];
        if (p.crop && p.status === 'growing' && p.growTime) {
          if (p.plantedAt + p.growTime <= now) {
            newInventory[p.crop] = (newInventory[p.crop] || 0) + 1;
            harvestedCrops++;
            newPlots[i] = { ...p, status: 'empty', crop: null, plantedAt: null, growTime: null };
          }
        } else if (p.crop && p.status === 'ready') {
          newInventory[p.crop] = (newInventory[p.crop] || 0) + 1;
          harvestedCrops++;
          newPlots[i] = { ...p, status: 'empty', crop: null, plantedAt: null, growTime: null };
        }
      }
    }
    
    // 2. Simulasikan peternakan (Auto Rancher)
    if (isWorkerActive(state, 'rancher')) {
      for (let i = 0; i < newAnimals.length; i++) {
        const a = newAnimals[i];
        const data = SHOP_ANIMALS.find(s => s.id === a.type);
        if (data && a.status === 'producing') {
          const produceTimeSecs = getAnimalProduceTime(a, state.weatherEffects) / 1000;
          const cycles = Math.floor(deltaSeconds / produceTimeSecs);
          if (cycles > 0) {
            newInventory[data.product] = (newInventory[data.product] || 0) + cycles;
            collectedProducts += cycles;
            newAnimals[i] = { ...a, lastCollected: now };
          }
        }
      }
    }
    
    // 3. Simulasikan nelayan (Auto Fisher) — roll sesuai probabilitas
    let caughtFishes = 0;
    if (isWorkerActive(state, 'fisher')) {
      const attempts = Math.floor(deltaSeconds / GAME_CONSTANTS.OFFLINE.FISHER_CATCH_EVERY_SECS);
      const catchChance = GAME_CONSTANTS.CHANCES.AUTO_FISHER_CATCH;
      const expectedCatches = Math.floor(attempts * catchChance);
      
      if (expectedCatches > 0) {
        caughtFishes = expectedCatches;
        for (let f = 0; f < expectedCatches; f++) {
          const rand = Math.random();
          let cumulative = 0;
          for (const fish of FISHES) {
            cumulative += fish.chance;
            if (rand <= cumulative) {
              newInventory[fish.id] = (newInventory[fish.id] || 0) + 1;
              break;
            }
          }
        }
      }
    }
    
    // 4. Simulasikan penambang (Auto Miner) — distribusi mineral proper
    let minedGems = 0;
    let maturedNodes = 0;
    
    const mineInterval = getMiningRegenMs(state.mining, state.weatherEffects) / 1000;
    const mineAttempts = Math.floor(deltaSeconds / mineInterval);
    
    if (isWorkerActive(state, 'miner')) {
      if (mineAttempts > 0) {
        minedGems = Math.floor(mineAttempts * 0.5);
        const lanternActive = state.mining.lanternUntil && state.mining.lanternUntil > now;
        const eventId = state.activeEvent?.id || null;
        for (let m = 0; m < minedGems; m++) {
          const mineralType = rollMineralType(state.mining.pickaxeLevel, lanternActive, eventId);
          newInventory[mineralType] = (newInventory[mineralType] || 0) + 1;
        }
      }
    } else if (mineAttempts > 0) {
      maturedNodes = Math.min(30, Math.floor(mineAttempts));
    }
    
    // Simulasikan tanaman yang matang tanpa Auto Farmer
    let maturedCrops = 0;
    if (!isWorkerActive(state, 'farmer')) {
      for (let i = 0; i < newPlots.length; i++) {
        const p = newPlots[i];
        if (p.crop && p.status === 'growing' && p.growTime) {
          if (p.plantedAt + p.growTime <= now) {
            maturedCrops++;
          }
        }
      }
    }
    
    // ===== Hitung earnedCoins dari item yang terkumpul =====
    earnedCoins = 0;
    try {
      const offlineItems = { ...newInventory };
      for (const [itemId] of Object.entries(state.inventory)) {
        delete offlineItems[itemId];
      }
      for (const [itemId, qty] of Object.entries(offlineItems)) {
        const price = getItemSellPrice(itemId);
        if (price != null) {
          earnedCoins += price * Number(qty);
        }
      }
    } catch { /* skip coin calc */ }

    // Set report
    if (harvestedCrops > 0 || collectedProducts > 0 || caughtFishes > 0 || minedGems > 0 || maturedCrops > 0 || maturedNodes > 0) {
      set({
        inventory: newInventory,
        plots: newPlots,
        animals: newAnimals,
        lastSavedAt: now,
        offlineReport: {
          deltaSeconds,
          harvestedCrops,
          collectedProducts,
          caughtFishes,
          minedGems,
          maturedCrops,
          maturedNodes,
          earnedCoins
        }
      });
    } else {
      set({ lastSavedAt: now });
    }
  },

  // ===== UTILITY =====
  // resetGame & dev di-override di store.js
});
