import { SHOP_SEEDS } from "@/lib/data/crops";
import type { ShopSeed } from "@/types/items";
import { GAME_CONSTANTS } from "@/lib/constants";
import {
  hasRequirements as canonicalHasRequirements,
  consumeRequirements as canonicalConsumeRequirements,
} from "@/lib/data/recipes";
import type {
  GameState,
  InventoryByCategory,
  InventoryStack,
  MiningState,
  Plot,
  Animal,
  WeatherEffects,
  WorkerRole,
} from "@/types/game";

export const MINING_REGEN_MS: Record<number, number> =
  GAME_CONSTANTS.MINING.REGEN_MS as Record<number, number>;

export function getMiningRegenMs(
  mining: Pick<MiningState, "pickaxeLevel" | "lanternUntil"> | null | undefined,
  weatherEffects: Pick<WeatherEffects, "miningRegen"> | null = null,
): number {
  let ms = MINING_REGEN_MS[mining?.pickaxeLevel ?? 1] || MINING_REGEN_MS[1];
  if (mining?.lanternUntil && mining.lanternUntil > Date.now()) {
    ms = Math.floor(ms * GAME_CONSTANTS.MINING.LANTERN_REGEN_MULT);
  }
  if (weatherEffects?.miningRegen && weatherEffects.miningRegen > 0) {
    ms = Math.floor(ms / weatherEffects.miningRegen);
  }
  return ms;
}

export function getAnimalProduceTime(
  animal: Pick<Animal, "produceTime"> | null | undefined,
  weatherEffects: Pick<WeatherEffects, "animalProduce"> | null = null,
): number {
  let ms = animal?.produceTime || 60000;
  if (weatherEffects?.animalProduce && weatherEffects.animalProduce > 0) {
    ms = Math.floor(ms / weatherEffects.animalProduce);
  }
  return ms;
}

export function rollMineralType(
  pickaxeLevel: number = 1,
  lanternActive: boolean | number | null | undefined = false,
  eventId: string | null = null,
): string {
  const weights: Record<string, number> = {
    batu: 50,
    tembaga: 20,
    besi: 15,
    emas: 10,
    berlian: 5,
  };
  if (pickaxeLevel >= 2) {
    weights.besi += 5;
    weights.batu -= 5;
  }
  if (pickaxeLevel >= 3) {
    weights.emas += 5;
    weights.berlian += 3;
    weights.batu -= 8;
  }
  if (lanternActive) {
    weights.emas += 3;
    weights.berlian += 2;
    weights.batu -= 5;
  }
  if (eventId === "tambang") {
    weights.emas += 5;
    weights.berlian += 5;
    weights.batu -= 10;
  }
  Object.keys(weights).forEach((k) => {
    if (weights[k] < 0) weights[k] = 0;
  });
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (const [type, weight] of Object.entries(weights)) {
    rand -= weight;
    if (rand <= 0) return type;
  }
  return "batu";
}

function stackQty(v: number | InventoryStack | null | undefined): number {
  if (typeof v === "number") return v;
  return v?.qty || 0;
}

