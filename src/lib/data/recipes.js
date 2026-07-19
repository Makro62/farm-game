export const RECIPES = [
  // ===== TIER 1 (Level 1+) =====
  { id: 'sup_wortel', name: 'Sup Wortel', emoji: '🥣', type: 'kitchen', time: 180, price: 150, xp: 50, req: { 'crops.wortel': 4 }, unlockLevel: 1 },
  { id: 'tepung_jagung', name: 'Tepung Jagung', emoji: '🌾', type: 'processing', time: 120, price: 200, xp: 60, req: { 'crops.jagung': 4 }, unlockLevel: 1 },
  { id: 'gula', name: 'Gula', emoji: '🍬', type: 'processing', time: 120, price: 150, xp: 40, req: { 'crops.tebu': 2 }, unlockLevel: 1 },
  { id: 'saus_tomat', name: 'Saus Tomat', emoji: '🥫', type: 'processing', time: 120, price: 180, xp: 50, req: { 'crops.tomat': 3 }, unlockLevel: 1 },
  { id: 'lele_bakar', name: 'Lele Bakar', emoji: '🍢', type: 'fish_kitchen', time: 300, price: 400, xp: 150, req: { 'fish.lele': 2, 'crops.jagung': 1 }, unlockLevel: 1 },

  // ===== TIER 2 (Level 5+) =====
  { id: 'keju', name: 'Keju', emoji: '🧀', type: 'processing', time: 240, price: 400, xp: 120, req: { 'animalProducts.susu': 3 }, unlockLevel: 5 },
  { id: 'nasi_goreng', name: 'Nasi Goreng', emoji: '🍛', type: 'kitchen', time: 250, price: 450, xp: 120, req: { 'crops.gandum': 2, 'animalProducts.telur': 1, 'processed.saus_tomat': 1 }, unlockLevel: 5 },
  { id: 'roti_gandum', name: 'Roti Gandum', emoji: '🍞', type: 'kitchen', time: 300, price: 250, xp: 80, req: { 'crops.gandum': 3, 'animalProducts.telur': 1 }, unlockLevel: 5 },
  { id: 'es_teh', name: 'Es Teh Manis', emoji: '🍹', type: 'kitchen', time: 100, price: 200, xp: 60, req: { 'processed.gula': 1, 'crops.apel': 1 }, unlockLevel: 5 },
  { id: 'kue_wortel', name: 'Kue Wortel', emoji: '🥕', type: 'restaurant', time: 480, price: 600, xp: 150, req: { 'crops.wortel': 3, 'crops.gandum': 2, 'animalProducts.telur': 1, 'processed.gula': 1 }, unlockLevel: 5 },
  { id: 'sushi_mas', name: 'Sushi Ikan Mas', emoji: '🍣', type: 'fish_kitchen', time: 240, price: 300, xp: 100, req: { 'fish.ikan_mas': 2, 'crops.tomat': 2 }, unlockLevel: 5 },

  // ===== TIER 3 (Level 10+) =====
  { id: 'kue_manis', name: 'Kue Manis', emoji: '🥮', type: 'restaurant', time: 400, price: 500, xp: 120, req: { 'processed.tepung_jagung': 2, 'animalProducts.susu': 2, 'processed.gula': 2 }, unlockLevel: 10 },
  { id: 'pancake', name: 'Pancake', emoji: '🥞', type: 'restaurant', time: 360, price: 550, xp: 140, req: { 'crops.gandum': 2, 'animalProducts.telur': 1, 'animalProducts.susu': 1, 'processed.gula': 1 }, unlockLevel: 10 },
  { id: 'takoyaki', name: 'Takoyaki', emoji: '🧆', type: 'fish_kitchen', time: 360, price: 1000, xp: 300, req: { 'fish.cumi': 2, 'animalProducts.telur': 2, 'processed.tepung_jagung': 1 }, unlockLevel: 10 },
  { id: 'nasi_jamur', name: 'Nasi Jamur', emoji: '🍚', type: 'kitchen', time: 420, price: 600, xp: 160, req: { 'crops.jamur': 2, 'crops.gandum': 3 }, unlockLevel: 10 },
  { id: 'kue_apel', name: 'Kue Apel', emoji: '🥧', type: 'restaurant', time: 540, price: 750, xp: 180, req: { 'crops.apel': 3, 'crops.gandum': 2, 'animalProducts.susu': 1, 'processed.gula': 1 }, unlockLevel: 10 },

  // ===== TIER 4 (Level 15+) =====
  { id: 'kue_stroberi', name: 'Kue Stroberi', emoji: '🍰', type: 'restaurant', time: 600, price: 800, xp: 200, req: { 'crops.stroberi': 3, 'animalProducts.telur': 2, 'animalProducts.susu': 1, 'processed.gula': 1 }, unlockLevel: 15 },
  { id: 'sushi_emas', name: 'Sushi Emas', emoji: '✨🍣', type: 'fish_kitchen', time: 480, price: 1200, xp: 350, req: { 'fish.ikan_mas': 2, 'minerals.emas': 1 }, unlockLevel: 15 },
];

