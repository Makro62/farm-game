import { initGame } from './core/game-engine.js';
import { saveGame } from './core/save-manager.js';
import { S, GameState } from './core/state.js';

import { UIManager } from './managers/ui-manager.js';
import { AudioManager } from './managers/audio-manager.js';
import { NotificationManager } from './managers/notification-manager.js';

// Import all to ensure they attach
import './utils/helpers.js';
import { renderShop, renderCropList, renderDecorations, renderAnimalsList } from './ui/shop-ui.js';
import { renderGrid, renderWanderingAnimals } from './ui/farm-ui.js';
import { renderInventory, renderQuests, renderOrders } from './ui/inventory-ui.js';
import { renderBuildings } from './ui/building-ui.js';
import { renderCrafting } from './ui/crafting-ui.js';
import './ui/core-ui.js';
import './systems/crop-system.js';
import './systems/animal-system.js';
import './systems/economy-system.js';
import { claimDaily } from './systems/quest-system.js';
import './systems/gnome-system.js';
import './systems/weather-system.js';

// Re-bind imported specific exports to window for `render` to find
window.renderShop = renderShop;
window.renderCropList = renderCropList;
window.renderDecorations = renderDecorations;
window.renderAnimalsList = renderAnimalsList;
window.renderGrid = renderGrid;
window.renderWanderingAnimals = renderWanderingAnimals;
window.renderInventory = renderInventory;
window.renderQuests = renderQuests;
window.renderOrders = renderOrders;
window.renderBuildings = renderBuildings;
window.renderCrafting = renderCrafting;

// Expose S and GameState for debugging if needed
window.S = S;
window.GameState = GameState;
window.NotificationManager = NotificationManager;

// Entry Point
document.addEventListener('DOMContentLoaded', () => {
    AudioManager.init();
    UIManager.initEvents();
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
