import { S, GameState } from './state.js';
import { CONFIG, WEATHERS } from '../data/config.js';
import { loadGame, saveGame } from './save-manager.js';
import { processGnome } from '../systems/gnome-system.js';
import { processWeather } from '../systems/weather-system.js';
import { processAnimalLoop } from '../systems/animal-system.js';
import { processCraftingQueue } from '../systems/crafting-system.js';

export function gameLoop() {
    let changed = false;

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
        if (typeof window.renderWanderingAnimals === 'function') {
            window.renderWanderingAnimals();
        }
    }

    // 4. Gnome auto-farmer
    processGnome();

    // 5. Fishing (Moved directly into engine for now)
    GameState.fishTimer++;
    if (GameState.fishTimer >= 10) {
        GameState.fishTimer = 0;
        if (!GameState.fishActive && Math.random() < 0.1) {
            GameState.fishActive = true;
            const splash = document.getElementById('fish-splash');
            if (splash) {
                splash.textContent = Math.random() > 0.5 ? '🐟' : '💦';
                splash.style.display = 'block';
                splash.style.left = (20 + Math.random() * 60) + '%';
                splash.style.top = (20 + Math.random() * 60) + '%';
                setTimeout(() => {
                    if (GameState.fishActive) {
                        GameState.fishActive = false;
                        splash.style.display = 'none';
                    }
                }, 3000);
            }
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
}

export async function initGame() {
    const loaded = await loadGame();
    if (!loaded) {
        S.plots = [];
        for (let i = 0; i < CONFIG.GRID_SIZE; i++) {
            S.plots.push({ id: i, state: 'grass', crop: null, plantedAt: 0, growTime: 0 });
        }
        if (typeof window.generateQuests === 'function') window.generateQuests();
        
        if (typeof window.NotificationManager !== 'undefined') {
            window.NotificationManager.toast('🌾 Selamat datang di Farm Tycoon!', 'success');
        } else {
            window.toast('🌾 Selamat datang di Farm Tycoon!', 'success');
        }
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
