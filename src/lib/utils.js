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
  if (!Number.isFinite(num)) return '0';
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

export const CROP_DATA = {
  wortel: { name: 'Wortel', emoji: '🥕' },
  jagung: { name: 'Jagung', emoji: '🌽' },
  tomat: { name: 'Tomat', emoji: '🍅' },
  stroberi: { name: 'Stroberi', emoji: '🍓' },
  semangka: { name: 'Semangka', emoji: '🍉' },
  jamur: { name: 'Jamur', emoji: '🍄' },
  nanas: { name: 'Nanas', emoji: '🍍' },
  labu: { name: 'Labu', emoji: '🎃' },
  kentang: { name: 'Kentang', emoji: '🥔' },
  gandum: { name: 'Gandum', emoji: '🌾' },
  tebu: { name: 'Tebu', emoji: '🎋' },
  tulip: { name: 'Tulip', emoji: '🌷' },
  apel: { name: 'Apel', emoji: '🍎' },
};

export const SHOP_SEEDS = [
  { id: 'bibit_wortel', cropId: 'wortel', name: 'Bibit Wortel', emoji: '🥕', price: 10, time: 15, season: 'all' },
  { id: 'bibit_jagung', cropId: 'jagung', name: 'Bibit Jagung', emoji: '🌽', price: 20, time: 30, season: 'all' },
  { id: 'bibit_tomat', cropId: 'tomat', name: 'Bibit Tomat', emoji: '🍅', price: 35, time: 60, season: 'summer' },
  { id: 'bibit_stroberi', cropId: 'stroberi', name: 'Bibit Stroberi', emoji: '🍓', price: 75, time: 120, season: 'spring' },
  { id: 'bibit_tulip', cropId: 'tulip', name: 'Bibit Tulip', emoji: '🌷', price: 100, time: 100, season: 'spring' },
  { id: 'bibit_gandum', cropId: 'gandum', name: 'Bibit Gandum', emoji: '🌾', price: 90, time: 135, season: 'autumn' },
  { id: 'bibit_tebu', cropId: 'tebu', name: 'Bibit Tebu', emoji: '🎋', price: 110, time: 140, season: 'summer' },
  { id: 'bibit_semangka', cropId: 'semangka', name: 'Bibit Semangka', emoji: '🍉', price: 120, time: 150, season: 'summer' },
  { id: 'bibit_apel', cropId: 'apel', name: 'Bibit Apel', emoji: '🍎', price: 140, time: 180, season: 'autumn' },
  { id: 'bibit_labu', cropId: 'labu', name: 'Bibit Labu', emoji: '🎃', price: 160, time: 200, season: 'autumn' },
  { id: 'bibit_jamur', cropId: 'jamur', name: 'Spora Jamur', emoji: '🍄', price: 500, time: 300, season: 'winter' },
];

export const SHOP_DECORATIONS = [
  { id: 'bunga', name: 'Pot Bunga', emoji: '🪴', price: 300, desc: 'Hiasan halaman (+5 XP saat beli)' },
  { id: 'air_mancur', name: 'Air Mancur', emoji: '⛲', price: 800, desc: 'Suasana kota lebih hidup' },
  { id: 'patung', name: 'Patung Koin', emoji: '🗿', price: 1500, desc: 'Bonus prestige visual' },
];

export const SHOP_BUILDINGS = [
  { id: 'silo', name: 'Silo', emoji: '🏚️', price: 2000, desc: 'Hasil jual tanaman +15%' },
  { id: 'greenhouse', name: 'Greenhouse', emoji: '🏠', price: 5000, desc: 'Tanam bibit luar musim' },
];

export const SHOP_BAIT = [
  { id: 'umpan_biasa', name: 'Umpan Biasa', emoji: '🪱', price: 15, waitMult: 0.85, rareBonus: 0, desc: 'Gigitan lebih cepat' },
  { id: 'umpan_premium', name: 'Umpan Premium', emoji: '🦐', price: 60, waitMult: 0.55, rareBonus: 0.12, desc: 'Cepat + chance ikan langka' },
  { id: 'umpan_emas', name: 'Umpan Emas', emoji: '✨', price: 150, waitMult: 0.4, rareBonus: 0.25, desc: 'Chance rare tertinggi' },
];

