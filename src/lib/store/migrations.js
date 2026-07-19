import { normalizePlots, normalizeAnimal, safeCoins } from './utils';

export const partializeState = (state) => ({
  coins: state.coins,
  level: state.level,
  xp: state.xp,
  energy: state.energy,
  maxEnergy: state.maxEnergy,
  day: state.day,
  streak: state.streak,
  lastLogin: state.lastLogin,
  plots: state.plots,
  inventoryByCategory: state.inventoryByCategory,
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
  selectedSeed: state.selectedSeed,
  selectedBait: state.selectedBait,
  selectedRecipe: state.selectedRecipe,
  season: state.season,
  weather: state.weather,
  mining: state.mining ? { ...state.mining, nodes: state.mining.nodes } : state.mining,
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
  restaurant: state.restaurant,
  town: state.town,
  decorations: state.decorations,
  activeCustomers: state.activeCustomers,
  achievements: state.achievements,
  stats: state.stats,
  sessionActions: state.sessionActions,
  weatherEffects: state.weatherEffects,
  totalTables: state.totalTables,
  tutorialStep: state.tutorialStep,
});

function migrateLegacyWorker(val) {
  if (!val) return null;
  if (typeof val === 'object' && val.hired) return val;
  const templates = {
    farmer: { name: 'Kurcaci Budi', role: 'farmer', skills: { farming: 1, harvesting: 1, watering: 1 } },
    rancher: { name: 'Kurcaci Siti', role: 'rancher', skills: { ranching: 1, collecting: 1, feeding: 1 } },
    fisher: { name: 'Kurcaci Mamat', role: 'fisher', skills: { fishing: 1, baiting: 1 } },
    miner: { name: 'Kurcaci Tarjo', role: 'miner', skills: { mining: 1, blasting: 1 } },
    chef: { name: 'Kurcaci Juna', role: 'chef', skills: { cooking: 1, baking: 1, prep: 1 } },
  };
  const role = typeof val === 'object' ? val.role || val.type : null;
  const t = role ? templates[role] : null;
  if (!t) return null;
  return { hired: true, ...t, level: val.level || 1, xp: val.xp || 0, xpToNext: 200, stamina: val.stamina ?? 100, maxStamina: val.maxStamina ?? 100, staminaRegenPerHour: 10, happiness: val.happiness ?? 80, maxHappiness: 100, wagePerDay: 50, daysEmployed: val.daysEmployed || 0, totalWagesPaid: val.totalWagesPaid || 0, loyalty: val.loyalty ?? 60, isWorking: val.isWorking ?? true, isAutoMode: val.isAutoMode ?? true, schedule: { workStart: 6, workEnd: 18, lunchBreak: 12, sleepStart: 22, sleepEnd: 5 } };
}

