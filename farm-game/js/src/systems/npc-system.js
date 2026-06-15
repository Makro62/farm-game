/**
 * NPC & Friendship System
 * Sistem pertemanan dengan NPC yang memiliki preferensi item unik
 */

import { S } from '../core/state.js';
import { notificationManager } from '../managers/notification-manager.js';
import { CROPS } from '../data/crops.js';
import { ANIMALS } from '../data/animals.js';
import { craftingRecipes } from '../data/crafting.js';

// Definisi NPC
export const NPCS = {
  chef_maria: {
    id: 'chef_maria',
    name: 'Chef Maria',
    emoji: '👩‍🍳',
    location: 'Town Square',
    description: 'Koki terkenal yang menyukai produk crafting berkualitas',
    favorites: ['cake', 'tomato_pie', 'carrot_soup', 'cheese'],
    liked: ['bread', 'jam', 'flour'],
    disliked: ['raw_crops'],
    rewards: {
      1: { type: 'dialog', desc: 'Unlock dialog dan hint item favorit' },
      3: { type: 'discount', value: 0.05, desc: 'Diskon 5% crafting' },
      5: { type: 'item', itemId: 'golden_whisk', desc: 'Golden Whisk (crafting speed +10%)' },
      7: { type: 'recipe', recipeId: 'legendary_cake', desc: 'Resep Legendary Cake' },
      10: { type: 'permanent', desc: 'Crafting speed +20% permanent' }
    }
  },
  botan: {
    id: 'botan',
    name: 'Pak Tua Botan',
    emoji: '🧙‍♂️',
    location: 'Pinggir Farm',
    description: 'Ahli tanaman tua yang mencintai bibit langka',
    favorites: ['pineapple', 'golden_pumpkin', 'truffle', 'tulip'],
    liked: ['strawberry', 'tomato', 'apple'],
    disliked: ['basic_crops'],
    rewards: {
      1: { type: 'dialog', desc: 'Unlock dialog dan tip tanaman' },
      3: { type: 'discount', value: 0.10, desc: 'Diskon 10% bibit langka' },
      5: { type: 'item', itemId: 'magical_seeds', desc: 'Magical Seeds (tumbuh 3x lebih cepat)' },
      7: { type: 'unlock', feature: 'rare_seeds_shop', desc: 'Akses toko bibit langka' },
      10: { type: 'permanent', desc: 'Grow time -15% permanent' }
    }
  },
  ben: {
    id: 'ben',
    name: 'Saudagar Ben',
    emoji: '🏪',
    location: 'Pasar',
    description: 'Pedagang kaya yang menghargai hasil panen melimpah',
    favorites: ['golden_pumpkin', 'corn', 'wheat', 'large_harvest'],
    liked: ['carrot', 'potato', 'cabbage'],
    disliked: ['small_harvest'],
    rewards: {
      1: { type: 'dialog', desc: 'Unlock dialog dan info harga pasar' },
      3: { type: 'discount', value: 0.05, desc: 'Diskon 5% di toko umum' },
      5: { type: 'item', itemId: 'premium_market_pass', desc: 'Premium Market Pass' },
      7: { type: 'unlock', feature: 'premium_market', desc: 'Unlock Premium Market (harga jual ×2)' },
      10: { type: 'permanent', desc: 'Sell price +10% permanent' }
    }
  },
  hadi: {
    id: 'hadi',
    name: 'Paman Hadi',
    emoji: '🐮',
    location: 'Area Peternakan',
    description: 'Peternak senior yang mencintai hewan dan produknya',
    favorites: ['cow', 'bee', 'honey', 'milk'],
    liked: ['chicken', 'egg', 'sheep'],
    disliked: ['neglected_animals'],
    rewards: {
      1: { type: 'dialog', desc: 'Unlock dialog dan tip peternakan' },
      3: { type: 'discount', value: 0.10, desc: 'Diskon 10% beli hewan' },
      5: { type: 'item', itemId: 'animal_treat', desc: 'Animal Treat (produksi +20% untuk 1 hari)' },
      7: { type: 'unlock', feature: 'legendary_animals', desc: 'Akses hewan legendary' },
      10: { type: 'permanent', desc: 'Animal production interval -15%' }
    }
  }
};

/**
 * Inisialisasi data NPC di state
 */
export function initNPCSystem() {
  if (!S.npcFriendship) {
    S.npcFriendship = {};
    
    Object.keys(NPCS).forEach(npcId => {
      S.npcFriendship[npcId] = {
        level: 0,
        points: 0,
        lastGiftDate: null,
        unlockedRewards: []
      };
    });
  }
}

/**
 * Hitung poin friendship berdasarkan item yang diberikan
 */
