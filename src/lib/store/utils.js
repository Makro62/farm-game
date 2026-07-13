import { SHOP_SEEDS, SHOP_ANIMALS } from '../utils';
import { GAME_CONSTANTS } from '../constants';

const { MINING } = GAME_CONSTANTS;

/**
 * Mendapatkan waktu regen tambang berdasarkan level pickaxe dan status lantern
 * @param {Object} mining - State mining object
 * @returns {number} Waktu regen dalam milidetik
 */
export function getMiningRegenMs(mining) {
  const regenMap = {
    1: MINING.REGEN_MS.PICKAXE_BASIC,
    2: MINING.REGEN_MS.PICKAXE_BESI,
    3: MINING.REGEN_MS.PICKAXE_EMAS,
  };
  let ms = regenMap[mining?.pickaxeLevel] || MINING.REGEN_MS.PICKAXE_BASIC;
  
  // Lantern mempercepat regen 50%
  if (mining?.lanternUntil && mining.lanternUntil > Date.now()) {
    ms = Math.floor(ms * MINING.LANTERN_SPEED_MULT);
  }
  return ms;
}

/**
 * Roll tipe mineral berdasarkan level pickaxe, lantern, dan event
 * @param {number} pickaxeLevel - Level pickaxe (1-3)
 * @param {boolean} lanternActive - Apakah lantern aktif
 * @param {string|null} eventId - ID event aktif
 * @returns {string} Tipe mineral yang didapat
 */
