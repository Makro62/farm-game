/**
 * MARKET SYSTEM - Dynamic Pricing
 * Mengubah harga jual tanaman setiap hari berdasarkan fluktuasi pasar
 */

import { CROPS } from '../data/crops.js';

const BASE_PRICES = {
  wortel: 15,
  jagung: 20,
  tomat: 35,
  stroberi: 75,
  nanas: 90,
  labu: 110,
  kentang: 12,
  gandum: 10
};

/**
 * Update harga pasar setiap hari baru
 * Dipanggil dari game-engine.js saat triggerNewDay()
 */
export function updateDailyMarket(state) {
  state.todayPrices = {};
  state.yesterdayPrices = state.todayPrices || {};
  state.marketTrend = state.marketTrend || {};

  for (const [cropId, basePrice] of Object.entries(BASE_PRICES)) {
    const trend = state.marketTrend[cropId] || 0;
    
    // Fluktuasi acak 70% - 130% dari harga dasar
    const randomFluctuation = 0.7 + Math.random() * 0.6;
    
    // Trend mempengaruhi harga (jika naik 2 hari berturut, kemungkinan naik lagi)
    const trendInfluence = trend * 0.1;
    
    const fluctuation = randomFluctuation + trendInfluence;
    const newPrice = Math.round(basePrice * fluctuation);
    
    state.todayPrices[cropId] = newPrice;
    
    // Update trend untuk hari berikutnya
    const yesterday = state.yesterdayPrices[cropId] || basePrice;
    if (newPrice > yesterday) {
      state.marketTrend[cropId] = Math.min(trend + 0.1, 0.5);
    } else {
      state.marketTrend[cropId] = Math.max(trend - 0.1, -0.5);
    }
  }
  
  // Simpan ke state
  if (!state.marketHistory) state.marketHistory = [];
  state.marketHistory.push({
    day: state.day,
    prices: { ...state.todayPrices }
  });
  
  // Keep hanya 7 hari terakhir
  if (state.marketHistory.length > 7) {
    state.marketHistory.shift();
  }
}

/**
 * Jual item dengan harga pasar hari ini
 */
export function sellItem(state, itemId, quantity) {
  const currentPrice = state.todayPrices?.[itemId] || BASE_PRICES[itemId] || 0;
  const totalCoins = currentPrice * quantity;
  
  // Kurangi inventory
  state.inventory[itemId] = (state.inventory[itemId] || 0) - quantity;
  if (state.inventory[itemId] <= 0) {
    delete state.inventory[itemId];
  }
  
  // Tambah koin
  state.coins += totalCoins;
  
  return {
    itemId,
    quantity,
    pricePerUnit: currentPrice,
    totalCoins,
    basePrice: BASE_PRICES[itemId] || 0,
    priceDifference: currentPrice - (BASE_PRICES[itemId] || 0)
  };
}

/**
 * Dapatkan persentase perubahan harga
 */
export function getPriceChangePercentage(itemId, state) {
  const current = state.todayPrices?.[itemId] || BASE_PRICES[itemId];
  const base = BASE_PRICES[itemId];
  const change = ((current - base) / base) * 100;
  return Math.round(change);
}

/**
 * Dapatkan prediksi harga besok (sederhana)
 */
export function predictTomorrowPrice(itemId, state) {
  const trend = state.marketTrend?.[itemId] || 0;
  const today = state.todayPrices?.[itemId] || BASE_PRICES[itemId];
  const prediction = Math.round(today * (1 + trend * 0.5));
  return prediction;
}

/**
 * Render UI Market Prices
 */
export function renderMarketPanel(state) {
  const panel = document.getElementById('market-panel');
  if (!panel) return;
  
  let html = '<h3>📈 Harga Pasar Hari Ini</h3>';
  html += '<div class="market-list">';
  
  for (const [itemId, price] of Object.entries(state.todayPrices || {})) {
    const basePrice = BASE_PRICES[itemId];
    const change = getPriceChangePercentage(itemId, state);
    const cropEmoji = getCropEmoji(itemId);
    const tomorrowPrice = predictTomorrowPrice(itemId, state);
    
    const trendClass = change >= 0 ? 'up' : 'down';
    const trendIcon = change >= 0 ? '↑' : '↓';
    
    html += `
      <div class="market-price-card">
        <div class="market-item">
          <span>${cropEmoji}</span>
          <span>${capitalizeFirst(itemId)}</span>
        </div>
        <div style="text-align: right;">
          <div class="market-price">${price} 💰</div>
          <div class="market-trend ${trendClass}">
            ${trendIcon} ${Math.abs(change)}%
          </div>
        </div>
      </div>
    `;
  }
  
  html += '</div>';
  html += '<p style="font-size: 12px; color: #718096; margin-top: 10px;">';
  html += '💡 Harga berubah setiap hari! Manfaatkan harga tinggi.</p>';
  
  panel.innerHTML = html;
}

function getCropEmoji(cropId) {
  const emojis = {
    wortel: '🥕',
    jagung: '🌽',
    tomat: '🍅',
    stroberi: '🍓',
    nanas: '🍍',
    labu: '🎃',
    kentang: '🥔',
    gandum: '🌾'
  };
  return emojis[cropId] || '🌱';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export untuk digunakan di module lain
export const MarketSystem = {
  BASE_PRICES,
  updateDailyMarket,
  sellItem,
  getPriceChangePercentage,
  predictTomorrowPrice,
  renderMarketPanel
};
