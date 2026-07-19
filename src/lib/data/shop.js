import { SHOP_SEEDS } from './crops';

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
  // ===== Umpan Cacing: dibuat dari cacing yang di-drop saat tambang batu =====
  { id: 'umpan_cacing', name: 'Umpan Cacing', emoji: '🪱', price: 0, waitMult: 0.65, rareBonus: 0.08, desc: 'Dibuat dari cacing tambang · alternatif murah', craftable: true, mineralReq: { cacing: 2 } },
];

export const SHOP_ANIMALS = [
  { id: 'ayam', name: 'Ayam', emoji: '🐔', price: 150, time: 20, product: 'telur', productEmoji: '🥚', image: '/img/animals/chicken.png' },
  { id: 'bebek', name: 'Bebek', emoji: '🦆', price: 300, time: 40, product: 'telur_bebek', productEmoji: '🥚', image: '/img/animals/duck.png' },
  { id: 'sapi', name: 'Sapi', emoji: '🐄', price: 500, time: 60, product: 'susu', productEmoji: '🥛', image: '/img/animals/cow.png' },
  { id: 'domba', name: 'Domba', emoji: '🐑', price: 800, time: 90, product: 'bulu', productEmoji: '🧶', image: '/img/animals/sheep.png' },
  { id: 'babi', name: 'Babi', emoji: '🐖', price: 1200, time: 120, product: 'truffle', productEmoji: '🍄', image: '/img/animals/pig.png' },
  { id: 'kuda', name: 'Kuda', emoji: '🐴', price: 2000, time: 150, product: 'tapal', productEmoji: '🧲', image: '/img/animals/horse.png' },
];

export const SHOP_MINING = [
  { id: 'bom_kecil', name: 'Bom Kecil', emoji: '🧨', price: 50, desc: '×2 hasil / buka petak tertutup' },
  // ===== mineralReq: butuh mineral asli selain koin untuk memasang =====
  { id: 'bom_besar', name: 'Bom Besar', emoji: '💣', price: 100, desc: 'Tambang semua petak siap', mineralReq: { tembaga: 3 } },
  { id: 'pickaxe_besi', name: 'Pickaxe Besi', emoji: '⛏️', price: 200, desc: 'Regen 90 detik', mineralReq: { besi: 5 } },
  { id: 'pickaxe_emas', name: 'Pickaxe Emas', emoji: '🛠️', price: 500, desc: 'Regen 60 detik + rare ore', mineralReq: { emas: 3, besi: 5 } },
  { id: 'senter', name: 'Senter Goa', emoji: '🔦', price: 120, desc: 'Buff 5 menit regen cepat' },
  { id: 'tali', name: 'Tali Tambang', emoji: '🪢', price: 60, desc: 'Pulihkan 1 petak tertutup' },
];

export const PICKAXE_LABELS = {
  1: { name: 'Cangkul Kayu', emoji: '🪨', regen: '120 detik' },
  2: { name: 'Pickaxe Besi', emoji: '⛏️', regen: '90 detik' },
  3: { name: 'Pickaxe Emas', emoji: '🛠️', regen: '60 detik' },
};

// ===== UNIFIED SHOP OBJECT =====
export const SHOP = {
  seeds: {
    icon: '🌱', unlockLevel: 1,
    items: Object.fromEntries(SHOP_SEEDS.map(s => [s.id, {
      id: s.id, name: s.name, emoji: s.emoji,
      price: s.price, cropId: s.cropId, season: s.season,
      stock: Infinity, maxPurchasePerDay: null,
    }])),
  },
  animals: {
    icon: '🐔', unlockLevel: 5,
    items: Object.fromEntries(SHOP_ANIMALS.map(a => [a.id, {
      id: a.id, name: a.name, emoji: a.emoji,
      price: a.price, product: a.product, productEmoji: a.productEmoji,
      produceTime: a.time, stock: 10,
    }])),
  },
  bait: {
    icon: '🪱', unlockLevel: 1,
    items: Object.fromEntries(SHOP_BAIT.map(b => [b.id, {
      id: b.id, name: b.name, emoji: b.emoji,
      price: b.price, waitMult: b.waitMult, rareBonus: b.rareBonus,
      craftable: b.craftable, mineralReq: b.mineralReq,
    }])),
  },
  tools: {
    icon: '⛏️', unlockLevel: 1,
    items: Object.fromEntries(SHOP_MINING.map(mt => [mt.id, {
      id: mt.id, name: mt.name, emoji: mt.emoji,
      price: mt.price, desc: mt.desc,
      mineralReq: mt.mineralReq,
    }])),
  },
  buildings: {
    icon: '🏗️', unlockLevel: 5,
    items: Object.fromEntries(SHOP_BUILDINGS.map(b => [b.id, {
      id: b.id, name: b.name, emoji: b.emoji,
      price: b.price, desc: b.desc,
    }])),
  },
  decorations: {
    icon: '🪴', unlockLevel: 3,
    items: Object.fromEntries(SHOP_DECORATIONS.map(d => [d.id, {
      id: d.id, name: d.name, emoji: d.emoji,
      price: d.price, desc: d.desc,
    }])),
  },
};

export function getShopItem(itemId) {
  for (const category of Object.values(SHOP)) {
    if (category.items?.[itemId]) return category.items[itemId];
  }
  return null;
}

// ===== Item Lintas-Sistem: tidak dijual di toko, tapi eksis dalam ekosistem game =====
// cacing: drop dari Tambang (batu) → dipakai untuk crafting umpan_cacing
// pupuk_kandang: drop dari Ternak → otomatis dipakai saat tanam di Ladang
export const SPECIAL_ITEMS = {
  cacing: { id: 'cacing', name: 'Cacing Tanah', emoji: '🪱', desc: 'Drop saat tambang batu · bisa jadi umpan' },
  pupuk_kandang: { id: 'pupuk_kandang', name: 'Pupuk Kandang', emoji: '🌿', desc: 'Drop dari ternak · mempercepat pertumbuhan tanaman 15%' },
};

// ===== Sistem Pakan Hewan (Fase B) =====
// Memberi makan hewan = opsional, tapi memberikan bonus produksi
// feedItem: ID crop yang dipakai sebagai pakan
// feedQty: jumlah yang dikonsumsi per sesi makan
export const ANIMAL_FEED = {
  ayam:  { feedItem: 'jagung',  feedQty: 2, bonusDesc: '+25% chance bonus telur' },
  bebek: { feedItem: 'jagung',  feedQty: 2, bonusDesc: '+25% chance bonus telur bebek' },
  sapi:  { feedItem: 'gandum',  feedQty: 2, bonusDesc: '+25% chance bonus susu' },
  domba: { feedItem: 'gandum',  feedQty: 2, bonusDesc: '+25% chance bonus bulu' },
  babi:  { feedItem: 'wortel',  feedQty: 2, bonusDesc: '+25% chance bonus truffle' },
  kuda:  { feedItem: 'wortel',  feedQty: 3, bonusDesc: '+25% chance bonus tapal' },
};


