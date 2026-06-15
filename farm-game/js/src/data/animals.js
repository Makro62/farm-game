// ========================================
// FARM TYCOON - ANIMAL DATA CONFIG
// ========================================

export const ANIMALS = {
    chicken: {
        id: 'chicken',
        name: '🐔 Ayam',
        price: 500,
        requiredLevel: 1,
        product: 'egg',
        productName: '🥚 Telur',
        productionInterval: 60,  // detik
        productXp: 5,
        productValue: 60,
        movementSpeed: 5,
    },
    cow: {
        id: 'cow',
        name: '🐄 Sapi',
        price: 1500,
        requiredLevel: 3,
        product: 'milk',
        productName: '🥛 Susu',
        productionInterval: 120,
        productXp: 15,
        productValue: 150,
        movementSpeed: 3,
    },
    bee: {
        id: 'bee',
        name: '🐝 Lebah Madu',
        price: 2000,
        requiredLevel: 5,
        product: 'honey',
        productName: '🍯 Madu',
        productionInterval: 180,
        productXp: 25,
        productValue: 200,
        movementSpeed: 8,
    },
    sheep: {
        id: 'sheep',
        name: '🐑 Domba',
        price: 1200,
        requiredLevel: 4,
        product: 'wool',
        productName: '🧶 Wol',
        productionInterval: 150,
        productXp: 20,
        productValue: 180,
        movementSpeed: 4,
    },
    pig: {
        id: 'pig',
        name: '🐷 Babi',
        price: 1800,
        requiredLevel: 6,
        product: 'truffle_pig',
        productName: '🍄 Truffle (Langka)',
        productionInterval: 300,
        productXp: 50,
        productValue: 500,
        movementSpeed: 3,
        specialChance: 0.1,  // 10% chance dapat truffle
    },
};

export function getAnimal(animalId) {
    return ANIMALS[animalId] || null;
}

export function canBuyAnimal(animalId) {
    const animal = getAnimal(animalId);
    if (!animal) return { canBuy: false, reason: 'Hewan tidak ditemukan' };
    
    const state = window.S;
    if (!state) return { canBuy: false, reason: 'State tidak tersedia' };
    
    // Check coins
    if (state.coins < animal.price) {
        return { canBuy: false, reason: 'Koin tidak cukup' };
    }
    
    // Check level
    if (state.level < animal.requiredLevel) {
        return { canBuy: false, reason: `Level belum cukup (butuh Level ${animal.requiredLevel})` };
    }
    
    // Check barn capacity
    const maxAnimals = getMaxAnimalCapacity();
    if (state.animals.length >= maxAnimals) {
        return { canBuy: false, reason: 'Kandang penuh, upgrade Barn!' };
    }
    
    return { canBuy: true };
}

export function getMaxAnimalCapacity() {
    const state = window.S;
    if (!state) return 3;
    
    const barnLevel = state.buildings.barn?.level || 1;
    return 3 + (barnLevel - 1) * 3;  // Base 3, +3 per level, max 15
}

export function getAnimalProductInfo(productId) {
    for (const animal of Object.values(ANIMALS)) {
        if (animal.product === productId) {
            return {
                ...animal,
                productId,
            };
        }
    }
    return null;
}

export function calculateProductionInterval(animalId) {
    const animal = getAnimal(animalId);
    if (!animal) return 0;
    
    let interval = animal.productionInterval;
    
    // Bonus musim Spring: produksi ×2 untuk lebah
    if (window.S?.season?.current === 'spring' && animalId === 'bee') {
        interval *= 0.5;
    }
    
    // Bonus musim Winter: susu ×1.5
    if (window.S?.season?.current === 'winter' && animalId === 'cow') {
        interval *= 0.75;
    }
    
    return interval;
}
