export const RECIPES = [
  { id: 'sup_wortel', name: 'Sup Wortel', emoji: '🥣', type: 'kitchen', time: 180, price: 150, xp: 50, req: { wortel: 4 } },
  { id: 'tepung_jagung', name: 'Tepung Jagung', emoji: '🌾', type: 'kitchen', time: 180, price: 200, xp: 60, req: { jagung: 4 } },
  { id: 'keju', name: 'Keju', emoji: '🧀', type: 'kitchen', time: 300, price: 400, xp: 120, req: { susu: 3 } },

  { id: 'kue_stroberi', name: 'Kue Stroberi', emoji: '🍰', type: 'restaurant', time: 600, price: 800, xp: 200, req: { stroberi: 3, telur: 2, susu: 1, tebu: 1 } },
  { id: 'kue_wortel', name: 'Kue Wortel', emoji: '🥕', type: 'restaurant', time: 480, price: 600, xp: 150, req: { wortel: 3, gandum: 2, telur: 1, tebu: 1 } },
  { id: 'kue_apel', name: 'Kue Apel', emoji: '🥧', type: 'restaurant', time: 540, price: 750, xp: 180, req: { apel: 3, gandum: 2, susu: 1, tebu: 1 } },
  { id: 'kue_manis', name: 'Kue Manis', emoji: '🥮', type: 'restaurant', time: 400, price: 500, xp: 120, req: { gandum: 2, susu: 2, tebu: 2 } },

  { id: 'sushi_mas', name: 'Sushi Ikan Mas', emoji: '🍣', type: 'fish_kitchen', time: 240, price: 300, xp: 100, req: { ikan_mas: 2, tomat: 2 } },
  { id: 'lele_bakar', name: 'Lele Bakar', emoji: '🍢', type: 'fish_kitchen', time: 300, price: 400, xp: 150, req: { lele: 2, jagung: 1 } },
  { id: 'takoyaki', name: 'Takoyaki', emoji: '🧆', type: 'fish_kitchen', time: 360, price: 1000, xp: 300, req: { cumi: 2, telur: 2 } },
];

export const ORDER_TEMPLATES = [
  { tier: 1, timer: 600, items: [{ id: 'wortel', qty: 5 }, { id: 'jagung', qty: 3 }], coins: 200, xp: 100 },
  { tier: 1, timer: 600, items: [{ id: 'tomat', qty: 4 }, { id: 'telur', qty: 2 }], coins: 250, xp: 120 },
  { tier: 2, timer: 900, items: [{ id: 'stroberi', qty: 5 }, { id: 'susu', qty: 2 }], coins: 600, xp: 250 },
  { tier: 2, timer: 900, items: [{ id: 'semangka', qty: 2 }, { id: 'ikan_mas', qty: 2 }], coins: 800, xp: 300 },
  { tier: 3, timer: 1200, items: [{ id: 'keju', qty: 1 }, { id: 'sup_wortel', qty: 2 }], coins: 1500, xp: 600 },
  { tier: 3, timer: 1200, items: [{ id: 'sushi_mas', qty: 2 }, { id: 'takoyaki', qty: 1 }], coins: 2500, xp: 1000 },
];

// Re-export for transitional imports
export { FISHES } from './fishes';
export { MINERALS } from './minerals';
