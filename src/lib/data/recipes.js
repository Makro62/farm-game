export const RECIPES = [
  // ===== TIER 1 (Level 1+) =====
  { id: 'sup_wortel', name: 'Sup Wortel', emoji: '🥣', type: 'kitchen', time: 180, price: 150, xp: 50, req: { wortel: 4 }, unlockLevel: 1 },
  { id: 'tepung_jagung', name: 'Tepung Jagung', emoji: '🌾', type: 'kitchen', time: 180, price: 200, xp: 60, req: { jagung: 4 }, unlockLevel: 1 },
  { id: 'es_teh', name: 'Es Teh Manis', emoji: '🍹', type: 'kitchen', time: 100, price: 150, xp: 40, req: { tebu: 2 }, unlockLevel: 1 },
  { id: 'jus_tomat', name: 'Jus Tomat', emoji: '🍅', type: 'kitchen', time: 120, price: 180, xp: 50, req: { tomat: 3 }, unlockLevel: 1 },
  { id: 'lele_bakar', name: 'Lele Bakar', emoji: '🍢', type: 'fish_kitchen', time: 300, price: 400, xp: 150, req: { lele: 2, jagung: 1 }, unlockLevel: 1 },

  // ===== TIER 2 (Level 5+) =====
  { id: 'keju', name: 'Keju', emoji: '🧀', type: 'kitchen', time: 300, price: 400, xp: 120, req: { susu: 3 }, unlockLevel: 5 },
  { id: 'nasi_goreng', name: 'Nasi Goreng', emoji: '🍛', type: 'kitchen', time: 250, price: 450, xp: 120, req: { gandum: 2, telur: 1, tomat: 1 }, unlockLevel: 5 },
  { id: 'roti_gandum', name: 'Roti Gandum', emoji: '🍞', type: 'kitchen', time: 300, price: 250, xp: 80, req: { gandum: 3, telur: 1 }, unlockLevel: 5 },
  { id: 'susu_stroberi', name: 'Susu Stroberi', emoji: '🥤', type: 'kitchen', time: 180, price: 300, xp: 90, req: { susu: 2, stroberi: 2 }, unlockLevel: 5 },
  { id: 'kue_wortel', name: 'Kue Wortel', emoji: '🥕', type: 'restaurant', time: 480, price: 600, xp: 150, req: { wortel: 3, gandum: 2, telur: 1, tebu: 1 }, unlockLevel: 5 },
  { id: 'sushi_mas', name: 'Sushi Ikan Mas', emoji: '🍣', type: 'fish_kitchen', time: 240, price: 300, xp: 100, req: { ikan_mas: 2, tomat: 2 }, unlockLevel: 5 },

  // ===== TIER 3 (Level 10+) =====
  { id: 'kue_manis', name: 'Kue Manis', emoji: '🥮', type: 'restaurant', time: 400, price: 500, xp: 120, req: { gandum: 2, susu: 2, tebu: 2 }, unlockLevel: 10 },
  { id: 'pancake', name: 'Pancake', emoji: '🥞', type: 'restaurant', time: 360, price: 550, xp: 140, req: { gandum: 2, telur: 1, susu: 1, tebu: 1 }, unlockLevel: 10 },
  { id: 'takoyaki', name: 'Takoyaki', emoji: '🧆', type: 'fish_kitchen', time: 360, price: 1000, xp: 300, req: { cumi: 2, telur: 2 }, unlockLevel: 10 },
  { id: 'nasi_jamur', name: 'Nasi Jamur', emoji: '🍚', type: 'kitchen', time: 420, price: 600, xp: 160, req: { jamur: 2, gandum: 3 }, unlockLevel: 10 },
  { id: 'kue_apel', name: 'Kue Apel', emoji: '🥧', type: 'restaurant', time: 540, price: 750, xp: 180, req: { apel: 3, gandum: 2, susu: 1, tebu: 1 }, unlockLevel: 10 },

  // ===== TIER 4 (Level 15+) =====
  { id: 'kue_stroberi', name: 'Kue Stroberi', emoji: '🍰', type: 'restaurant', time: 600, price: 800, xp: 200, req: { stroberi: 3, telur: 2, susu: 1, tebu: 1 }, unlockLevel: 15 },
  { id: 'sushi_emas', name: 'Sushi Emas', emoji: '✨🍣', type: 'fish_kitchen', time: 480, price: 1200, xp: 350, req: { ikan_mas: 2, emas: 1 }, unlockLevel: 15 },
];

export const ORDER_TEMPLATES = [
  { tier: 1, timer: 600, items: [{ id: 'wortel', qty: 5 }, { id: 'jagung', qty: 3 }], coins: 200, xp: 100 },
  { tier: 1, timer: 600, items: [{ id: 'tomat', qty: 4 }, { id: 'telur', qty: 2 }], coins: 250, xp: 120 },
  { tier: 2, timer: 900, items: [{ id: 'stroberi', qty: 5 }, { id: 'susu', qty: 2 }], coins: 600, xp: 250 },
  { tier: 2, timer: 900, items: [{ id: 'semangka', qty: 2 }, { id: 'ikan_mas', qty: 2 }], coins: 800, xp: 300 },
  // ===== Order baru yang melibatkan Tambang =====
  { tier: 2, timer: 900, items: [{ id: 'tembaga', qty: 5 }, { id: 'ikan_mas', qty: 2 }], coins: 700, xp: 280 },
  { tier: 2, timer: 900, items: [{ id: 'besi', qty: 3 }, { id: 'stroberi', qty: 3 }], coins: 650, xp: 260 },
  { tier: 3, timer: 1200, items: [{ id: 'keju', qty: 1 }, { id: 'sup_wortel', qty: 2 }], coins: 1500, xp: 600 },
  { tier: 3, timer: 1200, items: [{ id: 'sushi_mas', qty: 2 }, { id: 'takoyaki', qty: 1 }], coins: 2500, xp: 1000 },
  { tier: 3, timer: 1500, items: [{ id: 'emas', qty: 2 }, { id: 'sushi_emas', qty: 1 }], coins: 3500, xp: 1200 },
];

// Re-export for transitional imports
export { FISHES } from './fishes';
export { MINERALS } from './minerals';
