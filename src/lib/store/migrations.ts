import { normalizePlots, normalizeAnimal, safeCoins } from "./utils";
import { getItemCategory } from "@/lib/utils/inventory";
import type { GameStore, GameState, Worker, WorkerRole } from "@/types/game";

export const partializeState = (state: GameStore) => ({
  coins: state.coins,
  level: state.level,
  xp: state.xp,
  energy: state.energy,
  maxEnergy: state.maxEnergy,
  day: state.day,
  streak: state.streak,
  lastLogin: state.lastLogin,
  plots: state.plots,
  feedPlots: state.feedPlots,
  kitchenPlots: state.kitchenPlots,
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
  selectedMiningTool: state.selectedMiningTool,
  season: state.season,
  weather: state.weather,
  mining: state.mining
    ? { ...state.mining, nodes: state.mining.nodes }
    : state.mining,
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

type LegacyRecord = Record<string, unknown>;

function asRecord(v: unknown): LegacyRecord {
  return (v ?? {}) as LegacyRecord;
}

function migrateLegacyWorker(val: unknown): Worker | null {
  if (!val) return null;
  if (typeof val === "object" && (val as LegacyRecord).hired)
    return val as Worker;
  const templates: Record<WorkerRole, Pick<Worker, "name" | "role" | "skills">> = {
    farmer: {
      name: "Kurcaci Budi",
      role: "farmer",
      skills: { farming: 1, harvesting: 1, watering: 1 },
    },
    rancher: {
      name: "Kurcaci Siti",
      role: "rancher",
      skills: { ranching: 1, collecting: 1, feeding: 1 },
    },
    fisher: {
      name: "Kurcaci Mamat",
      role: "fisher",
      skills: { fishing: 1, baiting: 1 },
    },
    miner: {
      name: "Kurcaci Tarjo",
      role: "miner",
      skills: { mining: 1, blasting: 1 },
    },
    chef: {
      name: "Kurcaci Juna",
      role: "chef",
      skills: { cooking: 1, baking: 1, prep: 1 },
    },
  };
  const rec = asRecord(val);
  const role = typeof val === "object" ? ((rec.role ?? rec.type) as string | null) : null;
  const t = role ? templates[role as WorkerRole] : null;
  if (!t) return null;
  return {
    hired: true,
    ...t,
    level: (rec.level as number) || 1,
    xp: (rec.xp as number) || 0,
    xpToNext: 200,
    stamina: (rec.stamina as number) ?? 100,
    maxStamina: (rec.maxStamina as number) ?? 100,
    staminaRegenPerHour: 10,
    happiness: (rec.happiness as number) ?? 80,
    maxHappiness: 100,
    wagePerDay: 50,
    daysEmployed: (rec.daysEmployed as number) || 0,
    totalWagesPaid: (rec.totalWagesPaid as number) || 0,
    loyalty: (rec.loyalty as number) ?? 60,
    isWorking: (rec.isWorking as boolean) ?? true,
    isAutoMode: (rec.isAutoMode as boolean) ?? true,
    schedule: {
      workStart: 6,
      workEnd: 18,
      lunchBreak: 12,
      sleepStart: 22,
      sleepEnd: 5,
    },
  } as Worker;
}

type MigratableState = GameState & LegacyRecord;

export const migrateState = (
  persistedState: unknown,
  currentState: GameStore,
): GameStore => {
  const persisted = asRecord(persistedState);
  const merged = { ...currentState, ...persisted } as MigratableState;
  merged.plots = normalizePlots(merged.plots, 30, 0);
  merged.feedPlots = normalizePlots(merged.feedPlots, 12, 100);
  merged.kitchenPlots = normalizePlots(merged.kitchenPlots, 12, 200);

  if (merged.mining) {
    if (merged.mining.pickaxeLevel == null) merged.mining.pickaxeLevel = 1;
    if (merged.mining.lanternUntil == null) merged.mining.lanternUntil = null;
    if (merged.mining.currentFloor == null) merged.mining.currentFloor = 1;
    if (merged.mining.maxFloorReached == null)
      merged.mining.maxFloorReached = 1;
    if (!merged.mining.smeltery)
      merged.mining.smeltery = {
        unlocked: false,
        level: 0,
        queue: [],
        fuel: 0,
      };
    if (Array.isArray(merged.mining.nodes)) {
      merged.mining.nodes = merged.mining.nodes.map((n) => ({
        ...n,
        hazard: n.hazard || null,
      }));
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
  if (merged.autoFarmer !== undefined && merged.workers.farmer)
    merged.workers.farmer.isAutoMode = !!merged.autoFarmer;
  if (merged.autoRancher !== undefined && merged.workers.rancher)
    merged.workers.rancher.isAutoMode = !!merged.autoRancher;
  if (merged.autoFisher !== undefined && merged.workers.fisher)
    merged.workers.fisher.isAutoMode = !!merged.autoFisher;
  if (merged.autoMiner !== undefined && merged.workers.miner)
    merged.workers.miner.isAutoMode = !!merged.autoMiner;
  if (merged.autoChef !== undefined && merged.workers.chef)
    merged.workers.chef.isAutoMode = !!merged.autoChef;

  // Clean up legacy fields
  delete merged.autoFarmer;
  delete merged.autoRancher;
  delete merged.autoFisher;
  delete merged.autoMiner;
  delete merged.autoChef;

  if (!Array.isArray(merged.dailyQuests)) merged.dailyQuests = [];
  if (!merged.growthMultiplier || merged.growthMultiplier <= 0)
    merged.growthMultiplier = 1;
  if (!Number.isFinite(Number(merged.coins))) merged.coins = 100;
  else merged.coins = safeCoins(merged.coins);
  if (
    !Number.isFinite(Number(merged.coinMultiplier)) ||
    merged.coinMultiplier <= 0
  )
    merged.coinMultiplier = 1;
  if (merged.energy == null) merged.energy = 100;
  if (merged.maxEnergy == null) merged.maxEnergy = 100;

  const oldBuildings = merged.buildings || {};
  merged.buildings = {
    silo:
      typeof oldBuildings.silo === "object"
        ? oldBuildings.silo
        : {
            unlocked: !!oldBuildings.silo,
            level: oldBuildings.silo ? 1 : 0,
            maxLevel: 3,
          },
    greenhouse:
      typeof oldBuildings.greenhouse === "object"
        ? oldBuildings.greenhouse
        : {
            unlocked: !!oldBuildings.greenhouse,
            level: oldBuildings.greenhouse ? 1 : 0,
            maxLevel: 1,
          },
    mill: oldBuildings.mill || { unlocked: false, level: 0, queue: [] },
    well: oldBuildings.well || { unlocked: true, level: 1, maxLevel: 3 },
    workshop: oldBuildings.workshop || {
      unlocked: false,
      level: 0,
      maxLevel: 3,
    },
    coop: oldBuildings.coop || {
      unlocked: false,
      level: 0,
      maxLevel: 3,
      capacity: 0,
    },
    barn: oldBuildings.barn || {
      unlocked: false,
      level: 0,
      maxLevel: 3,
      capacity: 0,
    },
  };
  if (!Array.isArray(merged.decorations)) merged.decorations = [];
  if (Array.isArray(merged.animals) && merged.animals.length > 0)
    merged.animals = merged.animals.map(normalizeAnimal);
  if (!Array.isArray(merged.activeCustomers)) merged.activeCustomers = [];
  if (!Number.isFinite(merged.totalTables) || merged.totalTables < 4)
    merged.totalTables = 4;
  // Restaurant state defaults for old saves
  merged.restaurant = Object.assign(
    {
      reputation: 0,
      dailySpecial: null,
      serviceOn: true,
      rushUntil: 0,
      lastSpecialDay: -1,
      serveStreak: 0,
      lastServedAt: 0,
    },
    merged.restaurant || {}
  );

  if (merged.mining && merged.mining.nodes && merged.mining.nodes.length < 30) {
    const newNodes = [...merged.mining.nodes];
    while (newNodes.length < 30) {
      newNodes.push({
        id: newNodes.length,
        status: "ready",
        regenAt: null,
        type: "batu",
        hazard: null,
      });
    }
    merged.mining.nodes = newNodes;
  }

  const legacyAnimalTypes: Record<string, string> = {
    chicken: "ayam",
    duck: "bebek",
    cow: "sapi",
    sheep: "domba",
    pig: "babi",
    horse: "kuda",
  };
  if (Array.isArray(merged.animals) && merged.animals.length > 0) {
    merged.animals = merged.animals.map((a) => ({
      ...a,
      type: legacyAnimalTypes[a.type] || a.type,
    }));
  }

  // Migrate flat inventory to inventoryByCategory
  if (merged.inventory && !merged.inventoryByCategory) {
    const cat: GameState["inventoryByCategory"] = {
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
      consumables: {},
    };
    for (const [itemId, qtyRaw] of Object.entries(
      merged.inventory as Record<string, unknown>,
    )) {
      const qty = Number(qtyRaw);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      const c = getItemCategory(itemId);
      if (c)
        cat[c][itemId] = { qty, quality: "normal", acquiredAt: Date.now() };
      else
        cat.collectibles[itemId] = {
          qty,
          quality: "normal",
          acquiredAt: Date.now(),
        };
    }
    merged.inventoryByCategory = cat;
  } else if (
    !merged.inventoryByCategory ||
    typeof merged.inventoryByCategory !== "object"
  ) {
    merged.inventoryByCategory = {
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
      consumables: {},
    };
  }
  delete merged.inventory;

  if (!merged.achievements || typeof merged.achievements !== "object")
    merged.achievements = {};
  if (!merged.stats || typeof merged.stats !== "object")
    merged.stats = {} as GameState["stats"];
  const defaultStats: GameState["stats"] = {
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
  merged.npcs = {
    maria: { level: 1, points: 0, hearts: 1, dailyGiftGiven: false, questsCompleted: [] },
    botan: { level: 1, points: 0, hearts: 1, dailyGiftGiven: false, questsCompleted: [] },
    hadi: { level: 1, points: 0, hearts: 1, dailyGiftGiven: false, questsCompleted: [] },
    bejo: { level: 1, points: 0, hearts: 1, dailyGiftGiven: false, questsCompleted: [] },
    dodi: { level: 1, points: 0, hearts: 1, dailyGiftGiven: false, questsCompleted: [] },
    ...((merged.npcs || {}) as GameState["npcs"]),
  };

  return merged as unknown as GameStore;
};
