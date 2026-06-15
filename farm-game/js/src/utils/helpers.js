/**
 * Helper Utility Functions
 * Fungsi-fungsi utilitas yang digunakan di berbagai sistem
 */

import { S } from '../core/state.js';

/**
 * Tambahkan XP dan cek level up
 * @param {number} amount - Jumlah XP yang ditambahkan
 */
export function addXP(amount) {
    if (!amount || amount <= 0) return;
    
    S.xp += amount;
    
    // Cek level up
    while (S.xp >= S.xpNeeded && S.level < 100) {
        S.xp -= S.xpNeeded;
        S.level++;
        S.xpNeeded = Math.floor(S.xpNeeded * 1.2);
        
        if (window.notificationManager) {
            window.notificationManager.show(`⭐ Level Up! Sekarang level ${S.level}!`, 'success');
        }
    }
    
    // Update UI jika tersedia
    if (window.updateXPBar) {
        window.updateXPBar();
    }
}

/**
 * Cek apakah inventory penuh
 * @returns {boolean}
 */
export function isInventoryFull() {
    const maxCapacity = S.buildings.silo ? 
        (50 + (S.buildings.silo.level - 1) * 50) : 
        S.config.maxInventory;
    return S.inventory.length >= maxCapacity;
}

/**
 * Tambahkan item ke inventory
 * @param {string} itemId - ID item
 * @param {number} qty - Jumlah
 * @returns {boolean} - true jika berhasil
 */
export function addToInventory(itemId, qty = 1) {
    if (isInventoryFull()) {
        if (window.notificationManager) {
            window.notificationManager.show('⚠️ Inventory penuh!', 'warning');
        }
        return false;
    }
    
    const existingItem = S.inventory.find(item => item.id === itemId);
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        S.inventory.push({ id: itemId, qty });
    }
    
    // Trigger UI update jika tersedia
    if (window.renderInventory) {
        window.renderInventory();
    }
    
    return true;
}

/**
 * Kurangi item dari inventory
 * @param {string} itemId - ID item
 * @param {number} qty - Jumlah
 * @returns {boolean} - true jika berhasil
 */
export function removeFromInventory(itemId, qty = 1) {
    const itemIndex = S.inventory.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return false;
    
    const item = S.inventory[itemIndex];
    if (item.qty > qty) {
        item.qty -= qty;
        return true;
    } else if (item.qty === qty) {
        S.inventory.splice(itemIndex, 1);
        return true;
    }
    
    return false;
}

/**
 * Cek apakah player memiliki item tertentu
 * @param {string} itemId - ID item
 * @param {number} qty - Jumlah yang dibutuhkan
 * @returns {boolean}
 */
export function hasItem(itemId, qty = 1) {
    const item = S.inventory.find(i => i.id === itemId);
    return item && item.qty >= qty;
}

/**
 * Format angka dengan separator ribuan
 * @param {number} num - Angka yang diformat
 * @returns {string}
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Generate UUID unik
 * @returns {string}
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Clamp nilai antara min dan max
 * @param {number} value - Nilai input
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number}
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Delay/timeout promise
 * @param {number} ms - Milidetik
 * @returns {Promise}
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
