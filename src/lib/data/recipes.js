export const RECIPES = [
  // ===== TIER 1 (Level 1+) =====
  {
    id: "sup_wortel",
    name: "Sup Wortel",
    emoji: "🥣",
    type: "kitchen",
    time: 180,
    price: 150,
    xp: 50,
    req: { "crops.wortel": 4 },
    unlockLevel: 1,
  },
  {
    id: "tepung_jagung",
    name: "Tepung Jagung",
    emoji: "🌾",
    type: "processing",
    time: 120,
    price: 200,
    xp: 60,
    req: { "crops.jagung": 4 },
    unlockLevel: 1,
  },
  {
    id: "gula",
    name: "Gula",
    emoji: "🍬",
    type: "processing",
    time: 120,
    price: 150,
    xp: 40,
    req: { "crops.tebu": 2 },
    unlockLevel: 1,
  },
  {
    id: "saus_tomat",
    name: "Saus Tomat",
    emoji: "🥫",
    type: "processing",
    time: 120,
    price: 180,
    xp: 50,
    req: { "crops.tomat": 3 },
    unlockLevel: 1,
  },
  {
    id: "lele_bakar",
    name: "Lele Bakar",
    emoji: "🍢",
    type: "fish_kitchen",
    time: 300,
    price: 400,
    xp: 150,
    req: { "fish.lele": 2, "crops.jagung": 1 },
    unlockLevel: 1,
  },

  // ===== TIER 2 (Level 5+) =====
  {
    id: "keju",
    name: "Keju",
    emoji: "🧀",
    type: "processing",
    time: 240,
    price: 400,
    xp: 120,
    req: { "animalProducts.susu": 3 },
    unlockLevel: 5,
  },
  {
    id: "nasi_goreng",
    name: "Nasi Goreng",
    emoji: "🍛",
    type: "kitchen",
    time: 250,
    price: 450,
    xp: 120,
    req: {
      "crops.gandum": 2,
      "animalProducts.telur": 1,
      "processed.saus_tomat": 1,
    },
    unlockLevel: 5,
  },
  {
    id: "roti_gandum",
    name: "Roti Gandum",
    emoji: "🍞",
    type: "kitchen",
    time: 300,
    price: 250,
    xp: 80,
    req: { "crops.gandum": 3, "animalProducts.telur": 1 },
    unlockLevel: 5,
  },
  {
    id: "es_teh",
    name: "Es Teh Manis",
    emoji: "🍹",
    type: "kitchen",
    time: 100,
    price: 200,
    xp: 60,
    req: { "processed.gula": 1, "crops.apel": 1 },
    unlockLevel: 5,
  },
  {
    id: "kue_wortel",
    name: "Kue Wortel",
    emoji: "🥕",
    type: "restaurant",
    time: 480,
    price: 600,
    xp: 150,
    req: {
      "crops.wortel": 3,
      "crops.gandum": 2,
      "animalProducts.telur": 1,
      "processed.gula": 1,
    },
    unlockLevel: 5,
  },
  {
    id: "sushi_mas",
    name: "Sushi Ikan Mas",
    emoji: "🍣",
    type: "fish_kitchen",
    time: 240,
    price: 300,
    xp: 100,
    req: { "fish.ikan_mas": 2, "crops.tomat": 2 },
    unlockLevel: 5,
  },

  // ===== TIER 3 (Level 10+) =====
  {
    id: "kue_manis",
    name: "Kue Manis",
    emoji: "🥮",
    type: "restaurant",
    time: 400,
    price: 500,
    xp: 120,
    req: {
      "processed.tepung_jagung": 2,
      "animalProducts.susu": 2,
      "processed.gula": 2,
    },
    unlockLevel: 10,
  },
  {
    id: "pancake",
    name: "Pancake",
    emoji: "🥞",
    type: "restaurant",
    time: 360,
    price: 550,
    xp: 140,
    req: {
      "crops.gandum": 2,
      "animalProducts.telur": 1,
      "animalProducts.susu": 1,
      "processed.gula": 1,
    },
    unlockLevel: 10,
  },
  {
    id: "takoyaki",
    name: "Takoyaki",
    emoji: "🧆",
    type: "fish_kitchen",
    time: 360,
    price: 1000,
    xp: 300,
    req: {
      "fish.cumi": 2,
      "animalProducts.telur": 2,
      "processed.tepung_jagung": 1,
    },
    unlockLevel: 10,
  },
  {
    id: "nasi_jamur",
    name: "Nasi Jamur",
    emoji: "🍚",
    type: "kitchen",
    time: 420,
    price: 600,
    xp: 160,
    req: { "crops.jamur": 2, "crops.gandum": 3 },
    unlockLevel: 10,
  },
  {
    id: "kue_apel",
    name: "Kue Apel",
    emoji: "🥧",
    type: "restaurant",
    time: 540,
    price: 750,
    xp: 180,
    req: {
      "crops.apel": 3,
      "crops.gandum": 2,
      "animalProducts.susu": 1,
      "processed.gula": 1,
    },
    unlockLevel: 10,
  },

  // ===== TIER 4 (Level 15+) =====
  {
    id: "kue_stroberi",
    name: "Kue Stroberi",
    emoji: "🍰",
    type: "restaurant",
    time: 600,
    price: 800,
    xp: 200,
    req: {
      "crops.stroberi": 3,
      "animalProducts.telur": 2,
      "animalProducts.susu": 1,
      "processed.gula": 1,
    },
    unlockLevel: 15,
  },
  {
    id: "sushi_emas",
    name: "Sushi Emas",
    emoji: "✨🍣",
    type: "fish_kitchen",
    time: 480,
    price: 1200,
    xp: 350,
    req: { "fish.ikan_mas": 2, "minerals.emas": 1 },
    unlockLevel: 15,
  },
];