export function calculateGiftPoints(itemId, npcId) {
  const npc = NPCS[npcId];
  if (!npc) return 0;

  // Cek apakah item adalah crafted item
  const recipe = craftingRecipes.find(r => r.id === itemId);
  const crop = CROPS[itemId];
  const animal = ANIMALS[itemId];

  let itemValue = 0;
  let itemType = 'neutral';

  if (recipe) {
    itemValue = recipe.craftTime / 60; // Berdasarkan waktu crafting
    if (npc.favorites.includes(itemId)) {
      itemType = 'favorite';
    } else if (npc.liked.includes(itemId)) {
      itemType = 'liked';
    }
  } else if (crop) {
    itemValue = crop.sellPrice;
    if (npc.favorites.includes(itemId)) {
      itemType = 'favorite';
    } else if (npc.liked.includes(itemId)) {
      itemType = 'liked';
    } else if (npc.disliked.includes('raw_crops')) {
      itemType = 'disliked';
    }
  } else if (animal) {
    itemValue = animal.productSellPrice;
    if (npc.favorites.includes(itemId)) {
      itemType = 'favorite';
    } else if (npc.liked.includes(itemId)) {
      itemType = 'liked';
    }
  }

  // Multiplier berdasarkan tipe
  let multiplier = 1.0;
  if (itemType === 'favorite') multiplier = 2.0;
  else if (itemType === 'liked') multiplier = 1.5;
  else if (itemType === 'disliked') multiplier = 0.5;

  return Math.floor(itemValue * multiplier);
}

/**
 * Berikan hadiah ke NPC
 */
export function giveGiftToNPC(npcId, itemId, quantity = 1) {
  const npc = NPCS[npcId];
  if (!npc) {
    notificationManager.show('❌ NPC tidak ditemukan!', 'error');
    return false;
  }

  // Cek cooldown harian
  const today = new Date().toDateString();
  if (S.npcFriendship[npcId].lastGiftDate === today) {
    notificationManager.show(`⏰ Sudah memberikan hadiah ke ${npc.name} hari ini!`, 'warning');
    return false;
  }

  // Cek item di inventory
  const invIndex = S.inventory.findIndex(inv => inv.id === itemId);
  if (invIndex === -1 || S.inventory[invIndex].qty < quantity) {
    notificationManager.show('❌ Item tidak cukup di inventory!', 'error');
    return false;
  }

  // Deduct item
  S.inventory[invIndex].qty -= quantity;
  if (S.inventory[invIndex].qty <= 0) {
    S.inventory.splice(invIndex, 1);
  }

  // Hitung dan tambahkan poin
  const points = calculateGiftPoints(itemId, npcId) * quantity;
  S.npcFriendship[npcId].points += points;
  S.npcFriendship[npcId].lastGiftDate = today;

  // Cek level up
  checkLevelUp(npcId);

  const friendship = S.npcFriendship[npcId];
  notificationManager.show(
    `🎁 ${npc.name} senang! +${points} poin friendship (Total: ${friendship.points})`,
    'success'
  );

  return true;
}

/**
 * Cek dan handle level up friendship
 */
function checkLevelUp(npcId) {
  const friendship = S.npcFriendship[npcId];
  const npc = NPCS[npcId];
  
  // Threshold level: Lv1=100, Lv2=300, Lv3=600, Lv4=1000, Lv5=1500, dst
  const thresholds = [100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6500];
  const newLevel = thresholds.findIndex((threshold, idx) => 
    friendship.points < threshold && (idx === 0 || friendship.points >= thresholds[idx - 1])
  );

  const actualNewLevel = newLevel === -1 ? thresholds.length : newLevel;

  if (actualNewLevel > friendship.level) {
    const oldLevel = friendship.level;
    friendship.level = actualNewLevel;

    // Berikan reward
    const reward = npc.rewards[actualNewLevel];
    if (reward) {
      giveReward(npcId, reward, actualNewLevel);
    }

    notificationManager.show(
      `🎉 Pertemanan dengan ${npc.name} naik ke Level ${actualNewLevel}!`,
      'special'
    );
  }
}

/**
 * Berikan reward ke pemain
 */
function giveReward(npcId, reward, level) {
  const npc = NPCS[npcId];
  
  // Tandai reward sudah diklaim
  S.npcFriendship[npcId].unlockedRewards.push(level);

  switch (reward.type) {
    case 'dialog':
      notificationManager.show(`💬 ${npc.name} sekarang mau berbicara denganmu!`, 'info');
      break;
    
    case 'discount':
      notificationManager.show(`💰 Unlock diskon ${reward.value * 100}% untuk ${npc.name}!`, 'success');
      // Simpan discount di state global
      if (!S.npcDiscounts) S.npcDiscounts = {};
      S.npcDiscounts[npcId] = reward.value;
      break;
    
    case 'item':
      // Tambahkan item ke inventory
      const existingItem = S.inventory.find(inv => inv.id === reward.itemId);
      if (existingItem) {
        existingItem.qty++;
      } else {
        S.inventory.push({ id: reward.itemId, qty: 1 });
      }
      notificationManager.show(`🎁 Mendapat item: ${reward.desc}`, 'success');
      break;
    
    case 'recipe':
      if (!S.unlockedRecipes) S.unlockedRecipes = [];
      if (!S.unlockedRecipes.includes(reward.recipeId)) {
        S.unlockedRecipes.push(reward.recipeId);
        notificationManager.show(`📜 Resep baru terbuka: ${reward.desc}`, 'success');
      }
      break;
    
    case 'unlock':
      if (!S.unlockedFeatures) S.unlockedFeatures = [];
      if (!S.unlockedFeatures.includes(reward.feature)) {
        S.unlockedFeatures.push(reward.feature);
        notificationManager.show(`🔓 Fitur baru terbuka: ${reward.desc}`, 'success');
      }
      break;
    
    case 'permanent':
      notificationManager.show(`⭐ Buff permanent: ${reward.desc}`, 'special');
      // Permanent buffs disimpan di state untuk referensi
      if (!S.permanentBuffs) S.permanentBuffs = [];
      S.permanentBuffs.push({ npcId, type: reward.desc, level });
      break;
  }
}

