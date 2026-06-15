// ========================================
// FARM TYCOON - GAME ENGINE
// Core game loop and tick system
// ========================================

import { S } from './state.js';
import { updateOrderTimers } from '../systems/order-system.js';
import { updateMiningProgress } from '../systems/mining-system.js';

let gameLoopId = null;
let lastTickTime = Date.now();
let weatherTimer = 300;  // 5 menit untuk cuaca berikutnya
let seasonTickTimer = 60;  // 60 detik real-time = 1 hari in-game

export function initGameEngine() {
    console.log('🎮 Game Engine initialized');
    
    // Start game loop
    gameLoop();
    
    // Weather change timer (setiap 5 menit)
    setInterval(() => {
        updateWeather();
    }, 5000);  // Untuk testing: 5 detik. Production: 300000 (5 menit)
    
    // Season tick timer (setiap 60 detik = 1 hari in-game)
    setInterval(() => {
        updateSeason();
    }, 10000);  // Untuk testing: 10 detik. Production: 60000 (1 menit)
    
    // Auto-save timer (setiap 30 detik)
    setInterval(() => {
        if (window.saveGame) {
            window.saveGame();
        }
    }, 30000);
    
    // Gnome auto-farm loop (setiap 5 detik)
    setInterval(() => {
        runGnomeFarmer();
        runGnomeRancher();
    }, 5000);
}

function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTickTime;
    
    // Update every 1 second
    if (deltaTime >= 1000) {
        gameTick();
        lastTickTime = currentTime;
    }
    
    // Continue loop
    gameLoopId = requestAnimationFrame(gameLoop);
}

function gameTick() {
    // Update crop growth
    updateCrops();
    
    // Update animal production
    updateAnimals();
    
    // Update crafting queue
    updateCraftingQueue();
    
    // Update order timers (NEW)
    updateOrderTimers();
    
    // Update mining progress (NEW)
    updateMiningProgress();
    
    // Update mine nodes regeneration
    updateMineNodes();
    
    // Render updates
    if (window.renderFarm) window.renderFarm();
    if (window.updateTopbar) window.updateTopbar();
    if (window.renderOrderBoard) window.renderOrderBoard();
    if (window.renderMiningGrid) window.renderMiningGrid();
}

function updateCrops() {
    const now = Date.now();
    
    S.plots.forEach(plot => {
        if (plot.state === 'growing' && plot.plantedAt) {
            const cropConfig = getCropConfig(plot.cropId);
            if (!cropConfig) return;
            
            // Calculate grow time with modifiers
            let growTime = cropConfig.growTime * 1000;  // Convert to ms
            
            // Water bonus: -30%
            if (plot.watered) {
                growTime *= 0.7;
            }
            
            // Weather modifier
            const weatherModifiers = {
                sunny: 1.0,
                cloudy: 1.05,
                rain: 0.8,
                storm: 1.3,
                windy: 0.9,
            };
            
            const weatherMod = weatherModifiers[S.weather.current] || 1.0;
            
            // Check if weather is negated by greenhouse
            if (isWeatherNegated(S.weather.current)) {
                growTime *= 1.0;  // No effect
            } else {
                growTime *= weatherMod;
            }
            
            // Building modifier (Water Tower)
            const waterTowerLevel = S.buildings.waterTower?.level || 1;
            const buildingMod = 1 - (Math.min(waterTowerLevel * 10, 50) / 100);
            growTime *= buildingMod;
            
            // Season modifier
            if (S.season.current === 'spring') {
                growTime *= 0.9;  // +10% faster in spring
            }
            
            // Calculate progress
            const elapsed = now - plot.plantedAt;
            const progress = Math.min(100, (elapsed / growTime) * 100);
            
            plot.growthStage = progress;
            
            // Check if ready to harvest
            if (progress >= 100) {
                plot.state = 'ready';
                plot.growthStage = 100;
                
                window.notificationManager?.show('✨ Tanaman siap panen!', 'success');
            }
        }
    });
}

