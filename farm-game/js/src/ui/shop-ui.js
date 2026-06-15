// ========================================
// FARM TYCOON - SHOP UI MANAGER
// ========================================

import { S } from '../core/state.js';

export function initShopUI() {
    renderSeedShop();
    renderAnimalShop();
    renderBuildingShop();
}

export function renderSeedShop() {
    const shop = document.getElementById('seed-shop');
    if (!shop) return;
    
    shop.innerHTML = '';
    
    const seeds = [
        { id: 'carrot', name: '🥕 Wortel', buyPrice: 15, growTime: 30 },
        { id: 'corn', name: '🌽 Jagung', buyPrice: 30, growTime: 60 },
        { id: 'tomato', name: '🍅 Tomat', buyPrice: 50, growTime: 90 },
        { id: 'strawberry', name: '🍓 Stroberi', buyPrice: 70, growTime: 120 },
        { id: 'pineapple', name: '🍍 Nanas', buyPrice: 100, growTime: 180 },
        { id: 'pumpkin', name: '🎃 Labu Emas', buyPrice: 200, growTime: 300 },
    ];
    
    seeds.forEach(seed => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `
            <div style="font-size: 24px;">${seed.name.split(' ')[0]}</div>
            <div style="font-size: 12px;">${seed.name.split(' ').slice(1).join(' ')}</div>
            <div style="color: #FFD700; font-size: 14px;">💰 ${seed.buyPrice}</div>
            <div style="font-size: 11px; color: #aaa;">⏱️ ${seed.growTime}s</div>
        `;
        
        item.addEventListener('click', () => selectSeed(seed.id, item));
        
        shop.appendChild(item);
    });
}

export function renderAnimalShop() {
    const shop = document.getElementById('animal-shop');
    if (!shop) return;
    
    shop.innerHTML = '';
    
    const animals = [
        { id: 'chicken', name: '🐔 Ayam', price: 500, level: 1 },
        { id: 'cow', name: '🐄 Sapi', price: 1500, level: 3 },
        { id: 'bee', name: '🐝 Lebah', price: 2000, level: 5 },
    ];
    
    animals.forEach(animal => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `
            <div style="font-size: 24px;">${animal.name.split(' ')[0]}</div>
            <div style="font-size: 12px;">${animal.name.split(' ').slice(1).join(' ')}</div>
            <div style="color: #FFD700; font-size: 14px;">💰 ${animal.price.toLocaleString()}</div>
            <div style="font-size: 11px; color: #aaa;">⭐ Lv ${animal.level}</div>
        `;
        
        item.addEventListener('click', () => buyAnimal(animal.id));
        
        shop.appendChild(item);
    });
}

export function renderBuildingShop() {
    const shop = document.getElementById('building-shop');
    if (!shop) return;
    
    shop.innerHTML = '';
    
    const buildings = [
        { id: 'silo', name: '🏠 Silo', effect: '+50 slot inventory' },
        { id: 'barn', name: '🏡 Kandang', effect: '+3 max hewan' },
        { id: 'waterTower', name: '💧 Menara Air', effect: '-10% waktu tumbuh' },
        { id: 'windmill', name: '💨 Kincir Angin', effect: '+15% craft speed' },
    ];
    
    buildings.forEach(building => {
        const currentLevel = S.buildings[building.id]?.level || 0;
        const nextLevel = currentLevel + 1;
        const upgradeCost = getUpgradeCost(building.id, currentLevel);
        
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `
            <div style="font-size: 20px;">${building.name}</div>
            <div style="font-size: 11px; color: #aaa;">${building.effect}</div>
            <div style="font-size: 12px; margin-top: 5px;">Level: ${currentLevel}</div>
            <div style="color: #FFD700; font-size: 14px;">💰 ${upgradeCost > 0 ? upgradeCost.toLocaleString() : 'MAX'}</div>
        `;
        
        item.addEventListener('click', () => upgradeBuilding(building.id));
        
        shop.appendChild(item);
    });
}

