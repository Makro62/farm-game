/**
 * ACHIEVEMENTS DATA
 * Setiap achievement punya:
 * - id: unique key
 * - name: nama tampilan
 * - desc: deskripsi kondisi
 * - emoji: ikon
 * - category: 'ladang' | 'ternak' | 'tambang' | 'pancing' | 'restoran' | 'kota' | 'special'
 * - condition: { stat, value } atau { type: 'custom', key }
 * - rewardXp: XP yang diberikan saat unlock
 * - rewardCoins: Koin bonus saat unlock (opsional)
 * - secret: boolean — tersembunyi sampai di-unlock
 */

export const ACHIEVEMENTS = [
  // ===== 🌾 LADANG =====
  {
    id: 'first_harvest',
    name: 'Panen Pertama',
    desc: 'Panen tanaman pertamamu',
    emoji: '🌾',
    category: 'ladang',
    condition: { stat: 'totalHarvested', value: 1 },
    rewardXp: 50,
    rewardCoins: 100,
  },
  {
    id: 'harvest_100',
    name: 'Petani Rajin',
    desc: 'Panen tanaman sebanyak 100 kali',
    emoji: '🚜',
    category: 'ladang',
    condition: { stat: 'totalHarvested', value: 100 },
    rewardXp: 200,
    rewardCoins: 500,
  },
  {
    id: 'harvest_500',
    name: 'Master Ladang',
    desc: 'Panen tanaman sebanyak 500 kali',
    emoji: '🏆',
    category: 'ladang',
    condition: { stat: 'totalHarvested', value: 500 },
    rewardXp: 500,
    rewardCoins: 2000,
  },
  {
    id: 'used_fertilizer',
    name: 'Pupuk Ajaib',
    desc: 'Gunakan Pupuk Kandang saat menanam',
    emoji: '🌿',
    category: 'ladang',
    condition: { stat: 'totalFertilizerUsed', value: 1 },
    rewardXp: 80,
    rewardCoins: 150,
  },
  {
    id: 'fertilizer_master',
    name: 'Raja Pupuk',
    desc: 'Gunakan Pupuk Kandang sebanyak 50 kali',
    emoji: '💚',
    category: 'ladang',
    condition: { stat: 'totalFertilizerUsed', value: 50 },
    rewardXp: 300,
    rewardCoins: 1000,
  },

  // ===== 🐄 TERNAK =====
  {
    id: 'first_animal',
    name: 'Peternak Pemula',
    desc: 'Beli hewan pertamamu',
    emoji: '🐔',
    category: 'ternak',
    condition: { stat: 'totalAnimalsOwned', value: 1 },
    rewardXp: 50,
    rewardCoins: 100,
  },
  {
    id: 'collect_50',
    name: 'Peternak Produktif',
    desc: 'Kumpulkan hasil ternak sebanyak 50 kali',
    emoji: '🥛',
    category: 'ternak',
    condition: { stat: 'totalCollected', value: 50 },
    rewardXp: 200,
    rewardCoins: 600,
  },
  {
    id: 'fed_animal_10',
    name: 'Penyayang Hewan',
    desc: 'Beri makan hewan sebanyak 10 kali',
    emoji: '🌽',
    category: 'ternak',
    condition: { stat: 'totalAnimalsFed', value: 10 },
    rewardXp: 120,
    rewardCoins: 300,
  },
  {
    id: 'got_fertilizer_20',
    name: 'Komposer',
    desc: 'Dapatkan Pupuk Kandang sebanyak 20 kali dari ternak',
    emoji: '♻️',
    category: 'ternak',
    condition: { stat: 'totalFertilizerDropped', value: 20 },
    rewardXp: 250,
    rewardCoins: 800,
  },

  // ===== ⛏️ TAMBANG =====
  {
    id: 'first_mine',
    name: 'Penambang Pemula',
    desc: 'Tambang pertama kali',
    emoji: '⛏️',
    category: 'tambang',
    condition: { stat: 'totalMined', value: 1 },
    rewardXp: 50,
    rewardCoins: 100,
  },
  {
    id: 'mine_100',
    name: 'Buruh Tambang',
    desc: 'Tambang sebanyak 100 kali',
    emoji: '⛏️',
    category: 'tambang',
    condition: { stat: 'totalMined', value: 100 },
    rewardXp: 200,
    rewardCoins: 500,
  },
  {
    id: 'found_diamond',
    name: 'Pemburu Berlian',
    desc: 'Temukan berlian pertamamu',
    emoji: '💎',
    category: 'tambang',
    condition: { stat: 'totalDiamondsMined', value: 1 },
    rewardXp: 500,
    rewardCoins: 3000,
    secret: true,
  },
  {
    id: 'got_worm_10',
    name: 'Kolektor Cacing',
    desc: 'Dapatkan Cacing Tanah 10 kali dari tambang',
    emoji: '🪱',
    category: 'tambang',
    condition: { stat: 'totalWormsFound', value: 10 },
    rewardXp: 150,
    rewardCoins: 400,
  },
  {
    id: 'pickaxe_gold',
    name: 'Penambang Emas',
    desc: 'Pasang Pickaxe Emas',
    emoji: '🛠️',
    category: 'tambang',
    condition: { type: 'custom', key: 'pickaxeGold' },
    rewardXp: 400,
    rewardCoins: 1500,
  },

  // ===== 🎣 MEMANCING =====
  {
    id: 'first_fish',
    name: 'Pemancing Pertama',
    desc: 'Tangkap ikan pertamamu',
    emoji: '🎣',
    category: 'pancing',
    condition: { stat: 'totalFished', value: 1 },
    rewardXp: 50,
    rewardCoins: 100,
  },
  {
    id: 'fish_50',
    name: 'Nelayan Handal',
    desc: 'Tangkap ikan sebanyak 50 kali',
    emoji: '🐟',
    category: 'pancing',
    condition: { stat: 'totalFished', value: 50 },
    rewardXp: 250,
    rewardCoins: 800,
  },
  {
    id: 'used_worm_bait',
    name: 'Umpan Rakitan',
    desc: 'Gunakan Umpan Cacing hasil tambang saat memancing',
    emoji: '🪱',
    category: 'pancing',
    condition: { stat: 'totalWormBaitUsed', value: 1 },
    rewardXp: 100,
    rewardCoins: 200,
  },

  // ===== 🍽️ RESTORAN =====
  {
    id: 'first_cook',
    name: 'Koki Pemula',
    desc: 'Masak hidangan pertamamu',
    emoji: '🍳',
    category: 'restoran',
    condition: { stat: 'totalCooked', value: 1 },
    rewardXp: 80,
    rewardCoins: 150,
  },
  {
    id: 'cook_20',
    name: 'Chef Berbakat',
    desc: 'Masak hidangan sebanyak 20 kali',
    emoji: '👨‍🍳',
    category: 'restoran',
    condition: { stat: 'totalCooked', value: 20 },
    rewardXp: 300,
    rewardCoins: 1000,
  },
  {
    id: 'serve_50',
    name: 'Restoran Populer',
    desc: 'Layani pelanggan sebanyak 50 kali',
    emoji: '🏪',
    category: 'restoran',
    condition: { stat: 'totalServed', value: 50 },
    rewardXp: 400,
    rewardCoins: 2000,
  },
  {
    id: 'cook_sushi_emas',
    name: 'Chef Mewah',
    desc: 'Masak Sushi Emas (butuh mineral dari Tambang)',
    emoji: '✨',
    category: 'restoran',
    condition: { stat: 'totalSushiEmasMade', value: 1 },
    rewardXp: 600,
    rewardCoins: 3000,
    secret: true,
  },

  // ===== 🏘️ KOTA =====
  {
    id: 'first_order',
    name: 'Pedagang Muda',
    desc: 'Selesaikan Order Board pertamamu',
    emoji: '📦',
    category: 'kota',
    condition: { stat: 'totalOrdersFulfilled', value: 1 },
    rewardXp: 80,
    rewardCoins: 200,
  },
  {
    id: 'order_10',
    name: 'Pedagang Andal',
    desc: 'Selesaikan 10 pesanan dari Order Board',
    emoji: '📋',
    category: 'kota',
    condition: { stat: 'totalOrdersFulfilled', value: 10 },
    rewardXp: 300,
    rewardCoins: 1500,
  },
  {
    id: 'gift_npc_5',
    name: 'Sahabat Kota',
    desc: 'Beri hadiah ke NPC sebanyak 5 kali',
    emoji: '🎁',
    category: 'kota',
    condition: { stat: 'totalGiftsGiven', value: 5 },
    rewardXp: 150,
    rewardCoins: 400,
  },

  // ===== ⭐ SPESIAL / LINTAS SISTEM =====
  {
    id: 'all_rounder',
    name: 'Petani Sejati',
    desc: 'Lakukan aksi di semua 5 area dalam 1 sesi (Ladang, Ternak, Tambang, Pancing, Restoran)',
    emoji: '🌟',
    category: 'special',
    condition: { type: 'custom', key: 'allRounder' },
    rewardXp: 1000,
    rewardCoins: 5000,
    secret: false,
  },
  {
    id: 'supply_chain',
    name: 'Pengusaha Tani',
    desc: 'Gunakan pupuk dari Ternak → Ladang → masak hasilnya di Restoran',
    emoji: '🔄',
    category: 'special',
    condition: { type: 'custom', key: 'supplyChain' },
    rewardXp: 800,
    rewardCoins: 3000,
    secret: false,
  },
];

// Lookup map untuk kemudahan
export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));

// Kategori dengan label dan emoji
export const ACHIEVEMENT_CATEGORIES = {
  ladang: { label: 'Ladang', emoji: '🌾' },
  ternak: { label: 'Peternakan', emoji: '🐄' },
  tambang: { label: 'Tambang', emoji: '⛏️' },
  pancing: { label: 'Memancing', emoji: '🎣' },
  restoran: { label: 'Restoran', emoji: '🍽️' },
  kota: { label: 'Kota', emoji: '🏘️' },
  special: { label: 'Spesial', emoji: '⭐' },
};
