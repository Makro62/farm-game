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
        minLv: 5
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
        minLv: 6
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
        minLv: 8
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
        minLv: 10
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
        minLv: 15
    }
};