function updateAnimals() {
    const now = Date.now();
    
    S.animals.forEach(animal => {
        const animalConfig = getAnimalConfig(animal.type);
        if (!animalConfig) return;
        
        const productionInterval = animalConfig.productionInterval * 1000;
        const elapsed = now - animal.lastProductTime;
        
        if (elapsed >= productionInterval) {
            // Animal produced!
            const product = {
                id: `${animal.type}_product_${Date.now()}`,
                animalId: animal.id,
                productId: animalConfig.product,
                x: animal.x,
                y: animal.y - 5,
            };
            
            S.animalProducts.push(product);
            animal.lastProductTime = now;
            
            // Show bubble notification
            showProductBubble(animal);
        }
        
        // Move animal slightly
        moveAnimal(animal);
    });
}

function moveAnimal(animal) {
    const speed = 2;
    const newX = animal.x + (Math.random() - 0.5) * speed;
    const newY = animal.y + (Math.random() - 0.5) * speed;
    
    // Clamp to boundaries
    animal.x = Math.max(5, Math.min(90, newX));
    animal.y = Math.max(5, Math.min(85, newY));
    
    // Update DOM if exists
    const el = document.getElementById(`animal-${animal.id}`);
    if (el) {
        el.style.left = `${animal.x}%`;
        el.style.top = `${animal.y}%`;
    }
}

function showProductBubble(animal) {
    // Visual feedback for product ready
    const pen = document.getElementById('animal-pen');
    if (!pen) return;
    
    const bubble = document.createElement('div');
    bubble.className = 'animal-product';
    bubble.textContent = '💭';
    bubble.style.left = `${animal.x}%`;
    bubble.style.top = `${animal.y - 10}%`;
    
    pen.appendChild(bubble);
    
    setTimeout(() => bubble.remove(), 2000);
}

function updateCraftingQueue() {
    if (S.craftingQueue.length === 0) return;
    
    const now = Date.now();
    const currentCraft = S.craftingQueue[0];
    
    const elapsed = now - currentCraft.startTime;
    const progress = Math.min(100, (elapsed / currentCraft.duration) * 100);
    
    currentCraft.progress = progress;
    
    if (progress >= 100) {
        // Crafting complete
        completeCraft(currentCraft);
        S.craftingQueue.shift();
        
        // Start next craft if available
        if (S.craftingQueue.length > 0) {
            S.craftingQueue[0].startTime = now;
        }
    }
}

function completeCraft(craft) {
    const recipe = getRecipe(craft.recipeId);
    if (!recipe) return;
    
    // Add output to inventory
    const output = recipe.output;
    addToInventory(output.item, output.quantity);
    
    // Add XP
    addXP(recipe.xp);
    
    window.notificationManager?.show(`✅ ${recipe.name} selesai dibuat!`, 'success');
}

function updateOrders() {
    // Decrease order timers
    S.orders.forEach((order, index) => {
        order.timer -= 1;
        
        if (order.timer <= 0) {
            // Order expired
            S.orders.splice(index, 1);
            window.notificationManager?.show('⏰ Pesanan expired!', 'warning');
            
            // Generate new order
            generateOrder();
        }
    });
    
    // Generate new orders if needed
    if (S.orders.length < 3) {
        generateOrder();
    }
}

function updateMineNodes() {
    const now = Date.now();
    
    S.mining.nodes.forEach(node => {
        if (node.depleted && node.regenTime) {
            if (now >= node.regenTime) {
                node.depleted = false;
                node.regenTime = null;
            }
        }
    });
}

function updateWeather() {
    const weathers = ['sunny', 'cloudy', 'rain', 'storm', 'windy'];
    const weights = [35, 25, 20, 10, 10];  // Probability weights
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedWeather = 'sunny';
    for (let i = 0; i < weathers.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            selectedWeather = weathers[i];
            break;
        }
    }
    
    S.weather.current = selectedWeather;
    
    // Apply weather class to body
    document.body.className = `weather-${selectedWeather} season-${S.season.current}`;
    
    window.notificationManager?.show(`🌤️ Cuaca berubah: ${getWeatherName(selectedWeather)}`, 'info');
}

