import { initGame } from './core/game-engine.js';
import { saveGame } from './core/save-manager.js';
import { S, GameState } from './core/state.js';

import { UIManager } from './managers/ui-manager.js';
import { AudioManager } from './managers/audio-manager.js';
import { NotificationManager } from './managers/notification-manager.js';

// Import all to ensure they attach
import './utils/helpers.js';
import { renderShop, renderCropList, renderDecorations, renderAnimalsList, renderFishShopList, renderFishMarket } from './ui/shop-ui.js';
import { renderGrid, renderAnimals, renderFishes, renderTownWorker } from './ui/farm-ui.js';
import { renderInventory, renderQuests, renderOrders } from './ui/inventory-ui.js';
import { renderBuildings } from './ui/building-ui.js';
import { renderCrafting } from './ui/crafting-ui.js';
import { setupTabs } from './ui/core-ui.js';
import './systems/crop-system.js';
import './systems/animal-system.js';
import './systems/fish-system.js';
import './systems/economy-system.js';
import { claimDaily } from './systems/quest-system.js';
import { WheelSystem } from './systems/wheel-system.js';
import { StreakSystem } from './systems/streak-system.js';
import './systems/gnome-system.js';
import './systems/weather-system.js';

// Re-bind render functions to window for game loop and cross-module access
window.renderShop = renderShop;
window.renderCropList = renderCropList;
window.renderDecorations = renderDecorations;
window.renderAnimalsList = renderAnimalsList;
window.renderFishShopList = renderFishShopList;
window.renderFishMarket = renderFishMarket;
window.renderGrid = renderGrid;
window.renderAnimals = renderAnimals;
window.renderFishes = renderFishes;
window.renderTownWorker = renderTownWorker;
window.renderInventory = renderInventory;
window.renderQuests = renderQuests;
window.renderOrders = renderOrders;
window.renderBuildings = renderBuildings;
window.renderCrafting = renderCrafting;

window.cheatCoin = function() {
    S.coins += 10000;
    AudioManager.playSound('coin');
    NotificationManager.toast('💰 Cheat: +10,000 Coin!', 'success');
    
    // Update coin UI manually since game loop might not update it immediately
    const elCoin = document.getElementById('coin-val');
    if (elCoin) elCoin.textContent = S.coins.toLocaleString();
};

// Entry Point
document.addEventListener('DOMContentLoaded', () => {
    AudioManager.init();
    UIManager.initEvents();
    setupTabs();
    initGame().then(() => {
        setTimeout(() => {
            StreakSystem.claimDailyStreak(S);
            StreakSystem.renderStreakIndicator(S);
        }, 1000);
    });

    const btnWheel = document.getElementById('btn-open-wheel');
    if(btnWheel) btnWheel.addEventListener('click', () => WheelSystem.renderWheelModal(S));
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    const cropKeys = { '1':'potato', '2':'wheat', '3':'corn', '4':'carrot', '5':'tomato' };
    if (cropKeys[e.key]) { 
        GameState.selectedCrop = cropKeys[e.key]; 
        renderCropList(); 
    }
    else if (e.key === 's' || e.key === 'S') saveGame(true);
    else if (e.key === 'd' || e.key === 'D') {
        claimDaily();
    }
    else if (e.key === 'c' || e.key === 'C') {
        window.cheatCoin();
    }
    else if (e.key === 'Escape') {
        NotificationManager.closeModal();
    }
});
