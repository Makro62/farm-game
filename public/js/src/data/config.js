export const WEATHERS = [
    { key:'sunny',  name:'Cerah',  icon:'☀️',  mult:1.1 },
    { key:'cloudy', name:'Berawan',icon:'☁️',  mult:1.0 },
    { key:'rainy',  name:'Hujan',  icon:'🌧️', mult:1.25 },
    { key:'stormy', name:'Badai',  icon:'⛈️', mult:0.85 },
    { key:'windy',  name:'Berangin',icon:'💨', mult:1.0 }
];

export const ACHIEVEMENTS = [
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

export const DAILY_REWARDS = [100, 200, 300, 400, 500, 750, 1500];

export const CONFIG = {
    GRID_SIZE: 42,
    SAVE_KEY: 'farmTycoonSave',
    WEATHER_INTERVAL: 5 * 60 * 1000, // 5 menit
    DEFAULT_INVENTORY_CAPACITY: 50,
};
