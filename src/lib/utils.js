import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes dengan conditional classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format number dengan separator
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString('id-ID');
}

/**
 * Format currency
 */
export function formatCurrency(num) {
  return `${formatNumber(num)} 💰`;
}

/**
 * Format time duration
 */
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}j ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}d`;
  }
  return `${seconds}d`;
}

/**
 * Format relative time
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Baru saja';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
  return `${Math.floor(diff / 86400000)} hari lalu`;
}

export const SHOP_SEEDS = [
  { id: 'bibit_wortel', cropId: 'wortel', name: 'Bibit Wortel', price: 10, time: 15, season: 'all' },
  { id: 'bibit_jagung', cropId: 'jagung', name: 'Bibit Jagung', price: 20, time: 30, season: 'all' },
  { id: 'bibit_tomat', cropId: 'tomat', name: 'Bibit Tomat', price: 35, time: 60, season: 'all' },
  { id: 'bibit_stroberi', cropId: 'stroberi', name: 'Bibit Stroberi', price: 75, time: 120, season: 'all' },
  // Bibit Musiman
  { id: 'bibit_tulip', cropId: 'tulip', name: 'Bibit Tulip', price: 200, time: 200, season: 'spring' },
  { id: 'bibit_semangka', cropId: 'semangka', name: 'Bibit Semangka', price: 120, time: 150, season: 'summer' },
  { id: 'bibit_apel', cropId: 'apel', name: 'Bibit Apel', price: 150, time: 240, season: 'autumn' },
  { id: 'bibit_jamur', cropId: 'jamur', name: 'Spora Jamur', price: 500, time: 300, season: 'winter' },
];

export const SHOP_ANIMALS = [
  { id: 'ayam', name: 'Ayam', price: 150, time: 20, product: 'telur', productEmoji: '🥚' },
  { id: 'bebek', name: 'Bebek', price: 300, time: 40, product: 'telur_bebek', productEmoji: '🥚' },
  { id: 'sapi', name: 'Sapi', price: 500, time: 60, product: 'susu', productEmoji: '🥛' },
  { id: 'domba', name: 'Domba', price: 800, time: 90, product: 'bulu', productEmoji: '🧶' },
  { id: 'babi', name: 'Babi', price: 1200, time: 120, product: 'truffle', productEmoji: '🍄' },
  { id: 'kuda', name: 'Kuda', price: 2000, time: 150, product: 'tapal', productEmoji: '🧲' },
];

/**
 * Get item emoji (handles crops, seeds, animal products, fishes, and minerals)
 */
export function getCropEmoji(itemId) {
  if (itemId.startsWith('bibit_')) return '🌱';
  
  const emojis = {
    wortel: '🥕',
    jagung: '🌽',
    tomat: '🍅',
    stroberi: '🍓',
    nanas: '🍍',
    labu: '🎃',
    kentang: '🥔',
    gandum: '🌾',
    tulip: '🌷',
    semangka: '🍉',
    apel: '🍎',
    jamur: '🍄'
  };
  
  if (emojis[itemId]) return emojis[itemId];
  
  const animal = SHOP_ANIMALS.find(a => a.product === itemId);
  if (animal) return animal.productEmoji;
  
  const fish = FISHES.find(f => f.id === itemId);
  if (fish) return fish.emoji;
  
  const mineral = MINERALS.find(m => m.id === itemId);
  if (mineral) return mineral.emoji;
  
  return '📦';
}

export const FISHES = [
  { id: 'ikan_mas', name: 'Ikan Mas', emoji: '🐟', priceNormal: 80, priceBig: 160, chance: 0.4 },
  { id: 'lele', name: 'Lele', emoji: '🐠', priceNormal: 100, priceBig: 200, chance: 0.3 },
  { id: 'ikan_badut', name: 'Ikan Badut', emoji: '🐡', priceNormal: 200, priceBig: 400, chance: 0.15 },
  { id: 'cumi', name: 'Cumi-cumi', emoji: '🦑', priceNormal: 350, priceBig: 700, chance: 0.1 },
  { id: 'gurita', name: 'Gurita Emas', emoji: '🐙', priceNormal: 2000, priceBig: 4000, chance: 0.05 },
];

export const MINERALS = [
  { id: 'batu', name: 'Batu', emoji: '🪨', price: 5, chance: 0.8 },
  { id: 'tembaga', name: 'Tembaga', emoji: '🔶', price: 30, chance: 0.5 },
  { id: 'besi', name: 'Besi', emoji: '⚫', price: 80, chance: 0.3 },
  { id: 'emas', name: 'Emas', emoji: '🟡', price: 300, chance: 0.15 },
  { id: 'berlian', name: 'Berlian', emoji: '💎', price: 1000, chance: 0.05 },
];

export const NPC_LIST = [
  { id: 'maria', name: 'Chef Maria', role: 'Koki Kota', emoji: '👩‍🍳', likes: ['tomat', 'wortel', 'susu'], maxLevel: 5 },
  { id: 'botan', name: 'Pak Tua Botan', role: 'Ahli Tani', emoji: '🧙‍♂️', likes: ['tulip', 'semangka', 'apel'], maxLevel: 5 },
  { id: 'hadi', name: 'Paman Hadi', role: 'Peternak', emoji: '🐮', likes: ['jagung', 'gandum'], maxLevel: 5 },
];

/**
 * Get animal emoji
 */
export function getAnimalEmoji(animal) {
  const emojis = {
    ayam: '🐔',
    sapi: '🐄',
    domba: '🐑',
    babi: '🐖',
    kuda: '🐴'
  };
  return emojis[animal] || '🐾';
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(plantedAt, growTime) {
  if (!plantedAt || !growTime) return 0;
  
  const elapsed = Date.now() - plantedAt;
  const progress = (elapsed / growTime) * 100;
  
  return Math.min(100, Math.max(0, progress));
}

/**
 * Check if crop is ready
 */
export function isCropReady(plantedAt, growTime) {
  if (!plantedAt || !growTime) return false;
  return Date.now() - plantedAt >= growTime;
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Shuffle array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if device is mobile
 */
export function isMobile() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is iOS
 */
export function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Get safe area insets
 */
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') return { top: 0, bottom: 0 };
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0')
  };
}

/**
 * LocalStorage wrapper dengan expiry
 */
export const storage = {
  set: (key, value, expiryMs = null) => {
    if (typeof window === 'undefined') return;
    const item = {
      value,
      expiry: expiryMs ? Date.now() + expiryMs : null
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  get: (key) => {
    if (typeof window === 'undefined') return null;
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch (err) {
      return null;
    }
  },
  
  remove: (key) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
};
