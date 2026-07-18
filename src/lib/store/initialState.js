import { rollMineralType } from './utils';

function createEmptyPlots(count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    status: 'empty',
    crop: null,
    plantedAt: null,
    growTime: null,
    watered: false,
  }));
}

function createMiningNodes(count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    status: 'ready',
    type: rollMineralType(1, false, null),
    regenAt: null,
  }));
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
  inventory: {},
  animals: [],

  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,

  todayPrices: {},
  marketTrend: {},

  lastWheelSpin: null,
  coinMultiplier: 1,
  growthMultiplier: 1,

  workers: {
    farmer: false,
    rancher: false,
    fisher: false,
    miner: false,
    chef: false,
  },

  autoFarmer: false,
  autoRancher: false,
  autoFisher: false,
  autoMiner: false,
  autoChef: false,
  selectedSeed: null,
  selectedMiningTool: null,
  selectedBait: null,
  selectedRecipe: null,

  modals: {
    prompt: { isOpen: false, title: '', msg: '', onConfirm: null },
    confirm: { isOpen: false, title: '', msg: '', onConfirm: null },
    npcGift: { isOpen: false, npcId: null },
  },

  combo: {
    count: 0,
    multiplier: 1,
    lastAction: 0,
  },

  season: { current: 'spring', day: 1, tick: 0 },
  weather: { current: '☀️ Cerah', nextChangeIn: 300 },

  mining: {
    nodes: createMiningNodes(),
    pickaxeLevel: 1,
    lanternUntil: null,
  },

  npcs: {
    maria: { level: 1, points: 0 },
    botan: { level: 1, points: 0 },
    hadi: { level: 1, points: 0 },
  },
  activeEvent: null,

  dailyQuests: [],
  lastQuestDate: null,
  workerAutoMigrated: false,

  craftingQueue: [],
  orders: [],

  buildings: {
    silo: false,
    greenhouse: false,
  },
  decorations: [],
};
