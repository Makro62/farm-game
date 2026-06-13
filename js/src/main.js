import { initGame } from './core/game-engine.js';
import { saveGame } from './core/save-manager.js';
import { S, GameState } from './core/state.js';

// Import all to ensure they attach to window
import './utils/helpers.js';
import { renderShop, renderCropList, renderDecorations, renderAnimalsList } from './ui/shop-ui.js';
import { renderGrid, renderWanderingAnimals } from './ui/farm-ui.js';
import { renderInventory, renderQuests, renderOrders } from './ui/inventory-ui.js';
import './ui/core-ui.js';
import './systems/crop-system.js';
import './systems/animal-system.js';
import './systems/economy-system.js';
import './systems/quest-system.js';
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

// Modal Helpers
window.showModal = function(title, msg, onOk) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-msg').textContent = msg;
    document.getElementById('modal').classList.add('show');
    document.getElementById('modal-ok').onclick = () => { window.closeModal(); onOk(); };
}
window.closeModal = function() { document.getElementById('modal').classList.remove('show'); }
window.saveGame = saveGame;

// Expose S and GameState for debugging if needed
window.S = S;
window.GameState = GameState;

// Entry Point
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    const cropKeys = { '1':'carrot', '2':'corn', '3':'tomato', '4':'strawberry', '5':'pineapple', '6':'pumpkin' };
    if (cropKeys[e.key]) { 
        GameState.selectedCrop = cropKeys[e.key]; 
        if (typeof window.renderCropList === 'function') window.renderCropList(); 
    }
    else if (e.key === 's' || e.key === 'S') saveGame(true);
    else if (e.key === 'd' || e.key === 'D') {
        if (typeof window.claimDaily === 'function') window.claimDaily();
    }
    else if (e.key === 'Escape') {
        if (typeof window.closeModal === 'function') window.closeModal();
    }
});
