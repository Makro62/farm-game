import { S } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { DAILY_REWARDS } from '../data/config.js';
import { queueSave } from '../core/save-manager.js';

export function generateQuests() {
    const templates = [
        { type: 'harvest', desc: 'Panen {n} tanaman', targets: [10, 25, 50], rewards: [100, 250, 500] },
        { type: 'plant', desc: 'Tanam {n} bibit', targets: [20, 40, 80], rewards: [150, 300, 600] },
        { type: 'earn', desc: 'Kumpulkan {n}💰', targets: [500, 1500, 5000], rewards: [250, 500, 1500] }
    ];
    S.quests = [];
    for (let i = 0; i < 3; i++) {
        const t = templates[Math.floor(Math.random() * templates.length)];
        const diff = Math.floor(Math.random() * t.targets.length);
        S.quests.push({
            type: t.type,
            desc: t.desc.replace('{n}', t.targets[diff]),
            target: t.targets[diff],
            reward: t.rewards[diff],
            progress: 0,
            done: false
        });
    }
}

export function updateQuest(type, amount) {
    S.quests.forEach(q => {
        if (q.type === type && !q.done) {
            q.progress = Math.min(q.target, q.progress + amount);
            if (q.progress >= q.target) {
                q.done = true;
                S.coins += q.reward;
                S.questsDone++;
                window.playSound('coin'); window.toast(`📋 Quest selesai! +${q.reward}💰`, 'success');
                window.checkAchievements();
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
        window.playSound('error'); window.toast(`⏰ Tunggu ${h}j ${m}m lagi!`, 'warn');
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
        window.playSound('levelup');
        const rand = Math.random();
        if (rand < 0.4) {
            S.coins += 2500;
            window.toast(`🎁 Mystery Box! Mendapat 2500💰!`, 'success');
        } else if (rand < 0.8) {
            S.seeds['pumpkin'] = (S.seeds['pumpkin'] || 0) + 3;
            window.toast(`🎁 Mystery Box! Mendapat 3x 🎃 Pumpkin Seeds!`, 'success');
        } else {
            S.boosters.coin = Date.now() + 15 * 60 * 1000;
            window.toast(`🎁 Mystery Box! Coin Booster Aktif 15 Menit!`, 'success');
        }
    } else {
        const reward = DAILY_REWARDS[dayIdx];
        S.coins += reward;
        window.playSound('coin');
        window.toast(`🎁 Daily Day ${S.loginStreak}! +${reward}💰`, 'success');
    }

    window.checkAchievements();
    window.render();
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
        window.addXP(o.rewardXP);
        window.playSound('coin');

        S.orders.splice(idx, 1);
        S.orders.push(generateOrder());

        window.toast('✅ Pesanan selesai! 🎉', 'success');
        window.render();
        queueSave();
    } else {
        window.playSound('error');
        window.toast('Bahan belum cukup!', 'warn');
    }
}

window.generateQuests = generateQuests;
window.updateQuest = updateQuest;
window.claimDaily = claimDaily;
window.generateOrder = generateOrder;
window.fulfillOrder = fulfillOrder;