// Legacy mapping: auto-convert unprefixed IDs to category-prefixed format
function normalizeIngredient(ingredient) {
  if (ingredient.includes('.')) return ingredient;
  const legacyMap = {
    wortel: 'crops.wortel', jagung: 'crops.jagung', tomat: 'crops.tomat',
    stroberi: 'crops.stroberi', semangka: 'crops.semangka', jamur: 'crops.jamur',
    nanas: 'crops.nanas', labu: 'crops.labu', kentang: 'crops.kentang',
    gandum: 'crops.gandum', tebu: 'crops.tebu', tulip: 'crops.tulip',
    apel: 'crops.apel',
    telur: 'animalProducts.telur', susu: 'animalProducts.susu',
    bulu: 'animalProducts.bulu', truffle: 'animalProducts.truffle',
    tapal: 'animalProducts.tapal', telur_bebek: 'animalProducts.telur_bebek',
    batu: 'minerals.batu', tembaga: 'minerals.tembaga',
    besi: 'minerals.besi', emas: 'minerals.emas', berlian: 'minerals.berlian',
    ikan_mas: 'fish.ikan_mas', lele: 'fish.lele',
    ikan_badut: 'fish.ikan_badut', cumi: 'fish.cumi', gurita: 'fish.gurita',
    tepung_jagung: 'processed.tepung_jagung', gula: 'processed.gula',
    saus_tomat: 'processed.saus_tomat',
    keju: 'processed.keju',
  };
  return legacyMap[ingredient] || ingredient;
}

function normalizeRecipe(recipe) {
  const normalizedReq = {};
  for (const [ing, qty] of Object.entries(recipe.req)) {
    normalizedReq[normalizeIngredient(ing)] = qty;
  }
  return { ...recipe, req: normalizedReq };
}

export const NORMALIZED_RECIPES = RECIPES.map(normalizeRecipe);

// Legacy accessor for backward compat — resolves unprefixed IDs
export function getRecipeIngredient(recipeId) {
  const recipe = NORMALIZED_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return {};
  return recipe.req;
}

// ===== VALIDATION: Check if player can cook a recipe =====
export function canCook(recipeId, inventoryByCategory, inventory) {
  const recipe = NORMALIZED_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return { canCook: false, reason: 'Recipe not found' };

  const missing = [];
  for (const [ingredient, amount] of Object.entries(recipe.req)) {
    const parts = ingredient.split('.');
    if (parts.length === 2) {
      const [cat, itemId] = parts;
      const available = inventoryByCategory?.[cat]?.[itemId]?.quantity || 0;
      if (available < amount) {
        missing.push({ ingredient: itemId, required: amount, available });
      }
    } else {
      // Fallback to flat inventory
      const available = inventory?.[ingredient] || 0;
      if (available < amount) {
        missing.push({ ingredient, required: amount, available });
      }
    }
  }

  return {
    canCook: missing.length === 0,
    missing: missing.length > 0 ? missing : null,
  };
}