export const SHOP_ANIMALS = [
  { id: 'ayam', name: 'Ayam', price: 150, time: 20, product: 'telur', productEmoji: '🥚', image: '/img/animals/chicken.png' },
  { id: 'bebek', name: 'Bebek', price: 300, time: 40, product: 'telur_bebek', productEmoji: '🥚', image: '/img/animals/duck.png' },
  { id: 'sapi', name: 'Sapi', price: 500, time: 60, product: 'susu', productEmoji: '🥛', image: '/img/animals/cow.png' },
  { id: 'domba', name: 'Domba', price: 800, time: 90, product: 'bulu', productEmoji: '🧶', image: '/img/animals/sheep.png' },
  { id: 'babi', name: 'Babi', price: 1200, time: 120, product: 'truffle', productEmoji: '🍄', image: '/img/animals/pig.png' },
  { id: 'kuda', name: 'Kuda', price: 2000, time: 150, product: 'tapal', productEmoji: '🧲', image: '/img/animals/horse.png' },
];

export const SHOP_MINING = [
  { id: 'bom_kecil', name: 'Bom Kecil', emoji: '🧨', price: 50, desc: '×2 hasil / buka petak tertutup' },
  { id: 'bom_besar', name: 'Bom Besar', emoji: '💣', price: 150, desc: 'Tambang semua petak siap' },
  { id: 'pickaxe_besi', name: 'Pickaxe Besi', emoji: '⛏️', price: 300, desc: 'Regen 90 detik' },
  { id: 'pickaxe_emas', name: 'Pickaxe Emas', emoji: '🛠️', price: 800, desc: 'Regen 60 detik + rare ore' },
  { id: 'senter', name: 'Senter Goa', emoji: '🔦', price: 120, desc: 'Buff 5 menit regen cepat' },
  { id: 'tali', name: 'Tali Tambang', emoji: '🪢', price: 60, desc: 'Pulihkan 1 petak tertutup' },
];

export const PICKAXE_LABELS = {
  1: { name: 'Cangkul Kayu', emoji: '🪨', regen: '120 detik' },
  2: { name: 'Pickaxe Besi', emoji: '⛏️', regen: '90 detik' },
  3: { name: 'Pickaxe Emas', emoji: '🛠️', regen: '60 detik' },
};

/**
 * Lookup bibit / tanaman dari shop
 */
export function getShopSeed(itemId) {
  return SHOP_SEEDS.find((s) => s.id === itemId);
}

/**
 * Emoji tanaman berdasarkan cropId (hasil panen)
 */
export function getCropEmojiById(cropId) {
  if (!cropId) return '📦';
  const seed = SHOP_SEEDS.find((s) => s.cropId === cropId);
  if (seed?.emoji) return seed.emoji;
  return CROP_DATA[cropId]?.emoji || '📦';
}

/**
 * Get item emoji (handles crops, seeds, animal products, fishes, and minerals)
 */
