import { S } from './state.js';
import { CONFIG } from '../data/config.js';
import { generateHash, verifyHash } from './security.js';

const SAVE_VERSION = 3;

let saveTimeout = null;

export function queueSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveGame(true);
    }, 5000); // Auto save after 5 seconds of inactivity
}

export async function saveGame(isAuto = false) {
    try {
        S.lastSave = Date.now();
        const dataStr = JSON.stringify(S);
        const hash = await generateHash(dataStr);
        
        const payload = {
            version: SAVE_VERSION,
            data: dataStr,
            hash: hash
        };
        
        localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(payload));
        if (!isAuto && typeof window.NotificationManager !== 'undefined') {
            window.NotificationManager.toast('💾 Progress tersimpan secara manual!', 'success');
        } else if (!isAuto) {
            console.log('💾 Progress tersimpan secara manual!');
        }
    } catch (e) {
        console.error('⚠️ Gagal menyimpan!', e);
    }
}

export async function loadGame() {
    try {
        const saved = localStorage.getItem(CONFIG.SAVE_KEY);
        if (!saved) return false;

        let dataStr;
        let saveVersion = 1;
        if (saved.startsWith('{"data"') || saved.startsWith('{"version"')) {
            const payload = JSON.parse(saved);
            const isValid = await verifyHash(payload.data, payload.hash);
            
            // Temporary backward compatibility check for old simple hash if SHA256 fails
            const oldExpectedHash = btoa(encodeURIComponent(payload.data)).substring(0, 20);
            
            if (!isValid && payload.hash !== oldExpectedHash) {
                console.error('⛔ KEAMANAN DILANGGAR: Data save telah dimanipulasi! Load dibatalkan.');
                if (typeof window.NotificationManager !== 'undefined') {
                    window.NotificationManager.toast('⛔ Save Data Corrupted / Tampered!', 'error');
                }
                return false; // REJECT LOAD!
            }
            dataStr = payload.data;
            saveVersion = payload.version || 1;
        } else {
            // Very old save format
            dataStr = saved;
        }

        let data = JSON.parse(dataStr);
        data = migrateSave(data, saveVersion);

        // Basic validation
        if (typeof data.coins !== 'number' || data.coins < 0) return false;
        if (!Array.isArray(data.plots) || data.plots.length !== CONFIG.GRID_SIZE) return false;

        // Apply loaded data to S object
        Object.assign(S, data);

        // Backward compatibility
        if (!S.animals) S.animals = [];
        if (!S.orders) S.orders = [];
        if (!S.decorations) S.decorations = [];
        if (!S.achievements) S.achievements = [];
        if (!S.fishes) S.fishes = [];
        if (S.inventoryCapacity === undefined) S.inventoryCapacity = 50;
        if (!S.buildings) S.buildings = { silo: 0, barn: 0, watertower: 0, greenhouse: 0, windmill: 0 };
        if (!S.craftingQueue) S.craftingQueue = [];
        
        // Gnome transition
        if (S.gnomeOwned !== undefined) {
            if (S.gnomeFarmOwned === undefined) S.gnomeFarmOwned = S.gnomeOwned;
            if (S.gnomeFarmActive === undefined) S.gnomeFarmActive = S.gnomeActive;
            delete S.gnomeOwned;
            delete S.gnomeActive;
        }

        // Idle calculation
        S.plots.forEach(p => {
            if (p.state === 'growing' && Date.now() - p.plantedAt >= p.growTime) {
                p.state = 'ready';
            }
        });

        if (S.animals) {
            S.animals.forEach(a => {
                if (!a.readyToCollect && Date.now() >= a.nextProduceAt) {
                    a.readyToCollect = true;
                }
                if (!a.nextMoveAt) a.nextMoveAt = Date.now() + 2000;
            });
        }

        return true;
    } catch (e) {
        console.error('Load failed:', e);
    }
    return false;
}

function migrateSave(data, oldVersion) {
    // Migration logic
    if (oldVersion < 2) {
        data.prestige = data.prestige ?? 0;
        if (!data.buildings) data.buildings = { silo: 0, barn: 0, watertower: 0, greenhouse: 0, windmill: 0 };
    }
    if (oldVersion < 3) {
        if (!data.fishes) data.fishes = [];
        if (!data.craftingQueue) data.craftingQueue = [];
        if (data.inventoryCapacity === undefined) data.inventoryCapacity = 50;
    }
    return data;
}