export function pickAutoSeed(
  inventory: Record<string, number | InventoryStack> | null | undefined,
  selectedSeed: string | null,
  season: string | null | undefined,
  hasGreenhouse: boolean = false,
): ShopSeed | null {
  const inv = inventory ?? {};
  if (selectedSeed) {
    const seed = SHOP_SEEDS.find((s) => s.id === selectedSeed);
    if (seed && stackQty(inv[selectedSeed]) > 0) {
      if (hasGreenhouse || seed.season === "all" || seed.season === season)
        return seed;
    }
  }
  const available = SHOP_SEEDS.filter(
    (s) =>
      stackQty(inv[s.id]) > 0 &&
      (hasGreenhouse || s.season === "all" || s.season === season),
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function getGrowthMultiplier(
  state:
    | Pick<GameState, "growthMultiplier" | "weatherEffects">
    | null
    | undefined,
): number {
  let mult =
    state && state.growthMultiplier > 0 ? state.growthMultiplier : 1;

  if (state?.weatherEffects?.cropGrowth) {
    mult *= state.weatherEffects.cropGrowth;
  }

  return mult;
}

export function consumeInventoryItem(
  inventory: Record<string, number>,
  itemId: string,
): void {
  const next = (inventory[itemId] || 0) - 1;
  if (next <= 0) {
    delete inventory[itemId];
  } else {
    inventory[itemId] = next;
  }
}

export function safeCoins(value: unknown, fallback: number = 100): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

export function safePositiveNumber(
  value: unknown,
  fallback: number = 0,
): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ===== RECIPE INGREDIENT HELPERS =====
// Canonical logic lives in `@/lib/data/recipes` (hasRequirements /
// consumeRequirements) which correctly uses the `qty` field.
// The helpers below are backward-compat wrappers kept for old call sites.

type CategoryInventory = Record<string, Record<string, InventoryStack>>;

function asCategoryMap(
  inventoryByCategory: InventoryByCategory | null | undefined,
): CategoryInventory {
  return (inventoryByCategory ?? {}) as CategoryInventory;
}

export function getIngredientAvailability(
  ingredientKey: string,
  inventory: Record<string, number> | null | undefined,
  inventoryByCategory: InventoryByCategory | null | undefined,
): number {
  const parts = ingredientKey.split(".");
  if (parts.length === 2) {
    const [cat, itemId] = parts;
    return asCategoryMap(inventoryByCategory)?.[cat]?.[itemId]?.qty || 0;
  }
  return inventory?.[ingredientKey] || 0;
}

export function consumeIngredient(
  ingredientKey: string,
  amount: number,
  inventory: Record<string, number> | null | undefined,
  inventoryByCategory: InventoryByCategory | null | undefined,
): {
  inventory: Record<string, number>;
  inventoryByCategory: CategoryInventory;
} | null {
  const parts = ingredientKey.split(".");
  if (parts.length === 2) {
    const [cat, itemId] = parts;
    if (!asCategoryMap(inventoryByCategory)?.[cat]?.[itemId]) return null;
    const newCat: CategoryInventory = { ...asCategoryMap(inventoryByCategory) };
    const catItems = { ...newCat[cat] };
    const next = (catItems[itemId]?.qty || 0) - amount;
    if (next <= 0) {
      delete catItems[itemId];
    } else {
      catItems[itemId] = { ...catItems[itemId], qty: next };
    }
    newCat[cat] = catItems;
    return { inventory: { ...(inventory ?? {}) }, inventoryByCategory: newCat };
  }
  const newInv = { ...(inventory ?? {}) };
  const next = (newInv[ingredientKey] || 0) - amount;
  if (next <= 0) {
    delete newInv[ingredientKey];
  } else {
    newInv[ingredientKey] = next;
  }
  return {
    inventory: newInv,
    inventoryByCategory: asCategoryMap(inventoryByCategory),
  };
}

export function checkRecipeIngredients(
  recipe: { req?: Record<string, number> } | null | undefined,
  _inventory: Record<string, number> | null | undefined,
  inventoryByCategory: InventoryByCategory | null | undefined,
): boolean {
  return canonicalHasRequirements(
    recipe?.req || {},
    inventoryByCategory ?? ({} as InventoryByCategory),
  );
}

export function consumeRecipeIngredients(
  recipe: { req?: Record<string, number> } | null | undefined,
  inventory: Record<string, number> | null | undefined,
  inventoryByCategory: InventoryByCategory | null | undefined,
): {
  inventory: Record<string, number>;
  inventoryByCategory: InventoryByCategory | CategoryInventory;
} | null {
  const next = canonicalConsumeRequirements(
    recipe?.req || {},
    inventoryByCategory ?? ({} as InventoryByCategory),
  );
  if (!next) return null;
  return {
    inventory: { ...(inventory ?? {}) },
    inventoryByCategory: next,
  };
}

export const WORKER_AUTO_KEYS: Record<WorkerRole, string> = {
  farmer: "autoFarmer",
  rancher: "autoRancher",
  fisher: "autoFisher",
  miner: "autoMiner",
  chef: "autoChef",
};

export function isWorkerActive(
  state: Pick<GameState, "workers"> | null | undefined,
  type: WorkerRole | string,
): boolean {
  const worker = state?.workers?.[type as WorkerRole];
  if (!worker?.hired) return false;
  if (worker.isWorking === false) return false;
  return worker.isAutoMode !== false;
}

export const PLOT_STATE_MAP: Record<string, Plot["status"]> = {
  empty: "empty",
  growing: "growing",
  ready: "ready",
  grass: "empty",
  depleted: "empty",
};

function emptyPlot(id: number): Plot {
  return {
    id,
    status: "empty",
    crop: null,
    plantedAt: null,
    growTime: null,
    watered: false,
    fertilizer: null,
    quality: null,
    pestInfestation: false,
    greenhouse: false,
    level: 1,
  };
}

export function normalizePlot(
  plot: Partial<Plot> & { state?: string } | null | undefined,
  index: number = 0,
): Plot {
  if (!plot || typeof plot !== "object") {
    return emptyPlot(index);
  }

  const legacyState = (plot as { state?: string }).state;
  const status =
    plot.status ||
    (legacyState ? PLOT_STATE_MAP[legacyState] || legacyState : "empty");

  return {
    id: plot.id ?? index,
    status,
    crop: plot.crop ?? null,
    plantedAt: plot.plantedAt ?? null,
    growTime: plot.growTime && plot.growTime > 0 ? plot.growTime : null,
    watered: plot.watered ?? false,
    fertilizer: plot.fertilizer ?? null,
    quality: plot.quality ?? null,
    pestInfestation: plot.pestInfestation ?? false,
    greenhouse: plot.greenhouse ?? false,
    level: Math.max(1, Math.min(3, plot.level || 1)),
  };
}

export function normalizePlots(
  plots: unknown,
  maxLength = 30,
  startId = 0,
): Plot[] {
  if (!Array.isArray(plots)) {
    return Array.from({ length: maxLength }, (_, i) => emptyPlot(startId + i));
  }

  const normalized = (plots as Array<Partial<Plot> & { id?: number }>).map(
    (p, i) =>
      normalizePlot(
        p,
        typeof p === "object" && p && "id" in p && typeof p.id === "number"
          ? p.id
          : startId + i,
      ),
  );
  while (normalized.length < maxLength) {
    normalized.push(emptyPlot(startId + normalized.length));
  }
  return normalized.slice(0, maxLength);
}

export function normalizeAnimal<T extends Animal>(animal: T | null | undefined): T {
  if (!animal || typeof animal !== "object") return animal as unknown as T;

  const produceTime =
    animal.produceTime && animal.produceTime > 0 ? animal.produceTime : 20000;

  if ((animal as { readyToCollect?: boolean }).readyToCollect) {
    return {
      ...animal,
      status: animal.status || "producing",
      lastCollected: 0,
      produceTime,
    };
  }

  return {
    ...animal,
    status: animal.status || "producing",
    lastCollected: animal.lastCollected ?? Date.now(),
    produceTime,
  };
}

export function migrateLegacyWorkers<T extends { workers?: unknown }>(merged: T): T {
  if (typeof window === "undefined") return merged;

  try {
    const legacyRaw = localStorage.getItem("farmTycoonSave");
    if (!legacyRaw) return merged;

    const payload = JSON.parse(legacyRaw) as { data?: unknown };
    const dataStr = payload.data ?? legacyRaw;
    const legacy =
      typeof dataStr === "string" ? JSON.parse(dataStr) : dataStr;
    if (!legacy || typeof legacy !== "object") return merged;

    return {
      ...merged,
      workers: {
        farmer: !!(
          (merged.workers as Record<string, unknown>)?.["farmer"] ||
          (legacy as Record<string, unknown>).gnomeFarmOwned
        ),
        rancher: !!(
          (merged.workers as Record<string, unknown>)?.["rancher"] ||
          (legacy as Record<string, unknown>).gnomeAnimalOwned
        ),
        fisher: !!(
          (merged.workers as Record<string, unknown>)?.["fisher"] ||
          (legacy as Record<string, unknown>).merchantOwned
        ),
        miner: !!(merged.workers as Record<string, unknown>)?.["miner"],
        chef: !!(merged.workers as Record<string, unknown>)?.["chef"],
      },
    };
  } catch {
    // abaikan save lama yang rusak
  }

  return merged;
}
