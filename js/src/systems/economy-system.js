import { S } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { DECORATIONS, BOOSTERS } from '../data/items.js';
import { queueSave } from '../core/save-manager.js';

export function buyBooster(type) {
    const cost = type === 'growth' ? 50 : 100;
    if (S.coins < cost) { window.playSound('error'); window.toast('💰 Koin tidak cukup!', 'warn'); return; }
    S.coins -= cost;
    S.boosters[type] = Date.now() + 5 * 60 * 1000;
    window.playSound('levelup'); window.toast(`⚡ ${type === 'growth' ? 'Growth' : 'Coin'} Booster aktif 5 menit!`, 'success');
    window.render();
    queueSave();
}

export function sellAll() {
    let baseTotal = 0;
    for (const [k, qty] of Object.entries(S.inventory)) {
        if (qty > 0) {
            baseTotal += qty * CROPS[k].reward;
            if (typeof window.updateQuest === 'function') window.updateQuest('earn', qty * CROPS[k].reward);
            S.inventory[k] = 0;
        }
    }
    if (baseTotal === 0) { window.playSound('error'); window.toast('Tidak ada yang dijual.', 'warn'); return; }

    let bonus = 0;
    if (S.prestige && S.prestige > 0) {
        bonus = Math.floor(baseTotal * (S.prestige * 0.01));
    }
    let total = baseTotal + bonus;

    S.coins += total;
    S.totalEarned += total;
    window.playSound('coin');
    if (bonus > 0) {
        window.toast(`💰 Terjual! +${total} (Termasuk +${bonus} Bonus Prestige)`, 'success');
    } else {
        window.toast(`💰 Terjual! +${total} koin`, 'success');
    }
    window.checkAchievements();
    window.render();
    queueSave();
}

export function buyDecoration(key) {
    const d = DECORATIONS[key];
    if (S.level < 5) { window.playSound('error'); window.toast('Butuh Level 5!', 'warn'); return; }
    if (S.coins < d.cost) { window.playSound('error'); window.toast('💰 Koin tidak cukup!', 'warn'); return; }

    S.coins -= d.cost;
    S.prestige = (S.prestige || 0) + d.prestige;
    S.decorations.push(key);
    window.playSound('levelup');
    window.toast(`🏡 Beli ${d.name}! +${d.prestige} Prestige`, 'success');
    window.render();
    queueSave();
}

export function upgradeSilo() {
    const currentCap = S.inventoryCapacity || 50;
    const upgradeCost = currentCap * 10;
    if (S.coins >= upgradeCost) {
        S.coins -= upgradeCost;
        S.inventoryCapacity = currentCap + 50;
        window.playSound('levelup');
        window.toast(`📦 Silo di-upgrade! Kapasitas: ${S.inventoryCapacity}`);
        queueSave();
        window.render();
    } else {
        window.playSound('error');
        window.toast('💰 Koin tidak cukup untuk upgrade Silo!');
    }
}

export function catchFish() {
    if (window.GameState && window.GameState.fishActive) {
        window.GameState.fishActive = false;
        const splash = document.getElementById('fish-splash');
        if (splash) splash.style.display = 'none';

        const currentCap = S.inventoryCapacity || 50;
        if (window.getInventoryTotal && window.getInventoryTotal() >= currentCap) {
            window.playSound('error');
            window.toast('⚠️ Gudang Penuh!');
            return;
        }

        const fishReward = 15 + Math.floor(Math.random() * 20);
        S.coins += fishReward;
        S.totalEarned += fishReward;
        window.addXP(10);
        window.playSound('coin');
        window.toast(`🎣 Tangkapan! +${fishReward} Koin`, 'success');
        queueSave();
        window.render();
    } else {
        window.toast('🌊 Tidak ada ikan... tunggu cipratan air!', 'info');
    }
}

window.buyBooster = buyBooster;
window.sellAll = sellAll;
window.buyDecoration = buyDecoration;
window.upgradeSilo = upgradeSilo;
window.catchFish = catchFish;
