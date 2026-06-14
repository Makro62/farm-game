import { S } from '../core/state.js';
import { ANIMALS } from '../data/animals.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';
import { addXP, isInventoryFull, renderIfNeeded } from '../utils/helpers.js';
import { getBuildingEffect } from './building-system.js';

/**
 * Check if player can buy animal (level and coins)
 * @param {object} animalConfig - Animal configuration
 * @returns {boolean} true if can buy
 */
function canBuyAnimal(animalConfig) {
    if (S.level < animalConfig.minLv) {
        AudioManager.playSound('error');
        NotificationManager.toast(`⚠️ Level ${animalConfig.minLv} dibutuhkan!`);
        return false;
    }
    
    if (S.coins < animalConfig.cost) {
        AudioManager.playSound('error');
        NotificationManager.toast('💰 Koin tidak cukup!', 'warn');
        return false;
    }
    
    return true;
}

/**
 * Check if barn has capacity for more animals
 * @returns {boolean} true if barn is full
 */
function isBarnFull() {
    const maxAnimals = getBuildingEffect('barn') || 2;
    const currentAnimals = S.animals ? S.animals.length : 0;
    
    if (currentAnimals >= maxAnimals) {
        AudioManager.playSound('error');
        NotificationManager.toast('Kapasitas Kandang (Barn) Penuh!', 'warn');
        return true;
    }
    
    return false;
}

/**
 * Buy a new animal
 * @param {string} key - Animal type key
 */
export function buyAnimal(key) {
    const animalConfig = ANIMALS[key];
    
    if (!animalConfig) {
        console.warn(`Animal ${key} tidak ditemukan`);
        return;
    }
    
    if (!canBuyAnimal(animalConfig)) return;
    if (isBarnFull()) return;

    S.coins -= animalConfig.cost;
    S.lastAnimalId = (S.lastAnimalId || 0) + 1;

    // Find non-overlapping position
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
        nextProduceAt: Date.now() + animalConfig.time,
        readyToCollect: false
    });

    addXP(15);
    AudioManager.playSound('levelup');
    NotificationManager.toast(`🎉 Membeli ${animalConfig.name}!`, 'success');
    
    renderIfNeeded();
    queueSave();
}

/**
 * Check if position is occupied by another animal
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} true if position is occupied
 */
function isPositionOccupied(x, y) {
    if (!S.animals) return false;
    return S.animals.some(a => {
        const dx = a.x - x;
        const dy = a.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 15;
    });
}

/**
 * Collect product from animal
 * @param {number} id - Animal ID
 */
export function collectAnimalProduct(id) {
    const animal = S.animals.find(a => a.id === id);
    
    if (!animal || !animal.readyToCollect) return;

    if (isInventoryFull()) {
        AudioManager.playSound('error');
        NotificationManager.toast('⚠️ Gudang Penuh! Tingkatkan kapasitas Silo Anda.', 'warn');
        return;
    }

    const config = ANIMALS[animal.type];
    S.coins += config.reward;
    S.totalEarned += config.reward;
    addXP(10);
    
    animal.readyToCollect = false;
    animal.nextProduceAt = Date.now() + config.time;

    AudioManager.playSound('coin');
    NotificationManager.toast(`Mendapat ${config.productEmoji} ${config.product}! +${config.reward}💰`, 'success');
    
    renderIfNeeded();
    queueSave();
}

/**
 * Process animal loop (production and movement)
 * @returns {boolean} true if animals changed
 */
export function processAnimalLoop() {
    let animalChanged = false;
    
    if (S.animals && S.animals.length > 0) {
        S.animals.forEach(animal => {
            // Production check
            if (!animal.readyToCollect && Date.now() >= animal.nextProduceAt) {
                animal.readyToCollect = true;
                animalChanged = true;
            }
            
            // Movement
            if (!animal.nextMoveAt) animal.nextMoveAt = Date.now() + 2000;
            
            if (Date.now() >= animal.nextMoveAt) {
                animal.x = Math.max(5, Math.min(90, animal.x + (Math.random() - 0.5) * 20));
                animal.y = Math.max(25, Math.min(75, animal.y + (Math.random() - 0.5) * 20));
                animal.flip = animal.x < (animal.x - (Math.random() - 0.5) * 20);
                animal.nextMoveAt = Date.now() + 2000 + Math.random() * 3000;
                animalChanged = true;
            }
        });
    }
    
    return animalChanged;
}

// Export to window for backward compatibility
window.buyAnimal = buyAnimal;
window.collectAnimalProduct = collectAnimalProduct;
