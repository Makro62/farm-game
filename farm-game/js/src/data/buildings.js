// ========================================
// FARM TYCOON - BUILDING DATA CONFIG
// ========================================

export const BUILDINGS = {
    silo: {
        id: 'silo',
        name: '🏠 Silo',
        description: 'Meningkatkan kapasitas inventory',
        baseLevel: 1,
        maxLevel: 5,
        effect: 'inventory',
        effectPerLevel: 50,  // +50 slot per level
        baseCapacity: 50,
        costs: [0, 500, 1500, 3000, 5000, 8000],  // index = level
    },
    barn: {
        id: 'barn',
        name: '🏡 Kandang',
        description: 'Meningkatkan kapasitas hewan',
        baseLevel: 1,
        maxLevel: 5,
        effect: 'animal_capacity',
        effectPerLevel: 3,  // +3 hewan per level
        baseCapacity: 3,
        costs: [0, 1000, 3000, 6000, 10000, 15000],
    },
    waterTower: {
        id: 'waterTower',
        name: '💧 Menara Air',
        description: 'Mengurangi waktu tumbuh tanaman',
        baseLevel: 1,
        maxLevel: 5,
        effect: 'grow_time_reduction',
        effectPerLevel: 10,  // -10% per level
        maxReduction: 50,  // Max -50%
        costs: [0, 800, 2000, 4000, 7000, 12000],
    },
    greenhouse: {
        id: 'greenhouse',
        name: '🏚️ Rumah Kaca',
        description: 'Menetralkan efek cuaca buruk',
        baseLevel: 0,
        maxLevel: 3,
        effect: 'weather_negation',
        tiers: {
            1: ['storm'],  // Lv1: negasi badai
            2: ['storm', 'cloudy'],  // Lv2: negasi badai + berawan
            3: ['storm', 'cloudy', 'windy'],  // Lv3: negasi semua cuaca buruk
        },
        costs: [0, 2000, 8000, 20000],
    },
    windmill: {
        id: 'windmill',
        name: '💨 Kincir Angin',
        description: 'Meningkatkan kecepatan crafting',
        baseLevel: 1,
        maxLevel: 5,
        effect: 'crafting_speed',
        effectPerLevel: 15,  // +15% speed per level
        maxSpeed: 75,  // Max +75%
        costs: [0, 1500, 4000, 8000, 13000, 18000],
    },
};

export function getBuilding(buildingId) {
    return BUILDINGS[buildingId] || null;
}

export function getUpgradeCost(buildingId, currentLevel) {
    const building = getBuilding(buildingId);
    if (!building) return 0;
    
    const nextLevel = currentLevel + 1;
    if (nextLevel > building.maxLevel) return 0;  // Sudah max level
    
    return building.costs[nextLevel] || 0;
}

export function canUpgrade(buildingId) {
    const state = window.S;
    if (!state) return { canUpgrade: false, reason: 'State tidak tersedia' };
    
    const building = getBuilding(buildingId);
    if (!building) return { canUpgrade: false, reason: 'Bangunan tidak ditemukan' };
    
    const currentLevel = state.buildings[buildingId]?.level || building.baseLevel;
    
    // Check if already max level
    if (currentLevel >= building.maxLevel) {
        return { canUpgrade: false, reason: 'Sudah level maksimal' };
    }
    
    // Check cost
    const cost = getUpgradeCost(buildingId, currentLevel);
    if (state.coins < cost) {
        return { canUpgrade: false, reason: `Koin tidak cukup (butuh ${cost.toLocaleString()})` };
    }
    
    return { 
        canUpgrade: true, 
        cost, 
        nextLevel: currentLevel + 1,
        effect: getEffectDescription(buildingId, currentLevel + 1),
    };
}

export function getEffectDescription(buildingId, level) {
    const building = getBuilding(buildingId);
    if (!building) return '';
    
    switch (building.effect) {
        case 'inventory':
            return `+${building.baseCapacity + (level - 1) * building.effectPerLevel} slot inventory`;
        case 'animal_capacity':
            return `+${building.baseCapacity + (level - 1) * building.effectPerLevel} max hewan`;
        case 'grow_time_reduction':
            return `-${Math.min(building.effectPerLevel * level, building.maxReduction)}% waktu tumbuh`;
        case 'weather_negation':
            const negated = building.tiers[level] || [];
            return `Netralisir: ${negated.join(', ')}`;
        case 'crafting_speed':
            return `+${Math.min(building.effectPerLevel * level, building.maxSpeed)}% kecepatan craft`;
        default:
            return '';
    }
}

export function getInventoryCapacity() {
    const state = window.S;
    if (!state) return 50;
    
    const siloLevel = state.buildings.silo?.level || 1;
    const building = BUILDINGS.silo;
    
    return building.baseCapacity + (siloLevel - 1) * building.effectPerLevel;
}

export function getGrowTimeReduction() {
    const state = window.S;
    if (!state) return 0;
    
    const waterTowerLevel = state.buildings.waterTower?.level || 1;
    const building = BUILDINGS.waterTower;
    
    return Math.min(waterTowerLevel * building.effectPerLevel, building.maxReduction) / 100;
}

export function getCraftingSpeedBonus() {
    const state = window.S;
    if (!state) return 0;
    
    const windmillLevel = state.buildings.windmill?.level || 1;
    const building = BUILDINGS.windmill;
    
    return Math.min(windmillLevel * building.effectPerLevel, building.maxSpeed) / 100;
}

export function isWeatherNegated(weatherType) {
    const state = window.S;
    if (!state) return false;
    
    const greenhouseLevel = state.buildings.greenhouse?.level || 0;
    if (greenhouseLevel === 0) return false;
    
    const building = BUILDINGS.greenhouse;
    const negatedWeathers = building.tiers[greenhouseLevel] || [];
    
    return negatedWeathers.includes(weatherType);
}
