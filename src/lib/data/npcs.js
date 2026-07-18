export const NPC_LIST = [
  {
    id: 'maria',
    name: 'Chef Maria',
    role: 'Koki Kota',
    emoji: '🍳',
    // Diperluas: sekarang suka 1 resep jadi (keju) dan 1 ikan — sesuai role Koki
    likes: ['tomat', 'wortel', 'susu', 'keju', 'ikan_mas'],
    maxLevel: 5,
  },
  {
    id: 'botan',
    name: 'Pak Tua Botan',
    role: 'Ahli Tani',
    emoji: '👴',
    // Diperluas: sekarang suka pupuk_kandang (item baru dari Ternak) — link Ternak→NPC
    likes: ['tulip', 'semangka', 'apel', 'pupuk_kandang'],
    maxLevel: 5,
  },
  {
    id: 'hadi',
    name: 'Paman Hadi',
    role: 'Peternak',
    emoji: '🐮',
    // Diperluas: sekarang suka produk ternak langka — sesuai role Peternak
    likes: ['jagung', 'gandum', 'truffle', 'tapal'],
    maxLevel: 5,
  },
  // ===== NPC Baru: representasi area Memancing & Tambang =====
  {
    id: 'bejo',
    name: 'Pak Nelayan Bejo',
    role: 'Nelayan',
    emoji: '🎣',
    likes: ['ikan_mas', 'lele', 'cumi', 'umpan_premium'],
    maxLevel: 5,
  },
  {
    id: 'dodi',
    name: 'Mang Dodi',
    role: 'Penambang',
    emoji: '⛏️',
    likes: ['batu', 'tembaga', 'besi', 'emas'],
    maxLevel: 5,
  },
];