export function getCropEmoji(itemId) {
  if (!itemId) return '📦';

  const seed = getShopSeed(itemId);
  if (seed) return seed.emoji || getCropEmojiById(seed.cropId);

  if (itemId.startsWith('bibit_')) {
    const cropId = itemId.replace('bibit_', '');
    return getCropEmojiById(cropId);
  }

  if (CROP_DATA[itemId]?.emoji) return CROP_DATA[itemId].emoji;
  
  const animal = SHOP_ANIMALS.find(a => a.product === itemId);
  if (animal) return animal.productEmoji;
  
  const fish = FISHES.find(f => f.id === itemId);
  if (fish) return fish.emoji;
  
  const mineral = MINERALS.find(m => m.id === itemId);
  if (mineral) return mineral.emoji;
  
  const recipe = RECIPES.find(r => r.id === itemId);
  if (recipe) return recipe.emoji;
  
  const miningTool = SHOP_MINING.find(m => m.id === itemId);
  if (miningTool) return miningTool.emoji;

  const bait = SHOP_BAIT.find((b) => b.id === itemId);
  if (bait) return bait.emoji;
  
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
  { id: 'maria', name: 'Chef Maria', role: 'Koki Kota', emoji: '🍳', likes: ['tomat', 'wortel', 'susu'], maxLevel: 5 },
  { id: 'botan', name: 'Pak Tua Botan', role: 'Ahli Tani', emoji: '👴', likes: ['tulip', 'semangka', 'apel'], maxLevel: 5 },
  { id: 'hadi', name: 'Paman Hadi', role: 'Peternak', emoji: '🐮', likes: ['jagung', 'gandum'], maxLevel: 5 },
];

/**
 * Get shop animal data by type id (supports legacy English keys from old saves)
 */
export function getShopAnimal(type) {
  const legacyMap = {
    chicken: 'ayam',
    duck: 'bebek',
    cow: 'sapi',
    sheep: 'domba',
    pig: 'babi',
    horse: 'kuda',
  };
  const id = legacyMap[type] || type;
  return SHOP_ANIMALS.find(a => a.id === id);
}

/**
 * Get animal emoji
 */
export function getAnimalEmoji(animal) {
  const emojis = {
    ayam: '🐔',
    bebek: '🦆',
    sapi: '🐄',
    domba: '🐑',
    babi: '🐖',
    kuda: '🐴',
    chicken: '🐔',
    duck: '🦆',
    cow: '🐄',
    sheep: '🐑',
    pig: '🐖',
    horse: '🐴',
  };
  return emojis[animal] || '🐾';
}

/**
 * Harga jual per item di inventory. null = tidak bisa dijual.
 */
export function getItemSellPrice(itemId) {
  const seedData = SHOP_SEEDS.find(s => s.id === itemId);
  if (seedData) return Math.floor(seedData.price * 0.5);

  const cropData = SHOP_SEEDS.find(s => s.cropId === itemId);
  if (cropData) return Math.floor(cropData.price * 1.5);

  const animalProduct = SHOP_ANIMALS.find(a => a.product === itemId);
  if (animalProduct) return Math.floor(animalProduct.price * 0.5);

  const fishData = FISHES.find(f => f.id === itemId);
  if (fishData) return fishData.priceNormal ?? 0;

  const baitData = SHOP_BAIT.find((b) => b.id === itemId);
  if (baitData) return Math.floor(baitData.price * 0.4);

  const mineralData = MINERALS.find(m => m.id === itemId);
  if (mineralData) return mineralData.price;

  const recipeData = RECIPES.find(r => r.id === itemId);
  if (recipeData) return recipeData.price;

  return null;
}

/**
 * Hasil yang boleh dijual lewat "Jual Semua" — exclude bibit, umpan, alat tambang.
 */
export function isSellableProduce(itemId) {
  if (!itemId) return false;
  if (SHOP_SEEDS.some((s) => s.id === itemId)) return false;
  if (SHOP_BAIT.some((b) => b.id === itemId)) return false;
  if (SHOP_MINING.some((m) => m.id === itemId)) return false;
  return getItemSellPrice(itemId) != null;
}

/**
 * Nama tampilan item inventory
 */
