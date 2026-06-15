// ========================================
// FARM TYCOON - FARM UI MANAGER
// ========================================

import { S } from '../core/state.js';

export function initFarmUI() {
    setupFarmGrid();
}

export function renderFarm() {
    const grid = document.getElementById('farm-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    S.plots.forEach((plot, index) => {
        const plotEl = createPlotElement(plot, index);
        grid.appendChild(plotEl);
    });
}

function createPlotElement(plot, index) {
    const el = document.createElement('div');
    el.className = `plot ${plot.state}`;
    el.dataset.index = index;
    
    // Add emoji based on state
    let content = '';
    
    switch (plot.state) {
        case 'grass':
            content = '🌿';
            break;
        case 'empty':
            content = '';
            break;
        case 'growing':
            const cropEmoji = getCropEmoji(plot.cropId);
            content = `${cropEmoji}<div class="progress-bar"><div class="progress-fill" style="width: ${plot.growthStage}%"></div></div>`;
            if (plot.watered) {
                content += '<span style="position:absolute;top:2px;right:2px;font-size:12px;">💧</span>';
            }
            break;
        case 'ready':
            content = `${getCropEmoji(plot.cropId)}✨`;
            break;
    }
    
    el.innerHTML = content;
    
    // Click handler
    el.addEventListener('click', () => handlePlotClick(index));
    
    return el;
}

function getCropEmoji(cropId) {
    const emojis = {
        carrot: '🥕',
        corn: '🌽',
        tomato: '🍅',
        strawberry: '🍓',
        pineapple: '🍍',
        pumpkin: '🎃',
        tulip: '🌷',
        watermelon: '🍉',
        apple: '🍎',
        truffle: '🍄',
    };
    
    return emojis[cropId] || '🌱';
}

function handlePlotClick(index) {
    const plot = S.plots[index];
    if (!plot) return;
    
    switch (plot.state) {
        case 'grass':
            clearGrass(index);
            break;
        case 'empty':
            plantSeed(index);
            break;
        case 'growing':
            waterPlant(index);
            break;
        case 'ready':
            harvestCrop(index);
            break;
    }
}

function clearGrass(index) {
    const plot = S.plots[index];
    plot.state = 'empty';
    
    window.notificationManager?.show('🧹 Rumput dibersihkan!', 'info');
    renderFarm();
}

function plantSeed(index) {
    const selectedSeed = S.selectedSeed;
    
    if (!selectedSeed) {
        window.notificationManager?.show('⚠️ Pilih bibit terlebih dahulu!', 'warning');
        return;
    }
    
    const plot = S.plots[index];
    
    // Check coins
    const cropConfig = getCropConfig(selectedSeed);
    if (!cropConfig) return;
    
    if (S.coins < cropConfig.buyPrice) {
        window.notificationManager?.show(`❌ Koin tidak cukup! Butuh ${cropConfig.buyPrice}`, 'error');
        return;
    }
    
    // Check inventory space
    if (isInventoryFull()) {
        window.notificationManager?.show('❌ Inventory penuh!', 'error');
        return;
    }
    
    // Deduct coins and plant
    S.coins -= cropConfig.buyPrice;
    plot.state = 'growing';
    plot.cropId = selectedSeed;
    plot.plantedAt = Date.now();
    plot.watered = false;
    plot.growthStage = 0;
    
    window.notificationManager?.show(`🌱 ${cropConfig.name} ditanam!`, 'success');
    
    updateTopbar();
    renderFarm();
}

function waterPlant(index) {
    const plot = S.plots[index];
    
    if (plot.watered) {
        window.notificationManager?.show('💧 Tanaman sudah disiram!', 'info');
        return;
    }
    
    plot.watered = true;
    plot.wateredAt = Date.now();
    
    window.notificationManager?.show('💧 Tanaman disiram! (-30% waktu tumbuh)', 'success');
    renderFarm();
}

function harvestCrop(index) {
    const plot = S.plots[index];
    const cropConfig = getCropConfig(plot.cropId);
    
    if (!cropConfig) return;
    
    // Calculate yield with bonuses
    let yieldAmount = cropConfig.yield;
    
    // Season bonus (Spring: +20%)
    if (S.season.current === 'spring') {
        yieldAmount = Math.ceil(yieldAmount * 1.2);
    }
    
    // Add to inventory
    addToInventory(plot.cropId, yieldAmount);
    
    // Add XP
    addXP(cropConfig.xp);
    
    // Reset plot
    plot.state = 'empty';
    plot.cropId = null;
    plot.plantedAt = null;
    plot.watered = false;
    plot.growthStage = 0;
    
    window.notificationManager?.show(`✅ Panen ${cropConfig.name} ×${yieldAmount}!`, 'success');
    
    updateTopbar();
    renderFarm();
    renderInventory();
}

function getCropConfig(cropId) {
    const configs = {
        carrot: { name: '🥕 Wortel', buyPrice: 15, xp: 5, yield: 1 },
        corn: { name: '🌽 Jagung', buyPrice: 30, xp: 10, yield: 1 },
        tomato: { name: '🍅 Tomat', buyPrice: 50, xp: 15, yield: 1 },
        strawberry: { name: '🍓 Stroberi', buyPrice: 70, xp: 25, yield: 1 },
        pineapple: { name: '🍍 Nanas', buyPrice: 100, xp: 40, yield: 1 },
        pumpkin: { name: '🎃 Labu Emas', buyPrice: 200, xp: 80, yield: 1 },
    };
    
    return configs[cropId];
}

function isInventoryFull() {
    const totalItems = S.inventory.reduce((sum, item) => sum + item.quantity, 0);
    return totalItems >= S.config.maxInventory;
}

function addToInventory(itemId, quantity) {
    const existing = S.inventory.find(item => item.id === itemId);
    
    if (existing) {
        existing.quantity += quantity;
    } else {
        S.inventory.push({ id: itemId, quantity });
    }
}

function addXP(amount) {
    S.xp += amount;
    
    while (S.xp >= S.xpToNextLevel) {
        S.xp -= S.xpToNextLevel;
        S.level++;
        S.xpToNextLevel = Math.floor(S.xpToNextLevel * 1.5);
        
        window.notificationManager?.show(`⭐ Level Up! Level ${S.level}`, 'success');
    }
}

function updateTopbar() {
    document.getElementById('coin-val').textContent = S.coins.toLocaleString();
    document.getElementById('level-val').textContent = S.level;
    
    const xpPercent = (S.xp / S.xpToNextLevel) * 100;
    document.getElementById('xp-bar-fill').style.width = `${xpPercent}%`;
}

function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const totalItems = S.inventory.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('inventory-count').textContent = `${totalItems}/${S.config.maxInventory}`;
    
    S.inventory.forEach(item => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.innerHTML = `
            ${getItemEmoji(item.id)}
            <span class="inv-count">${item.quantity}</span>
        `;
        grid.appendChild(slot);
    });
}

function getItemEmoji(itemId) {
    const emojis = {
        carrot: '🥕',
        corn: '🌽',
        tomato: '🍅',
        strawberry: '🍓',
        egg: '🥚',
        milk: '🥛',
        honey: '🍯',
    };
    
    return emojis[itemId] || '📦';
}

// Export for global access
window.renderFarm = renderFarm;
window.renderInventory = renderInventory;