function selectSeed(seedId, element) {
    S.selectedSeed = seedId;
    
    // Update UI selection
    document.querySelectorAll('#seed-shop .shop-item').forEach(el => {
        el.style.borderColor = 'transparent';
    });
    
    element.style.borderColor = '#4CAF50';
    
    window.notificationManager?.show(`🌱 ${seedId} dipilih! Klik tanah untuk menanam`, 'info');
}

function buyAnimal(animalId) {
    const animalConfigs = {
        chicken: { name: 'Ayam', price: 500, requiredLevel: 1 },
        cow: { name: 'Sapi', price: 1500, requiredLevel: 3 },
        bee: { name: 'Lebah', price: 2000, requiredLevel: 5 },
    };
    
    const config = animalConfigs[animalId];
    if (!config) return;
    
    // Check level
    if (S.level < config.requiredLevel) {
        window.notificationManager?.show(`❌ Level belum cukup! Butuh Level ${config.requiredLevel}`, 'error');
        return;
    }
    
    // Check coins
    if (S.coins < config.price) {
        window.notificationManager?.show(`❌ Koin tidak cukup! Butuh ${config.price.toLocaleString()}`, 'error');
        return;
    }
    
    // Check barn capacity
    const maxAnimals = getMaxAnimalCapacity();
    if (S.animals.length >= maxAnimals) {
        window.notificationManager?.show('❌ Kandang penuh! Upgrade Barn terlebih dahulu', 'error');
        return;
    }
    
    // Purchase
    S.coins -= config.price;
    
    // Spawn animal
    const animal = {
        id: `${animalId}_${Date.now()}`,
        type: animalId,
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 10,
        lastProductTime: Date.now(),
    };
    
    S.animals.push(animal);
    
    window.notificationManager?.show(`🎉 ${config.name} dibeli dan ditambahkan ke peternakan!`, 'success');
    
    updateTopbar();
    
    if (window.renderAnimals) window.renderAnimals();
}

function upgradeBuilding(buildingId) {
    const currentLevel = S.buildings[buildingId]?.level || 0;
    const upgradeCost = getUpgradeCost(buildingId, currentLevel);
    
    if (upgradeCost <= 0) {
        window.notificationManager?.show('✅ Bangunan sudah level maksimal!', 'info');
        return;
    }
    
    if (S.coins < upgradeCost) {
        window.notificationManager?.show(`❌ Koin tidak cukup! Butuh ${upgradeCost.toLocaleString()}`, 'error');
        return;
    }
    
    // Upgrade
    S.coins -= upgradeCost;
    S.buildings[buildingId].level++;
    
    const newLevel = S.buildings[buildingId].level;
    window.notificationManager?.show(`🎉 ${buildingId} upgraded to Level ${newLevel}!`, 'success');
    
    updateTopbar();
    renderBuildingShop();
    
    // Update inventory capacity if silo
    if (buildingId === 'silo') {
        S.config.maxInventory = getInventoryCapacity();
    }
}

function getUpgradeCost(buildingId, currentLevel) {
    const costs = {
        silo: [0, 500, 1500, 3000, 5000, 8000],
        barn: [0, 1000, 3000, 6000, 10000, 15000],
        waterTower: [0, 800, 2000, 4000, 7000, 12000],
        windmill: [0, 1500, 4000, 8000, 13000, 18000],
    };
    
    const buildingCosts = costs[buildingId];
    if (!buildingCosts) return 0;
    
    const nextLevel = currentLevel + 1;
    if (nextLevel >= buildingCosts.length) return 0;
    
    return buildingCosts[nextLevel];
}

function getMaxAnimalCapacity() {
    const barnLevel = S.buildings.barn?.level || 1;
    return 3 + (barnLevel - 1) * 3;
}

function getInventoryCapacity() {
    const siloLevel = S.buildings.silo?.level || 1;
    return 50 + (siloLevel - 1) * 50;
}

function updateTopbar() {
    document.getElementById('coin-val').textContent = S.coins.toLocaleString();
    document.getElementById('level-val').textContent = S.level;
}

// Export for global access
window.renderSeedShop = renderSeedShop;
window.renderAnimalShop = renderAnimalShop;
window.renderBuildingShop = renderBuildingShop;
