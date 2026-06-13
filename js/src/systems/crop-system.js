import { S, GameState } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { BOOSTERS } from '../data/items.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';
import { addXP } from '../utils/helpers.js';
import { getBuildingEffect } from './building-system.js';

export function clickPlot(i) {
    const p = S.plots[i];
    if (p.state === 'grass') {
        p.state = 'empty';
        addXP(1);
        NotificationManager.spawnParticles(i, '+1 XP');
        NotificationManager.toast('🌿 Rumput dibersihkan', 'info'); 
        AudioManager.playSound('pop');
    }
    else if (p.state === 'empty') {
        if ((S.seeds[GameState.selectedCrop] || 0) <= 0) { 
            AudioManager.playSound('error'); 
            NotificationManager.toast(`Bibit ${CROPS[GameState.selectedCrop].name} habis! Beli di shop.`, 'warn'); 
            return; 
        }
        const c = CROPS[GameState.selectedCrop];
        S.seeds[GameState.selectedCrop]--;
        p.state = 'growing';
        p.crop = GameState.selectedCrop;
        p.plantedAt = Date.now();
        let growTime = c.time;
        if (S.boosters.growth > Date.now()) growTime *= 0.67;
        
        // Water Tower & Greenhouse passive effects
        const waterTowerBonus = getBuildingEffect('watertower') || 0;
        const greenhouseBonus = getBuildingEffect('greenhouse') ? 0.1 : 0;
        const totalBonus = waterTowerBonus + greenhouseBonus;
        growTime *= (1 - totalBonus);
        
        p.growTime = growTime;
        p.watered = false;
        S.totalPlanted++;
        addXP(5);
        if (typeof window.updateQuest === 'function') window.updateQuest('plant', 1);
        NotificationManager.spawnParticles(i, `+5 XP`);
        NotificationManager.toast(`🌱 ${c.name} ditanam!`); 
        AudioManager.playSound('pop');
    }
    else if (p.state === 'growing' && !p.watered) {
        // WATERING: Percepat waktu tumbuh 50%
        p.watered = true;
        const elapsed = Date.now() - p.plantedAt;
        const remaining = p.growTime - elapsed;
        p.growTime -= Math.floor(remaining / 2);
        AudioManager.playSound('water');
        NotificationManager.spawnParticles(i, '💧');
        NotificationManager.toast('💧 Tanaman disiram! Waktu panen dipercepat.');
    }
    else if (p.state === 'ready') {
        // CAPACITY CHECK
        const currentCap = getBuildingEffect('silo') || 50;
        if (getInventoryTotal() >= currentCap) {
            AudioManager.playSound('error');
            NotificationManager.toast('⚠️ Gudang Penuh! Tingkatkan kapasitas Silo Anda.', 'warn');
            return;
        }

        const c = CROPS[p.crop];
        let reward = c.reward;
        if (S.boosters.coin > Date.now()) reward *= 2;
        S.inventory[p.crop] = (S.inventory[p.crop] || 0) + 1;
        if (p.crop === 'pumpkin') S.pumpkinHarvest = (S.pumpkinHarvest || 0) + 1;
        S.totalHarvest++;
        addXP(c.xp);
        p.state = 'empty'; p.crop = null; p.watered = false;
        if (typeof window.updateQuest === 'function') window.updateQuest('harvest', 1);
        NotificationManager.spawnParticles(i, `+${c.emoji}`, `+${c.xp} XP`, '💰');
        NotificationManager.toast(`🧺 Panen ${c.name}! +${c.xp} XP`, 'success'); 
        AudioManager.playSound('coin');
        if (typeof window.checkAchievements === 'function') window.checkAchievements();
    }
    if (typeof window.render === 'function') window.render();
    queueSave();
}

export function buySeed(key) {
    const c = CROPS[key];
    if (S.level < c.minLv) { 
        AudioManager.playSound('error'); 
        NotificationManager.toast(`Butuh Level ${c.minLv}!`, 'warn'); 
        return; 
    }
    if (S.coins < c.cost) { 
        AudioManager.playSound('error'); 
        NotificationManager.toast('💰 Koin tidak cukup!', 'warn'); 
        return; 
    }
    S.coins -= c.cost;
    S.seeds[key] = (S.seeds[key] || 0) + 1;
    AudioManager.playSound('pop'); 
    NotificationManager.toast(`🌱 Beli ${c.name}!`);
    if (typeof window.render === 'function') window.render();
    queueSave();
}

export function getInventoryTotal() {
    if (!S.inventory) return 0;
    return Object.values(S.inventory).reduce((a, b) => a + b, 0);
}
