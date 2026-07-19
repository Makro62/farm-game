import { SHOP_SEEDS } from '../data/crops';
import { SHOP_ANIMALS } from '../data/shop';
import { GAME_CONSTANTS } from '../constants';

export const MINING_REGEN_MS = GAME_CONSTANTS.MINING.REGEN_MS;

export function getMiningRegenMs(mining, weatherEffects = null) {
  let ms = MINING_REGEN_MS[mining?.pickaxeLevel] || MINING_REGEN_MS[1];
  if (mining?.lanternUntil && mining.lanternUntil > Date.now()) {
    ms = Math.floor(ms * GAME_CONSTANTS.MINING.LANTERN_REGEN_MULT);
  }
  if (weatherEffects?.miningRegen && weatherEffects.miningRegen > 0) {
    ms = Math.floor(ms / weatherEffects.miningRegen);
  }
  return ms;
}

export function getAnimalProduceTime(animal, weatherEffects = null) {
  let ms = animal.produceTime || 60000;
  if (weatherEffects?.animalProduce && weatherEffects.animalProduce > 0) {
    ms = Math.floor(ms / weatherEffects.animalProduce);
  }
  return ms;
}

export function rollMineralType(pickaxeLevel = 1, lanternActive = false, eventId = null) {
  const weights = { batu: 50, tembaga: 20, besi: 15, emas: 10, berlian: 5 };
  if (pickaxeLevel >= 2) { weights.besi += 5; weights.batu -= 5; }
  if (pickaxeLevel >= 3) { weights.emas += 5; weights.berlian += 3; weights.batu -= 8; }
  if (lanternActive) { weights.emas += 3; weights.berlian += 2; weights.batu -= 5; }
  if (eventId === 'tambang') { weights.emas += 5; weights.berlian += 5; weights.batu -= 10; }
  Object.keys(weights).forEach(k => { if (weights[k] < 0) weights[k] = 0; });
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (const [type, weight] of Object.entries(weights)) {
    rand -= weight;
    if (rand <= 0) return type;
  }
  return 'batu';
}

