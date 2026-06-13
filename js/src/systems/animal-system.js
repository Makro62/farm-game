import { S } from '../core/state.js';
import { ANIMALS } from '../data/animals.js';
import { getInventoryTotal } from './crop-system.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';
import { addXP } from '../utils/helpers.js';
import { getBuildingEffect } from './building-system.js';

export function buyAnimal(key) {
    const a = ANIMALS[key];
    if (S.level < a.minLv) {
        AudioManager.playSound('error');
        NotificationManager.toast(`⚠️ Level ${a.minLv} dibutuhkan!`);
        return;
    }
    if (a.cost >= 1000) {
        if (!confirm(`Beli ${a.name} seharga ${a.cost}💰?`)) return;
    }
    if (S.coins < a.cost) { 
        AudioManager.playSound('error'); 
        NotificationManager.toast('💰 Koin tidak cukup!', 'warn'); 
        return; 
    }

    const maxAnimals = getBuildingEffect('barn') || 2;
    const currentAnimals = S.animals ? S.animals.length : 0;
    if (currentAnimals >= maxAnimals) {
        AudioManager.playSound('error'); 
        NotificationManager.toast('Kapasitas Kandang (Barn) Penuh!', 'warn'); 
        return; 
    }

    S.coins -= a.cost;
    S.lastAnimalId = (S.lastAnimalId || 0) + 1;

    let x, y, attempts = 0;
    do {
        x = 10 + Math.random() * 80;
        y = 30 + Math.random() * 40;
        attempts++;
    } while (isPositionOccupied(x, y) && attempts < 10);

    S.animals.push({
        id: S.lastAnimalId,
        type: key,
        x: x,
        y: y,
        flip: Math.random() > 0.5,
        nextMoveAt: Date.now() + 2000,
        nextProduceAt: Date.now() + a.time,
        readyToCollect: false
    });

    addXP(15);
    AudioManager.playSound('levelup');
    NotificationManager.toast(`🎉 Membeli ${a.name}!`, 'success');
    queueSave();
    if (typeof window.render === 'function') window.render();
}

function isPositionOccupied(x, y) {
    if (!S.animals) return false;
    return S.animals.some(a => {
        const dx = a.x - x;
        const dy = a.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 15;
    });
}

export function collectAnimalProduct(id) {
    const a = S.animals.find(x => x.id === id);
    if (!a || !a.readyToCollect) return;

    const currentCap = S.inventoryCapacity || 50;
    if (getInventoryTotal() >= currentCap) {
        AudioManager.playSound('error');
        NotificationManager.toast('⚠️ Gudang Penuh! Tingkatkan kapasitas Silo Anda.', 'warn');
        return;
    }

    const conf = ANIMALS[a.type];
    S.coins += conf.reward;
    S.totalEarned += conf.reward;
    addXP(10);
    a.readyToCollect = false;
    a.nextProduceAt = Date.now() + conf.time;

    AudioManager.playSound('coin');
    NotificationManager.toast(`Mendapat ${conf.productEmoji} ${conf.product}! +${conf.reward}💰`, 'success');
    queueSave();
    if (typeof window.render === 'function') window.render();
}

export function processAnimalLoop() {
    let animalChanged = false;
    if (S.animals && S.animals.length > 0) {
        S.animals.forEach(a => {
            // Production check
            if (!a.readyToCollect && Date.now() >= a.nextProduceAt) {
                a.readyToCollect = true;
                animalChanged = true;
            }
            // Movement
            if (!a.nextMoveAt) a.nextMoveAt = Date.now() + 2000;
            if (Date.now() >= a.nextMoveAt) {
                const nx = Math.max(5, Math.min(90, a.x + (Math.random() - 0.5) * 20));
                const ny = Math.max(25, Math.min(75, a.y + (Math.random() - 0.5) * 20));
                a.flip = nx < a.x;
                a.x = nx;
                a.y = ny;
                a.nextMoveAt = Date.now() + 2000 + Math.random() * 3000;
                animalChanged = true;
            }
        });
    }
    return animalChanged;
}

window.buyAnimal = buyAnimal;
window.collectAnimalProduct = collectAnimalProduct;
