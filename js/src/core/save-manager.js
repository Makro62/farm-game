import { S } from './state.js';
import { CONFIG } from '../data/config.js';

let saveTimeout = null;

export function queueSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveGame(true);
    }, 5000); // Auto save after 5 seconds of inactivity
}

export function saveGame(isAuto = false) {
    try {
        S.lastSave = Date.now();
        // Basic checksum to prevent simple tampering
        const dataStr = JSON.stringify(S);
        const hash = btoa(encodeURIComponent(dataStr)).substring(0, 20); // Simple hash for now
        
        const payload = {
            data: dataStr,
            hash: hash
        };
        
        localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(payload));
        if (!isAuto) console.log('💾 Progress tersimpan secara manual!');
    } catch (e) {
        console.error('⚠️ Gagal menyimpan!', e);
    }
}

export function loadGame() {
    try {
        const saved = localStorage.getItem(CONFIG.SAVE_KEY);
        if (!saved) return false;

        let dataStr;
        // Check if it's the new format with hash, or old format
        if (saved.startsWith('{"data"')) {
            const payload = JSON.parse(saved);
            const expectedHash = btoa(encodeURIComponent(payload.data)).substring(0, 20);
            if (payload.hash !== expectedHash) {
                console.warn('⚠️ Data save corrupted or tampered!');
                // Fallback to load anyway for now, but in strict mode we'd return false
            }
            dataStr = payload.data;
        } else {
            // Old save format compatibility
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

        // Idle calculation: mature crops that should have finished
        S.plots.forEach(p => {
            if (p.state === 'growing' && Date.now() - p.plantedAt >= p.growTime) {
                p.state = 'ready';
            }
        });

        // Idle calculation: animals that should have produced
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
