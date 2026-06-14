export const CRAFTING_RECIPES = {
    soup: {
        id: 'soup',
        name: 'Sup Wortel',
        emoji: '🍲',
        desc: 'Sup hangat bergizi.',
        ingredients: { carrot: 5 },
        time: 15000,      // 15 seconds
        reward: 120,      // Total sell value > raw ingredients
        xp: 30,
        minLv: 5,
        tab: 'farm'
    },
    flour: {
        id: 'flour',
        name: 'Tepung Jagung',
        emoji: '🌽',
        desc: 'Bahan dasar pembuat kue.',
        ingredients: { corn: 5 },
        time: 20000,
        reward: 200,
        xp: 40,
        minLv: 6,
        tab: 'farm'
    },
    cheese: {
        id: 'cheese',
        name: 'Keju',
        emoji: '🧀',
        desc: 'Keju perah segar.',
        ingredients: { cow: 3 }, // using 'cow' as product key for Milk
        time: 45000,
        reward: 800,
        xp: 100,
        minLv: 8,
        tab: 'animal'
    },
    cake: {
        id: 'cake',
        name: 'Kue Tar',
        emoji: '🍰',
        desc: 'Kue lezat manis.',
        ingredients: { chicken: 4, flour: 1 }, // 4 Eggs + 1 Corn Flour
        time: 60000,
        reward: 1000,
        xp: 150,
        minLv: 10,
        tab: 'animal'
    },
    pie: {
        id: 'pie',
        name: 'Sweet Pie',
        emoji: '🥧',
        desc: 'Kue madu legendaris.',
        ingredients: { bee: 2, flour: 1 },
        time: 120000,
        reward: 3500,
        xp: 300,
        minLv: 15,
        tab: 'animal'
    },
    sushi: {
        id: 'sushi',
        name: 'Sushi',
        emoji: '🍣',
        desc: 'Sushi ikan nila segar.',
        ingredients: { nila: 4 },
        time: 30000,
        reward: 800,
        xp: 60,
        minLv: 6,
        tab: 'fish'
    },
    grilledfish: {
        id: 'grilledfish',
        name: 'Ikan Bakar',
        emoji: '🔥',
        desc: 'Lele bakar bumbu kecap.',
        ingredients: { lele: 3 },
        time: 45000,
        reward: 1500,
        xp: 120,
        minLv: 9,
        tab: 'fish'
    },
    sashimi: {
        id: 'sashimi',
        name: 'Sashimi Mas',
        emoji: '🍱',
        desc: 'Sashimi ikan mas premium.',
        ingredients: { mas: 2, nila: 2 },
        time: 60000,
        reward: 3000,
        xp: 250,
        minLv: 13,
        tab: 'fish'
    }
};
