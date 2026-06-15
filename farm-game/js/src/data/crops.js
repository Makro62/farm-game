// ========================================
// FARM TYCOON - CROP DATA CONFIG
// ========================================

export const CROPS = {
    carrot: {
        id: 'carrot',
        name: '🥕 Wortel',
        buyPrice: 15,
        sellPrice: 50,
        growTime: 30,  // detik
        xp: 5,
        yield: 1,
        seasons: ['spring', 'summer', 'autumn'],
    },
    corn: {
        id: 'corn',
        name: '🌽 Jagung',
        buyPrice: 30,
        sellPrice: 90,
        growTime: 60,
        xp: 10,
        yield: 1,
        seasons: ['summer', 'autumn'],
    },
    tomato: {
        id: 'tomato',
        name: '🍅 Tomat',
        buyPrice: 50,
        sellPrice: 130,
        growTime: 90,
        xp: 15,
        yield: 1,
        seasons: ['summer'],
    },
    strawberry: {
        id: 'strawberry',
        name: '🍓 Stroberi',
        buyPrice: 70,
        sellPrice: 200,
        growTime: 120,
        xp: 25,
        yield: 1,
        seasons: ['spring', 'summer'],
    },
    pineapple: {
        id: 'pineapple',
        name: '🍍 Nanas',
        buyPrice: 100,
        sellPrice: 350,
        growTime: 180,
        xp: 40,
        yield: 1,
        seasons: ['summer'],
    },
    pumpkin: {
        id: 'pumpkin',
        name: '🎃 Labu Emas',
        buyPrice: 200,
        sellPrice: 700,
        growTime: 300,
        xp: 80,
        yield: 1,
        seasons: ['autumn'],
    },
    // Seasonal crops
    tulip: {
        id: 'tulip',
        name: '🌷 Tulip',
        buyPrice: 200,
        sellPrice: 400,
        growTime: 150,
        xp: 30,
        yield: 1,
        seasons: ['spring'],
        special: true,
    },
    watermelon: {
        id: 'watermelon',
        name: '🍉 Semangka',
        buyPrice: 120,
        sellPrice: 300,
        growTime: 200,
        xp: 35,
        yield: 2,  // ×2 di greenhouse
        seasons: ['summer'],
        special: true,
    },
    apple: {
        id: 'apple',
        name: '🍎 Apel',
        buyPrice: 150,
        sellPrice: 250,
        growTime: 240,
        xp: 40,
        yield: 1,
        seasons: ['autumn'],
        special: true,
        goldenChance: 0.05,  // 5% drop Golden Apple
    },
    truffle: {
        id: 'truffle',
        name: '🍄 Truffle',
        buyPrice: 500,
        sellPrice: 1200,
        growTime: 600,
        xp: 100,
        yield: 1,
        seasons: ['winter'],
        special: true,
    },
};

export function getCrop(cropId) {
    return CROPS[cropId] || null;
}

export function getCropsForSeason(season) {
    return Object.values(CROPS).filter(crop => 
        crop.seasons.includes(season)
    );
}

export function getAvailableCrops(season, level) {
    let crops = getCropsForSeason(season);
    
    // Filter berdasarkan level (untuk balance)
    if (level < 3) {
        crops = crops.filter(c => c.buyPrice <= 30);
    } else if (level < 5) {
        crops = crops.filter(c => c.buyPrice <= 100);
    }
    
    return crops;
}

export function calculateSellPrice(cropId, quantity = 1) {
    const crop = getCrop(cropId);
    if (!crop) return 0;
    
    // Bonus musim Autumn: +30% harga jual
    const seasonBonus = window.S?.season?.current === 'autumn' ? 1.3 : 1.0;
    
    // Bonus prestige
    const prestigeBonus = window.S?.prestigeMultiplier || 1.0;
    
    return Math.floor(crop.sellPrice * quantity * seasonBonus * prestigeBonus);
}

export function isCropInSeason(cropId, season) {
    const crop = getCrop(cropId);
    return crop && crop.seasons.includes(season);
}
