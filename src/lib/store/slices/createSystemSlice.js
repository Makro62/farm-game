import { 
  getMiningRegenMs, 
  isWorkerActive, 
  getGrowthMultiplier, 
  normalizePlot, 
  normalizePlots, 
  normalizeAnimal, 
  consumeInventoryItem, 
  pickAutoSeed, 
  safeCoins,
  safePositiveNumber
} from '../utils';
import { SHOP_ANIMALS, FISHES } from '../../utils';
import toast from 'react-hot-toast';

export const createSystemSlice = (set, get) => ({
  // Settings
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  
  // Modals
  modals: {
    prompt: { isOpen: false, title: '', msg: '', onConfirm: null },
    confirm: { isOpen: false, title: '', msg: '', onConfirm: null },
    npcGift: { isOpen: false, npcId: null }
  },

  // Environment
  season: { current: 'spring', day: 1, tick: 0 },
  weather: { current: '☀️ Cerah', nextChangeIn: 300 },

  // Progress & Offline
  lastSavedAt: Date.now(),
  offlineReport: null,
  
  // Workers
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
  workerAutoMigrated: false,
  
  lastWheelSpin: null,

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

        // Refresh harga pasar tiap hari baru (async via setTimeout agar tidak nested set)
        setTimeout(() => get().updateMarket?.(), 0);
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
        const state = get();
        const now = Date.now();
        let changed = false;
        let newCoinMult = state.coinMultiplier;
        let newGrowthMult = state.growthMultiplier;
        
        if (state.coinMultiplierExpireAt && now > state.coinMultiplierExpireAt) {
          newCoinMult = 1;
          changed = true;
          toast('Booster Koin telah habis.', { icon: '⏳' });
        }
        if (state.growthMultiplierExpireAt && now > state.growthMultiplierExpireAt) {
          newGrowthMult = 1;
          changed = true;
          toast('Booster Pertumbuhan telah habis.', { icon: '⏳' });
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
        console.error('Game tick error:', error);
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

  clearOfflineReport: () => {
    set({ offlineReport: null });
  },

  calculateOfflineProgress: () => {
    const state = get();
    if (!state.lastSavedAt) return;
    
    const now = Date.now();
    const deltaSeconds = Math.floor((now - state.lastSavedAt) / 1000);
    
    // Hanya proses jika offline lebih dari 60 detik (1 menit)
    if (deltaSeconds < 60) return;
    
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
          const produceTimeSecs = a.produceTime / 1000;
          const cycles = Math.floor(deltaSeconds / produceTimeSecs);
          if (cycles > 0) {
            newInventory[data.product] = (newInventory[data.product] || 0) + cycles;
            collectedProducts += cycles;
            newAnimals[i] = { ...a, lastCollected: now };
          }
        }
      }
    }
    
    // 3. Simulasikan nelayan (Auto Fisher)
    let caughtFishes = 0;
    if (isWorkerActive(state, 'fisher')) {
      const catchAttemptEverySecs = 10;
      const attempts = Math.floor(deltaSeconds / catchAttemptEverySecs);
      const catchChance = 0.1;
      const expectedCatches = Math.floor(attempts * catchChance);
      
      if (expectedCatches > 0) {
        caughtFishes = expectedCatches;
        newInventory[FISHES[0].id] = (newInventory[FISHES[0].id] || 0) + caughtFishes; // Asumsikan dapat ikan dasar untuk simulasi offline
      }
    }
    
    // 4. Simulasikan penambang (Auto Miner)
    let minedGems = 0;
    let maturedNodes = 0;
    
    const mineInterval = getMiningRegenMs(state.mining) / 1000;
    const mineAttempts = Math.floor(deltaSeconds / mineInterval);
    
    if (isWorkerActive(state, 'miner')) {
      if (mineAttempts > 0) {
        minedGems = Math.floor(mineAttempts * 0.5); // Kasarannya 50% node yg siap ditambang
        newInventory['batu'] = (newInventory['batu'] || 0) + minedGems;
      }
    } else if (mineAttempts > 0) {
      maturedNodes = Math.min(30, Math.floor(mineAttempts)); // Simulasikan node yg cooldown selesai
      // Kita tidak benar-benar mengupdate node array di sini, biarkan syncMiningNodes yg bekerja
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
  resetGame: () => {
    // Requires access to initialState which we will handle in store.js
    if (typeof window !== 'undefined') {
      localStorage.removeItem('farm-game-storage');
      window.location.reload();
    }
    return true;
  },

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
      // Handled in store.js
    }
  }
});
