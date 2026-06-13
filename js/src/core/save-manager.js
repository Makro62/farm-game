import { S } from './state.js';
import { CONFIG } from '../data/config.js';
import { generateHash, verifyHash } from './security.js';

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
        if (saved.startsWith('{"data"')) {
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
        } else {
            // Very old save format
            dataStr = saved;
        }

        const data = JSON.parse(dataStr);

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
        if (S.inventoryCapacity === undefined) S.inventoryCapacity = 50;
        if (!S.buildings) S.buildings = { silo: 0, barn: 0, watertower: 0, greenhouse: 0, windmill: 0 };
        if (!S.craftingQueue) S.craftingQueue = [];

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
