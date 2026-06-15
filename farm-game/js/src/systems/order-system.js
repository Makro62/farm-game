/**
 * Order Board System - Quest & Order Management
 * Mengelola pesanan pelanggan dengan timer dan reward
 */

import { S } from '../core/state.js';
import { CROPS } from '../data/crops.js';
import { ANIMALS } from '../data/animals.js';
import { craftingRecipes } from '../data/crafting.js';
import { notificationManager } from '../managers/notification-manager.js';
import { addXP } from '../utils/helpers.js';

// Konfigurasi Order
const ORDER_CONFIG = {
  MAX_ACTIVE_ORDERS: 5,
  REFRESH_INTERVAL: 600, // 10 menit dalam detik
  TYPES: {
    NORMAL: { name: 'Normal', timer: 600, rewardMultiplier: 1.0 },
    PREMIUM: { name: 'Premium', timer: 1200, rewardMultiplier: 2.5 },
    EXPRESS: { name: 'Express', timer: 180, rewardMultiplier: 2.0 },
  }
};

/**
 * Generate order baru secara acak
 */
export function generateOrder(type = 'normal') {
  const orderType = ORDER_CONFIG.TYPES[type.toUpperCase()] || ORDER_CONFIG.TYPES.NORMAL;
  const numItems = type === 'premium' ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 2) + 1;
  
  const items = [];
  const availableItems = [
    ...Object.keys(CROPS).map(key => ({ id: key, type: 'crop', ...CROPS[key] })),
    ...Object.keys(ANIMALS).map(key => ({ id: key, type: 'animal', ...ANIMALS[key] })),
  ];

  for (let i = 0; i < numItems; i++) {
    const item = availableItems[Math.floor(Math.random() * availableItems.length)];
    const qty = Math.floor(Math.random() * 5) + 1;
    
    // Cek apakah item sudah ada di order
    const existing = items.find(it => it.itemId === item.id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        itemId: item.id,
        qty: qty,
        name: item.name,
        emoji: item.emoji || item.productEmoji
      });
    }
  }

  // Hitung reward berdasarkan nilai item
  let baseReward = 0;
  items.forEach(item => {
    const crop = CROPS[item.itemId];
    if (crop) {
      baseReward += crop.sellPrice * item.qty;
    } else {
      const animal = ANIMALS[item.itemId];
      if (animal) {
        baseReward += animal.productSellPrice * item.qty;
      }
    }
  });

  const coins = Math.floor(baseReward * orderType.rewardMultiplier);
  const xp = Math.floor(coins / 5);

  return {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    items: items,
    reward: { coins, xp },
    timer: orderType.timer,
    maxTimer: orderType.timer,
    type: type,
    createdAt: Date.now()
  };
}

/**
 * Inisialisasi order board saat game load
 */
export function initOrderBoard() {
  if (!S.orders) {
    S.orders = [];
  }

  // Generate order awal jika kosong
  while (S.orders.length < 3) {
    const rand = Math.random();
    let type = 'normal';
    if (rand > 0.85) type = 'premium';
    else if (rand > 0.7) type = 'express';
    
    S.orders.push(generateOrder(type));
  }
}

/**
 * Update timer semua order (dipanggil setiap detik oleh game loop)
 */
export function updateOrderTimers() {
  if (!S.orders || S.orders.length === 0) return;

  const now = Date.now();
  
  S.orders = S.orders.filter(order => {
    order.timer -= 1;
    
    if (order.timer <= 0) {
      // Order expired
      notificationManager.show(`⏰ Pesanan ${order.type} expired!`, 'error');
      return false;
    }
    
    return true;
  });

  // Auto-refresh jika order kurang dari minimum
  if (S.orders.length < 2) {
    const rand = Math.random();
    let type = 'normal';
    if (rand > 0.8) type = 'premium';
    else if (rand > 0.6) type = 'express';
    
    S.orders.push(generateOrder(type));
  }
}

/**
 * Cek apakah inventory memiliki semua item yang dibutuhkan
 */
