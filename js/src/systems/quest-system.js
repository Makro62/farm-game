import { S } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { DAILY_REWARDS } from '../data/config.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';
import { addXP } from '../utils/helpers.js';

/**
 * Generate one daily quest for each place/area of the game.
 */
export function generateQuests() {
    const templatesByPlace = [
        { place: '🌾 Kebun', options: [
            { type: 'harvest', desc: 'Panen {n} tanaman', targets: [10, 25, 50], rewards: [100, 250, 500] },
            { type: 'plant', desc: 'Tanam {n} bibit', targets: [20, 40, 80], rewards: [150, 300, 600] }
        ]},
        { place: '🐔 Peternakan', options: [
            { type: 'collect', desc: 'Kumpulkan {n} hasil ternak', targets: [3, 8, 15], rewards: [150, 400, 800] }
        ]},
        { place: '🍳 Dapur', options: [
            { type: 'craft', desc: 'Produksi {n} olahan', targets: [2, 5, 10], rewards: [200, 500, 1000] }
        ]},
        { place: '🎣 Danau', options: [
            { type: 'fish', desc: 'Panen {n} ikan', targets: [3, 6, 12], rewards: [150, 350, 700] }
        ]},
        { place: '🏪 Kota', options: [
            { type: 'earn', desc: 'Hasilkan {n}💰 dari penjualan', targets: [500, 1500, 5000], rewards: [250, 500, 1500] }
        ]}
    ];

    S.quests = [];
    templatesByPlace.forEach(({ place, options }) => {
        const t = options[Math.floor(Math.random() * options.length)];
        const diff = Math.floor(Math.random() * t.targets.length);
        S.quests.push({
            place,
            type: t.type,
            desc: t.desc.replace('{n}', t.targets[diff]),
            target: t.targets[diff],
            reward: t.rewards[diff],
            progress: 0,
            done: false
        });
    });
}

export function updateQuest(type, amount) {
    S.quests.forEach(q => {
        if (q.type === type && !q.done) {
            q.progress = Math.min(q.target, q.progress + amount);
            if (q.progress >= q.target) {
                q.done = true;
                S.coins += q.reward;
                S.questsDone++;
                AudioManager.playSound('coin'); 
                NotificationManager.toast(`📋 Quest selesai! +${q.reward}💰`, 'success');
                if (typeof window.checkAchievements === 'function') window.checkAchievements();
            }
        }
    });
    if (typeof window.renderQuests === 'function') window.renderQuests();
}

export function claimDaily() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    if (S.lastDaily && now - S.lastDaily < dayMs) {
        const remaining = dayMs - (now - S.lastDaily);
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        AudioManager.playSound('error'); 
        NotificationManager.toast(`⏰ Tunggu ${h}j ${m}m lagi!`, 'warn');
        return;
    }
    if (S.lastDaily && now - S.lastDaily < 2 * dayMs) {
        S.loginStreak++;
    } else {
        S.loginStreak = 1;
    }
    const dayIdx = Math.min(S.loginStreak - 1, DAILY_REWARDS.length - 1);
    S.lastDaily = now;

    if (dayIdx === 6) {
        AudioManager.playSound('levelup');
        const rand = Math.random();
        if (rand < 0.4) {
            S.coins += 2500;
            NotificationManager.toast(`🎁 Mystery Box! Mendapat 2500💰!`, 'success');
        } else if (rand < 0.8) {
            S.seeds['pumpkin'] = (S.seeds['pumpkin'] || 0) + 3;
            NotificationManager.toast(`🎁 Mystery Box! Mendapat 3x 🎃 Pumpkin Seeds!`, 'success');
        } else {
            S.boosters.coin = Date.now() + 15 * 60 * 1000;
            NotificationManager.toast(`🎁 Mystery Box! Coin Booster Aktif 15 Menit!`, 'success');
        }
    } else {
        const reward = DAILY_REWARDS[dayIdx];
        S.coins += reward;
        AudioManager.playSound('coin');
        NotificationManager.toast(`🎁 Daily Day ${S.loginStreak}! +${reward}💰`, 'success');
    }

    if (typeof window.checkAchievements === 'function') window.checkAchievements();
    if (typeof window.render === 'function') window.render();
    queueSave();
}

export function generateOrder() {
    const crops = Object.keys(CROPS).filter(k => S.level >= CROPS[k].minLv);
    const crop = crops[Math.floor(Math.random() * crops.length)] || 'carrot';
    const qty = Math.floor(Math.random() * 5) + 3 + Math.floor(S.level / 2);
    const rewardCoins = CROPS[crop].reward * qty * 2.5;
    const rewardXP = CROPS[crop].xp * qty * 1.5;

    return {
        id: Date.now() + Math.random(),
        crop: crop,
        qty: qty,
        rewardCoins: Math.floor(rewardCoins),
        rewardXP: Math.floor(rewardXP)
    };
}

export function fulfillOrder(id) {
    const idx = S.orders.findIndex(x => x.id === id);
    if (idx === -1) return;
    const o = S.orders[idx];
    if ((S.inventory[o.crop] || 0) >= o.qty) {
        S.inventory[o.crop] -= o.qty;
        S.coins += o.rewardCoins;
        S.totalEarned += o.rewardCoins;
        addXP(o.rewardXP);
        AudioManager.playSound('coin');

        S.orders.splice(idx, 1);
        S.orders.push(generateOrder());

        NotificationManager.toast('✅ Pesanan selesai! 🎉', 'success');
        if (typeof window.render === 'function') window.render();
        queueSave();
    } else {
        AudioManager.playSound('error');
        NotificationManager.toast('Bahan belum cukup!', 'warn');
    }
}

window.generateQuests = generateQuests;
window.updateQuest = updateQuest;
window.claimDaily = claimDaily;
window.generateOrder = generateOrder;
window.fulfillOrder = fulfillOrder;
