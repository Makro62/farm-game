import { SHOP_SEEDS, CROP_DATA } from './crops';
import { SHOP_ANIMALS, SHOP_BAIT, SHOP_MINING } from './shop';
import { RECIPES } from './recipes';
import { FISHES } from './fishes';
import { MINERALS } from './minerals';

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

  return '📦';
}

export const getCropEmoji = getItemEmoji;

export function getShopAnimal(type) {
  const id = LEGACY_ANIMAL_MAP[type] || type;
  return SHOP_ANIMALS.find((a) => a.id === id);
}

export function getAnimalEmoji(animal) {
  const emojis = {
    ayam: '🐔',
    bebek: '🦆',
    sapi: '🐄',
    domba: '🐑',
    babi: '🐖',
    kuda: '🐴',
    chicken: '🐔',
    duck: '🦆',
    cow: '🐄',
    sheep: '🐑',
    pig: '🐖',
    horse: '🐴',
  };
  return emojis[animal] || '🐾';
}

export function getItemSellPrice(itemId) {
  const seedData = SHOP_SEEDS.find((s) => s.id === itemId);
  if (seedData) return Math.floor(seedData.price * 0.5);

  const cropData = SHOP_SEEDS.find((s) => s.cropId === itemId);
  if (cropData) return Math.floor(cropData.price * 1.5);

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

  return itemId;
}
