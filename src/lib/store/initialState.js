import { rollMineralType } from "./utils";

function createEmptyPlots(count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    status: "empty",
    crop: null,
    plantedAt: null,
    growTime: null,
    watered: false,
    fertilizer: null,
    quality: null,
    pestInfestation: false,
    greenhouse: false,
  }));
}

function createMiningNodes(count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    status: "ready",
    type: rollMineralType(1, false, null),
    regenAt: null,
    hazard: null,
  }));
}

function createDefaultWorker(type) {
  const templates = {
    farmer: {
      name: "Kurcaci Budi",
      role: "farmer",
      level: 1,
      xp: 0,
      xpToNext: 200,
      stamina: 100, // kept for now if future
      happiness: 80,
      wagePerDay: 50,
      daysEmployed: 0,
      totalWagesPaid: 0,
      loyalty: 60,
      skills: { farming: 1, harvesting: 1, watering: 1 },
      isWorking: true,
      isAutoMode: true,
    },
    rancher: {
      name: "Kurcaci Siti",
      role: "rancher",
      level: 1,
      xp: 0,
      xpToNext: 200,
      stamina: 100,
      happiness: 80,
      wagePerDay: 50,
      daysEmployed: 0,
      totalWagesPaid: 0,
      loyalty: 60,
      skills: { ranching: 1, collecting: 1, feeding: 1 },
      isWorking: true,
      isAutoMode: true,
    },
    fisher: {
      name: "Kurcaci Mamat",
      role: "fisher",
      level: 1,
      xp: 0,
      xpToNext: 200,
      stamina: 100,
      happiness: 80,
      wagePerDay: 50,
      daysEmployed: 0,
      totalWagesPaid: 0,
      loyalty: 60,
      skills: { fishing: 1, baiting: 1 },
      isWorking: true,
      isAutoMode: true,
    },
    miner: {
      name: "Kurcaci Tarjo",
      role: "miner",
      level: 1,
      xp: 0,
      xpToNext: 200,
      stamina: 100,
      happiness: 80,
      wagePerDay: 50,
      daysEmployed: 0,
      totalWagesPaid: 0,
      loyalty: 60,
      skills: { mining: 1, blasting: 1 },
      isWorking: true,
      isAutoMode: true,
    },
    chef: {
      name: "Kurcaci Juna",
      role: "chef",
      level: 1,
      xp: 0,
      xpToNext: 200,
      stamina: 100,
      happiness: 80,
      wagePerDay: 50,
      daysEmployed: 0,
      totalWagesPaid: 0,
      loyalty: 60,
      skills: { cooking: 1, baking: 1, prep: 1 },
      isWorking: true,
      isAutoMode: true,
    },
  };
  return templates[type] || null;
}

export const initialState = {
  coins: 100,
  level: 1,
  xp: 0,
  energy: 100,
  maxEnergy: 100,
  day: 1,
  streak: 0,
  lastLogin: null,
  lastSavedAt: Date.now(),
  offlineReport: null,

  plots: createEmptyPlots(),

  inventoryByCategory: {
    crops: {},
    animalProducts: {},
    minerals: {},
    fish: {},
    processed: {},
    cooked: {},
    seeds: {},
    tools: {},
    bait: {},
    collectibles: {},
  },

  animals: [],

  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,

  todayPrices: {},
  marketTrend: {},

  lastWheelSpin: null,
  coinMultiplier: 1,
  growthMultiplier: 1,

  // Workers — full lifecycle
  workers: {
    farmer: null,
    rancher: null,
    fisher: null,
    miner: null,
    chef: null,
  },

  selectedSeed: null,
  selectedMiningTool: null,
  selectedBait: null,
  selectedRecipe: null,

  modals: {
    prompt: { isOpen: false, title: "", msg: "", onConfirm: null },
    confirm: { isOpen: false, title: "", msg: "", onConfirm: null },
    npcGift: { isOpen: false, npcId: null },
  },

  combo: {
    count: 0,
    multiplier: 1,
    lastAction: 0,
  },

  season: { current: "spring", day: 1, tick: 0 },
  weather: {
    current: "☀️ Cerah",
    nextChangeIn: 300,
    forecast: ["☀️ Cerah", "🌧️ Hujan", "☀️ Cerah"],
  },

  mining: {
    currentFloor: 1,
    maxFloorReached: 1,
    nodes: createMiningNodes(),
    pickaxeLevel: 1,
    lanternUntil: null,
    hazards: [],
    smeltery: {
      unlocked: false,
      level: 0,
      queue: [],
      fuel: 0,
    },
  },

  npcs: {
    maria: {
      level: 1,
      points: 0,
      hearts: 1,
      dailyGiftGiven: false,
      questsCompleted: [],
    },
    botan: {
      level: 1,
      points: 0,
      hearts: 1,
      dailyGiftGiven: false,
      questsCompleted: [],
    },
    hadi: {
      level: 1,
      points: 0,
      hearts: 1,
      dailyGiftGiven: false,
      questsCompleted: [],
    },
    bejo: {
      level: 1,
      points: 0,
      hearts: 1,
      dailyGiftGiven: false,
      questsCompleted: [],
    },
    dodi: {
      level: 1,
      points: 0,
      hearts: 1,
      dailyGiftGiven: false,
      questsCompleted: [],
    },
  },
  activeEvent: null,

  dailyQuests: [],
  lastQuestDate: null,
  workerAutoMigrated: false,

  craftingQueue: [],
  orders: [],

  totalTables: 4,
  buildings: {
    silo: { unlocked: false, level: 0, maxLevel: 3 },
    greenhouse: { unlocked: false, level: 0, maxLevel: 1 },
    mill: { unlocked: false, level: 0, queue: [] },
    well: { unlocked: true, level: 1, maxLevel: 3 },
    workshop: { unlocked: false, level: 0, maxLevel: 3 },
    coop: { unlocked: false, level: 0, maxLevel: 3, capacity: 0 },
    barn: { unlocked: false, level: 0, maxLevel: 3, capacity: 0 },
  },
  decorations: [],
  tutorialStep: 0,

  achievements: {},
  sessionActions: {},
  weatherEffects: {
    cropGrowth: 1.0,
    miningRegen: 1.0,
    animalProduce: 1.0,
    fishingRare: 1.0,
    customerRate: 1.0,
  },
  stats: {
    totalHarvested: 0,
    totalMined: 0,
    totalFished: 0,
    totalCooked: 0,
    totalServed: 0,
    totalCollected: 0,
    totalOrdersFulfilled: 0,
    totalGiftsGiven: 0,
    totalFertilizerUsed: 0,
    totalFertilizerDropped: 0,
    totalAnimalsFed: 0,
    totalAnimalsOwned: 0,
    totalWormsFound: 0,
    totalWormBaitUsed: 0,
    totalDiamondsMined: 0,
    totalSushiEmasMade: 0,
  },
  activeCustomers: [],
  notificationsQueue: [],

  restaurant: {
    reputation: 0,
    dailySpecial: null,
    serviceOn: true,
  },

  town: {
    museumDonations: [],
    bankSavings: 0,
    bankInterestRate: 0.02,
  },
};
