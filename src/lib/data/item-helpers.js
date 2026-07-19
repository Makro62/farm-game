import { SHOP_SEEDS, CROP_DATA } from './crops';
import { SHOP_ANIMALS, SHOP_BAIT, SHOP_MINING, SPECIAL_ITEMS } from './shop';
import { RECIPES } from './recipes';
import { FISHES } from './fishes';
import { MINERALS } from './minerals';

// ===== ITEM CATEGORY SYSTEM =====
// Maps every item ID to its inventory category
// Used for structured inventory access and cross-system validation
export const ITEM_CATEGORY = {};

// Seeds -> crops mapping
SHOP_SEEDS.forEach(s => {
  ITEM_CATEGORY[s.id] = 'seeds';        // bibit_wortel -> seeds
  ITEM_CATEGORY[s.cropId] = 'crops';     // wortel -> crops
});

// Animal products
SHOP_ANIMALS.forEach(a => {
  ITEM_CATEGORY[a.id] = 'animals';
  ITEM_CATEGORY[a.product] = 'animalProducts';  // telur, susu, etc
});

// Minerals
MINERALS.forEach(m => {
  ITEM_CATEGORY[m.id] = 'minerals';
});

// Fish
FISHES.forEach(f => {
  ITEM_CATEGORY[f.id] = 'fish';
});

// Cooked/processed items from recipes
RECIPES.forEach(r => {
  if (r.type === 'processing') {
    ITEM_CATEGORY[r.id] = 'processed';
  } else {
    ITEM_CATEGORY[r.id] = 'cooked';
  }
});

// Shop items
SHOP_BAIT.forEach(b => {
  ITEM_CATEGORY[b.id] = 'bait';
});
SHOP_MINING.forEach(mt => {
  ITEM_CATEGORY[mt.id] = 'tools';
});

// Special items
Object.keys(SPECIAL_ITEMS).forEach(si => {
  ITEM_CATEGORY[si] = 'collectibles';
});

export function getItemCategory(itemId) {
  return ITEM_CATEGORY[itemId] || null;
}

// ===== QUALITY SYSTEM =====
export const QUALITY_MULTIPLIERS = {
  normal: 1.0,
  silver: 1.2,
  gold: 1.5,
  iridium: 2.0,
};

export function rollCropQuality(weather, fertilizer) {
  let score = Math.random();
  if (fertilizer === 'premium') score += 0.3;
  if (fertilizer === 'organic') score += 0.2;
  if (weather === 'rainy') score += 0.1;
  if (score > 0.95) return 'iridium';
  if (score > 0.85) return 'gold';
  if (score > 0.70) return 'silver';
  return 'normal';
}

export function rollFishSize(fishId) {
  const fish = FISHES.find(f => f.id === fishId);
  if (!fish?.sizeTiers) return 'normal';
  const rand = Math.random();
  let cumulative = 0;
  for (const [size, data] of Object.entries(fish.sizeTiers)) {
    cumulative += data.chance;
    if (rand <= cumulative) return size;
  }
  return 'normal';
}

const LEGACY_ANIMAL_MAP = {
  chicken: 'ayam',
  duck: 'bebek',
  cow: 'sapi',
  sheep: 'domba',
  pig: 'babi',
  horse: 'kuda',
};

export function getShopSeed(itemId) {
  return SHOP_SEEDS.find((s) => s.id === itemId);
}

export function getCropEmojiById(cropId) {
  if (!cropId) return '📦';
  const seed = SHOP_SEEDS.find((s) => s.cropId === cropId);
  if (seed?.emoji) return seed.emoji;
  return CROP_DATA[cropId]?.emoji || '📦';
}

/** Prefer getItemEmoji — alias getCropEmoji retained for compatibility */
export function getItemEmoji(itemId) {
  if (!itemId) return '📦';

  const seed = getShopSeed(itemId);
  if (seed) return seed.emoji || getCropEmojiById(seed.cropId);

  if (itemId.startsWith('bibit_')) {
    const cropId = itemId.replace('bibit_', '');
    return getCropEmojiById(cropId);
  }

  if (CROP_DATA[itemId]?.emoji) return CROP_DATA[itemId].emoji;

  const animal = SHOP_ANIMALS.find((a) => a.product === itemId);
  if (animal) return animal.productEmoji;

  const fish = FISHES.find((f) => f.id === itemId);
  if (fish) return fish.emoji;

  const mineral = MINERALS.find((m) => m.id === itemId);
  if (mineral) return mineral.emoji;

  const recipe = RECIPES.find((r) => r.id === itemId);
  if (recipe) return recipe.emoji;

  const miningTool = SHOP_MINING.find((m) => m.id === itemId);
  if (miningTool) return miningTool.emoji;

  const bait = SHOP_BAIT.find((b) => b.id === itemId);
  if (bait) return bait.emoji;

  // Item lintas-sistem (cacing, pupuk_kandang)
  const specialItem = SPECIAL_ITEMS[itemId];
  if (specialItem) return specialItem.emoji;

  return '📦';
}