export function canCraft(recipeId, inventoryByCategory) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return { canCraft: false, reason: "Recipe not found" };

  for (const [ingredient, amount] of Object.entries(recipe.req)) {
    const [cat, itemId] = ingredient.split(".");
    const available = inventoryByCategory?.[cat]?.[itemId]?.qty || 0;
    if (available < amount) {
      return { canCraft: false, missing: ingredient };
    }
  }
  return { canCraft: true };
}

export function hasRequirements(requirements, inventoryByCategory) {
  for (const [key, amount] of Object.entries(requirements)) {
    const [cat, itemId] = key.split(".");
    if ((inventoryByCategory?.[cat]?.[itemId]?.qty || 0) < amount) return false;
  }
  return true;
}

export function consumeRequirements(requirements, inventoryByCategory) {
  for (const [key, amount] of Object.entries(requirements)) {
    const [cat, itemId] = key.split(".");
    if ((inventoryByCategory?.[cat]?.[itemId]?.qty || 0) < amount) return false;
  }
  const newCat = {};
  for (const [cat, items] of Object.entries(inventoryByCategory)) {
    newCat[cat] = { ...items };
    for (const [itemId] of Object.entries(items)) {
      newCat[cat][itemId] = { ...items[itemId] };
    }
  }
  for (const [key, amount] of Object.entries(requirements)) {
    const [cat, itemId] = key.split(".");
    newCat[cat][itemId].qty -= amount;
    if (newCat[cat][itemId].qty <= 0) {
      delete newCat[cat][itemId];
    }
  }
  return newCat;
}

export function getItemCategory(itemId) {
  const catMap = {
    wortel: "crops",
    jagung: "crops",
    tomat: "crops",
    stroberi: "crops",
    semangka: "crops",
    jamur: "crops",
    nanas: "crops",
    labu: "crops",
    kentang: "crops",
    gandum: "crops",
    tebu: "crops",
    tulip: "crops",
    apel: "crops",
    telur: "animalProducts",
    susu: "animalProducts",
    bulu: "animalProducts",
    truffle: "animalProducts",
    tapal: "animalProducts",
    telur_bebek: "animalProducts",
    batu: "minerals",
    tembaga: "minerals",
    besi: "minerals",
    emas: "minerals",
    berlian: "minerals",
    ikan_mas: "fish",
    lele: "fish",
    ikan_badut: "fish",
    cumi: "fish",
    gurita: "fish",
    tepung_jagung: "processed",
    gula: "processed",
    saus_tomat: "processed",
    keju: "processed",
    sup_wortel: "cooked",
    nasi_goreng: "cooked",
    roti_gandum: "cooked",
    es_teh: "cooked",
    kue_wortel: "cooked",
    sushi_mas: "cooked",
    kue_manis: "cooked",
    pancake: "cooked",
    takoyaki: "cooked",
    nasi_jamur: "cooked",
    kue_apel: "cooked",
    kue_stroberi: "cooked",
    sushi_emas: "cooked",
    lele_bakar: "cooked",
  };
  return catMap[itemId] || null;
}

export const getRecipeIngredient = (recipeId) => {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  return recipe?.req || {};
};

export const ORDER_TEMPLATES = [
  {
    tier: 1,
    timer: 600,
    items: [
      { id: "crops.wortel", qty: 5 },
      { id: "crops.jagung", qty: 3 },
    ],
    coins: 200,
    xp: 100,
  },
  {
    tier: 1,
    timer: 600,
    items: [
      { id: "crops.tomat", qty: 4 },
      { id: "animalProducts.telur", qty: 2 },
    ],
    coins: 250,
    xp: 120,
  },
  {
    tier: 2,
    timer: 900,
    items: [
      { id: "crops.stroberi", qty: 5 },
      { id: "animalProducts.susu", qty: 2 },
    ],
    coins: 600,
    xp: 250,
  },
  {
    tier: 2,
    timer: 900,
    items: [
      { id: "crops.semangka", qty: 2 },
      { id: "fish.ikan_mas", qty: 2 },
    ],
    coins: 800,
    xp: 300,
  },
  {
    tier: 2,
    timer: 900,
    items: [
      { id: "minerals.tembaga", qty: 5 },
      { id: "fish.ikan_mas", qty: 2 },
    ],
    coins: 700,
    xp: 280,
  },
  {
    tier: 2,
    timer: 900,
    items: [
      { id: "minerals.besi", qty: 3 },
      { id: "crops.stroberi", qty: 3 },
    ],
    coins: 650,
    xp: 260,
  },
  {
    tier: 3,
    timer: 1200,
    items: [
      { id: "processed.keju", qty: 1 },
      { id: "cooked.sup_wortel", qty: 2 },
    ],
    coins: 1500,
    xp: 600,
  },
  {
    tier: 3,
    timer: 1200,
    items: [
      { id: "cooked.sushi_mas", qty: 2 },
      { id: "cooked.takoyaki", qty: 1 },
    ],
    coins: 2500,
    xp: 1000,
  },
  {
    tier: 3,
    timer: 1500,
    items: [
      { id: "minerals.emas", qty: 2 },
      { id: "cooked.sushi_emas", qty: 1 },
    ],
    coins: 3500,
    xp: 1200,
  },
];
