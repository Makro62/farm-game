// ============================================================
// KONFIGURASI
// ============================================================

const CROPS = {
    carrot:     { name:'Carrot',     emoji:'🥕', cost:10,  time:5000,   reward:20,  xp:10, minLv:1 },
    corn:       { name:'Corn',       emoji:'🌽', cost:20,  time:10000,  reward:45,  xp:10, minLv:1 },
    tomato:     { name:'Tomato',     emoji:'🍅', cost:30,  time:15000,  reward:70,  xp:10, minLv:5 },
    strawberry: { name:'Strawberry', emoji:'🍓', cost:60,  time:30000,  reward:150, xp:15, minLv:5 },
    pineapple:  { name:'Pineapple',  emoji:'🍍', cost:100, time:60000,  reward:260, xp:20, minLv:10 },
    pumpkin:    { name:'Gold.Pumpkin',emoji:'🎃', cost:300, time:120000, reward:800, xp:30, minLv:10 }
};

const WEATHERS = [
    { key:'sunny',  name:'Cerah',  icon:'☀️',  mult:1.1 },
    { key:'cloudy', name:'Berawan',icon:'☁️',  mult:1.0 },
    { key:'rainy',  name:'Hujan',  icon:'🌧️', mult:1.25 },
    { key:'stormy', name:'Badai',  icon:'⛈️', mult:0.85 },
    { key:'windy',  name:'Berangin',icon:'💨', mult:1.0 }
];

const ACHIEVEMENTS = [
    { id:'A01', name:'First Seed',     desc:'Tanam 1 tanaman',    check:s=>s.totalPlanted>=1,   reward:50 },
    { id:'A02', name:'First Harvest',  desc:'Panen 1 tanaman',    check:s=>s.totalHarvest>=1,   reward:100 },
    { id:'A03', name:'Green Thumb',    desc:'Panen 10 tanaman',   check:s=>s.totalHarvest>=10,  reward:200 },
    { id:'A04', name:'Level 5',        desc:'Capai level 5',      check:s=>s.level>=5,          reward:300 },
    { id:'A05', name:'Farmer',         desc:'Panen 100 tanaman',  check:s=>s.totalHarvest>=100, reward:500 },
    { id:'A06', name:'Rich Farmer',    desc:'Total 5.000💰',      check:s=>s.totalEarned>=5000, reward:1000 },
    { id:'A07', name:'Level 10',       desc:'Capai level 10',     check:s=>s.level>=10,         reward:1500 },
    { id:'A08', name:'Farming Master', desc:'Panen 1.000 tanaman',check:s=>s.totalHarvest>=1000,reward:2000 },
    { id:'A09', name:'Millionaire',    desc:'Total 100.000💰',    check:s=>s.totalEarned>=100000,reward:5000 },
    { id:'A10', name:'Pumpkin King',   desc:'Panen 50 🎃',        check:s=>(s.pumpkinHarvest||0)>=50,reward:2500 },
    { id:'A11', name:'Quest Hero',     desc:'Selesaikan 30 quest',check:s=>s.questsDone>=30,    reward:3000 },
    { id:'A12', name:'Streak Master',  desc:'Login 7 hari streak',check:s=>s.loginStreak>=7,    reward:1000 }
];

const ANIMALS = {
    chicken: { name: 'Ayam', emoji: '🐔', cost: 1000, product: 'Telur', productEmoji: '🥚', time: 60000, reward: 50, minLv: 3 },
    cow: { name: 'Sapi', emoji: '🐄', cost: 3000, product: 'Susu', productEmoji: '🥛', time: 120000, reward: 200, minLv: 5 }
};

const DAILY_REWARDS = [50, 100, 200, 300, 500, 800, 1500];
const GRID_SIZE = 36;
const SAVE_KEY = 'farmTycoonSave';
const WEATHER_INTERVAL = 5 * 60 * 1000; // 5 menit

const DECORATIONS = {
    tree: { name: 'Tree', emoji: '🌳', cost: 200, prestige: 5 },
    flower: { name: 'Flower', emoji: '🌷', cost: 100, prestige: 3 },
    rock: { name: 'Rock', emoji: '🪨', cost: 50, prestige: 1 },
    house: { name: 'House', emoji: '🏠', cost: 1000, prestige: 25 },
    fountain: { name: 'Fountain', emoji: '⛲', cost: 2000, prestige: 50 },
    statue: { name: 'Statue', emoji: '🗿', cost: 5000, prestige: 100 }
};
