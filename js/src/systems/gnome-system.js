import { S } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { ANIMALS } from '../data/animals.js';
import { FISHES } from '../data/fishes.js';
import { CRAFTING_RECIPES } from '../data/crafting.js';
import { getInventoryTotal, addXP } from '../utils/helpers.js';
import { getBuildingEffect } from './building-system.js';

export function processGnome() {
    if (S.gnomeFarmOwned && S.gnomeFarmActive) {
        // 1. KURCACI PETANI — Harvest ready plots directly
        for (let i = 0; i < S.plots.length; i++) {
            const p = S.plots[i];
            if (p.state === 'ready') {
                const currentCap = getBuildingEffect('silo') || 50;
                if (getInventoryTotal() >= currentCap) break;

                const c = CROPS[p.crop];
                S.inventory[p.crop] = (S.inventory[p.crop] || 0) + 1;
                if (p.crop === 'pumpkin') S.pumpkinHarvest = (S.pumpkinHarvest || 0) + 1;
                S.totalHarvest++;
                addXP(c.xp);
                p.state = 'empty'; p.crop = null; p.watered = false;
                if (typeof window.updateQuest === 'function') window.updateQuest('harvest', 1);
                break;
            }
        }

        // 2. KURCACI PETANI — Plant random seeds on empty plots
        const availableSeeds = Object.keys(S.seeds).filter(k => S.seeds[k] > 0 && S.level >= CROPS[k].minLv);
        if (availableSeeds.length > 0) {
            for (let i = 0; i < S.plots.length; i++) {
                const p = S.plots[i];
                if (p.state === 'empty') {
                    const randomCrop = availableSeeds[Math.floor(Math.random() * availableSeeds.length)];
                    const c = CROPS[randomCrop];
                    S.seeds[randomCrop]--;
                    p.state = 'growing';
                    p.crop = randomCrop;
                    p.plantedAt = Date.now();
                    let growTime = c.time;
                    if (S.boosters.growth > Date.now()) growTime *= 0.67;
                    p.growTime = growTime;
                    p.watered = false;
                    S.totalPlanted++;
                    addXP(2);
                    break;
                }
            }
        }

        // 4. KURCACI KURIR — Fulfill orders
        if (S.orders) {
            for (const o of S.orders) {
                if ((S.inventory[o.crop] || 0) >= o.qty) {
                    if (typeof window.fulfillOrder === 'function') window.fulfillOrder(o.id);
                    break;
                }
            }
        }
    }

    if (S.gnomeAnimalOwned && S.gnomeAnimalActive) {
        // 3. KURCACI PETERNAK — Collect animal products into the inventory
        if (S.animals) {
            for (const a of S.animals) {
                if (a.readyToCollect) {
                    const currentCap = getBuildingEffect('silo') || 50;
                    if (getInventoryTotal() >= currentCap) break;

                    const conf = ANIMALS[a.type];
                    S.inventory[a.type] = (S.inventory[a.type] || 0) + 1;
                    addXP(5);
                    a.readyToCollect = false;
                    a.nextProduceAt = Date.now() + conf.time;
                    if (typeof window.updateQuest === 'function') window.updateQuest('collect', 1);
                    break;
                }
            }
        }
    }
}

export function processTownWorker() {
    if (!S.merchantOwned || !S.merchantActive) return;

    // 1. Auto-harvest fish
    if (S.fishes) {
        for (let i = 0; i < S.fishes.length; i++) {
            const f = S.fishes[i];
            if (f.readyToCollect) {
                const currentCap = getBuildingEffect('silo') || 50;
                if (getInventoryTotal() >= currentCap) break;

                const conf = FISHES[f.type];
                S.inventory[f.type] = (S.inventory[f.type] || 0) + 1;
                addXP(15);
                S.fishes = S.fishes.filter(x => x.id !== f.id);
                if (typeof window.updateQuest === 'function') window.updateQuest('fish', 1);
                break; // one harvest per tick
            }
        }
    }

    // 2. Auto-buy starter fish (ikankecil) silently if pond is empty or not full
    const currentFishes = S.fishes ? S.fishes.length : 0;
    if (currentFishes < 50) {
        const f = FISHES['ikankecil'];
        if (f && S.coins >= f.cost && S.level >= f.minLv) {
            S.coins -= f.cost;
            S.lastFishId = (S.lastFishId || 0) + 1;
            if (!S.fishes) S.fishes = [];
            S.fishes.push({
                id: S.lastFishId,
                type: 'ikankecil',
                x: 10 + Math.random() * 80,
                y: 10 + Math.random() * 80,
                flip: Math.random() > 0.5,
                nextMoveAt: Date.now() + 2000,
                nextProduceAt: Date.now() + f.time,
                readyToCollect: false
            });
            addXP(10);
        }
    }

    // 3. Auto-claim fish cooking
    if (S.craftingQueue) {
        for (let i = 0; i < S.craftingQueue.length; i++) {
            const task = S.craftingQueue[i];
            if (task.ready) {
                const recipe = CRAFTING_RECIPES[task.recipeId];
                if (recipe && recipe.tab === 'fish') {
                    S.inventory[task.recipeId] = (S.inventory[task.recipeId] || 0) + 1;
                    addXP(recipe.xp);
                    S.craftingQueue.splice(i, 1);
                    if (typeof window.updateQuest === 'function') window.updateQuest('craft', 1);
                    if (typeof window.renderCrafting === 'function') window.renderCrafting();
                    if (typeof window.renderInventory === 'function') window.renderInventory();
                    break;
                }
            }
        }
    }
}
