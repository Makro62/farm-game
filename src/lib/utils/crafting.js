import { RECIPES } from '@/lib/data/recipes';

export function canCraft(recipeId, inventoryByCategory, inventory) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return false;

  for (const [ingredient, amount] of Object.entries(recipe.req || {})) {
    const parts = ingredient.split('.');
    if (parts.length === 2) {
      const [cat, itemId] = parts;
      const available = inventoryByCategory?.[cat]?.[itemId]?.quantity || 0;
      if (available < amount) return false;
    } else {
      if ((inventory?.[ingredient] || 0) < amount) return false;
    }
  }
  return true;
}

export function getCraftingTime(recipeId, workerSkills) {
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return 0;

  const baseTime = recipe.time * 1000;
  const speedBonus = workerSkills?.crafting || 0;
  return Math.floor(baseTime / (1 + speedBonus * 0.1));
}

export function getCraftingQueueLimit(recipe, buildings) {
  const baseLimit = 3;
  if (recipe?.type === 'processing' && buildings?.mill?.unlocked) {
    return baseLimit + (buildings.mill.level || 0) * 2;
  }
  if (recipe?.type === 'kitchen' || recipe?.type === 'restaurant') {
    return baseLimit;
  }
  return baseLimit;
}

export function getItemCategoryLabel(categoryKey) {
  const labels = {
    crops: '🌱 Tanaman',
    animalProducts: '🐄 Hasil Ternak',
    minerals: '⛏️ Mineral',
    fish: '🎣 Ikan',
    processed: '⚙️ Olahan',
    cooked: '🍳 Masakan',
    seeds: '🌰 Bibit',
    tools: '🛠️ Alat',
    bait: '🪱 Umpan',
    collectibles: '📦 Koleksi',
  };
  return labels[categoryKey] || '📦 Lainnya';
}
