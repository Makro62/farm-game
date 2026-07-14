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
