import { S } from '../core/state.js';
import { ACHIEVEMENTS, CONFIG } from '../data/config.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';
import { getBuildingEffect } from '../systems/building-system.js';

export function addXP(n) {
    S.xp += n;
    const needed = S.level * 100;
    while (S.xp >= needed) {
        S.xp -= needed;
        S.level++;
        AudioManager.playSound('levelup');
        NotificationManager.toast(`🎉 LEVEL UP! Lv ${S.level}`, 'success');
        checkAchievements();
    }
}

export function checkAchievements() {
    ACHIEVEMENTS.forEach(a => {
        if (!S.achievements.includes(a.id) && a.check(S)) {
            S.achievements.push(a.id);
            S.coins += a.reward;
            AudioManager.playSound('levelup'); 
            NotificationManager.toast(`🏆 Achievement: ${a.name}! +${a.reward}💰`, 'success');
        }
    });
}

/**
 * Check if inventory is at capacity using Silo building effect
 * @returns {boolean} true if inventory is full
 */
export function isInventoryFull() {
    const currentCap = getBuildingEffect('silo') || CONFIG.DEFAULT_INVENTORY_CAPACITY;
    return getInventoryTotal() >= currentCap;
}

/**
 * Get total items in inventory
 * @returns {number} Total inventory count
 */
export function getInventoryTotal() {
    if (!S.inventory) return 0;
    return Object.values(S.inventory).reduce((sum, qty) => sum + qty, 0);
}

/**
 * Render UI if render function is available
 */
export function renderIfNeeded() {
    if (typeof window.render === 'function') {
        window.render();
    }
}

window.addXP = addXP;
window.checkAchievements = checkAchievements;
