import { CROPS } from './crops.js';
import { CRAFTING_RECIPES } from './crafting.js';

export const DECORATIONS = {
    tree: { name: 'Tree', emoji: '🌳', cost: 200, prestige: 5 },
    flower: { name: 'Flower', emoji: '🌷', cost: 100, prestige: 3 },
    rock: { name: 'Rock', emoji: '🪨', cost: 50, prestige: 1 },
    house: { name: 'House', emoji: '🏠', cost: 1000, prestige: 25 },
    fountain: { name: 'Fountain', emoji: '⛲', cost: 2000, prestige: 50 },
    statue: { name: 'Statue', emoji: '🗿', cost: 5000, prestige: 100 }
};

export const BOOSTERS = {
    growth: { name: 'Growth', emoji: '⚡', cost: 50, duration: 5 * 60 * 1000, multiplier: 1.5 },
    coin: { name: 'Coin', emoji: '💰', cost: 100, duration: 5 * 60 * 1000, multiplier: 2.0 }
};

/**
 * Raw products that can be stored in the inventory (from animals & fish ponds).
 * The inventory key matches the animal/fish type key so crafting recipes can
 * reference them directly (e.g. recipe uses { cow: 3 } for 3 milk).
 */
export const PRODUCTS = {
    chicken: { name: 'Telur', emoji: '🥚', reward: 50 },
    cow:     { name: 'Susu', emoji: '🥛', reward: 200 },
    bee:     { name: 'Madu', emoji: '🍯', reward: 500 },
    nila:    { name: 'Ikan Nila', emoji: '🐟', reward: 150 },
    lele:    { name: 'Ikan Lele', emoji: '🐡', reward: 350 },
    mas:     { name: 'Ikan Mas', emoji: '🐠', reward: 800 }
};

/**
 * Resolve display/value data for any inventory key (crop, raw product, or crafted item).
 * @param {string} key - Inventory key
 * @returns {{name:string, emoji:string, reward:number}}
 */
export function getItemData(key) {
    return CROPS[key] || PRODUCTS[key] || CRAFTING_RECIPES[key] || { name: key, emoji: '📦', reward: 0 };
}