export function pickAutoSeed(inventory, selectedSeed, season, hasGreenhouse = false) {
  if (selectedSeed) {
    const seed = SHOP_SEEDS.find((s) => s.id === selectedSeed);
    if (seed && (inventory[selectedSeed] || 0) > 0) {
      if (hasGreenhouse || seed.season === 'all' || seed.season === season) return seed;
    }
  }
  const available = SHOP_SEEDS.filter(
    (s) =>
      (inventory[s.id] || 0) > 0 &&
      (hasGreenhouse || s.season === 'all' || s.season === season)
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function getGrowthMultiplier(state) {
  let mult = state?.growthMultiplier > 0 ? state.growthMultiplier : 1;
  
  if (state?.weatherEffects?.cropGrowth) {
    mult *= state.weatherEffects.cropGrowth;
  }
  
  return mult;
}

export function consumeInventoryItem(inventory, itemId) {
  const next = (inventory[itemId] || 0) - 1;
  if (next <= 0) {
    delete inventory[itemId];
  } else {
    inventory[itemId] = next;
  }
}

export function safeCoins(value, fallback = 100) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

export function safePositiveNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ===== RECIPE INGREDIENT HELPERS =====

export function getIngredientAvailability(ingredientKey, inventory, inventoryByCategory) {
  const parts = ingredientKey.split('.');
  if (parts.length === 2) {
    const [cat, itemId] = parts;
    return inventoryByCategory?.[cat]?.[itemId]?.quantity || 0;
  }
  return inventory?.[ingredientKey] || 0;
}

export function consumeIngredient(ingredientKey, amount, inventory, inventoryByCategory) {
  const parts = ingredientKey.split('.');
  if (parts.length === 2) {
    const [cat, itemId] = parts;
    if (!inventoryByCategory?.[cat]?.[itemId]) return null;
    const newCat = { ...inventoryByCategory };
    const catItems = { ...newCat[cat] };
    const next = (catItems[itemId]?.quantity || 0) - amount;
    if (next <= 0) {
      delete catItems[itemId];
    } else {
      catItems[itemId] = { ...catItems[itemId], quantity: next };
    }
    newCat[cat] = catItems;
    return { inventory, inventoryByCategory: newCat };
  }
  const newInv = { ...inventory };
  const next = (newInv[ingredientKey] || 0) - amount;
  if (next <= 0) {
    delete newInv[ingredientKey];
  } else {
    newInv[ingredientKey] = next;
  }
  return { inventory: newInv, inventoryByCategory };
}

export function checkRecipeIngredients(recipe, inventory, inventoryByCategory) {
  for (const [ingredient, amount] of Object.entries(recipe.req || {})) {
    const available = getIngredientAvailability(ingredient, inventory, inventoryByCategory);
    if (available < amount) return false;
  }
  return true;
}

export function consumeRecipeIngredients(recipe, inventory, inventoryByCategory) {
  let currentInv = { ...inventory };
  let currentCat = inventoryByCategory ? { ...inventoryByCategory } : null;

  for (const [ingredient, amount] of Object.entries(recipe.req || {})) {
    const result = consumeIngredient(ingredient, amount, currentInv, currentCat);
    if (!result) return null;
    currentInv = result.inventory;
    currentCat = result.inventoryByCategory;
  }

  return { inventory: currentInv, inventoryByCategory: currentCat };
}

export const WORKER_AUTO_KEYS = {
  farmer: 'autoFarmer',
  rancher: 'autoRancher',
  fisher: 'autoFisher',
  miner: 'autoMiner',
  chef: 'autoChef',
};

export function isWorkerActive(state, type) {
  if (!state?.workers?.[type]) return false;
  const autoKey = WORKER_AUTO_KEYS[type];
  if (!autoKey) return false;
  return state[autoKey] !== false;
}

export const PLOT_STATE_MAP = {
  empty: 'empty',
  growing: 'growing',
  ready: 'ready',
  grass: 'empty',
  depleted: 'empty',
};

export function normalizePlot(plot, index = 0) {
  if (!plot || typeof plot !== 'object') {
    return { id: index, status: 'empty', crop: null, plantedAt: null, growTime: null };
  }

  const legacyState = plot.state;
  const status = plot.status || (legacyState ? PLOT_STATE_MAP[legacyState] || legacyState : 'empty');

  return {
    id: plot.id ?? index,
    status,
    crop: plot.crop ?? null,
    plantedAt: plot.plantedAt ?? null,
    growTime: plot.growTime > 0 ? plot.growTime : null,
  };
}

export function normalizePlots(plots) {
  if (!Array.isArray(plots)) {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      status: 'empty',
      crop: null,
      plantedAt: null,
      growTime: null,
    }));
  }

  const normalized = plots.map((p, i) => normalizePlot(p, i));
  while (normalized.length < 30) {
    normalized.push({
      id: normalized.length,
      status: 'empty',
      crop: null,
      plantedAt: null,
      growTime: null,
    });
  }
  return normalized.slice(0, 30);
}

export function normalizeAnimal(animal) {
  if (!animal || typeof animal !== 'object') return animal;

  const produceTime = animal.produceTime > 0 ? animal.produceTime : 20000;

  if (animal.readyToCollect) {
    return {
      ...animal,
      status: animal.status || 'producing',
      lastCollected: 0,
      produceTime,
    };
  }

  return {
    ...animal,
    status: animal.status || 'producing',
    lastCollected: animal.lastCollected ?? Date.now(),
    produceTime,
  };
}

export function migrateLegacyWorkers(merged) {
  if (typeof window === 'undefined') return merged;

  try {
    const legacyRaw = localStorage.getItem('farmTycoonSave');
    if (!legacyRaw) return merged;

    const payload = JSON.parse(legacyRaw);
    const dataStr = payload.data ?? legacyRaw;
    const legacy = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
    if (!legacy || typeof legacy !== 'object') return merged;

    merged.workers = {
      farmer: !!(merged.workers?.farmer || legacy.gnomeFarmOwned),
      rancher: !!(merged.workers?.rancher || legacy.gnomeAnimalOwned),
      fisher: !!(merged.workers?.fisher || legacy.merchantOwned),
      miner: !!merged.workers?.miner,
      chef: !!merged.workers?.chef,
    };

    if (legacy.gnomeFarmOwned && legacy.gnomeFarmActive !== false) merged.autoFarmer = true;
    if (legacy.gnomeAnimalOwned && legacy.gnomeAnimalActive !== false) merged.autoRancher = true;
    if (legacy.merchantOwned && legacy.merchantActive !== false) merged.autoFisher = true;
  } catch {
    // abaikan save lama yang rusak
  }

  return merged;
}
