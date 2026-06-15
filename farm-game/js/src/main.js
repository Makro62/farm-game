// ========================================
// FARM TYCOON - MAIN ENTRY POINT
// ========================================

import { S } from './core/state.js';
import { initGameEngine } from './core/game-engine.js';
import { initUI } from './ui/core-ui.js';
import { initFarmUI, renderFarm } from './ui/farm-ui.js';
import { initShopUI } from './ui/shop-ui.js';
import { initInventoryUI } from './ui/inventory-ui.js';
import { initNotificationManager } from './managers/notification-manager.js';

// Import sistem baru
import { initOrderBoard, updateOrderTimers, renderOrderBoard } from './systems/order-system.js';
import { initNPCSystem, renderNPCDialog } from './systems/npc-system.js';
import { initMiningSystem, updateMiningProgress, renderMiningGrid } from './systems/mining-system.js';
import { initFishingSystem, renderFishingArea } from './systems/fishing-system.js';

// Make S globally accessible for other modules
window.S = S;

// ========================================
// INITIALIZATION
// ========================================

export function initGame() {
    console.log('🌾 Farm Tycoon - Initializing...');
    
    // Load saved game
    loadGame();
    
    // Initialize all systems
    initNotificationManager();
    initUI();
    initFarmUI();
    initShopUI();
    initInventoryUI();
    
    // Initialize new systems
    initOrderBoard();
    initNPCSystem();
    initMiningSystem();
    initFishingSystem();
    
    // Start game engine
    initGameEngine();
    
    // Render initial state
    renderAll();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    console.log('✅ Game initialized successfully!');
}

function renderAll() {
    renderFarm();
    updateTopbar();
    renderInventory();
    renderShop();
    renderOrderBoard();
    renderMiningGrid();
    renderFishingArea();
}

function updateTopbar() {
    document.getElementById('coin-val').textContent = S.coins.toLocaleString();
    document.getElementById('level-val').textContent = S.level;
    
    const xpPercent = (S.xp / S.xpToNextLevel) * 100;
    document.getElementById('xp-bar-fill').style.width = `${xpPercent}%`;
    
    // Update weather
    const weatherEmoji = {
        sunny: '☀️',
        cloudy: '⛅',
        rain: '🌧️',
        storm: '⛈️',
        windy: '💨',
    };
    
    const weatherText = {
        sunny: 'Cerah',
        cloudy: 'Berawan',
        rain: 'Hujan',
        storm: 'Badai',
        windy: 'Berangin',
    };
    
    document.getElementById('weather-chip').querySelector('span:first-child').textContent = weatherEmoji[S.weather.current];
    document.getElementById('weather-text').textContent = weatherText[S.weather.current];
    
    // Update season
    const seasonEmoji = {
        spring: '🌸',
        summer: '☀️',
        autumn: '🍂',
        winter: '❄️',
    };
    
    const seasonText = {
        spring: 'Semi',
        summer: 'Panas',
        autumn: 'Gugur',
        winter: 'Dingin',
    };
    
    document.getElementById('season-chip').querySelector('span:first-child').textContent = seasonEmoji[S.season.current];
    document.getElementById('season-text').textContent = seasonText[S.season.current];
    
    // Apply season class to body
    document.body.className = `season-${S.season.current}`;
}

function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const totalItems = S.inventory.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('inventory-count').textContent = `${totalItems}/${S.config.maxInventory}`;
    
    // Render inventory slots
    S.inventory.forEach(item => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        
        const emoji = getItemEmoji(item.id);
        slot.innerHTML = `
            ${emoji}
            <span class="inv-count">${item.quantity}</span>
        `;
        
        grid.appendChild(slot);
    });
    
    // Fill empty slots
    const emptySlots = S.config.maxInventory - S.inventory.length;
    for (let i = 0; i < emptySlots && i < 25; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.style.opacity = '0.3';
        grid.appendChild(slot);
    }
}

function renderShop() {
    const seedShop = document.getElementById('seed-shop');
    if (!seedShop) return;
    
    seedShop.innerHTML = '';
    
    const availableCrops = getAvailableCropsForCurrentSeason();
    
    availableCrops.forEach(crop => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `
            <div style="font-size: 24px;">${crop.name.split(' ')[0]}</div>
            <div style="font-size: 12px;">${crop.name.split(' ').slice(1).join(' ')}</div>
            <div style="color: #FFD700; font-size: 14px;">💰 ${crop.buyPrice}</div>
            <div style="font-size: 11px; color: #aaa;">⏱️ ${crop.growTime}s</div>
        `;
        
        item.addEventListener('click', () => selectSeed(crop.id));
        
        seedShop.appendChild(item);
    });
}

