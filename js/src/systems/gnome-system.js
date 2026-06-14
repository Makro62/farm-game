import { S } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { ANIMALS } from '../data/animals.js';
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
        // 3. KURCACI PETERNAK — Collect animal products
        if (S.animals) {
            for (const a of S.animals) {
                if (a.readyToCollect) {
                    const currentCap = getBuildingEffect('silo') || 50;
                    if (getInventoryTotal() >= currentCap) break;

                    const conf = ANIMALS[a.type];
                    S.coins += conf.reward;
                    S.totalEarned += conf.reward;
                    addXP(5);
                    a.readyToCollect = false;
                    a.nextProduceAt = Date.now() + conf.time;
                    break;
                }
            }
        }
    }
}
