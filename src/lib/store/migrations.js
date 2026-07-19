import { normalizePlots, normalizeAnimal, migrateLegacyWorkers, safeCoins } from './utils';

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
  inventory: state.inventory,
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
  mining: state.mining ? {
    ...state.mining,
    nodes: state.mining.nodes,
  } : state.mining,
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

  const oldWorkers = merged.workers || {};
  merged.workers = {
    farmer: typeof oldWorkers.farmer === 'object' ? oldWorkers.farmer : oldWorkers.farmer ? { hired: true, name: 'Petani Budi', level: 1, stamina: 100, maxStamina: 100, happiness: 80, skills: { farming: 1, harvesting: 1, watering: 1 } } : null,
    rancher: typeof oldWorkers.rancher === 'object' ? oldWorkers.rancher : oldWorkers.rancher ? { hired: true, name: 'Peternak Siti', level: 1, stamina: 100, maxStamina: 100, happiness: 80, skills: { ranching: 1, collecting: 1, feeding: 1 } } : null,
    fisher: typeof oldWorkers.fisher === 'object' ? oldWorkers.fisher : oldWorkers.fisher ? { hired: true, name: 'Nelayan Mamat', level: 1, stamina: 100, maxStamina: 100, happiness: 80, skills: { fishing: 1, baiting: 1 } } : null,
    miner: typeof oldWorkers.miner === 'object' ? oldWorkers.miner : oldWorkers.miner ? { hired: true, name: 'Penambang Tarjo', level: 1, stamina: 100, maxStamina: 100, happiness: 80, skills: { mining: 1, blasting: 1 } } : null,
    chef: typeof oldWorkers.chef === 'object' ? oldWorkers.chef : oldWorkers.chef ? { hired: true, name: 'Koki Juna', level: 1, stamina: 100, maxStamina: 100, happiness: 80, skills: { cooking: 1, baking: 1, prep: 1 } } : null,
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
  if (!Array.isArray(merged.decorations)) {
    merged.decorations = [];
  }

  if (Array.isArray(merged.animals) && merged.animals.length > 0) {
    merged.animals = merged.animals.map(normalizeAnimal);
  }

  if (!Array.isArray(merged.activeCustomers)) {
    merged.activeCustomers = [];
  }

  if (!Number.isFinite(merged.totalTables) || merged.totalTables < 4) {
    merged.totalTables = 4;
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
        type: 'batu',
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

  // MIGRATION: inventoryByCategory (new structured field)
  if (!merged.inventoryByCategory || typeof merged.inventoryByCategory !== 'object') {
    merged.inventoryByCategory = {
      crops: {}, animalProducts: {}, minerals: {}, fish: {},
      processed: {}, cooked: {}, seeds: {}, tools: {},
      bait: {}, collectibles: {}, decorations: {}, animals: {},
    };
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
};
