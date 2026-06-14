# 🚀 Game Improvement Plan — Farm Tycoon
**Repo:** https://github.com/Makro62/farm-game  
**Fokus:** Tampilan lebih seru · Sistem ekonomi lebih kaya · Fitur baru yang meningkatkan engagement

---

## 📋 Daftar Isi
- [1. Sistem Ekonomi & Cara Dapat Uang](#1-sistem-ekonomi--cara-dapat-uang-lebih-banyak)
- [2. Peningkatan Tampilan (Visual Upgrade)](#2-peningkatan-tampilan-visual-upgrade)
- [3. Fitur Baru yang Disarankan](#3-fitur-baru-yang-disarankan)
- [4. Sistem Progression yang Lebih Dalam](#4-sistem-progression-yang-lebih-dalam)
- [5. Contoh Kode Implementasi](#5-contoh-kode-implementasi)
- [6. Roadmap Prioritas](#6-roadmap-prioritas)

---

## 1. Sistem Ekonomi & Cara Dapat Uang Lebih Banyak

> Game yang bagus memberi pemain **banyak cara** untuk dapat uang, bukan hanya satu jalur. Berikut 8 sistem baru penghasil koin.

---

### 💰 1.1 Pasar Dinamis (Dynamic Market)

**Masalah saat ini:** Harga jual tanaman selalu tetap. Tidak ada alasan untuk menanam sesuatu lebih dari yang lain.

**Solusi:** Harga berfluktuasi setiap hari berdasarkan supply & demand sederhana.

```javascript
// js/src/systems/market-system.js

const BASE_PRICES = {
  wortel: 15, jagung: 20, tomat: 35,
  stroberi: 75, nanas: 90, labu: 110
};

// Harga naik/turun ±30% setiap pergantian hari
function updateMarketPrices(state) {
  state.marketPrices = {};
  for (const [crop, base] of Object.entries(BASE_PRICES)) {
    const fluctuation = 0.7 + Math.random() * 0.6; // 70% ~ 130%
    state.marketPrices[crop] = Math.round(base * fluctuation);
  }
}

// Panggil di game-engine.js saat pergantian hari
```

**Tampilan di UI:**
```
📈 Harga Pasar Hari Ini:
  🥕 Wortel     18 💰  (+20%) ↑
  🌽 Jagung     16 💰  (-20%) ↓
  🍅 Tomat      42 💰  (+20%) ↑
  🔔 Besok: Tomat diprediksi naik!
```

**Efek gameplay:** Pemain akan merencanakan tanam lebih strategis — mana yang harganya lagi tinggi hari ini.

---

### 💰 1.2 Sistem Kontrak Jangka Panjang

**Konsep:** Pedagang NPC menawarkan kontrak: "Kirim 50 Jagung dalam 3 hari = bonus 500 koin + 2× XP".

```javascript
// js/src/data/contracts.js
export const CONTRACT_TEMPLATES = [
  {
    id: 'contract_jagung_besar',
    title: '📦 Ekspor Jagung ke Kota',
    description: 'Kirim 50 Jagung dalam 3 hari',
    requirement: { jagung: 50 },
    deadline: 3,           // dalam hari in-game
    reward: { coins: 500, xp: 100, bonus: '2× XP hari ini' }
  },
  {
    id: 'contract_sup_premium',
    title: '🍲 Pesanan Restoran Mewah',
    description: 'Kirim 10 Sup Wortel + 5 Keju',
    requirement: { sup_wortel: 10, keju: 5 },
    deadline: 5,
    reward: { coins: 1200, xp: 250, bonus: 'Buka resep rahasia' }
  }
];
```

---

### 💰 1.3 Sistem Lelang (Auction House)

**Konsep:** Setiap 3 hari, muncul lelang item langka. Pemain bisa bid dengan koin.

```
🏛️ LELANG HARI INI (tutup dalam: 02:30)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 Bibit Labu Emas Langka        Bid: 800 💰
   +50% hasil panen, durasi 1 musim

🧪 Pupuk Super                   Bid: 300 💰
   Semua tanaman tumbuh 3× lebih cepat (1 hari)

🏺 Pot Ajaib                     Bid: 500 💰
   Plot ini tidak butuh disiram selamanya
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 💰 1.4 Investasi Kebun (Farm Investment)

**Konsep:** Pemain bisa "investasi" koin ke sebuah plot untuk mendapat passive income.

```
📊 Sistem Investasi:
┌─────────────────────────────────────────┐
│  💎 Investasi Platinum Plot             │
│  Biaya: 2.000 💰                        │
│  Passive Income: +50 💰 / hari         │
│  Balik modal: 40 hari                   │
│  Bonus: Plot tidak bisa kena hama       │
└─────────────────────────────────────────┘
```

---

### 💰 1.5 Sistem Referral & Kode Promo (In-Game)

**Konsep:** Pemain dapat "kode referral" yang bisa dimasukkan saat pertama main. Kode ini dibuat dari data save pemain lain (simulasi saja, bukan online).

```javascript
// Pemain share kode ini ke teman
function generateReferralCode(playerName, level) {
  const seed = btoa(`${playerName}-${level}-farmtycoon`);
  return seed.slice(0, 8).toUpperCase();
}

// Saat ada yang masukkan kode valid:
function applyReferralBonus() {
  addCoins(500);
  showNotification('🎁 Bonus referral: +500 💰 dan 1 bibit langka!');
}
```

---

### 💰 1.6 Mini-Game Spin the Wheel (Roda Keberuntungan)

**Konsep:** Sekali sehari, pemain bisa putar roda untuk hadiah acak.

```
🎡 RODA KEBERUNTUNGAN
━━━━━━━━━━━━━━━━━━━━
Bisa dimainkan: 1x per hari

Hadiah yang mungkin:
  🥉 Biasa    (60%): +100~300 💰
  🥈 Bagus    (25%): +500 💰 atau 3 bibit langka
  🥇 Luar biasa (10%): +2.000 💰
  💎 Jackpot  (5%):  +5.000 💰 + item langka
━━━━━━━━━━━━━━━━━━━━
```

**Kode animasi roda:**
```javascript
// js/src/systems/wheel-system.js
function spinWheel(state) {
  if (state.lastWheelSpin === today()) {
    showNotification('⏰ Roda sudah diputar hari ini. Kembali besok!');
    return;
  }
  
  const roll = Math.random();
  let reward;
  
  if (roll < 0.05)       reward = { coins: 5000, item: 'bibit_langka' };
  else if (roll < 0.15)  reward = { coins: 2000 };
  else if (roll < 0.40)  reward = { coins: 500 };
  else                   reward = { coins: 100 + Math.floor(Math.random() * 200) };
  
  state.lastWheelSpin = today();
  addCoins(reward.coins);
  animateWheel(roll);  // CSS animation
}
```

---

### 💰 1.7 Bonus Streak Login Harian

**Konsep:** Semakin sering login berturut-turut, semakin besar hadiahnya.

```
🔥 STREAK LOGIN KAMU: 7 HARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hari 1:  ✅ +100 💰
Hari 2:  ✅ +200 💰
Hari 3:  ✅ +300 💰 + 1 bibit
Hari 4:  ✅ +400 💰
Hari 5:  ✅ +500 💰 + pupuk super
Hari 6:  ✅ +750 💰
Hari 7:  🎁 +1.500 💰 + item langka! ← Hari ini!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Besok: +500 💰 (hari ke-8)
Jangan sampai putus!
```

```javascript
// js/src/systems/streak-system.js
const STREAK_REWARDS = [100, 200, 300, 400, 500, 750, 1500];

function claimDailyStreak(state) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (state.lastLogin === today) {
    showNotification('Sudah klaim hari ini!');
    return;
  }

  // Streak putus jika tidak login kemarin
  if (state.lastLogin !== yesterday) state.streak = 0;

  state.streak = (state.streak || 0) + 1;
  state.lastLogin = today;

  const reward = STREAK_REWARDS[Math.min(state.streak - 1, 6)];
  addCoins(reward);
  showNotification(`🔥 Streak ${state.streak} hari! +${reward} 💰`);
}
```

---

### 💰 1.8 Sistem Season Pass (Gratis)

**Konsep:** Setiap "musim" (misal 30 hari in-game), ada track reward yang bisa di-unlock dengan bermain aktif.

```
🌸 SEASON PASS — MUSIM SEMI
Progress: ████████░░░░░░░  53%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level 1:  ✅ Bibit Wortel ×5
Level 2:  ✅ +500 💰
Level 3:  ✅ Kurcaci Sementara (3 hari)
Level 4:  🔒 Dekorasi Eksklusif Musim Semi
Level 5:  🔒 Bibit Langka "Bunga Sakura"
Level 6:  🔒 +2.000 💰 + Frame profil khusus
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Unlock lewat: Quest harian + Panen + Crafting
```

---

## 2. Peningkatan Tampilan (Visual Upgrade)

> Tampilan yang hidup = pemain betah lebih lama. Berikut improvement visual yang konkret dan implementable.

---

### 🎨 2.1 Tema Visual per Musim

**Konsep:** Background, warna UI, dan partikel berubah sesuai musim aktif.

```css
/* css/themes/season-spring.css */
:root[data-season="spring"] {
  --bg-primary: linear-gradient(135deg, #a8e063, #56ab2f);
  --soil-color: #8B6914;
  --accent: #ff9ff3;
  --particle: '🌸'; /* Kelopak bunga beterbangan */
}

/* css/themes/season-summer.css */
:root[data-season="summer"] {
  --bg-primary: linear-gradient(135deg, #f9d423, #ff4e50);
  --soil-color: #7a5c1e;
  --accent: #ffd32a;
  --particle: '☀️';
}

/* css/themes/season-autumn.css */
:root[data-season="autumn"] {
  --bg-primary: linear-gradient(135deg, #f7971e, #ffd200);
  --soil-color: #6B3A2A;
  --accent: #ff6b35;
  --particle: '🍂'; /* Daun gugur */
}

/* css/themes/season-winter.css */
:root[data-season="winter"] {
  --bg-primary: linear-gradient(135deg, #e0eafc, #cfdef3);
  --soil-color: #4a6fa5;
  --accent: #74b9ff;
  --particle: '❄️'; /* Salju */
}
```

```javascript
// Terapkan tema saat musim berubah
function applySeasonTheme(season) {
  document.documentElement.setAttribute('data-season', season);
  startParticleEffect(season);
}
```

---

### 🎨 2.2 Animasi Plot yang Lebih Hidup

**Konsep:** Setiap state tanaman punya animasi berbeda yang membuatnya terasa hidup.

```css
/* Tanaman baru ditanam — muncul dengan bounce */
@keyframes plant-pop {
  0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
  60%  { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* Tanaman sedang tumbuh — bergerak pelan */
@keyframes sway {
  0%, 100% { transform: rotate(-3deg); }
  50%       { transform: rotate(3deg); }
}

/* Tanaman siap panen — glow berkilau */
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 5px #ffd54f, 0 0 10px #ffd54f;
  }
  50% {
    box-shadow: 0 0 15px #ffd54f, 0 0 30px #ffab00, 0 0 45px #ff6f00;
  }
}

/* Saat panen — partikel beterbangan */
@keyframes harvest-burst {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
}

.plot.ready {
  animation: glow-pulse 1.5s ease-in-out infinite;
}

.plot.growing .crop-icon {
  animation: sway 2s ease-in-out infinite;
}
```

```javascript
// Animasi burst saat panen
function createHarvestBurst(plotElement, emoji) {
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'harvest-particle';
    particle.textContent = emoji;
    particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 100}px`);
    particle.style.setProperty('--dy', `${-50 - Math.random() * 60}px`);
    plotElement.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }
}
```

---

### 🎨 2.3 Progress Bar Pertumbuhan per Plot

**Konsep:** Setiap plot yang sedang tumbuh menampilkan progress bar kecil di bawahnya.

```html
<!-- Tambahkan di farm-ui.js saat render plot growing -->
<div class="plot-progress-wrap">
  <div class="plot-progress-bar" style="width: 65%"></div>
</div>
<div class="plot-timer-label">1h 23m</div>
```

```css
.plot-progress-wrap {
  position: absolute;
  bottom: 4px;
  left: 6px;
  right: 6px;
  height: 4px;
  background: rgba(0,0,0,0.3);
  border-radius: 2px;
  overflow: hidden;
}

.plot-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #56ab2f, #a8e063);
  border-radius: 2px;
  transition: width 1s linear;
}
```

---

### 🎨 2.4 Floating Text (+💰, +XP) yang Lebih Dramatis

**Konsep:** Saat panen atau jual, angka koin melayang ke atas dengan animasi yang lebih menarik.

```css
/* Teks melayang saat dapat koin besar */
@keyframes coin-float-big {
  0%   { transform: translateY(0) scale(1); opacity: 1; }
  20%  { transform: translateY(-10px) scale(1.4); }
  100% { transform: translateY(-70px) scale(0.8); opacity: 0; }
}

.float-text {
  position: absolute;
  font-weight: 900;
  pointer-events: none;
  z-index: 999;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  animation: coin-float-big 1s ease-out forwards;
}

.float-text.big-money {
  font-size: 24px;
  color: #ffd700;
}

.float-text.xp {
  font-size: 14px;
  color: #74b9ff;
}

.float-text.level-up {
  font-size: 28px;
  color: #a29bfe;
  animation-duration: 1.5s;
}
```

```javascript
// js/src/utils/float-text.js
export function showFloatText(element, text, type = 'normal') {
  const el = document.createElement('div');
  el.className = `float-text ${type}`;
  el.textContent = text;
  
  const rect = element.getBoundingClientRect();
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top  = `${rect.top}px`;
  el.style.position = 'fixed';
  
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// Penggunaan:
showFloatText(plotEl, '+250 💰', 'big-money');
showFloatText(plotEl, '+50 XP', 'xp');
showFloatText(topbarEl, '🎉 LEVEL UP!', 'level-up');
```

---

### 🎨 2.5 Dashboard / HUD yang Lebih Informatif

**Konsep:** Topbar saat ini hanya menampilkan koin dan level. Upgrade jadi dashboard mini yang informatif.

```
┌────────────────────────────────────────────────────────────────────┐
│ 🌾 Farm Tycoon    │ 💰 12.450   │ ⭐ Lv 8   │ 🔥 Streak: 12     │
│                   │ +320/hari   │ 2.400 XP  │ 📅 Hari ke-34     │
│                   │             │ ████░░░░  │ 🌸 Musim Semi     │
├─────────────────┬─────────────────┬─────────────────┬─────────────┤
│ 🌱 Tumbuh: 8    │ 🌽 Siap: 3      │ 🐔 Hewan: 5     │ 📦 Order: 2 │
└─────────────────┴─────────────────┴─────────────────┴─────────────┘
```

```javascript
// Update HUD setiap detik
function updateHUD(state) {
  document.getElementById('hud-income').textContent =
    `+${calculateDailyIncome(state)}/hari`;
  
  document.getElementById('hud-growing').textContent =
    state.plots.filter(p => p.status === 'growing').length;
  
  document.getElementById('hud-ready').textContent =
    state.plots.filter(p => p.status === 'ready').length;
    
  document.getElementById('hud-streak').textContent =
    `🔥 ${state.streak} hari`;
}
```

---

### 🎨 2.6 Efek Cuaca yang Lebih Imersif

**Konsep:** Cuaca bukan hanya badge teks — dia secara visual mempengaruhi layar.

```css
/* Hujan — titik air jatuh */
.rain-drop {
  position: fixed;
  width: 2px;
  height: 15px;
  background: linear-gradient(transparent, rgba(100, 181, 246, 0.6));
  border-radius: 2px;
  animation: rain-fall linear infinite;
  pointer-events: none;
}

@keyframes rain-fall {
  from { transform: translateY(-20px); opacity: 0.8; }
  to   { transform: translateY(100vh) translateX(10px); opacity: 0; }
}

/* Badai — layar berkedip sesekali */
@keyframes lightning {
  0%, 95%, 100% { background: transparent; }
  96% { background: rgba(255, 255, 255, 0.15); }
}

.storm-overlay {
  animation: lightning 4s infinite;
}

/* Musim dingin — partikel salju */
.snowflake {
  color: white;
  font-size: 1em;
  position: fixed;
  animation: snowfall linear infinite;
  opacity: 0.8;
  pointer-events: none;
}

@keyframes snowfall {
  from { transform: translateY(-10px) rotate(0deg); }
  to   { transform: translateY(100vh) rotate(360deg); }
}
```

---

### 🎨 2.7 Notifikasi Toast yang Lebih Variatif

**Konsep:** Toast notif sekarang mungkin semua sama. Bedakan berdasarkan tipe dengan ikon dan warna.

```css
.toast { border-radius: 12px; padding: 12px 16px; font-size: 14px; font-weight: 600; }
.toast.success { background: #00b894; color: white; border-left: 4px solid #00cec9; }
.toast.warning { background: #fdcb6e; color: #2d3436; border-left: 4px solid #e17055; }
.toast.info    { background: #0984e3; color: white; border-left: 4px solid #74b9ff; }
.toast.reward  { background: linear-gradient(135deg, #f6d365, #fda085); color: white; font-size: 16px; }
.toast.levelup { background: linear-gradient(135deg, #a18cd1, #fbc2eb); color: white; font-size: 18px; }
```

---

### 🎨 2.8 Farm Grid Tile yang Lebih Detail

**Konsep:** Plot tanah punya beberapa state visual yang lebih kaya.

```css
/* Plot dengan berbagai kondisi */
.plot { border-radius: 12px; position: relative; transition: all 0.2s; }

/* Tanah kering — retak-retak */
.plot.dry::after {
  content: '';
  background-image: url("data:image/svg+xml,..."); /* crack pattern */
  opacity: 0.3;
}

/* Tanah basah — efek mengkilap */
.plot.wet {
  background: linear-gradient(135deg, #5d7a8a, #6fa3b0);
  box-shadow: inset 0 -3px 6px rgba(100, 181, 246, 0.4);
}

/* Plot premium (sudah di-upgrade) */
.plot.premium {
  border: 2px solid #ffd700;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
}

/* Hover state yang lebih dramatis */
.plot:hover {
  transform: translateY(-4px) scale(1.06);
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  z-index: 10;
}
```

---

## 3. Fitur Baru yang Disarankan

> Fitur-fitur ini dipilih berdasarkan dampak terhadap **engagement**, **replayability**, dan **keseruan** game.

---

### 🆕 3.1 Sistem Musim Nyata (4 Season Full)

**Impact: ⭐⭐⭐⭐⭐ — Mengubah cara bermain total**

Setiap musim punya tanaman eksklusif, bonus, dan tantangan berbeda.

```javascript
// js/src/data/seasons.js
export const SEASONS = {
  spring: {
    name: 'Musim Semi 🌸',
    duration: 7,        // hari in-game
    exclusiveCrops: ['sakura_fruit', 'tulip'],
    weatherBonus: { rain: 1.5 },    // 1.5× frekuensi hujan
    cropBonus: { growthSpeed: 1.2 }, // tumbuh 20% lebih cepat
    bgMusic: 'spring_theme'
  },
  summer: {
    name: 'Musim Panas ☀️',
    duration: 7,
    exclusiveCrops: ['watermelon_giant', 'sunflower'],
    weatherBonus: { drought: 0.3 }, // 30% chance kekeringan
    cropBonus: { sellPrice: 1.3 },  // jual 30% lebih mahal
    event: 'summer_festival'        // Event tahunan
  },
  autumn: {
    name: 'Musim Gugur 🍂',
    duration: 7,
    exclusiveCrops: ['pumpkin_giant', 'mushroom'],
    weatherBonus: { wind: 0.5 },
    craftingBonus: { speed: 1.5 },  // crafting lebih cepat
    event: 'harvest_festival'
  },
  winter: {
    name: 'Musim Dingin ❄️',
    duration: 7,
    exclusiveCrops: ['ice_berry', 'snowdrop'],
    weatherBonus: { snow: 1.0 },
    restriction: { outdoor_crops: 0.5 }, // tanaman outdoor tumbuh lambat
    bonus: { greenhouse_crops: 2.0 }     // greenhouse ×2 saat winter
  }
};
```

**UI Indikator Musim:**
```
┌──────────────────────────────────────────────────┐
│  🌸 Musim Semi    Hari 3/7                       │
│  ████████░░░░░░   Progress: 43%                  │
│  Bonus: Tanaman tumbuh 20% lebih cepat           │
│  Eksklusif: 🌸 Sakura Fruit tersedia di toko!   │
└──────────────────────────────────────────────────┘
```

---

### 🆕 3.2 Sistem Upgrade Plot (Tanah Premium)

**Impact: ⭐⭐⭐⭐⭐ — Sink koin yang powerful**

Pemain bisa upgrade plot individual untuk bonus permanen.

```javascript
// js/src/data/plot-upgrades.js
export const PLOT_UPGRADES = [
  {
    level: 1,
    name: 'Tanah Gemburkan',
    cost: 200,
    bonuses: { growthSpeed: 1.1 },   // +10% speed
    visual: 'plot-lv1'
  },
  {
    level: 2,
    name: 'Pupuk Dasar',
    cost: 500,
    bonuses: { growthSpeed: 1.2, yield: 1.1 },
    visual: 'plot-lv2'
  },
  {
    level: 3,
    name: 'Irigasi Tetes',
    cost: 1200,
    bonuses: { autoWater: true, growthSpeed: 1.3 },
    visual: 'plot-lv3'  // plot punya pipa kecil
  },
  {
    level: 4,
    name: 'Tanah Emas',
    cost: 3000,
    bonuses: { growthSpeed: 1.5, yield: 1.5, sellBonus: 1.2 },
    visual: 'plot-lv4'  // plot berkilau emas
  }
];
```

**Cara interaksi:** Klik kanan / tahan plot → muncul menu upgrade.

---

### 🆕 3.3 Sistem NPC Pedagang yang Muncul Periodik

**Impact: ⭐⭐⭐⭐ — Menambah kejutan dan urgency**

**Konsep:** Setiap beberapa hari, muncul pedagang misterius yang menjual item langka untuk waktu terbatas.

```
🧙 PEDAGANG MISTERIUS MUNCUL!
Tersedia selama: ⏰ 15 menit nyata

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 Bibit Naga               1.500 💰
   Tanaman terlangka. Hasil ×5!

⚗️ Eliksir Tumbuh Super     800 💰
   Semua plot panen dalam 30 detik

🏺 Jimat Perlindungan       600 💰
   Plot kebal hama selama 7 hari

📜 Resep Kuno               1.200 💰
   Buka crafting tersembunyi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```javascript
// js/src/systems/merchant-system.js
function spawnMerchant(state) {
  const MERCHANT_INTERVAL = 3; // setiap 3 hari in-game
  
  if (state.day % MERCHANT_INTERVAL !== 0) return;
  
  const merchantItems = selectRandomItems(RARE_ITEMS, 3);
  state.merchantActive = true;
  state.merchantItems = merchantItems;
  state.merchantExpiry = Date.now() + (15 * 60 * 1000); // 15 menit
  
  showNotification('🧙 Pedagang Misterius muncul! Belanja sekarang!', 'special');
}
```

---

### 🆕 3.4 Festival & Event Spesial

**Impact: ⭐⭐⭐⭐⭐ — Konten terbatas = players kembali rutin**

```
🎪 FESTIVAL PANEN RAYA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Berlangsung: 3 hari in-game
🎯 Tantangan: Kumpulkan 200 hasil panen!

Progress: ████████░░░░░░░  107/200

Reward:
  ✅ 50 panen:   +500 💰
  ✅ 100 panen:  Dekorasi "Tenda Festival"
  🔒 200 panen:  Bibit Langka "Festival Corn"
  🔒 300 panen:  Gelar "Master Petani" + frame profil
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```javascript
// js/src/data/events.js
export const SEASONAL_EVENTS = [
  {
    id: 'harvest_festival',
    name: '🎪 Festival Panen Raya',
    triggerDay: 28,     // Hari ke-28 (akhir musim gugur)
    duration: 3,
    challenge: { harvest: 200 },
    rewards: [
      { at: 50,  reward: { coins: 500 } },
      { at: 100, reward: { decoration: 'festival_tent' } },
      { at: 200, reward: { seed: 'festival_corn', coins: 2000 } }
    ]
  },
  {
    id: 'winter_market',
    name: '❄️ Pasar Musim Dingin',
    triggerDay: 35,
    duration: 2,
    challenge: { craft: 50 },
    rewards: [
      { at: 20, reward: { coins: 800 } },
      { at: 50, reward: { seed: 'ice_berry_gold', coins: 3000 } }
    ]
  }
];
```

---

### 🆕 3.5 Skill Tree Petani

**Impact: ⭐⭐⭐⭐ — Memberi arah tujuan jangka panjang**

**Konsep:** Pemain memilih jalur spesialisasi saat naik level.

```
🌿 SKILL TREE — Pilih jalur kamu!

          [Master Pertanian]
         ↗        ↑        ↘
   [Tanaman]  [Crafting]  [Peternakan]
      ↓           ↓           ↓
  [Wortel×3]  [Masak×2]  [Ayam×2]
  [Siram auto][Queue +1] [Produce×2]
  [Plot ×5]   [Resep VIP][Barn 2×]
```

```javascript
// js/src/data/skill-tree.js
export const SKILL_PATHS = {
  farming: {
    name: '🌿 Master Pertanian',
    skills: [
      { id: 'crop_speed_1',  name: 'Tangan Cepat',    cost: 3,  bonus: { growthSpeed: 1.15 } },
      { id: 'crop_yield_1',  name: 'Hasil Melimpah',  cost: 5,  bonus: { harvestYield: 1.25 } },
      { id: 'auto_water',    name: 'Siram Otomatis',  cost: 8,  bonus: { autoWater: true } },
      { id: 'extra_plots',   name: '+5 Plot Baru',    cost: 10, bonus: { plotExpansion: 5 } }
    ]
  },
  crafting: {
    name: '🍳 Master Dapur',
    skills: [
      { id: 'craft_speed_1', name: 'Chef Cepat',      cost: 3,  bonus: { craftSpeed: 1.2 } },
      { id: 'craft_queue',   name: 'Antrian +2',      cost: 5,  bonus: { craftQueue: 2 } },
      { id: 'recipe_unlock', name: 'Resep Rahasia',   cost: 8,  bonus: { unlockRecipes: ['golden_pie'] } }
    ]
  },
  animal: {
    name: '🐄 Master Peternakan',
    skills: [
      { id: 'animal_prod',   name: 'Produksi ×1.5',  cost: 3,  bonus: { productionRate: 1.5 } },
      { id: 'barn_expand',   name: 'Kandang 2×',      cost: 5,  bonus: { barnCapacity: 2 } },
      { id: 'auto_collect',  name: 'Kumpul Otomatis', cost: 8,  bonus: { autoCollect: true } }
    ]
  }
};
```

---

### 🆕 3.6 Sistem Combo & Multiplier

**Impact: ⭐⭐⭐⭐ — Membuat panen terasa lebih memuaskan**

**Konsep:** Panen berturut-turut dalam waktu singkat membangun combo multiplier.

```javascript
// js/src/systems/combo-system.js
let comboCount = 0;
let comboTimer = null;
const COMBO_WINDOW = 2000; // 2 detik antar aksi

function registerHarvest(state, plotElement, baseCoins) {
  comboCount++;
  clearTimeout(comboTimer);
  
  const multiplier = Math.min(1 + (comboCount - 1) * 0.2, 3.0); // max 3×
  const actualCoins = Math.round(baseCoins * multiplier);
  
  addCoins(actualCoins);
  
  // Tampilkan indikator combo
  if (comboCount >= 2) {
    showFloatText(plotElement, `${comboCount}x COMBO! +${actualCoins} 💰`, 'combo');
    showComboBar(comboCount, multiplier);
  }
  
  // Reset combo jika tidak ada aksi dalam 2 detik
  comboTimer = setTimeout(() => {
    if (comboCount >= 5) showNotification(`🔥 ${comboCount}x Combo! Luar biasa!`);
    comboCount = 0;
    hideComboBar();
  }, COMBO_WINDOW);
}
```

**UI Combo Bar:**
```
🔥 COMBO ×4        ████████░░  [2.0 detik lagi reset]
                   Bonus: +60% koin!
```

---

### 🆕 3.7 Mini-Game Memancing Interaktif

**Impact: ⭐⭐⭐⭐ — Konten berbeda dari farming loop utama**

**Konsep:** Mengubah sistem pancing yang ada menjadi mini-game aktif.

```javascript
// js/src/systems/fishing-minigame.js

// State mesin pancing
const fishingState = {
  barPosition: 50,    // 0-100, posisi bar
  fishPosition: 50,   // 0-100, posisi ikan
  catchZone: { min: 40, max: 60 }, // zona tangkap
  catchProgress: 0,   // 0-100
  isActive: false
};

// Pemain tahan tombol/click untuk naikkan bar
document.addEventListener('mousedown', () => {
  if (fishingState.isActive) fishingState.holding = true;
});
document.addEventListener('mouseup', () => {
  fishingState.holding = false;
});

function updateFishingGame(dt) {
  if (!fishingState.isActive) return;
  
  // Bar turun sendiri, naik saat ditahan
  fishingState.barPosition += fishingState.holding ? 3 : -2;
  fishingState.barPosition = Math.max(0, Math.min(100, fishingState.barPosition));
  
  // Ikan bergerak random
  fishingState.fishPosition += (Math.random() - 0.5) * 4;
  fishingState.fishPosition = Math.max(0, Math.min(100, fishingState.fishPosition));
  
  // Update catch zone mengikuti ikan
  fishingState.catchZone = {
    min: fishingState.fishPosition - 10,
    max: fishingState.fishPosition + 10
  };
  
  // Hitung progress
  const inZone = fishingState.barPosition >= fishingState.catchZone.min &&
                 fishingState.barPosition <= fishingState.catchZone.max;
  fishingState.catchProgress += inZone ? 2 : -3;
  fishingState.catchProgress = Math.max(0, Math.min(100, fishingState.catchProgress));
  
  if (fishingState.catchProgress >= 100) catchFish();
  if (fishingState.catchProgress <= 0)   escapeFish();
  
  renderFishingUI(fishingState);
}
```

---

### 🆕 3.8 Sistem Reputasi & Gelar

**Impact: ⭐⭐⭐ — Motivasi jangka panjang dan kebanggaan**

```javascript
// js/src/data/titles.js
export const PLAYER_TITLES = [
  { id: 'beginner',    name: '🌱 Petani Pemula',   condition: { level: 1 } },
  { id: 'farmer',      name: '🧑‍🌾 Petani Handal',  condition: { level: 5, harvest: 100 } },
  { id: 'craftsman',   name: '🍳 Juru Masak',       condition: { crafted: 50 } },
  { id: 'rancher',     name: '🐄 Peternak Ulung',   condition: { animals: 10 } },
  { id: 'tycoon',      name: '💰 Tycoon Pertanian', condition: { coins: 50000 } },
  { id: 'legend',      name: '🏆 Legenda Nusantara',condition: { level: 20, allAchieve: true } }
];
```

**Tampilan di profil:**
```
👤 PROFIL PETANI
━━━━━━━━━━━━━━━━━━━━━━━━━━
[Avatar]  Makro62
          🏆 Legenda Nusantara
          Level 12 | Hari ke-45
          Total Panen: 1.247
          Total Koin: 89.432 💰
━━━━━━━━━━━━━━━━━━━━━━━━━━
Gelar yang diraih: 6/8
[🌱] [🧑‍🌾] [🍳] [🐄] [💰] [🏆] [🔒] [🔒]
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 🆕 3.9 Sistem Bencana & Recovery

**Impact: ⭐⭐⭐ — Menambah drama dan tantangan**

**Konsep:** Sesekali terjadi bencana yang bisa dimitigasi dengan persiapan yang tepat.

```javascript
// js/src/systems/disaster-system.js
const DISASTERS = [
  {
    id: 'pest',
    name: '🐛 Serangan Hama',
    chance: 0.08,   // 8% per hari
    effect: (state) => {
      const victims = state.plots.filter(p => p.status === 'growing');
      victims.slice(0, 3).forEach(p => p.status = 'withered'); // 3 plot layu
    },
    counter: 'pesticide',   // item yang bisa mencegah
    warning: '⚠️ Ada tanda-tanda hama di kebun!'
  },
  {
    id: 'drought',
    name: '☀️ Kekeringan',
    chance: 0.05,
    effect: (state) => {
      state.plots.forEach(p => {
        if (p.status === 'growing') p.growthPaused = true;
      });
    },
    counter: 'water_tower_lv2',
    warning: '⚠️ Cuaca sangat panas! Siram tanamanmu segera!'
  },
  {
    id: 'flood',
    name: '🌊 Banjir Kecil',
    chance: 0.03,
    effect: (state) => {
      // Sebagian hasil crafting hilang
      Object.keys(state.craftedItems).forEach(k => {
        state.craftedItems[k] = Math.floor(state.craftedItems[k] * 0.7);
      });
    },
    counter: 'drainage_system',
    warning: '⚠️ Sungai meluap! Amankan hasil panen!'
  }
];
```

---

### 🆕 3.10 Sistem Ekspansi Lahan (Land Expansion)

**Impact: ⭐⭐⭐⭐⭐ — Progression yang paling memuaskan**

**Konsep:** Pemain bisa beli lahan baru untuk expand farm, bukan hanya unlock plot.

```
🗺️ PETA LAHAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Lahan Utama ✅]  →  [Bukit Timur 🔒]  →  [Lembah Hijau 🔒]
  (Aktif)              5.000 💰 Lv10      20.000 💰 Lv20
  16 plot              +20 plot            +30 plot + danau

                       ↓
                  [Hutan Rimba 🔒]
                  15.000 💰 Lv15
                  +25 plot + tambang
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 4. Sistem Progression yang Lebih Dalam

### 4.1 Loop Ekonomi yang Ideal

```
Diagram alur koin yang sehat:

SUMBER KOIN (+):                    PENGELUARAN (-):
━━━━━━━━━━━━━━━━━━━━━                ━━━━━━━━━━━━━━━━━━━━━
Jual tanaman (base)                  Beli bibit
Jual produk crafting (×2)            Beli hewan
Selesaikan pesanan (×2.5)            Upgrade plot
Daily streak bonus                   Beli bangunan
Spin roda harian                     Skill tree
Selesaikan event                     Lelang
Jual ikan hasil pancing              Investasi
Kontrak jangka panjang               Beli dekorasi

FLOW IDEAL:
Tanam → Panen → Crafting → Jual via Pesanan → Koin
  ↑                                              ↓
  └─── Beli bibit lebih banyak ←── Upgrade plot ←┘
```

### 4.2 Ekonomi Sink yang Penting

Agar koin tidak menumpuk sia-sia dan game terasa ada tujuan:

| Fitur Sink | Biaya Estimasi | Manfaat |
|------------|---------------|---------|
| Upgrade plot (Lv 1→4) | 200 → 3.000 💰 | Grow speed, yield bonus |
| Beli lahan baru | 5.000 → 20.000 💰 | Lebih banyak plot |
| Skill tree (per node) | 500 → 5.000 💰 | Passive bonus permanen |
| Ikut lelang | 300 → 3.000 💰 | Item langka |
| Investasi plot | 2.000 💰 | Passive income |
| Upgrade bangunan | 1.000 → 10.000 💰 | Kapasitas lebih besar |

### 4.3 Kurva Progres yang Tepat

```
Level  Fokus Utama              Koin Target    Waktu Estimasi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1-3    Tutorial, tanam wortel   0 - 500        15 menit
4-6    Beli hewan, crafting     500 - 2.000    30 menit
7-10   Upgrade plot, kurcaci    2.000 - 8.000  1 jam
11-15  Beli lahan baru, event   8.000 - 25.000 3 jam
16-20  Skill tree, legendaris   25.000+        10+ jam
```

---

## 5. Contoh Kode Implementasi

### 5.1 Cara Menambahkan Pasar Dinamis ke Economy System

```javascript
// js/src/systems/economy-system.js — tambahkan fungsi ini

/**
 * Update harga pasar setiap hari baru
 * Panggil dari game-engine.js saat triggerNewDay()
 */
export function updateDailyMarket(state) {
  const BASE = CROPS_DATA;
  state.todayPrices = {};
  state.yesterdayPrices = state.todayPrices || {};

  for (const [cropId, cropData] of Object.entries(BASE)) {
    const trend = state.marketTrend?.[cropId] || 0;
    const fluctuation = 0.75 + Math.random() * 0.5 + trend * 0.1;
    const newPrice = Math.round(cropData.basePrice * fluctuation);

    state.todayPrices[cropId] = newPrice;

    // Trend: jika harga naik 2 hari berturut, kecenderungan naik lagi
    const yesterday = state.yesterdayPrices?.[cropId] || cropData.basePrice;
    state.marketTrend = state.marketTrend || {};
    state.marketTrend[cropId] = newPrice > yesterday ? 0.1 : -0.1;
  }
}

/**
 * Jual dengan harga hari ini, bukan harga base
 */
export function sellItem(state, itemId, quantity) {
  const pricePerUnit = state.todayPrices?.[itemId] || CROPS_DATA[itemId]?.basePrice || 0;
  const totalCoins = pricePerUnit * quantity;

  state.coins += totalCoins;
  state.inventory[itemId] = (state.inventory[itemId] || 0) - quantity;

  showFloatText(`+${totalCoins} 💰`, 'big-money');
  return totalCoins;
}
```

### 5.2 Cara Menambahkan Spin Wheel ke UI

```javascript
// js/src/ui/wheel-ui.js
export function renderWheelModal(state) {
  const canSpin = !isSameDay(state.lastWheelSpin, new Date());

  return `
    <div class="modal-wheel">
      <h2>🎡 Roda Keberuntungan</h2>
      <div class="wheel-container">
        <canvas id="wheel-canvas" width="300" height="300"></canvas>
        <div class="wheel-pointer">▼</div>
      </div>
      <button id="btn-spin" ${!canSpin ? 'disabled' : ''} class="btn-primary">
        ${canSpin ? '🎰 Putar Sekarang!' : '⏰ Kembali Besok'}
      </button>
      ${!canSpin ? `<p class="muted">Reset dalam: ${getTimeUntilMidnight()}</p>` : ''}
    </div>
  `;
}

// Draw roda dengan Canvas API
function drawWheel(canvas) {
  const ctx = canvas.getContext('2d');
  const segments = [
    { label: '+100 💰',   color: '#e17055', chance: 0.35 },
    { label: '+300 💰',   color: '#00b894', chance: 0.25 },
    { label: '+500 💰',   color: '#0984e3', chance: 0.20 },
    { label: '3× Bibit',  color: '#6c5ce7', chance: 0.10 },
    { label: '+2000 💰',  color: '#fdcb6e', chance: 0.07 },
    { label: '💎 JACKPOT',color: '#fd79a8', chance: 0.03 }
  ];
  // ... canvas drawing logic
}
```

### 5.3 Cara Menambahkan Combo System

```javascript
// js/src/systems/combo-system.js — file baru
let combo = { count: 0, timer: null, multiplier: 1 };

export function registerComboAction(type, baseReward, plotEl) {
  combo.count++;
  clearTimeout(combo.timer);

  combo.multiplier = Math.min(1 + (combo.count - 1) * 0.25, 4.0);
  const actual = Math.round(baseReward * combo.multiplier);

  if (combo.count >= 2) {
    showFloatText(plotEl, `×${combo.multiplier.toFixed(1)} COMBO!`, 'combo');
    updateComboBar(combo.count, combo.multiplier);
  }

  combo.timer = setTimeout(resetCombo, 2500);
  return actual;
}

function resetCombo() {
  if (combo.count >= 5) {
    showNotification(`🔥 ${combo.count}x Mega Combo! Bonus akhir!`);
    addCoins(combo.count * 50); // bonus akhir combo
  }
  combo = { count: 0, timer: null, multiplier: 1 };
  hideComboBar();
}
```

---

## 6. Roadmap Prioritas

Urutan pengerjaan berdasarkan **impact** tinggi & **effort** rendah:

### 🟢 Minggu 1 — Quick Wins (Langsung terasa)
```
[ ] 1. Animasi plot lebih hidup (CSS saja, 2 jam)
[ ] 2. Floating text lebih dramatis (JS + CSS, 3 jam)
[ ] 3. Bonus streak login harian (logic + UI, 4 jam)
[ ] 4. Spin wheel harian (canvas + logic, 6 jam)
[ ] 5. Progress bar per plot (CSS + JS, 2 jam)
```

### 🟡 Minggu 2 — Core Improvement
```
[ ] 6. Pasar dinamis dengan harga fluktuasi (8 jam)
[ ] 7. Tema visual per musim (CSS theming, 6 jam)
[ ] 8. Efek cuaca lebih imersif (partikel CSS, 5 jam)
[ ] 9. Sistem combo & multiplier (4 jam)
[ ] 10. HUD dashboard yang lebih informatif (4 jam)
```

### 🔵 Minggu 3 — New Features
```
[ ] 11. Upgrade plot per-tile (logic + UI, 10 jam)
[ ] 12. NPC Pedagang Misterius (8 jam)
[ ] 13. Skill tree sederhana (12 jam)
[ ] 14. Kontrak jangka panjang (6 jam)
[ ] 15. Sistem reputasi & gelar (4 jam)
```

### 🟣 Bulan 2 — Big Features
```
[ ] 16. Festival & event spesial bulanan
[ ] 17. Mini-game memancing interaktif
[ ] 18. Sistem bencana & mitigation
[ ] 19. Ekspansi lahan (beli lahan baru)
[ ] 20. Season pass track reward
```

---

## Ringkasan Singkat

| Kategori | Fitur | Impact | Effort |
|----------|-------|:------:|:------:|
| 💰 Ekonomi | Pasar dinamis | ⭐⭐⭐⭐⭐ | 🟡 Sedang |
| 💰 Ekonomi | Spin roda harian | ⭐⭐⭐⭐ | 🟢 Mudah |
| 💰 Ekonomi | Streak login | ⭐⭐⭐⭐⭐ | 🟢 Mudah |
| 💰 Ekonomi | Kontrak jangka panjang | ⭐⭐⭐⭐ | 🟡 Sedang |
| 🎨 Visual | Animasi plot hidup | ⭐⭐⭐⭐⭐ | 🟢 Mudah |
| 🎨 Visual | Tema per musim | ⭐⭐⭐⭐⭐ | 🟢 Mudah |
| 🎨 Visual | Combo floating text | ⭐⭐⭐⭐ | 🟢 Mudah |
| 🎨 Visual | Efek cuaca imersif | ⭐⭐⭐⭐ | 🟡 Sedang |
| 🆕 Fitur | Upgrade plot per-tile | ⭐⭐⭐⭐⭐ | 🔴 Besar |
| 🆕 Fitur | Skill tree | ⭐⭐⭐⭐⭐ | 🔴 Besar |
| 🆕 Fitur | NPC Pedagang | ⭐⭐⭐⭐ | 🟡 Sedang |
| 🆕 Fitur | Festival event | ⭐⭐⭐⭐⭐ | 🔴 Besar |
| 🆕 Fitur | Combo system | ⭐⭐⭐⭐ | 🟢 Mudah |
| 🆕 Fitur | Mini-game pancing | ⭐⭐⭐⭐ | 🟡 Sedang |

---

*Dokumen ini dibuat spesifik untuk repo [Makro62/farm-game](https://github.com/Makro62/farm-game).*
*Semua kode di atas adalah referensi implementasi — sesuaikan dengan struktur file yang sudah ada di `js/src/`.*