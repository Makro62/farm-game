// ============================================================
// STATE
// ============================================================

let S = {
    coins: 100, level: 1, xp: 0,
    totalEarned: 0, totalHarvest: 0, totalPlanted: 0,
    pumpkinHarvest: 0, questsDone: 0,
    lastSave: Date.now(), lastDaily: 0, loginStreak: 0,
    seeds: { carrot: 3, corn: 0, tomato: 0, strawberry: 0, pineapple: 0, pumpkin: 0 },
    inventory: { carrot: 0, corn: 0, tomato: 0, strawberry: 0, pineapple: 0, pumpkin: 0 },
    plots: [],
    weather: 0, weatherChangedAt: Date.now(),
    boosters: { growth: 0, coin: 0 },
    quests: [],
    achievements: [],
    prestige: 0,
    decorations: [],
    animals: [],
    orders: [],
    gnomeOwned: false,
    gnomeActive: false,
    inventoryCapacity: 50
};
let selectedCrop = 'carrot';