function getAvailableCropsForCurrentSeason() {
    // Import dari crops.js akan di-setup nanti
    const allCrops = {
        carrot: { id: 'carrot', name: '🥕 Wortel', buyPrice: 15, growTime: 30 },
        corn: { id: 'corn', name: '🌽 Jagung', buyPrice: 30, growTime: 60 },
        tomato: { id: 'tomato', name: '🍅 Tomat', buyPrice: 50, growTime: 90 },
        strawberry: { id: 'strawberry', name: '🍓 Stroberi', buyPrice: 70, growTime: 120 },
        pineapple: { id: 'pineapple', name: '🍍 Nanas', buyPrice: 100, growTime: 180 },
        pumpkin: { id: 'pumpkin', name: '🎃 Labu Emas', buyPrice: 200, growTime: 300 },
    };
    
    return Object.values(allCrops);
}

function selectSeed(cropId) {
    S.selectedSeed = cropId;
    
    // Update UI selection
    document.querySelectorAll('.shop-item').forEach(el => {
        el.classList.remove('active');
        el.style.borderColor = 'transparent';
    });
    
    event.currentTarget.style.borderColor = '#4CAF50';
    event.currentTarget.classList.add('active');
    
    window.notificationManager?.show(`🌱 Bibit ${cropId} dipilih! Klik tanah untuk menanam`, 'info');
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Save: S key
        if (e.key === 's' || e.key === 'S') {
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                saveGame();
            }
        }
        
        // Tab switching: 1-5
        if (e.key >= '1' && e.key <= '5') {
            const tabs = ['farm', 'animals', 'city', 'mine', 'lake'];
            const tabIndex = parseInt(e.key) - 1;
            switchTab(tabs[tabIndex]);
        }
        
        // Seed selection: 6-9
        if (e.key >= '6' && e.key <= '9') {
            const seeds = ['carrot', 'corn', 'tomato', 'strawberry'];
            const seedIndex = parseInt(e.key) - 6;
            selectSeed(seeds[seedIndex]);
        }
    });
}

function switchTab(tabName) {
    // Remove active from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activate selected tab
    const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`tab-${tabName}`);
    
    if (selectedBtn && selectedContent) {
        selectedBtn.classList.add('active');
        selectedContent.classList.add('active');
    }
}

// ========================================
// SAVE/LOAD SYSTEM
// ========================================

const SAVE_KEY = 'farmGame_save';
const HASH_KEY = 'farmGame_hash';
const SECRET_SALT = 'farm_tycoon_secret_salt_2026';

async function saveGame() {
    try {
        const saveData = JSON.stringify(S);
        const hash = await generateHash(saveData + SECRET_SALT);
        
        localStorage.setItem(SAVE_KEY, saveData);
        localStorage.setItem(HASH_KEY, hash);
        
        window.notificationManager?.show('💾 Game tersimpan!', 'success');
    } catch (error) {
        console.error('Save error:', error);
        window.notificationManager?.show('❌ Gagal menyimpan game', 'error');
    }
}

function loadGame() {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        const storedHash = localStorage.getItem(HASH_KEY);
        
        if (!saveData) {
            console.log('No save found, starting new game');
            return;
        }
        
        // Verify hash
        generateHash(saveData + SECRET_SALT).then(computedHash => {
            if (computedHash !== storedHash) {
                console.warn('⚠️ Hash mismatch! Possible cheat detected');
                window.notificationManager?.show('⚠️ Save file corrupted, starting new game', 'warning');
                return;
            }
            
            // Parse and merge with default state
            const parsed = JSON.parse(saveData);
            Object.assign(S, parsed);
            
            console.log('✅ Game loaded successfully');
            window.notificationManager?.show('💾 Game dimuat!', 'success');
        });
    } catch (error) {
        console.error('Load error:', error);
        window.notificationManager?.show('❌ Gagal memuat game', 'error');
    }
}

async function generateHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Export functions for global access
window.saveGame = saveGame;
window.switchTab = switchTab;
window.selectSeed = selectSeed;

// Auto-start game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