function updateSeason() {
    S.season.tick++;
    
    if (S.season.tick >= 30) {  // 30 ticks = 1 hari
        S.season.tick = 0;
        S.season.day++;
        
        if (S.season.day > 7) {  // 7 hari = 1 musim
            S.season.day = 1;
            advanceSeason();
        }
    }
}

function advanceSeason() {
    const order = ['spring', 'summer', 'autumn', 'winter'];
    const idx = order.indexOf(S.season.current);
    S.season.current = order[(idx + 1) % 4];
    
    // Update body class
    document.body.className = `season-${S.season.current}`;
    
    window.notificationManager?.show(
        `🍂 Musim berganti ke ${getSeasonName(S.season.current)}!`,
        'success'
    );
}

function runGnomeFarmer() {
    if (!S.gnomes.farmer.active) return;
    
    // Auto-harvest ready crops
    S.plots.forEach((plot, index) => {
        if (plot.state === 'ready') {
            // Simulate harvest
            plot.state = 'empty';
            plot.cropId = null;
            
            window.notificationManager?.show('🧙‍♂️ Kurcaci memanen tanaman!', 'info');
        }
    });
}

function runGnomeRancher() {
    if (!S.gnomes.rancher.active) return;
    
    // Auto-collect animal products
    if (S.animalProducts.length > 0) {
        S.animalProducts = [];
        window.notificationManager?.show('🧑‍🍳 Kurcaci mengumpulkan produk hewan!', 'info');
    }
}

// Helper functions
function getCropConfig(cropId) {
    const configs = {
        carrot: { growTime: 30 },
        corn: { growTime: 60 },
        tomato: { growTime: 90 },
        strawberry: { growTime: 120 },
        pineapple: { growTime: 180 },
        pumpkin: { growTime: 300 },
    };
    return configs[cropId];
}

function getAnimalConfig(animalId) {
    const configs = {
        chicken: { product: 'egg', productionInterval: 60 },
        cow: { product: 'milk', productionInterval: 120 },
        bee: { product: 'honey', productionInterval: 180 },
    };
    return configs[animalId];
}

function getRecipe(recipeId) {
    return { name: 'Item', xp: 10, output: { item: 'product', quantity: 1 } };
}

function addToInventory(itemId, quantity) {
    const existing = S.inventory.find(item => item.id === itemId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        S.inventory.push({ id: itemId, quantity });
    }
}

function addXP(amount) {
    S.xp += amount;
    while (S.xp >= S.xpToNextLevel) {
        S.xp -= S.xpToNextLevel;
        S.level++;
        S.xpToNextLevel = Math.floor(S.xpToNextLevel * 1.5);
        window.notificationManager?.show(`⭐ Level Up! Level ${S.level}`, 'success');
    }
}

function isWeatherNegated(weatherType) {
    const greenhouseLevel = S.buildings.greenhouse?.level || 0;
    if (greenhouseLevel === 0) return false;
    
    const negatedWeathers = {
        1: ['storm'],
        2: ['storm', 'cloudy'],
        3: ['storm', 'cloudy', 'windy'],
    };
    
    return (negatedWeathers[greenhouseLevel] || []).includes(weatherType);
}

function getWeatherName(weather) {
    const names = {
        sunny: 'Cerah',
        cloudy: 'Berawan',
        rain: 'Hujan',
        storm: 'Badai',
        windy: 'Berangin',
    };
    return names[weather] || weather;
}

function getSeasonName(season) {
    const names = {
        spring: 'Semi',
        summer: 'Panas',
        autumn: 'Gugur',
        winter: 'Dingin',
    };
    return names[season] || season;
}

function generateOrder() {
    // Simple order generation
    const items = ['carrot', 'corn', 'egg', 'milk'];
    const item = items[Math.floor(Math.random() * items.length)];
    const qty = Math.floor(Math.random() * 5) + 1;
    
    S.orders.push({
        id: `order_${Date.now()}`,
        items: [{ itemId: item, quantity: qty }],
        reward: { coins: qty * 100, xp: qty * 10 },
        timer: 600,  // 10 minutes
        type: 'normal',
    });
}
