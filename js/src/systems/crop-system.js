import { S, GameState } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';
import { addXP, checkAchievements, isInventoryFull, getInventoryTotal, renderIfNeeded } from '../utils/helpers.js';
import { getBuildingEffect } from './building-system.js';

/**
 * Handle plot click actions
 * @param {number} i - Plot index
 */
export function clickPlot(i) {
    const p = S.plots[i];
    
    if (!p) {
        console.warn(`Plot ${i} tidak ditemukan`);
        return;
    }

    switch (p.state) {
        case 'grass':
            clearGrass(p, i);
            break;
        case 'empty':
            plantSeed(p, i);
            break;
        case 'growing':
            waterPlant(p, i);
            break;
        case 'ready':
            harvestCrop(p, i);
            break;
    }
    
    renderIfNeeded();
    queueSave();
}

/**
 * Clear grass from plot
 */
function clearGrass(plot, index) {
    plot.state = 'empty';
    addXP(1);
    NotificationManager.spawnParticles(index, '+1 XP');
    NotificationManager.toast('🌿 Rumput dibersihkan', 'info');
    AudioManager.playSound('pop');
}

/**
 * Plant seed in empty plot
 */
function plantSeed(plot, index) {
    const selectedCrop = GameState.selectedCrop;
    const seedCount = S.seeds[selectedCrop] || 0;
    
    if (seedCount <= 0) {
        AudioManager.playSound('error');
        NotificationManager.toast(`Bibit ${CROPS[selectedCrop].name} habis! Beli di shop.`, 'warn');
        return;
    }

    const cropConfig = CROPS[selectedCrop];
    S.seeds[selectedCrop]--;
    
    plot.state = 'growing';
    plot.crop = selectedCrop;
    plot.plantedAt = Date.now();
    plot.watered = false;
    
    // Calculate grow time with all bonuses
    let growTime = calculateGrowTime(cropConfig.time);
    plot.growTime = growTime;
    
    S.totalPlanted++;
    addXP(5);
    
    if (typeof window.updateQuest === 'function') {
        window.updateQuest('plant', 1);
    }
    
    NotificationManager.spawnParticles(index, '+5 XP');
    NotificationManager.toast(`🌱 ${cropConfig.name} ditanam!`);
    AudioManager.playSound('pop');
}

/**
 * Calculate effective grow time with all modifiers
 * @param {number} baseTime - Base grow time in ms
 * @returns {number} Modified grow time
 */
function calculateGrowTime(baseTime) {
    let growTime = baseTime;
    
    // Growth booster (33% reduction)
    if (S.boosters.growth > Date.now()) {
        growTime *= 0.67;
    }
    
    // Building bonuses
    const waterTowerBonus = getBuildingEffect('watertower') || 0;
    const greenhouseBonus = getBuildingEffect('greenhouse') ? 0.1 : 0;
    const totalBonus = waterTowerBonus + greenhouseBonus;
    
    growTime *= (1 - totalBonus);
    
    return growTime;
}

/**
 * Water a growing plant
 */
function waterPlant(plot, index) {
    if (plot.watered) return;
    
    plot.watered = true;
    const elapsed = Date.now() - plot.plantedAt;
    const remaining = plot.growTime - elapsed;
    plot.growTime -= Math.floor(remaining / 2);
    
    AudioManager.playSound('water');
    NotificationManager.spawnParticles(index, '💧');
    NotificationManager.toast('💧 Tanaman disiram! Waktu panen dipercepat.');
}

/**
 * Harvest ready crop
 */
function harvestCrop(plot, index) {
    if (isInventoryFull()) {
        AudioManager.playSound('error');
        NotificationManager.toast('⚠️ Gudang Penuh! Tingkatkan kapasitas Silo Anda.', 'warn');
        return;
    }

    const cropConfig = CROPS[plot.crop];
    let reward = cropConfig.reward;
    
    // Coin booster doubles reward
    if (S.boosters.coin > Date.now()) {
        reward *= 2;
    }
    
    S.inventory[plot.crop] = (S.inventory[plot.crop] || 0) + 1;
    
    if (plot.crop === 'pumpkin') {
        S.pumpkinHarvest = (S.pumpkinHarvest || 0) + 1;
    }
    
    S.totalHarvest++;
    addXP(cropConfig.xp);
    
    // Reset plot
    plot.state = 'empty';
    plot.crop = null;
    plot.watered = false;
    
    if (typeof window.updateQuest === 'function') {
        window.updateQuest('harvest', 1);
    }
    
    NotificationManager.spawnParticles(index, `+${cropConfig.emoji}`, `+${cropConfig.xp} XP`, '💰');
    NotificationManager.toast(`🧺 Panen ${cropConfig.name}! +${cropConfig.xp} XP`, 'success');
    AudioManager.playSound('coin');
    checkAchievements();
}

/**
 * Buy seeds from shop (supports buying multiple at once)
 * @param {string} key - Crop key
 * @param {number} qty - How many seeds to buy
 */
export function buySeed(key, qty = 1) {
    const cropConfig = CROPS[key];
    
    if (!cropConfig) {
        console.warn(`Crop ${key} tidak ditemukan`);
        return;
    }
    
    if (S.level < cropConfig.minLv) {
        AudioManager.playSound('error');
        NotificationManager.toast(`Butuh Level ${cropConfig.minLv}!`, 'warn');
        return;
    }

    qty = Math.max(1, Math.floor(qty));
    const totalCost = cropConfig.cost * qty;
    
    if (S.coins < totalCost) {
        AudioManager.playSound('error');
        NotificationManager.toast(`💰 Koin tidak cukup! Butuh ${totalCost}💰`, 'warn');
        return;
    }
    
    S.coins -= totalCost;
    S.seeds[key] = (S.seeds[key] || 0) + qty;
    
    AudioManager.playSound('pop');
    NotificationManager.toast(`🌱 Beli ${qty}x ${cropConfig.name}! (-${totalCost}💰)`);
    
    renderIfNeeded();
    queueSave();
}