export const migrateState = (persistedState, currentState) => {
  let merged = { ...currentState, ...persistedState };
  merged.plots = normalizePlots(merged.plots);

  if (merged.mining) {
    if (merged.mining.pickaxeLevel == null) merged.mining.pickaxeLevel = 1;
    if (merged.mining.lanternUntil == null) merged.mining.lanternUntil = null;
    if (merged.mining.currentFloor == null) merged.mining.currentFloor = 1;
    if (merged.mining.maxFloorReached == null) merged.mining.maxFloorReached = 1;
    if (!merged.mining.smeltery) merged.mining.smeltery = { unlocked: false, level: 0, queue: [], fuel: 0 };
    if (Array.isArray(merged.mining.nodes)) {
      merged.mining.nodes = merged.mining.nodes.map(n => ({ ...n, hazard: n.hazard || null }));
    }
  }

  // Migrate workers from old format (boolean, {hired: true}, etc.)
  const oldWorkers = merged.workers || {};
  merged.workers = {
    farmer: migrateLegacyWorker(oldWorkers.farmer),
    rancher: migrateLegacyWorker(oldWorkers.rancher),
    fisher: migrateLegacyWorker(oldWorkers.fisher),
    miner: migrateLegacyWorker(oldWorkers.miner),
    chef: migrateLegacyWorker(oldWorkers.chef),
  };

  // Ensure isAutoMode is set from old auto* flags
  if (merged.autoFarmer !== undefined && merged.workers.farmer) merged.workers.farmer.isAutoMode = !!merged.autoFarmer;
  if (merged.autoRancher !== undefined && merged.workers.rancher) merged.workers.rancher.isAutoMode = !!merged.autoRancher;
  if (merged.autoFisher !== undefined && merged.workers.fisher) merged.workers.fisher.isAutoMode = !!merged.autoFisher;
  if (merged.autoMiner !== undefined && merged.workers.miner) merged.workers.miner.isAutoMode = !!merged.autoMiner;
  if (merged.autoChef !== undefined && merged.workers.chef) merged.workers.chef.isAutoMode = !!merged.autoChef;

  // Clean up legacy fields
  delete merged.autoFarmer;
  delete merged.autoRancher;
  delete merged.autoFisher;
  delete merged.autoMiner;
  delete merged.autoChef;

  if (!Array.isArray(merged.dailyQuests)) merged.dailyQuests = [];
  if (!merged.growthMultiplier || merged.growthMultiplier <= 0) merged.growthMultiplier = 1;
  if (!Number.isFinite(Number(merged.coins))) merged.coins = 100;
  else merged.coins = safeCoins(merged.coins);
  if (!Number.isFinite(Number(merged.coinMultiplier)) || merged.coinMultiplier <= 0) merged.coinMultiplier = 1;
  if (merged.energy == null) merged.energy = 100;
  if (merged.maxEnergy == null) merged.maxEnergy = 100;

  const oldBuildings = merged.buildings || {};
  merged.buildings = {
    silo: typeof oldBuildings.silo === 'object' ? oldBuildings.silo : { unlocked: !!oldBuildings.silo, level: oldBuildings.silo ? 1 : 0, maxLevel: 3 },
    greenhouse: typeof oldBuildings.greenhouse === 'object' ? oldBuildings.greenhouse : { unlocked: !!oldBuildings.greenhouse, level: oldBuildings.greenhouse ? 1 : 0, maxLevel: 1 },
    mill: oldBuildings.mill || { unlocked: false, level: 0, queue: [] },
    well: oldBuildings.well || { unlocked: true, level: 1, maxLevel: 3 },
    workshop: oldBuildings.workshop || { unlocked: false, level: 0, maxLevel: 3 },
    coop: oldBuildings.coop || { unlocked: false, level: 0, maxLevel: 3, capacity: 0 },
    barn: oldBuildings.barn || { unlocked: false, level: 0, maxLevel: 3, capacity: 0 },
  };
  if (!Array.isArray(merged.decorations)) merged.decorations = [];
  if (Array.isArray(merged.animals) && merged.animals.length > 0) merged.animals = merged.animals.map(normalizeAnimal);
  if (!Array.isArray(merged.activeCustomers)) merged.activeCustomers = [];
  if (!Number.isFinite(merged.totalTables) || merged.totalTables < 4) merged.totalTables = 4;

  if (merged.mining && merged.mining.nodes && merged.mining.nodes.length < 30) {
    const newNodes = [...merged.mining.nodes];
    while (newNodes.length < 30) {
      newNodes.push({ id: newNodes.length, status: 'ready', regenAt: null, type: 'batu' });
    }
    merged.mining.nodes = newNodes;
  }

  const legacyAnimalTypes = { chicken: 'ayam', duck: 'bebek', cow: 'sapi', sheep: 'domba', pig: 'babi', horse: 'kuda' };
  if (Array.isArray(merged.animals) && merged.animals.length > 0) {
    merged.animals = merged.animals.map((a) => ({ ...a, type: legacyAnimalTypes[a.type] || a.type }));
  }

  // Migrate flat inventory to inventoryByCategory
  if (merged.inventory && !merged.inventoryByCategory) {
    const cat = { crops: {}, animalProducts: {}, minerals: {}, fish: {}, processed: {}, cooked: {}, seeds: {}, tools: {}, bait: {}, collectibles: {} };
    for (const [itemId, qty] of Object.entries(merged.inventory)) {
      if (qty <= 0) continue;
      const c = getItemCategory(itemId);
      if (c) cat[c][itemId] = { qty, quality: 'normal', acquiredAt: Date.now() };
      else cat.collectibles[itemId] = { qty, quality: 'normal', acquiredAt: Date.now() };
    }
    merged.inventoryByCategory = cat;
  } else if (!merged.inventoryByCategory || typeof merged.inventoryByCategory !== 'object') {
    merged.inventoryByCategory = { crops: {}, animalProducts: {}, minerals: {}, fish: {}, processed: {}, cooked: {}, seeds: {}, tools: {}, bait: {}, collectibles: {} };
  }
  delete merged.inventory;

  if (!merged.achievements || typeof merged.achievements !== 'object') merged.achievements = {};
  if (!merged.stats || typeof merged.stats !== 'object') merged.stats = {};
  const defaultStats = { totalHarvested: 0, totalMined: 0, totalFished: 0, totalCooked: 0, totalServed: 0, totalCollected: 0, totalOrdersFulfilled: 0, totalGiftsGiven: 0, totalFertilizerUsed: 0, totalFertilizerDropped: 0, totalAnimalsFed: 0, totalAnimalsOwned: 0, totalWormsFound: 0, totalWormBaitUsed: 0, totalDiamondsMined: 0, totalSushiEmasMade: 0 };
  merged.stats = { ...defaultStats, ...merged.stats };
  merged.sessionActions = merged.sessionActions || {};
  merged.weatherEffects = merged.weatherEffects || { cropGrowth: 1.0, miningRegen: 1.0, animalProduce: 1.0, fishingRare: 1.0, customerRate: 1.0 };
  merged.npcs = { maria: { level: 1, points: 0 }, botan: { level: 1, points: 0 }, hadi: { level: 1, points: 0 }, bejo: { level: 1, points: 0 }, dodi: { level: 1, points: 0 }, ...(merged.npcs || {}) };

  return merged;
};

function getItemCategory(itemId) {
  const catMap = {
    wortel: 'crops', jagung: 'crops', tomat: 'crops', stroberi: 'crops',
    semangka: 'crops', jamur: 'crops', nanas: 'crops', labu: 'crops',
    kentang: 'crops', gandum: 'crops', tebu: 'crops', tulip: 'crops', apel: 'crops',
    telur: 'animalProducts', susu: 'animalProducts', bulu: 'animalProducts',
    truffle: 'animalProducts', tapal: 'animalProducts', telur_bebek: 'animalProducts',
    batu: 'minerals', tembaga: 'minerals', besi: 'minerals', emas: 'minerals', berlian: 'minerals',
    ikan_mas: 'fish', lele: 'fish', ikan_badut: 'fish', cumi: 'fish', gurita: 'fish',
    tepung_jagung: 'processed', gula: 'processed', saus_tomat: 'processed', keju: 'processed',
    sup_wortel: 'cooked', nasi_goreng: 'cooked', roti_gandum: 'cooked', es_teh: 'cooked',
    kue_wortel: 'cooked', sushi_mas: 'cooked', kue_manis: 'cooked', pancake: 'cooked',
    takoyaki: 'cooked', nasi_jamur: 'cooked', kue_apel: 'cooked', kue_stroberi: 'cooked',
    sushi_emas: 'cooked', lele_bakar: 'cooked',
  };
  return catMap[itemId] || null;
}
