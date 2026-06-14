import { S } from '../core/state.js';
import { FISHES } from '../data/fishes.js';
import { getInventoryTotal } from '../utils/helpers.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';
import { addXP } from '../utils/helpers.js';

export function buyFish(key) {
    const f = FISHES[key];
    if (S.level < f.minLv) {
        AudioManager.playSound('error');
        NotificationManager.toast(`⚠️ Level ${f.minLv} dibutuhkan!`);
        return;
    }
    if (S.coins < f.cost) { 
        AudioManager.playSound('error'); 
        NotificationManager.toast('💰 Koin tidak cukup!', 'warn'); 
        return; 
    }

    const currentFishes = S.fishes ? S.fishes.length : 0;
    if (currentFishes >= 10) { // arbitrary limit to prevent overcrowding
        AudioManager.playSound('error'); 
        NotificationManager.toast('Danau Penuh! Maksimal 10 ekor.', 'warn'); 
        return; 
    }

    S.coins -= f.cost;
    S.lastFishId = (S.lastFishId || 0) + 1;

    S.fishes.push({
        id: S.lastFishId,
        type: key,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        flip: Math.random() > 0.5,
        nextMoveAt: Date.now() + 2000,
        nextProduceAt: Date.now() + f.time,
        readyToCollect: false
    });

    addXP(10);
    AudioManager.playSound('levelup');
    NotificationManager.toast(`🎉 Membeli Bibit ${f.name}!`, 'success');
    queueSave();
    if (typeof window.render === 'function') window.render();
}

export function collectFish(id) {
    const fData = S.fishes.find(x => x.id === id);
    if (!fData || !fData.readyToCollect) return;

    const currentCap = S.inventoryCapacity || 50;
    if (getInventoryTotal() >= currentCap) {
        AudioManager.playSound('error');
        NotificationManager.toast('⚠️ Gudang Penuh!', 'warn');
        return;
    }

    const conf = FISHES[fData.type];
    S.coins += conf.reward;
    S.totalEarned += conf.reward;
    addXP(15);
    
    // Fish is collected completely (harvested)
    S.fishes = S.fishes.filter(x => x.id !== id);

    AudioManager.playSound('coin');
    NotificationManager.toast(`Panen ${conf.productEmoji} ${conf.product}! +${conf.reward}💰`, 'success');
    queueSave();
    if (typeof window.render === 'function') window.render();
}

export function processFishLoop() {
    let fishChanged = false;
    if (S.fishes && S.fishes.length > 0) {
        S.fishes.forEach(f => {
            // Growth check
            if (!f.readyToCollect && Date.now() >= f.nextProduceAt) {
                f.readyToCollect = true;
                fishChanged = true;
            }
            // Movement
            if (!f.nextMoveAt) f.nextMoveAt = Date.now() + 1000;
            if (Date.now() >= f.nextMoveAt) {
                const nx = Math.max(5, Math.min(90, f.x + (Math.random() - 0.5) * 30));
                const ny = Math.max(5, Math.min(90, f.y + (Math.random() - 0.5) * 30));
                f.flip = nx < f.x;
                f.x = nx;
                f.y = ny;
                f.nextMoveAt = Date.now() + 1000 + Math.random() * 2000;
                fishChanged = true;
            }
        });
    }
    return fishChanged;
}

window.buyFish = buyFish;
window.collectFish = collectFish;
