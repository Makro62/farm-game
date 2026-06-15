import { S } from '../core/state.js';
import { BUILDINGS } from '../data/buildings.js';
import { queueSave } from '../core/save-manager.js';
import { AudioManager } from '../managers/audio-manager.js';
import { NotificationManager } from '../managers/notification-manager.js';

export function getBuildingLevel(id) {
    return S.buildings[id] || 0;
}

export function getBuildingEffect(id) {
    const level = getBuildingLevel(id);
    const building = BUILDINGS[id];
    if (!building) return 0;
    const lvData = building.levels[level];
    return lvData ? lvData.effect : 0;
}

export function upgradeBuilding(id) {
    const building = BUILDINGS[id];
    if (!building) return;

    const currentLevel = getBuildingLevel(id);
    if (currentLevel >= building.maxLevel) {
        AudioManager.playSound('error');
        NotificationManager.toast('Bangunan sudah level maksimal!', 'warn');
        return;
    }

    const nextLevelData = building.levels[currentLevel + 1];
    if (S.coins < nextLevelData.cost) {
        AudioManager.playSound('error');
        NotificationManager.toast('💰 Koin tidak cukup untuk upgrade!', 'warn');
        return;
    }

    S.coins -= nextLevelData.cost;
    S.buildings[id] = currentLevel + 1;
    
    AudioManager.playSound('levelup');
    NotificationManager.toast(`🏗️ ${building.name} di-upgrade ke Level ${currentLevel + 1}!`, 'success');

    // Handle special immediate side effects like Silo capacity
    if (id === 'silo') {
        S.inventoryCapacity = getBuildingEffect('silo');
    }

    if (typeof window.render === 'function') window.render();
    if (typeof window.renderBuildings === 'function') window.renderBuildings();
    queueSave();
}