/**
 * Dapatkan info friendship NPC
 */
export function getNPCFriendshipInfo(npcId) {
  const npc = NPCS[npcId];
  const friendship = S.npcFriendship[npcId];
  
  if (!npc || !friendship) return null;

  // Threshold untuk level berikutnya
  const thresholds = [100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6500];
  const nextThreshold = thresholds[friendship.level] || thresholds[thresholds.length - 1];
  const progress = ((friendship.points / nextThreshold) * 100).toFixed(1);

  return {
    ...npc,
    friendship: {
      level: friendship.level,
      points: friendship.points,
      nextLevel: friendship.level + 1,
      progress: Math.min(100, progress),
      lastGiftDate: friendship.lastGiftDate,
      canGiftToday: friendship.lastGiftDate !== new Date().toDateString()
    },
    unlockedRewards: friendship.unlockedRewards
  };
}

/**
 * Render UI NPC dialog
 */
export function renderNPCDialog(npcId) {
  const info = getNPCFriendshipInfo(npcId);
  if (!info) return;

  const container = document.getElementById('npc-dialog-container');
  if (!container) return;

  const favoriteItems = info.favorites.map(id => {
    const crop = CROPS[id];
    const animal = ANIMALS[id];
    const recipe = craftingRecipes.find(r => r.id === id);
    const item = crop || animal || recipe;
    return item ? `${item.emoji || '❓'} ${item.name}` : '';
  }).join(', ');

  container.innerHTML = `
    <div class="npc-dialog">
      <div class="npc-header">
        <span class="npc-emoji">${info.emoji}</span>
        <div class="npc-info">
          <h3>${info.name}</h3>
          <p class="npc-location">📍 ${info.location}</p>
        </div>
      </div>
      
      <p class="npc-description">${info.description}</p>
      
      <div class="friendship-panel">
        <div class="friendship-level">
          <span>Level ${info.friendship.level}</span>
          <span>→ Level ${info.friendship.nextLevel}</span>
        </div>
        <div class="friendship-bar">
          <div class="friendship-progress" style="width: ${info.friendship.progress}%"></div>
        </div>
        <div class="friendship-points">
          ${info.friendship.points} / ${Math.round(info.friendship.points * (100 / info.friendship.progress))} poin
        </div>
      </div>
      
      <div class="gift-preferences">
        <h4>❤️ Disukai:</h4>
        <p>${favoriteItems}</p>
      </div>
      
      <div class="gift-actions">
        <h4>🎁 Berikan Hadiah:</h4>
        <select id="gift-item-select">
          <option value="">Pilih item...</option>
          ${S.inventory.map(item => {
            const crop = CROPS[item.id];
            const animal = ANIMALS[item.id];
            const recipe = craftingRecipes.find(r => r.id === item.id);
            const itemName = (crop || animal || recipe || {}).name || item.id;
            const itemEmoji = (crop || animal || recipe || {}).emoji || '📦';
            return `<option value="${item.id}">${itemEmoji} ${itemName} x${item.qty}</option>`;
          }).join('')}
        </select>
        <button onclick="window.handleGiveGift('${npcId}')">
          ${info.friendship.canGiftToday ? '🎁 Beri Hadiah' : '⏰ Sudah Hari Ini'}
        </button>
      </div>
      
      <div class="rewards-list">
        <h4>🏆 Reward Terbuka:</h4>
        ${Object.keys(info.rewards).map(level => {
          const reward = info.rewards[level];
          const unlocked = info.unlockedRewards.includes(parseInt(level));
          const available = parseInt(level) <= info.friendship.level;
          return `
            <div class="reward-item ${unlocked ? 'unlocked' : ''} ${!available ? 'locked' : ''}">
              <span>Lv ${level}: ${reward.desc}</span>
              ${unlocked ? '✅' : !available ? '🔒' : '⏳'}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Expose ke window untuk onclick handler
window.handleGiveGift = (npcId) => {
  const select = document.getElementById('gift-item-select');
  if (!select || !select.value) {
    notificationManager.show('❌ Pilih item terlebih dahulu!', 'warning');
    return;
  }
  giveGiftToNPC(npcId, select.value);
  setTimeout(() => renderNPCDialog(npcId), 500);
};

export default {
  NPCS,
  initNPCSystem,
  giveGiftToNPC,
  calculateGiftPoints,
  getNPCFriendshipInfo,
  renderNPCDialog
};
