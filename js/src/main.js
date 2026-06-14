import { initGame } from './core/game-engine.js';
import { saveGame } from './core/save-manager.js';
import { S, GameState } from './core/state.js';

import { UIManager } from './managers/ui-manager.js';
import { AudioManager } from './managers/audio-manager.js';
import { NotificationManager } from './managers/notification-manager.js';

// Import all to ensure they attach
import './utils/helpers.js';
import { renderShop, renderCropList, renderDecorations, renderAnimalsList, renderFishShopList } from './ui/shop-ui.js';
import { renderGrid, renderAnimals, renderFishes } from './ui/farm-ui.js';
import { renderInventory, renderQuests, renderOrders } from './ui/inventory-ui.js';
import { renderBuildings } from './ui/building-ui.js';
import { renderCrafting } from './ui/crafting-ui.js';
import { setupTabs } from './ui/core-ui.js';
import './systems/crop-system.js';
import './systems/animal-system.js';
import './systems/fish-system.js';
import './systems/economy-system.js';
import { claimDaily } from './systems/quest-system.js';
import './systems/gnome-system.js';
import './systems/weather-system.js';

// Re-bind render functions to window for game loop and cross-module access
window.renderShop = renderShop;
window.renderCropList = renderCropList;
window.renderDecorations = renderDecorations;
window.renderAnimalsList = renderAnimalsList;
window.renderFishShopList = renderFishShopList;
window.renderGrid = renderGrid;
window.renderAnimals = renderAnimals;
window.renderFishes = renderFishes;
window.renderInventory = renderInventory;
window.renderQuests = renderQuests;
window.renderOrders = renderOrders;
window.renderBuildings = renderBuildings;
window.renderCrafting = renderCrafting;

// Entry Point
document.addEventListener('DOMContentLoaded', () => {
    AudioManager.init();
    UIManager.initEvents();
    setupTabs();
    initGame();
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    const cropKeys = { '1':'carrot', '2':'corn', '3':'tomato', '4':'strawberry', '5':'pineapple', '6':'pumpkin' };
    if (cropKeys[e.key]) { 
        GameState.selectedCrop = cropKeys[e.key]; 
        renderCropList(); 
    }
    else if (e.key === 's' || e.key === 'S') saveGame(true);
    else if (e.key === 'd' || e.key === 'D') {
        claimDaily();
    }
    else if (e.key === 'Escape') {
        NotificationManager.closeModal();
    }
});