export function canFulfillOrder(order) {
  if (!order || !order.items) return false;

  for (const item of order.items) {
    const inventoryItem = S.inventory.find(inv => inv.id === item.itemId);
    if (!inventoryItem || inventoryItem.qty < item.qty) {
      return false;
    }
  }
  
  return true;
}

/**
 * Penuhi order dan berikan reward
 */
export function fulfillOrder(orderId) {
  const orderIndex = S.orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) {
    notificationManager.show('❌ Pesanan tidak ditemukan!', 'error');
    return false;
  }

  const order = S.orders[orderIndex];

  // Validasi lagi sebelum fulfill
  if (!canFulfillOrder(order)) {
    notificationManager.show('❌ Item tidak cukup di inventory!', 'error');
    return false;
  }

  // Deduct items dari inventory
  order.items.forEach(item => {
    const invIndex = S.inventory.findIndex(inv => inv.id === item.itemId);
    if (invIndex !== -1) {
      S.inventory[invIndex].qty -= item.qty;
      if (S.inventory[invIndex].qty <= 0) {
        S.inventory.splice(invIndex, 1);
      }
    }
  });

  // Berikan reward
  const prestigeMultiplier = 1 + (S.prestige * 0.1);
  const finalCoins = Math.floor(order.reward.coins * prestigeMultiplier);
  
  S.coins += finalCoins;
  addXP(order.reward.xp);

  // Update stats untuk leaderboard
  if (!S.stats) S.stats = {};
  S.stats.ordersFulfilled = (S.stats.ordersFulfilled || 0) + 1;

  // Hapus order
  S.orders.splice(orderIndex, 1);

  // Generate order pengganti
  const rand = Math.random();
  let newType = 'normal';
  if (rand > 0.85) newType = 'premium';
  else if (rand > 0.7) newType = 'express';
  
  S.orders.push(generateOrder(newType));

  notificationManager.show(
    `✅ Pesanan dipenuhi! +${finalCoins} koin, +${order.reward.xp} XP`,
    'success'
  );

  return true;
}

/**
 * Dapatkan order berdasarkan tipe
 */
export function getOrdersByType(type) {
  if (!S.orders) return [];
  return S.orders.filter(o => o.type === type);
}

/**
 * Format waktu timer untuk display
 */
export function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Render UI Order Board
 */
export function renderOrderBoard() {
  const container = document.getElementById('order-board');
  if (!container) return;

  if (!S.orders || S.orders.length === 0) {
    container.innerHTML = '<div class="empty-state">📋 Belum ada pesanan</div>';
    return;
  }

  container.innerHTML = S.orders.map(order => {
    const timeLeft = formatTimer(order.timer);
    const isUrgent = order.timer < 60;
    const canFulfill = canFulfillOrder(order);

    const itemsHtml = order.items.map(item => `
      <span class="order-item" title="${item.name} x${item.qty}">
        ${item.emoji || '❓'} x${item.qty}
      </span>
    `).join('');

    const typeClass = `order-${order.type}`;
    const urgencyClass = isUrgent ? 'urgent' : '';

    return `
      <div class="order-card ${typeClass} ${urgencyClass}" data-order-id="${order.id}">
        <div class="order-header">
          <span class="order-type-badge">${ORDER_CONFIG.TYPES[order.type.toUpperCase()].name}</span>
          <span class="order-timer ${isUrgent ? 'blinking' : ''}">⏱️ ${timeLeft}</span>
        </div>
        <div class="order-items">
          ${itemsHtml}
        </div>
        <div class="order-reward">
          💰 ${order.reward.coins} | ⭐ ${order.reward.xp} XP
        </div>
        <button 
          class="btn-fulfill ${canFulfill ? '' : 'disabled'}" 
          onclick="window.handleFulfillOrder('${order.id}')"
          ${!canFulfill ? 'disabled' : ''}
        >
          ${canFulfill ? '✅ Penuhi' : '❌ Item Kurang'}
        </button>
      </div>
    `;
  }).join('');
}

// Expose ke window untuk onclick handler
window.handleFulfillOrder = fulfillOrder;

export default {
  initOrderBoard,
  updateOrderTimers,
  fulfillOrder,
  canFulfillOrder,
  generateOrder,
  renderOrderBoard,
  formatTimer,
  getOrdersByType
};
