import { S } from '../core/state.js';
import { CRAFTING_RECIPES } from '../data/crafting.js';
import { getBuildingEffect } from './building-system.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';
import { addXP } from '../utils/helpers.js';

export function startCrafting(recipeId) {
    const recipe = CRAFTING_RECIPES[recipeId];
    if (!recipe) return;

    if (S.level < recipe.minLv) {
        AudioManager.playSound('error');
        NotificationManager.toast(`Level ${recipe.minLv} dibutuhkan!`, 'warn');
        return;
    }

    // Check ingredients
    for (const [item, qty] of Object.entries(recipe.ingredients)) {
        if ((S.inventory[item] || 0) < qty) {
            AudioManager.playSound('error');
            NotificationManager.toast(`Bahan tidak cukup: ${item}`, 'warn');
            return;
        }
    }

    // Check if queue has space (max 3)
    if (S.craftingQueue && S.craftingQueue.length >= 3) {
        AudioManager.playSound('error');
        NotificationManager.toast(`Dapur produksi penuh!`, 'warn');
        return;
    }

    // Consume ingredients
    for (const [item, qty] of Object.entries(recipe.ingredients)) {
        S.inventory[item] -= qty;
    }

    // Calculate time with windmill bonus
    const multiplier = getBuildingEffect('windmill') || 1;
    let finalTime = Math.floor(recipe.time * multiplier);

    S.craftingQueue.push({
        id: Date.now() + Math.random(),
        recipeId: recipeId,
        finishAt: Date.now() + finalTime,
        ready: false
    });

    AudioManager.playSound('coin');
    NotificationManager.toast(`Mulai memproduksi ${recipe.name}!`, 'success');
    
    if (typeof window.renderCrafting === 'function') window.renderCrafting();
    queueSave();
}

export function processCraftingQueue() {
    if (!S.craftingQueue) return false;
    let changed = false;
    const now = Date.now();
    for (const task of S.craftingQueue) {
        if (!task.ready && now >= task.finishAt) {
            task.ready = true;
            changed = true;
        }
    }
    return changed;
}

export function claimCraftedItem(taskId) {
    const idx = S.craftingQueue.findIndex(t => t.id === taskId);
    if (idx === -1) return;
    const task = S.craftingQueue[idx];
    if (!task.ready) return;

    const recipe = CRAFTING_RECIPES[task.recipeId];
    
    // Add to inventory (using recipeId as inventory key)
    S.inventory[task.recipeId] = (S.inventory[task.recipeId] || 0) + 1;
    addXP(recipe.xp);

    // Remove from queue
    S.craftingQueue.splice(idx, 1);

    if (typeof window.updateQuest === 'function') window.updateQuest('craft', 1);

    AudioManager.playSound('levelup');
    NotificationManager.toast(`Telah mendapatkan 1x ${recipe.name}!`, 'success');
    
    if (typeof window.renderCrafting === 'function') window.renderCrafting();
    if (typeof window.renderInventory === 'function') window.renderInventory();
    queueSave();
}
