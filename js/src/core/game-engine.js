import { S, GameState } from './state.js';
import { CONFIG, WEATHERS } from '../data/config.js';
import { loadGame, saveGame } from './save-manager.js';
import { processGnome } from '../systems/gnome-system.js';
import { processWeather } from '../systems/weather-system.js';
import { processAnimalLoop } from '../systems/animal-system.js';
import { processFishLoop } from '../systems/fish-system.js';
import { processCraftingQueue } from '../systems/crafting-system.js';
import { NotificationManager } from '../managers/notification-manager.js';

export function gameLoop() {
    let changed = false;

    try {
        // 1. Cek tanaman matang
        S.plots.forEach(p => {
            if (p.state === 'growing') {
                const elapsed = Date.now() - p.plantedAt;
                if (elapsed >= p.growTime) {
                    p.state = 'ready';
                    changed = true;
                }
            }
        });

        // 2. Cek cuaca
        processWeather();

        // 3. Animal wandering & production
        const animalChanged = processAnimalLoop();
        if (animalChanged) {
            if (typeof window.renderAnimals === 'function') {
                window.renderAnimals();
            }
        }

        // 4. Gnome auto-farmer
        processGnome();

        // 5. Fish farming loop
        const fishChanged = processFishLoop();
        if (fishChanged) {
            if (typeof window.renderFishes === 'function') {
                window.renderFishes();
            }
        }

        // 6. Order regeneration
        if (!S.orders || S.orders.length === 0) {
            if (typeof window.generateOrder === 'function') {
                S.orders = [window.generateOrder(), window.generateOrder(), window.generateOrder()];
                if (typeof window.renderOrders === 'function') window.renderOrders();
            }
        }

        // 7. Crafting Queue Processing
        const craftingChanged = processCraftingQueue();
        if (craftingChanged && typeof window.renderCrafting === 'function') {
            window.renderCrafting();
        }

        // 8. Render updates
        if (changed && typeof window.renderGrid === 'function') window.renderGrid();
        if (typeof window.updateTopbar === 'function') window.updateTopbar();
        if (typeof window.updateBoosters === 'function') window.updateBoosters();
    } catch (err) {
        console.error('[GameLoop Error]', err);
        // We do not stop the loop, we catch it so it doesn't break the setInterval
    }
}

export async function initGame() {
    const loaded = await loadGame();
    if (!loaded) {
        S.plots = [];
        for (let i = 0; i < CONFIG.GRID_SIZE; i++) {
            S.plots.push({ id: i, state: 'grass', crop: null, plantedAt: 0, growTime: 0 });
        }
        if (typeof window.generateQuests === 'function') window.generateQuests();
        NotificationManager.toast('🌾 Selamat datang di Farm Tycoon!', 'success');
    }
    
    if (!S.quests || !S.quests.length) {
        if (typeof window.generateQuests === 'function') window.generateQuests();
    }
    
    if (!S.orders || !S.orders.length) {
        if (typeof window.generateOrder === 'function') {
            S.orders = [window.generateOrder(), window.generateOrder(), window.generateOrder()];
        }
    }

    if (typeof window.render === 'function') window.render();
    
    // Main Game Loop
    setInterval(gameLoop, 1000);
}
