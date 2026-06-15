// ========================================
// FARM TYCOON - GLOBAL STATE (S)
// ========================================

export const S = {
    // Core Stats
    coins: 500,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    
    // Season System
    season: {
        current: 'spring',  // spring, summer, autumn, winter
        day: 1,
        tick: 0,  // 0-29 (30 ticks = 1 hari in-game)
    },
    
    // Weather System
    weather: {
        current: 'sunny',  // sunny, cloudy, rain, storm, windy
        timer: 300,  // detik sampai cuaca berikutnya
    },
    
    // Inventory
    inventory: [],
    config: {
        maxInventory: 50,
    },
    
    // Farm Plots (6x6 = 36 plots)
    plots: Array(36).fill(null).map((_, i) => ({
        index: i,
        state: 'grass',  // grass, empty, growing, ready
        cropId: null,
        plantedAt: null,
        watered: false,
        growthStage: 0,
    })),
    
    // Animals
    animals: [],
    animalProducts: [],
    
    // Buildings
    buildings: {
        silo: { level: 1, name: '🏠 Silo' },
        barn: { level: 1, name: '🏡 Kandang' },
        waterTower: { level: 1, name: '💧 Menara Air' },
        greenhouse: { level: 0, name: '🏚️ Rumah Kaca' },
        windmill: { level: 1, name: '💨 Kincir Angin' },
    },
    
    // Gnomes (Auto-farm)
    gnomes: {
        farmer: { active: false, purchased: false },
        rancher: { active: false, purchased: false },
    },
    
    // Mining
    mining: {
        tool: 'wooden',  // wooden, copper, iron, gold, diamond
        nodes: Array(24).fill(null).map((_, i) => ({
            index: i,
            type: 'stone',  // stone, copper, iron, gold, diamond
            depleted: false,
            regenTime: null,
        })),
    },
    
    // Fishing
    fishing: {
        rod: 'basic',  // basic, advanced, master
        minigameActive: false,
    },
    
    // NPCs & Friendship
    npcs: {
        chef_maria: { 
            level: 1, 
            points: 0, 
            name: '👩‍🍳 Chef Maria',
            favorite: ['cake', 'soup', 'pie'],
        },
        botan: { 
            level: 1, 
            points: 0, 
            name: '🧙‍♂️ Pak Tua Botan',
            favorite: ['tulip', 'apple', 'truffle'],
        },
        ben: { 
            level: 1, 
            points: 0, 
            name: '🏪 Saudagar Ben',
            favorite: ['carrot', 'corn', 'pumpkin'],
        },
        hadi: { 
            level: 1, 
            points: 0, 
            name: '🐮 Paman Hadi',
            favorite: ['egg', 'milk', 'honey'],
        },
    },
    
    // Quests & Orders
    orders: [],
    
    // Crafting Queue
    craftingQueue: [],
    
    // Selected Items
    selectedSeed: null,
    selectedTool: null,
    
    // Layout (drag-and-drop)
    layout: [],
    
    // Prestige
    prestige: 0,
    prestigeMultiplier: 1.0,
};

// Helper functions untuk state management
export function getState() {
    return S;
}

export function setState(key, value) {
    const keys = key.split('.');
    let obj = S;
    
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
}

export function addToInventory(itemId, quantity = 1) {
    const existing = S.inventory.find(item => item.id === itemId);
    
    if (existing) {
        existing.quantity += quantity;
    } else {
        S.inventory.push({ id: itemId, quantity });
    }
    
    // Check if inventory is full
    const totalItems = S.inventory.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > S.config.maxInventory) {
        return false; // Inventory penuh
    }
    
    return true;
}

export function removeFromInventory(itemId, quantity = 1) {
    const itemIndex = S.inventory.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return false;
    
    const item = S.inventory[itemIndex];
    
    if (item.quantity <= quantity) {
        S.inventory.splice(itemIndex, 1);
    } else {
        item.quantity -= quantity;
    }
    
    return true;
}

export function hasItem(itemId, quantity = 1) {
    const item = S.inventory.find(item => item.id === itemId);
    return item && item.quantity >= quantity;
}

export function getItemCount(itemId) {
    const item = S.inventory.find(item => item.id === itemId);
    return item ? item.quantity : 0;
}

export function getTotalInventoryCount() {
    return S.inventory.reduce((sum, item) => sum + item.quantity, 0);
}

export function isInventoryFull() {
    return getTotalInventoryCount() >= S.config.maxInventory;
}

export function addXP(amount) {
    const multiplier = S.prestigeMultiplier;
    S.xp += Math.floor(amount * multiplier);
    
    // Level up check
    while (S.xp >= S.xpToNextLevel) {
        S.xp -= S.xpToNextLevel;
        S.level++;
        S.xpToNextLevel = Math.floor(S.xpToNextLevel * 1.5);
        
        // Trigger level up notification
        if (window.notificationManager) {
            window.notificationManager.show(`⭐ Level Up! Anda mencapai Level ${S.level}`, 'success');
        }
    }
}

export function addCoins(amount) {
    const multiplier = S.prestigeMultiplier;
    S.coins += Math.floor(amount * multiplier);
}

export function removeCoins(amount) {
    if (S.coins >= amount) {
        S.coins -= amount;
        return true;
    }
    return false;
}
