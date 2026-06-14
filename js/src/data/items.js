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
    coin: { name: 'Coin', emoji: '💰', cost: 50, duration: 5 * 60 * 1000, multiplier: 2.0 }
};

/**
 * Raw products that can be stored in the inventory (from animals & fish ponds).
 * The inventory key matches the animal/fish type key so crafting recipes can
 * reference them directly (e.g. recipe uses { cow: 3 } for 3 milk).
 */
export const PRODUCTS = {
    chicken: { name: 'Telur', emoji: '🥚', reward: 10 },
    duck:    { name: 'Telur Bebek', emoji: '🥚', reward: 30 },
    cow:     { name: 'Susu', emoji: '🥛', reward: 200 },
    sheep:   { name: 'Bulu Domba', emoji: '🧶', reward: 350 },
    bee:     { name: 'Madu', emoji: '🍯', reward: 500 },
    pig:     { name: 'Truffle', emoji: '🍄', reward: 1200 },
    ikankecil: { name: 'Ikan Segar', emoji: '🐟', reward: 15 },
    nila:    { name: 'Nila Segar', emoji: '🐟', reward: 150 },
    lele:    { name: 'Lele Jumbo', emoji: '🐡', reward: 350 },
    gurame:  { name: 'Gurame Besar', emoji: '🐠', reward: 600 },
    mas:     { name: 'Mas Super', emoji: '🐠', reward: 800 },
    salmon:  { name: 'Daging Salmon', emoji: '🍣', reward: 2000 },
    hiu:     { name: 'Sirip Hiu', emoji: '🦈', reward: 5000 }
};

/**
 * Resolve display/value data for any inventory key (crop, raw product, or crafted item).
 * @param {string} key - Inventory key
 * @returns {{name:string, emoji:string, reward:number}}
 */
export function getItemData(key) {
    return CROPS[key] || PRODUCTS[key] || CRAFTING_RECIPES[key] || { name: key, emoji: '📦', reward: 0 };
}