export function rollMineralType(pickaxeLevel = 1, lanternActive = false, eventId = null) {
  const { PROBABILITIES, EVENT_BONUS } = MINING;
  
  // Bonus dari lantern dan pickaxe level tinggi
  let bonus = (lanternActive ? 0.05 : 0) + 
              (pickaxeLevel >= 3 ? 0.08 : pickaxeLevel >= 2 ? 0.04 : 0);
  
  // Event Demam Emas: peluang emas & berlian naik
  if (eventId === 'tambang') {
    bonus += EVENT_BONUS;
  }
  
  const r = Math.random();
  if (r < PROBABILITIES.DIAMOND_BASE + bonus) return 'berlian';
  if (r < PROBABILITIES.GOLD_BASE + bonus) return 'emas';
  if (r < PROBABILITIES.IRON_BASE + (pickaxeLevel >= 2 ? 0.05 : 0)) return 'besi';
  if (r < PROBABILITIES.COPPER_BASE) return 'tembaga';
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

/**
 * Menghitung multiplier pertumbuhan tanaman berdasarkan booster dan cuaca
 * @param {Object} state - Game state object
 * @returns {number} Multiplier pertumbuhan
 */
export function getGrowthMultiplier(state) {
  let mult = state?.growthMultiplier > 0 ? state.growthMultiplier : 1;
  const weather = state?.weather?.current;
  
  // Cuaca mempengaruhi pertumbuhan
  if (weather === '🌧️ Hujan') {
    mult *= 1.5; // Hujan mempercepat 50%
  } else if (weather === '⛈️ Badai') {
    mult *= 0.5; // Badai memperlambat 50%
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

/**
 * Helper untuk normalisasi nilai coins (mencegah NaN/Infinity)
 * @param {number} value - Nilai coins yang akan dinormalisasi
 * @param {number} fallback - Nilai default jika invalid
 * @returns {number} Nilai coins yang aman
 */
export function safeCoins(value, fallback = 100) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

/**
 * Helper untuk normalisasi angka positif
 * @param {number} value - Nilai yang akan dinormalisasi
 * @param {number} fallback - Nilai default jika invalid
 * @returns {number} Nilai positif yang aman
 */
export function safePositiveNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Mapping worker type ke flag auto di state
 */
export const WORKER_AUTO_KEYS = {
  farmer: 'autoFarmer',
  rancher: 'autoRancher',
  fisher: 'autoFisher',
  miner: 'autoMiner',
};

/**
 * Cek apakah worker aktif (dibeli dan enabled)
 * @param {Object} state - Game state object
 * @param {string} type - Tipe worker ('farmer', 'rancher', 'fisher', 'miner')
 * @returns {boolean} True jika worker aktif
 */
export function isWorkerActive(state, type) {
  if (!state?.workers?.[type]) return false;
  const autoKey = WORKER_AUTO_KEYS[type];
  if (!autoKey) return false;
  return state[autoKey] !== false;
}

/**
 * Mapping state plot lama ke state baru
 */
export const PLOT_STATE_MAP = {
  empty: 'empty',
  growing: 'growing',
  ready: 'ready',
  grass: 'empty',
  depleted: 'empty',
};

/**
 * Normalisasi objek plot untuk memastikan format konsisten
 * @param {Object} plot - Plot object dari state
 * @param {number} index - Index fallback untuk ID
 * @returns {Object} Plot yang ternormalisasi
 */
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

/**
 * Normalisasi array plots - memastikan selalu ada 30 plots dengan format valid
 * @param {Array} plots - Array plots dari state
 * @returns {Array} Array plots yang ternormalisasi (selalu 30 items)
 */
export function normalizePlots(plots) {
  const { PLOTS_COUNT } = GAME_CONSTANTS;
  
  if (!Array.isArray(plots)) {
    return Array.from({ length: PLOTS_COUNT }, (_, i) => ({
      id: i,
      status: 'empty',
      crop: null,
      plantedAt: null,
      growTime: null,
    }));
  }

  const normalized = plots.map((p, i) => normalizePlot(p, i));
  while (normalized.length < PLOTS_COUNT) {
    normalized.push({
      id: normalized.length,
      status: 'empty',
      crop: null,
      plantedAt: null,
      growTime: null,
    });
  }
  return normalized.slice(0, PLOTS_COUNT);
}

/**
 * Normalisasi objek animal untuk memastikan format konsisten
 * @param {Object} animal - Animal object dari state
 * @returns {Object} Animal yang ternormalisasi
 */
export function normalizeAnimal(animal) {
  const { RANCHING } = GAME_CONSTANTS;
  
  if (!animal || typeof animal !== 'object') return animal;

  // Gunakan konstanta untuk default produce time
  const produceTime = animal.produceTime > 0 ? animal.produceTime : RANCHING.BASE_PRODUCE_TIME_MS;

  // Legacy field migration: readyToCollect -> status producing dengan lastCollected 0
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

/**
 * Migrasi worker dari format save lama ke format baru
 * @param {Object} merged - Merged state object
 * @returns {Object} State dengan workers yang sudah dimigrasi
 */
export function migrateLegacyWorkers(merged) {
  // SSR guard: skip jika tidak di browser
  if (typeof window === 'undefined') return merged;

  try {
    const legacyRaw = localStorage.getItem('farmTycoonSave');
    if (!legacyRaw) return merged;

    const payload = JSON.parse(legacyRaw);
    const dataStr = payload.data ?? legacyRaw;
    const legacy = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
    if (!legacy || typeof legacy !== 'object') return merged;

    // Merge workers dari save lama
    merged.workers = {
      farmer: !!(merged.workers?.farmer || legacy.gnomeFarmOwned),
      rancher: !!(merged.workers?.rancher || legacy.gnomeAnimalOwned),
      fisher: !!(merged.workers?.fisher || legacy.merchantOwned),
      miner: !!merged.workers?.miner,
    };

    // Migrate auto flags
    if (legacy.gnomeFarmOwned && legacy.gnomeFarmActive !== false) merged.autoFarmer = true;
    if (legacy.gnomeAnimalOwned && legacy.gnomeAnimalActive !== false) merged.autoRancher = true;
    if (legacy.merchantOwned && legacy.merchantActive !== false) merged.autoFisher = true;
  } catch {
    // Abaikan save lama yang rusak
  }

  return merged;
}
