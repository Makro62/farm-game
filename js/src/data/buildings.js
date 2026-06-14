export const BUILDINGS = {
    silo: {
        id: 'silo',
        name: 'Silo',
        emoji: '📦',
        desc: 'Meningkatkan kapasitas gudang penyimpan hasil panen.',
        maxLevel: 3,
        levels: [
            { cost: 0, effect: 50 },          // Base (level 0) capacity 50
            { cost: 150, effect: 150 },      // Lv1: +100 (Total 150)
            { cost: 800, effect: 400 },      // Lv2: +250 (Total 400)
            { cost: 3000, effect: 900 }      // Lv3: +500 (Total 900)
        ]
    },
    barn: {
        id: 'barn',
        name: 'Kandang (Barn)',
        emoji: '🛖',
        desc: 'Meningkatkan batas maksimal hewan ternak di peternakan.',
        maxLevel: 3,
        levels: [
            { cost: 0, effect: 50 },           // Base (level 0) capacity 50 animals
            { cost: 300, effect: 80 },        // Lv1: 80 animals
            { cost: 1500, effect: 150 },       // Lv2: 150 animals
            { cost: 5000, effect: 300 }       // Lv3: 300 animals
        ]
    },
    watertower: {
        id: 'watertower',
        name: 'Menara Air',
        emoji: '💧',
        desc: 'Mempercepat waktu siram tanaman dengan pengairan otomatis.',
        maxLevel: 3,
        levels: [
            { cost: 0, effect: 0 },
            { cost: 500, effect: 0.1 },      // Lv1: Reduce grow time by 10% passively
            { cost: 2000, effect: 0.2 },     // Lv2: Reduce grow time by 20%
            { cost: 8000, effect: 0.3 }      // Lv3: Reduce grow time by 30%
        ]
    },
    greenhouse: {
        id: 'greenhouse',
        name: 'Rumah Kaca',
        emoji: '🌱',
        desc: 'Menjaga suhu tanaman agar tetap tumbuh optimal di segala musim.',
        maxLevel: 1,
        levels: [
            { cost: 0, effect: 0 },
            { cost: 15000, effect: 1 }        // Lv1: unlocks winter crops / double yield chance
        ]
    },
    windmill: {
        id: 'windmill',
        name: 'Kincir Angin',
        emoji: '🌾',
        desc: 'Mempercepat durasi mesin dan dapur produksi (Crafting).',
        maxLevel: 3,
        levels: [
            { cost: 0, effect: 1 },           // Multiplier 1x
            { cost: 1000, effect: 0.8 },      // Lv1: Crafting takes 80% time
            { cost: 3000, effect: 0.5 },     // Lv2: Crafting takes 50% time
            { cost: 8000, effect: 0.25 }     // Lv3: Crafting takes 25% time
        ]
    }
};
