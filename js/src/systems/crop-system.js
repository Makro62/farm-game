import { S, GameState } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { BOOSTERS } from '../data/items.js';
import { queueSave } from '../core/save-manager.js';

export function clickPlot(i) {
    const p = S.plots[i];
    if (p.state === 'grass') {
        p.state = 'empty';
        addXP(1);
        window.spawnParticles(i, '+1 XP');
        window.toast('🌿 Rumput dibersihkan', 'info'); window.playSound('pop');
    }
    else if (p.state === 'empty') {
        if ((S.seeds[GameState.selectedCrop] || 0) <= 0) { 
            window.playSound('error'); 
            window.toast(`Bibit ${CROPS[GameState.selectedCrop].name} habis! Beli di shop.`, 'warn'); 
            return; 
        }
        const c = CROPS[GameState.selectedCrop];
        S.seeds[GameState.selectedCrop]--;
        p.state = 'growing';
        p.crop = GameState.selectedCrop;
        p.plantedAt = Date.now();
        let growTime = c.time;
        if (S.boosters.growth > Date.now()) growTime *= 0.67;
        p.growTime = growTime;
        p.watered = false;
        S.totalPlanted++;
        addXP(5);
        updateQuest('plant', 1);
        window.spawnParticles(i, `+5 XP`);
        window.toast(`🌱 ${c.name} ditanam!`); window.playSound('pop');
    }
    else if (p.state === 'growing' && !p.watered) {
        // WATERING: Percepat waktu tumbuh 50%
        p.watered = true;
        const elapsed = Date.now() - p.plantedAt;
        const remaining = p.growTime - elapsed;
        p.growTime -= Math.floor(remaining / 2);
        window.playSound('water');
        window.spawnParticles(i, '💧');
        window.toast('💧 Tanaman disiram! Waktu panen dipercepat.');
    }
    else if (p.state === 'ready') {
        // CAPACITY CHECK
        const currentCap = S.inventoryCapacity || 50;
        if (getInventoryTotal() >= currentCap) {
            window.playSound('error');
            window.toast('⚠️ Gudang Penuh! Tingkatkan kapasitas Silo Anda.');
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
        updateQuest('harvest', 1);
        window.spawnParticles(i, `+${c.emoji}`, `+${c.xp} XP`, '💰');
        window.toast(`🧺 Panen ${c.name}! +${c.xp} XP`, 'success'); window.playSound('coin');
        checkAchievements();
    }
    window.render();
    queueSave();
}

export function buySeed(key) {
    const c = CROPS[key];
    if (S.level < c.minLv) { window.playSound('error'); window.toast(`Butuh Level ${c.minLv}!`, 'warn'); return; }
    if (S.coins < c.cost) { window.playSound('error'); window.toast('💰 Koin tidak cukup!', 'warn'); return; }
    S.coins -= c.cost;
    S.seeds[key] = (S.seeds[key] || 0) + 1;
    window.playSound('pop'); window.toast(`🌱 Beli ${c.name}!`);
    window.render();
    queueSave();
}

export function getInventoryTotal() {
    if (!S.inventory) return 0;
    return Object.values(S.inventory).reduce((a, b) => a + b, 0);
}

// Temporary exports for external UI bindings
window.clickPlot = clickPlot;
window.buySeed = buySeed;
