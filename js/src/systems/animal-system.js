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
        x = 12 + Math.random() * 70;
        y = 38 + Math.random() * 38;
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
    // Product goes into the inventory (under the animal type key) so it can be
    // sold or used as a crafting ingredient in the kitchen.
    S.inventory[animal.type] = (S.inventory[animal.type] || 0) + 1;
    addXP(10);
    
    animal.readyToCollect = false;
    animal.nextProduceAt = Date.now() + config.time;

    if (typeof window.updateQuest === 'function') window.updateQuest('collect', 1);

    AudioManager.playSound('coin');
    NotificationManager.toast(`Mendapat ${config.productEmoji} ${config.product}! (masuk gudang)`, 'success');
    
    renderIfNeeded();
    queueSave();
}

/** Fraction of the purchase price returned when selling an animal. */
const ANIMAL_SELL_RATE = 0.6;

/**
 * Get the coin value returned when selling an animal of a given type.
 * @param {string} type - Animal type key
 * @returns {number} Sell value in coins
 */
export function getAnimalSellValue(type) {
    const conf = ANIMALS[type];
    if (!conf) return 0;
    return Math.floor(conf.cost * ANIMAL_SELL_RATE);
}

/**
 * Sell (remove) an animal and refund part of its purchase price.
 * @param {number} id - Animal ID
 */
export function sellAnimal(id) {
    const animal = S.animals && S.animals.find(a => a.id === id);
    if (!animal) return;

    const conf = ANIMALS[animal.type];
    if (!conf) return;

    const value = getAnimalSellValue(animal.type);

    NotificationManager.showModal(
        `💰 Jual ${conf.name}?`,
        `Anda akan menjual 1 ${conf.name} dan menerima ${value}💰. Lanjutkan?`,
        () => {
            const idx = S.animals.findIndex(a => a.id === id);
            if (idx === -1) return;

            S.animals.splice(idx, 1);
            S.coins += value;
            S.totalEarned = (S.totalEarned || 0) + value;

            AudioManager.playSound('coin');
            NotificationManager.toast(`💰 ${conf.name} terjual! +${value} koin`, 'success');

            if (typeof window.checkAchievements === 'function') window.checkAchievements();
            renderIfNeeded();
            queueSave();
        }
    );
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
        });
    }
    
    return animalChanged;
}

// Export to window for backward compatibility
window.buyAnimal = buyAnimal;
window.collectAnimalProduct = collectAnimalProduct;
window.sellAnimal = sellAnimal;