export function getItemDisplayName(itemId) {
  const seedData = SHOP_SEEDS.find(s => s.id === itemId);
  if (seedData) return seedData.name;

  const cropData = SHOP_SEEDS.find(s => s.cropId === itemId);
  if (cropData) return cropData.name.replace('Bibit ', '');

  const animalProduct = SHOP_ANIMALS.find(a => a.product === itemId);
  if (animalProduct) return animalProduct.productEmoji + ' ' + (animalProduct.product.replace('_', ' '));

  const fishData = FISHES.find(f => f.id === itemId);
  if (fishData) return fishData.name;

  const baitData = SHOP_BAIT.find((b) => b.id === itemId);
  if (baitData) return baitData.name;

  const mineralData = MINERALS.find(m => m.id === itemId);
  if (mineralData) return mineralData.name;

  const recipeData = RECIPES.find(r => r.id === itemId);
  if (recipeData) return recipeData.name;
  
  const miningTool = SHOP_MINING.find(m => m.id === itemId);
  if (miningTool) return miningTool.name;

  return itemId;
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

/**
 * Daftar resep crafting
 */
export const RECIPES = [
  // Dapur Produksi
  { id: 'sup_wortel', name: 'Sup Wortel', emoji: '🥣', type: 'kitchen', time: 180, price: 150, xp: 50, req: { wortel: 4 } },
  { id: 'tepung_jagung', name: 'Tepung Jagung', emoji: '🌾', type: 'kitchen', time: 180, price: 200, xp: 60, req: { jagung: 4 } },
  { id: 'keju', name: 'Keju', emoji: '🧀', type: 'kitchen', time: 300, price: 400, xp: 120, req: { susu: 3 } },
  
  // Restoran Dewi Hidangan
  { id: 'kue_stroberi', name: 'Kue Stroberi', emoji: '🍰', type: 'restaurant', time: 600, price: 800, xp: 200, req: { stroberi: 3, telur: 2, susu: 1, tebu: 1 } },
  { id: 'kue_wortel', name: 'Kue Wortel', emoji: '🥕', type: 'restaurant', time: 480, price: 600, xp: 150, req: { wortel: 3, gandum: 2, telur: 1, tebu: 1 } },
  { id: 'kue_apel', name: 'Kue Apel', emoji: '🥧', type: 'restaurant', time: 540, price: 750, xp: 180, req: { apel: 3, gandum: 2, susu: 1, tebu: 1 } },
  { id: 'kue_manis', name: 'Kue Manis', emoji: '🥮', type: 'restaurant', time: 400, price: 500, xp: 120, req: { gandum: 2, susu: 2, tebu: 2 } },
  
  // Dapur Ikan
  { id: 'sushi_mas', name: 'Sushi Ikan Mas', emoji: '🍣', type: 'fish_kitchen', time: 240, price: 300, xp: 100, req: { ikan_mas: 2, tomat: 2 } },
  { id: 'lele_bakar', name: 'Lele Bakar', emoji: '🍢', type: 'fish_kitchen', time: 300, price: 400, xp: 150, req: { lele: 2, jagung: 1 } },
  { id: 'takoyaki', name: 'Takoyaki', emoji: '🧆', type: 'fish_kitchen', time: 360, price: 1000, xp: 300, req: { cumi: 2, telur: 2 } },
];

/**
 * Template untuk pesanan di Papan Pesanan
 */
export const ORDER_TEMPLATES = [
  // Mudah
  { tier: 1, timer: 600, items: [{id: 'wortel', qty: 5}, {id: 'jagung', qty: 3}], coins: 200, xp: 100 },
  { tier: 1, timer: 600, items: [{id: 'tomat', qty: 4}, {id: 'telur', qty: 2}], coins: 250, xp: 120 },
  // Menengah
  { tier: 2, timer: 900, items: [{id: 'stroberi', qty: 5}, {id: 'susu', qty: 2}], coins: 600, xp: 250 },
  { tier: 2, timer: 900, items: [{id: 'semangka', qty: 2}, {id: 'ikan_mas', qty: 2}], coins: 800, xp: 300 },
  // Sulit
  { tier: 3, timer: 1200, items: [{id: 'keju', qty: 1}, {id: 'sup_wortel', qty: 2}], coins: 1500, xp: 600 },
  { tier: 3, timer: 1200, items: [{id: 'sushi_mas', qty: 2}, {id: 'takoyaki', qty: 1}], coins: 2500, xp: 1000 },
];
