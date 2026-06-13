import { S, GameState } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { CRAFTING_RECIPES } from '../data/crafting.js';
import { DECORATIONS } from '../data/items.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';
import { addXP } from '../utils/helpers.js';
import { getInventoryTotal } from './crop-system.js';

export function buyBooster(type) {
    const cost = type === 'growth' ? 50 : 100;
    if (S.coins < cost) { 
        AudioManager.playSound('error'); 
        NotificationManager.toast('💰 Koin tidak cukup!', 'warn'); 
        return; 
    }
    S.coins -= cost;
    S.boosters[type] = Date.now() + 5 * 60 * 1000;
    AudioManager.playSound('levelup'); 
    NotificationManager.toast(`⚡ ${type === 'growth' ? 'Growth' : 'Coin'} Booster aktif 5 menit!`, 'success');
    if (typeof window.render === 'function') window.render();
    queueSave();
}

export function sellAll() {
    let baseTotal = 0;
    for (const [k, qty] of Object.entries(S.inventory)) {
        if (qty > 0) {
            const itemData = CROPS[k] || CRAFTING_RECIPES[k] || { reward: 0 };
            baseTotal += qty * itemData.reward;
            if (typeof window.updateQuest === 'function') window.updateQuest('earn', qty * itemData.reward);
            S.inventory[k] = 0;
        }
    }
    if (baseTotal === 0) { 
        AudioManager.playSound('error'); 
        NotificationManager.toast('Tidak ada yang dijual.', 'warn'); 
        return; 
    }

    let bonus = 0;
    if (S.prestige && S.prestige > 0) {
        bonus = Math.floor(baseTotal * (S.prestige * 0.01));
    }
    let total = baseTotal + bonus;

    S.coins += total;
    S.totalEarned += total;
    AudioManager.playSound('coin');
    if (bonus > 0) {
        NotificationManager.toast(`💰 Terjual! +${total} (Termasuk +${bonus} Bonus Prestige)`, 'success');
    } else {
        NotificationManager.toast(`💰 Terjual! +${total} koin`, 'success');
    }
    if (typeof window.checkAchievements === 'function') window.checkAchievements();
    if (typeof window.render === 'function') window.render();
    queueSave();
}

export function buyDecoration(key) {
    const d = DECORATIONS[key];
    if (S.level < 5) { AudioManager.playSound('error'); NotificationManager.toast('Butuh Level 5!', 'warn'); return; }
    if (S.coins < d.cost) { AudioManager.playSound('error'); NotificationManager.toast('💰 Koin tidak cukup!', 'warn'); return; }

    S.coins -= d.cost;
    S.prestige = (S.prestige || 0) + d.prestige;
    S.decorations.push(key);
    AudioManager.playSound('levelup');
    NotificationManager.toast(`🏡 Beli ${d.name}! +${d.prestige} Prestige`, 'success');
    if (typeof window.render === 'function') window.render();
    queueSave();
}

export function catchFish() {
    if (GameState.fishActive) {
        GameState.fishActive = false;
        const splash = document.getElementById('fish-splash');
        if (splash) splash.style.display = 'none';

        const currentCap = S.inventoryCapacity || 50;
        if (getInventoryTotal() >= currentCap) {
            AudioManager.playSound('error');
            NotificationManager.toast('⚠️ Gudang Penuh!', 'warn');
            return;
        }

        const fishReward = 15 + Math.floor(Math.random() * 20);
        S.coins += fishReward;
        S.totalEarned += fishReward;
        addXP(10);
        AudioManager.playSound('coin');
        NotificationManager.toast(`🎣 Tangkapan! +${fishReward} Koin`, 'success');
        queueSave();
        if (typeof window.render === 'function') window.render();
    } else {
        NotificationManager.toast('🌊 Tidak ada ikan... tunggu cipratan air!', 'info');
    }
}

