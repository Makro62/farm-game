// ========================================
// FARM TYCOON - CRAFTING RECIPES
// ========================================

export const RECIPES = {
    // Crop-based recipes
    carrot_soup: {
        id: 'carrot_soup',
        name: '🥣 Sup Wortel',
        ingredients: [
            { item: 'carrot', quantity: 3 },
            { item: 'water', quantity: 1 },
        ],
        output: { item: 'carrot_soup', quantity: 1 },
        craftTime: 300,  // detik (5 menit)
        xp: 30,
        sellPrice: 200,
        category: 'crop',
    },
    corn_flour: {
        id: 'corn_flour',
        name: '🌾 Tepung Jagung',
        ingredients: [
            { item: 'corn', quantity: 4 },
        ],
        output: { item: 'corn_flour', quantity: 1 },
        craftTime: 240,
        xp: 25,
        sellPrice: 180,
        category: 'crop',
    },
    tomato_pie: {
        id: 'tomato_pie',
        name: '🥧 Pie Tomat',
        ingredients: [
            { item: 'tomato', quantity: 3 },
            { item: 'corn_flour', quantity: 2 },
        ],
        output: { item: 'tomato_pie', quantity: 1 },
        craftTime: 600,
        xp: 70,
        sellPrice: 600,
        category: 'crop',
    },
    strawberry_jam: {
        id: 'strawberry_jam',
        name: '🍓 Selai Stroberi',
        ingredients: [
            { item: 'strawberry', quantity: 5 },
            { item: 'sugar', quantity: 1 },
        ],
        output: { item: 'strawberry_jam', quantity: 1 },
        craftTime: 420,
        xp: 50,
        sellPrice: 450,
        category: 'crop',
    },
    
    // Animal-based recipes
    cheese: {
        id: 'cheese',
        name: '🧀 Keju',
        ingredients: [
            { item: 'milk', quantity: 5 },
        ],
        output: { item: 'cheese', quantity: 1 },
        craftTime: 480,
        xp: 60,
        sellPrice: 500,
        category: 'animal',
    },
    cake: {
        id: 'cake',
        name: '🎂 Kue',
        ingredients: [
            { item: 'corn_flour', quantity: 2 },
            { item: 'egg', quantity: 2 },
            { item: 'milk', quantity: 1 },
        ],
        output: { item: 'cake', quantity: 1 },
        craftTime: 720,
        xp: 90,
        sellPrice: 800,
        category: 'animal',
    },
    honey_premium: {
        id: 'honey_premium',
        name: '🫙 Madu Premium',
        ingredients: [
            { item: 'honey', quantity: 3 },
            { item: 'jar', quantity: 1 },
        ],
        output: { item: 'honey_premium', quantity: 1 },
        craftTime: 360,
        xp: 65,
        sellPrice: 650,
        category: 'animal',
    },
    
    // Seasonal recipes
    tulip_perfume: {
        id: 'tulip_perfume',
        name: '🌸 Parfum Tulip',
        ingredients: [
            { item: 'tulip', quantity: 5 },
            { item: 'water', quantity: 2 },
        ],
        output: { item: 'tulip_perfume', quantity: 1 },
        craftTime: 900,
        xp: 100,
        sellPrice: 1500,
        category: 'seasonal',
        requiredSeason: 'spring',
    },
    apple_cider: {
        id: 'apple_cider',
        name: '🍎 Sari Apel',
        ingredients: [
            { item: 'apple', quantity: 6 },
        ],
        output: { item: 'apple_cider', quantity: 1 },
        craftTime: 600,
        xp: 80,
        sellPrice: 900,
        category: 'seasonal',
        requiredSeason: 'autumn',
    },
    truffle_oil: {
        id: 'truffle_oil',
        name: '🍄 Minyak Truffle',
        ingredients: [
            { item: 'truffle', quantity: 3 },
            { item: 'olive', quantity: 5 },
        ],
        output: { item: 'truffle_oil', quantity: 1 },
        craftTime: 1200,
        xp: 150,
        sellPrice: 3000,
        category: 'seasonal',
        requiredSeason: 'winter',
    },
};

export function getRecipe(recipeId) {
    return RECIPES[recipeId] || null;
}

export function getAllRecipes() {
    return Object.values(RECIPES);
}

export function getRecipesByCategory(category) {
    return Object.values(RECIPES).filter(recipe => recipe.category === category);
}

export function canCraft(recipeId) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return { canCraft: false, reason: 'Resep tidak ditemukan' };
    
    const state = window.S;
    if (!state) return { canCraft: false, reason: 'State tidak tersedia' };
    
    // Check season requirement
    if (recipe.requiredSeason && state.season.current !== recipe.requiredSeason) {
        return { 
            canCraft: false, 
            reason: `Hanya bisa dibuat di musim ${recipe.requiredSeason}` 
        };
    }
    
    // Check ingredients
    for (const ingredient of recipe.ingredients) {
        const hasItem = state.inventory.find(item => item.id === ingredient.item);
        
        if (!hasItem || hasItem.quantity < ingredient.quantity) {
            return { 
                canCraft: false, 
                reason: `Bahan tidak cukup: ${ingredient.item} (butuh ${ingredient.quantity})` 
            };
        }
    }
    
    // Check queue length
    const maxQueue = 5;
    if (state.craftingQueue.length >= maxQueue) {
        return { canCraft: false, reason: 'Antrian crafting penuh (max 5)' };
    }
    
    return { canCraft: true };
}

export function deductIngredients(recipeId) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return false;
    
    const state = window.S;
    
    for (const ingredient of recipe.ingredients) {
        // Import removeFromInventory dari state.js
        // Ini akan di-handle oleh sistem
        console.log(`Deduct ${ingredient.quantity}x ${ingredient.item}`);
    }
    
    return true;
}

export function calculateCraftTime(recipeId) {
    const recipe = getRecipe(recipeId);
    if (!recipe) return 0;
    
    let craftTime = recipe.craftTime;
    
    // Apply windmill bonus
    const state = window.S;
    if (state) {
        const windmillLevel = state.buildings.windmill?.level || 1;
        const bonus = Math.min(windmillLevel * 15, 75) / 100;
        craftTime *= (1 - bonus);
    }
    
    return Math.floor(craftTime);
}