export const getCropEmoji = getItemEmoji;

export function getShopAnimal(type) {
  const id = LEGACY_ANIMAL_MAP[type] || type;
  return SHOP_ANIMALS.find((a) => a.id === id);
}

export function getAnimalEmoji(animal) {
  const data = getShopAnimal(animal);
  return data?.emoji || '🐾';
}

export function getItemSellPrice(itemId, options = {}) {
  const { season, quality, buildings } = options;

  // Seeds are not sellable directly
  const seedData = SHOP_SEEDS.find((s) => s.id === itemId);
  if (seedData) return Math.floor(seedData.price * 0.5);

  // Crops: use CROP_DATA baseSellPrice with season/quality modifiers
  const cropData = CROP_DATA[itemId];
  if (cropData) {
    let price = cropData.baseSellPrice;
    // Quality multiplier
    if (quality && QUALITY_MULTIPLIERS[quality]) {
      price *= QUALITY_MULTIPLIERS[quality];
    }
    // Season multiplier
    if (season && cropData.seasonBonus?.[season]) {
      price *= cropData.seasonBonus[season];
    }
    // Building bonus (Silo)
    if (buildings?.silo) {
      price *= 1.15;
    }
    return Math.floor(price);
  }

  // Legacy: SHOP_SEEDS cropId fallback
  const seedCropData = SHOP_SEEDS.find((s) => s.cropId === itemId);
  if (seedCropData) return Math.floor(seedCropData.price * 1.5);

  const animalProduct = SHOP_ANIMALS.find((a) => a.product === itemId);
  if (animalProduct) return Math.floor(animalProduct.price * 0.5);

  const fishData = FISHES.find((f) => f.id === itemId);
  if (fishData) return fishData.priceNormal ?? 0;

  const baitData = SHOP_BAIT.find((b) => b.id === itemId);
  if (baitData) return Math.floor(baitData.price * 0.4);

  const mineralData = MINERALS.find((m) => m.id === itemId);
  if (mineralData) return mineralData.price;

  const recipeData = RECIPES.find((r) => r.id === itemId);
  if (recipeData) return recipeData.price;

  return null;
}

export function isSellableProduce(itemId) {
  if (!itemId) return false;
  if (SHOP_SEEDS.some((s) => s.id === itemId)) return false;
  if (SHOP_BAIT.some((b) => b.id === itemId)) return false;
  if (SHOP_MINING.some((m) => m.id === itemId)) return false;
  return getItemSellPrice(itemId) != null;
}

export function getItemSource(itemId) {
  if (!itemId) return null;

  if (SHOP_SEEDS.some(s => s.cropId === itemId)) return '🌱 Ladang (Tanam & Panen)';
  if (SHOP_SEEDS.some(s => s.id === itemId)) return '🛒 Toko Bibit (Beli)';
  if (SHOP_ANIMALS.some(a => a.product === itemId)) return '🐄 Peternakan (Kolek dari hewan)';
  if (FISHES.some(f => f.id === itemId)) return '🎣 Memancing';
  if (MINERALS.some(m => m.id === itemId)) return '⛏️ Tambang';
  if (RECIPES.some(r => r.id === itemId)) return '🍳 Restoran (Masak)';
  if (SHOP_BAIT.some(b => b.id === itemId)) return '🎣 Umpan Pancing';
  if (SHOP_MINING.some(m => m.id === itemId)) return '⛏️ Alat Tambang';
  if (SPECIAL_ITEMS[itemId]) {
    if (itemId === 'cacing') return '⛏️ Drop dari Tambang (Batu)';
    if (itemId === 'pupuk_kandang') return '🐄 Drop dari Ternak (Kolek)';
  }

  return null;
}

export function getItemDisplayName(itemId) {
  const seedData = SHOP_SEEDS.find((s) => s.id === itemId);
  if (seedData) return seedData.name;

  const cropData = SHOP_SEEDS.find((s) => s.cropId === itemId);
  if (cropData) return cropData.name.replace('Bibit ', '');

  const animalProduct = SHOP_ANIMALS.find((a) => a.product === itemId);
  if (animalProduct) return animalProduct.productEmoji + ' ' + animalProduct.product.replace('_', ' ');

  const fishData = FISHES.find((f) => f.id === itemId);
  if (fishData) return fishData.name;

  const baitData = SHOP_BAIT.find((b) => b.id === itemId);
  if (baitData) return baitData.name;

  const mineralData = MINERALS.find((m) => m.id === itemId);
  if (mineralData) return mineralData.name;

  const recipeData = RECIPES.find((r) => r.id === itemId);
  if (recipeData) return recipeData.name;

  const miningTool = SHOP_MINING.find((m) => m.id === itemId);
  if (miningTool) return miningTool.name;

  // Item lintas-sistem
  const specialItem = SPECIAL_ITEMS[itemId];
  if (specialItem) return specialItem.name;

  return itemId;
}
