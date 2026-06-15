// ========================================
// FARM TYCOON - INVENTORY UI MANAGER
// ========================================

import { S } from '../core/state.js';

export function initInventoryUI() {
    setupSellAllButton();
}

export function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const totalItems = S.inventory.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('inventory-count').textContent = `${totalItems}/${S.config.maxInventory}`;
    
    S.inventory.forEach(item => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        
        const emoji = getItemEmoji(item.id);
        slot.innerHTML = `
            ${emoji}
            <span class="inv-count">${item.quantity}</span>
        `;
        
        slot.addEventListener('click', () => showItemDetails(item));
        
        grid.appendChild(slot);
    });
    
    // Fill empty slots for visual consistency
    const emptySlots = Math.min(25, S.config.maxInventory - S.inventory.length);
    for (let i = 0; i < emptySlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.style.opacity = '0.3';
        grid.appendChild(slot);
    }
}

function getItemEmoji(itemId) {
    const emojis = {
        // Crops
        carrot: '🥕',
        corn: '🌽',
        tomato: '🍅',
        strawberry: '🍓',
        pineapple: '🍍',
        pumpkin: '🎃',
        tulip: '🌷',
        watermelon: '🍉',
        apple: '🍎',
        truffle: '🍄',
        
        // Animal products
        egg: '🥚',
        milk: '🥛',
        honey: '🍯',
        wool: '🧶',
        
        // Crafted items
        carrot_soup: '🥣',
        corn_flour: '🌾',
        tomato_pie: '🥧',
        strawberry_jam: '🍓',
        cheese: '🧀',
        cake: '🎂',
        honey_premium: '🫙',
        
        // Minerals
        stone: '🪨',
        copper: '🔶',
        iron: '⚫',
        gold: '🟡',
        diamond: '💎',
        
        // Fish
        carp: '🐟',
        catfish: '🐠',
        clownfish: '🐡',
        squid: '🦑',
        octopus: '🐙',
    };
    
    return emojis[itemId] || '📦';
}

function showItemDetails(item) {
    const itemInfo = getItemInfo(item.id);
    
    window.notificationManager?.show(
        `${getItemEmoji(item.id)} ${itemInfo?.name || item.id} ×${item.quantity}`,
        'info'
    );
}

function getItemInfo(itemId) {
    // This would normally import from data files
    const info = {
        carrot: { name: 'Wortel', sellPrice: 50 },
        corn: { name: 'Jagung', sellPrice: 90 },
        tomato: { name: 'Tomat', sellPrice: 130 },
        strawberry: { name: 'Stroberi', sellPrice: 200 },
        egg: { name: 'Telur', sellPrice: 60 },
        milk: { name: 'Susu', sellPrice: 150 },
        honey: { name: 'Madu', sellPrice: 200 },
    };
    
    return info[itemId];
}

function setupSellAllButton() {
    const sellBtn = document.getElementById('btn-sell-all');
    if (sellBtn) {
        sellBtn.addEventListener('click', sellAllHarvests);
    }
}

function sellAllHarvests() {
    let totalEarned = 0;
    let itemsSold = 0;
    
    const harvestItems = [
        'carrot', 'corn', 'tomato', 'strawberry', 'pineapple', 'pumpkin',
        'tulip', 'watermelon', 'apple', 'truffle',
        'egg', 'milk', 'honey', 'wool',
    ];
    
    // Sell harvest items
    for (const itemId of harvestItems) {
        const itemIndex = S.inventory.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            const item = S.inventory[itemIndex];
            const sellPrice = getItemSellPrice(itemId);
            
            totalEarned += sellPrice * item.quantity;
            itemsSold += item.quantity;
            
            S.inventory.splice(itemIndex, 1);
        }
    }
    
    if (itemsSold > 0) {
        S.coins += totalEarned;
        
        window.notificationManager?.show(
            `✅ Terjual ${itemsSold} item seharga 💰 ${totalEarned.toLocaleString()}!`,
            'success'
        );
        
        updateTopbar();
        renderInventory();
    } else {
        window.notificationManager?.show('⚠️ Tidak ada hasil panen untuk dijual', 'warning');
    }
}

function getItemSellPrice(itemId) {
    const prices = {
        carrot: 50,
        corn: 90,
        tomato: 130,
        strawberry: 200,
        pineapple: 350,
        pumpkin: 700,
        tulip: 400,
        watermelon: 300,
        apple: 250,
        truffle: 1200,
        egg: 60,
        milk: 150,
        honey: 200,
        wool: 180,
        stone: 5,
        copper: 30,
        iron: 80,
        gold: 300,
        diamond: 1000,
    };
    
    let price = prices[itemId] || 10;
    
    // Autumn bonus: +30% sell price
    if (S.season.current === 'autumn') {
        price = Math.floor(price * 1.3);
    }
    
    return price;
}

function updateTopbar() {
    document.getElementById('coin-val').textContent = S.coins.toLocaleString();
    document.getElementById('level-val').textContent = S.level;
}

// Export for global access
window.renderInventory = renderInventory;