// ===== CONSUME ingredients for cooking =====
export function consumeIngredients(recipeId, inventoryByCategory, inventory) {
  const recipe = NORMALIZED_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return false;

  const newCat = { ...inventoryByCategory };
  const newInv = { ...inventory };

  for (const [ingredient, amount] of Object.entries(recipe.req)) {
    const parts = ingredient.split('.');
    if (parts.length === 2) {
      const [cat, itemId] = parts;
      if (newCat[cat]?.[itemId]) {
        const updated = { ...newCat[cat] };
        const next = (updated[itemId]?.quantity || 0) - amount;
        if (next <= 0) {
          delete updated[itemId];
        } else {
          updated[itemId] = { ...updated[itemId], quantity: next };
        }
        newCat[cat] = updated;
      }
    } else {
      const next = (newInv[ingredient] || 0) - amount;
      if (next <= 0) {
        delete newInv[ingredient];
      } else {
        newInv[ingredient] = next;
      }
    }
  }

  return { inventoryByCategory: newCat, inventory: newInv };
}

export const ORDER_TEMPLATES = [
  { tier: 1, timer: 600, items: [{ id: 'wortel', qty: 5 }, { id: 'jagung', qty: 3 }], coins: 200, xp: 100 },
  { tier: 1, timer: 600, items: [{ id: 'tomat', qty: 4 }, { id: 'telur', qty: 2 }], coins: 250, xp: 120 },
  { tier: 2, timer: 900, items: [{ id: 'stroberi', qty: 5 }, { id: 'susu', qty: 2 }], coins: 600, xp: 250 },
  { tier: 2, timer: 900, items: [{ id: 'semangka', qty: 2 }, { id: 'ikan_mas', qty: 2 }], coins: 800, xp: 300 },
  { tier: 2, timer: 900, items: [{ id: 'tembaga', qty: 5 }, { id: 'ikan_mas', qty: 2 }], coins: 700, xp: 280 },
  { tier: 2, timer: 900, items: [{ id: 'besi', qty: 3 }, { id: 'stroberi', qty: 3 }], coins: 650, xp: 260 },
  { tier: 3, timer: 1200, items: [{ id: 'keju', qty: 1 }, { id: 'sup_wortel', qty: 2 }], coins: 1500, xp: 600 },
  { tier: 3, timer: 1200, items: [{ id: 'sushi_mas', qty: 2 }, { id: 'takoyaki', qty: 1 }], coins: 2500, xp: 1000 },
  { tier: 3, timer: 1500, items: [{ id: 'emas', qty: 2 }, { id: 'sushi_emas', qty: 1 }], coins: 3500, xp: 1200 },
];

export function getItemCategory(itemId) {
  const catMap = {
    wortel: 'crops', jagung: 'crops', tomat: 'crops', stroberi: 'crops',
    semangka: 'crops', jamur: 'crops', nanas: 'crops', labu: 'crops',
    kentang: 'crops', gandum: 'crops', tebu: 'crops', tulip: 'crops', apel: 'crops',
    telur: 'animalProducts', susu: 'animalProducts', bulu: 'animalProducts',
    truffle: 'animalProducts', tapal: 'animalProducts', telur_bebek: 'animalProducts',
    batu: 'minerals', tembaga: 'minerals', besi: 'minerals', emas: 'minerals', berlian: 'minerals',
    ikan_mas: 'fish', lele: 'fish', ikan_badut: 'fish', cumi: 'fish', gurita: 'fish',
    tepung_jagung: 'processed', gula: 'processed', saus_tomat: 'processed', keju: 'processed',
    sup_wortel: 'cooked', nasi_goreng: 'cooked', roti_gandum: 'cooked', es_teh: 'cooked',
    kue_wortel: 'cooked', sushi_mas: 'cooked', kue_manis: 'cooked', pancake: 'cooked',
    takoyaki: 'cooked', nasi_jamur: 'cooked', kue_apel: 'cooked', kue_stroberi: 'cooked',
    sushi_emas: 'cooked', lele_bakar: 'cooked',
  };
  return catMap[itemId] || null;
}
