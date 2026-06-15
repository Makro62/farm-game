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
  { id: 'bibit_wortel', cropId: 'wortel', name: 'Bibit Wortel', price: 10, time: 15 },
  { id: 'bibit_jagung', cropId: 'jagung', name: 'Bibit Jagung', price: 20, time: 30 },
  { id: 'bibit_tomat', cropId: 'tomat', name: 'Bibit Tomat', price: 35, time: 60 },
  { id: 'bibit_stroberi', cropId: 'stroberi', name: 'Bibit Stroberi', price: 75, time: 120 },
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
 * Get crop emoji
 */
export function getCropEmoji(crop) {
  if (crop.startsWith('bibit_')) return '🌱';
  
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
  return emojis[crop] || '🌱';
}

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
