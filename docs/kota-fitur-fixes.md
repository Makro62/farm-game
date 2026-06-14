# 📄 Farm Tycoon - Dokumentasi Perbaikan Tab Kota & Fitur

**File:** `kota-fitur-fixes.md`  
**Tanggal:** 14 Juni 2026  
**Versi:** 1.0  
**Status:** Draft / To-Do

---

## 📋 DAFTAR ISI

1. [Ringkasan Masalah](#1-ringkasan-masalah)
2. [Analisis Kondisi Saat Ini](#2-analisis-kondisi-saat-ini)
3. [Perbaikan Yang Disarankan](#3-perbaikan-yang-disarankan)
4. [Spesifikasi Teknis & Mekanik](#4-spesifikasi-teknis--mekanik)
5. [Daftar Bug & Issue](#5-daftar-bug--issue)
6. [Checklist Implementasi](#6-checklist-implementasi)

---

## 1. RINGKASAN MASALAH

### 🎯 Masalah Utama
Tab **Kota & Fitur** memiliki masalah aksesibilitas dan value proposition yang lemah untuk player Level 1:
- ❌ **Danau pancingan kosong**: Tidak ada mekanisme memancing yang terlihat
- ❌ **Semua resep ikan terkunci**: Sushi (Lv 6), Ikan Bakar (Lv 9), Sashimi (higher level)
- ❌ **Bangunan upgrade terlalu mahal**: Range 1.000 - 50.000 💰 (player punya 100 💰)
- ❌ **Dekorasi terkunci Lv 5**: Tidak ada feedback visual untuk player baru
- ❌ **Booster Coin x2 = 100 💰**: Harga sama dengan total uang player (tidak ada insentif)
- ❌ **Pekerja Kota 12.000 💰**: 120x lipat uang player
- ❌ **Tidak ada tutorial**: Player tidak tahu fungsi tab ini

### 📊 Data Player Saat Ini
```
💰 Uang: 100
⭐ Level: 1
📈 XP: 0/100
🏆 Prestige: 0
```

---

## 2. ANALISIS KONDISI SAAT INI

### 2.1 Bangunan & Upgrade

| Bangunan | Level | Max Level | Harga Upgrade | Fungsi | Status |
|----------|-------|-----------|---------------|--------|--------|
| 🏭 Silo | 0/3 | 3 | 1.000 💰 | Kapasitas gudang hasil panen | 🔒 Terlalu Mahal |
| 🏠 Kandang (Barn) | 0/3 | 3 | 2.000 💰 | Kapasitas maksimal hewan | 🔒 Terlalu Mahal |
| 💧 Menara Air | 0/3 | 3 | 3.000 💰 | Siram otomatis | 🔒 Terlalu Mahal |
| 🏡 Rumah Kaca | 0/1 | 1 | 50.000 💰 | Tanaman tumbuh optimal | 🔒 Tidak Terjangkau |
| 🌪️ Kincir Angin | 0/3 | 3 | 5.000 💰 | Percepat crafting | 🔒 Terlalu Mahal |

**Problem:** Semua upgrade 10-500x lipat dari uang player (100 💰).

### 2.2 Dapur Ikan (Masakan Laut)

| Resep | Waktu | Bahan | Harga Jual | Syarat | Status |
|-------|-------|-------|------------|--------|--------|
| 🍣 Sushi | 30s | 0/4 Ikan Nila | 800 💰 (+60) | Lv 6 | 🔒 TERKUNCI |
| 🔥 Ikan Bakar | 45s | 0/3 Ikan Lele | 1.500 💰 (+120) | Lv 9 | 🔒 TERKUNCI |
| 🍱 Sashimi Mas | 60s | 0/2 Ikan Mas, 0/2 Ikan Nila | Premium | Higher Lv | 🔒 TERKUNCI |

**Problem:**
- Semua resep terkunci (Lv 6-9+)
- Bahan ikan tidak jelas cara mendapatkannya
- Danau pancingan kosong (tidak ada mekanisme)

### 2.3 Danau Pemancingan

**Kondisi Saat Ini:**
- Area biru besar kosong
- Tidak ada tombol/interaksi memancing
- Tidak ada indikator ikan yang tersedia
- Tidak ada sistem energi/stamina

### 2.4 Booster

| Booster | Harga | Efek | Value |
|---------|-------|------|-------|
| 💰 Coin x2 | 100 💰 | Double coin untuk waktu tertentu | ⚠️ Semua uang player |

**Problem:** Player harus menghabiskan 100% uang untuk booster → tidak bisa investasi.

### 2.5 Pekerja Kota (Auto)

| Pekerja | Harga | Fitur | Status |
|---------|-------|-------|--------|
| 🏙️ Pedagang Kota | 12.000 💰 | Auto-trade/sell | 🔒 120x uang player |

---

## 3. PERBAIKAN YANG DISARANKAN

### 3.1 🎣 Sistem Memancing Starter (Priority: 🔴 CRITICAL)

```yaml
Fitur: "🎣 Memancing Pemula"
Akses: "GRATIS untuk semua level"
Mekanisme:
  - Klik danau → Mulai memancing
  - Waktu tunggu: 15-30 detik
  - Chance dapat ikan:
    • Ikan Kecil (Common): 60% → Jual 10-20 💰
    • Ikan Nila (Uncommon): 30% → Jual 50 💰
    • Ikan Lele (Rare): 8% → Jual 150 💰
    • Ikan Mas (Epic): 2% → Jual 500 💰
  - Stamina: 10 energi (regenerasi 1 per 5 menit)
  - Energi maksimal: 10 (bisa upgrade)
```

**Alasan:** Memberikan sumber income alternatif tanpa perlu investasi besar.

---

### 3.2 🏗️ Rebalance Harga Bangunan

#### Tier 1: Bangunan Pemula (Lv 1-3)

| Bangunan | Harga Lama | Harga Baru | Level Req | Fungsi Dasar |
|----------|------------|------------|-----------|--------------|
| 🏭 Silo Lv 1 | 1.000 💰 | **150 💰** | Lv 1 | +10 slot inventory |
| 🏠 Kandang Lv 1 | 2.000 💰 | **300 💰** | Lv 2 | +2 slot hewan |
| 💧 Menara Air Lv 1 | 3.000 💰 | **500 💰** | Lv 3 | Siram 1 plot otomatis |

#### Tier 2: Bangunan Menengah (Lv 4-7)

| Bangunan | Harga Baru | Level Req | Fungsi |
|----------|------------|-----------|--------|
| 🏭 Silo Lv 2 | 800 💰 | Lv 4 | +20 slot inventory |
| 🏠 Kandang Lv 2 | 1.500 💰 | Lv 5 | +3 slot hewan |
| 💧 Menara Air Lv 2 | 2.000 💰 | Lv 6 | Siram 3 plot otomatis |
| 🌪️ Kincir Angin Lv 1 | **1.000 💰** | Lv 5 | -10% waktu crafting |

#### Tier 3: Bangunan Advanced (Lv 8+)

| Bangunan | Harga | Level Req | Fungsi |
|----------|-------|-----------|--------|
| 🏭 Silo Lv 3 | 3.000 💰 | Lv 8 | +50 slot inventory |
| 🏠 Kandang Lv 3 | 5.000 💰 | Lv 10 | +5 slot hewan |
| 💧 Menara Air Lv 3 | 8.000 💰 | Lv 10 | Siram semua plot |
| 🌪️ Kincir Angin Lv 2-3 | 3.000-8.000 💰 | Lv 8-12 | -20% to -30% crafting |
| 🏡 Rumah Kaca | 15.000 💰 | Lv 15 | Tanaman selalu optimal |

**Penurunan harga:** 70-85% untuk tier awal.

---

### 3.3 🍣 Resep Dapur Ikan Level Rendah

#### Resep 1: Ikan Goreng (Lv 1) - STARTER
```yaml
Nama: "🐟 Ikan Goreng"
Waktu: "20 detik"
Bahan: "1 Ikan Kecil (dari memancing)"
Jual: "35 💰 (+10 💰 bonus)"
XP: 5
Syarat_Level: 1
Status: "TERBUKA"
Deskripsi: "Resep sederhana untuk pemula"
```

#### Resep 2: Sup Ikan (Lv 2)
```yaml
Nama: "🍲 Sup Ikan"
Waktu: "30 detik"
Bahan: "2 Ikan Kecil"
Jual: "60 💰 (+15 💰 bonus)"
XP: 8
Syarat_Level: 2
Status: "TERBUKA"
```

#### Resep 3: Pepes Ikan (Lv 4)
```yaml
Nama: "🍃 Pepes Ikan"
Waktu: "40 detik"
Bahan: "1 Ikan Nila, 1 Daun Pisang (dari Pertanian)"
Jual: "150 💰 (+30 💰 bonus)"
XP: 12
Syarat_Level: 4
Status: "TERBUKA"
```

#### Resep Existing (Rebalance)

| Resep | Level Lama | Level Baru | Harga Baru |
|-------|------------|------------|------------|
| 🍣 Sushi | Lv 6 | **Lv 5** | 800 💰 |
| 🔥 Ikan Bakar | Lv 9 | **Lv 7** | 1.500 💰 |
| 🍱 Sashimi Mas | Lv 12+ | **Lv 10** | 3.000 💰 |

---

### 3.4 🎮 Mekanisme Danau Pemancingan

**Visual & Interaksi:**
```
┌─────────────────────────────────────────┐
│  DANAU PEMANCINGAN                      │
├─────────────────────────────────────────┤
│                                         │
│         🎣 [MULAI MEMANCING]           │
│                                         │
│  Energi: ████████░░ 8/10               │
│  (+2 dalam 10 menit)                    │
│                                         │
│  Statistik Hari Ini:                    │
│  🐟 Ikan ditangkap: 12                 │
│  💰 Total nilai: 450 💰                │
│  🏆 Ikan terbesar: Ikan Mas (500💰)   │
│                                         │
└─────────────────────────────────────────┘

Popup Saat Memancing:
┌─────────────────────────────────┐
│  MEMANCING...                 │
├─────────────────────────────────┤
│                                 │
│      🎣                         │
│       \                         │
│        \                        │
│    ~~~~~~~~~~~                  │
│                                 │
│  Tunggu 15-30 detik...         │
│                                 │
│  [Batal]                        │
│                                 │
└─────────────────────────────────┘

Hasil Memancing:
┌─────────────────────────────────┐
│ 🎉 DAPAT IKAN!                  │
├─────────────────────────────────┤
│                                 │
│         🐟                      │
│    Ikan Nila                    │
│                                 │
│  Nilai jual: 50 💰             │
│  XP: 3                          │
│                                 │
│  [Jual] [Simpan]                │
│                                 │
└─────────────────────────────────┘
```

**Upgrade Sistem Energi:**
```yaml
Upgrade_Energi_Maksimal:
  Level_1: "10 → 15 energi" = 500 💰
  Level_2: "15 → 20 energi" = 1.500 💰
  Level_3: "20 → 30 energi" = 5.000 💰
  Level_4: "30 → 50 energi" = 15.000 💰

Upgrade_Regenerasi:
  Level_1: "1 per 5 menit → 1 per 3 menit" = 1.000 💰
  Level_2: "1 per 3 menit → 1 per 2 menit" = 3.000 💰
  Level_3: "1 per 2 menit → 1 per 1 menit" = 10.000 💰
```

---

### 3.5 💰 Rebalance Booster

| Booster | Harga Lama | Harga Baru | Durasi | Efek |
|---------|------------|------------|--------|------|
| 💰 Coin x2 | 100 💰 | **50 💰** | 30 menit | Double coin dari jual |
| ⚡ Speed Up | - | **30 💰** | 15 menit | -50% waktu semua proses |
| 🎣 Lucky Fish | - | **40 💰** | 20 menit | +20% chance ikan rare |
| 🌾 Green Thumb | - | **35 💰** | 25 menit | +1 hasil panen |

**Bundle Packs:**
```yaml
Starter_Pack:
  Harga: "200 💰"
  Isi:
    - Coin x2 (30 menit)
    - Speed Up (15 menit)
    - 5 Energi penuh
  Discount: "30% dari harga normal"

Daily_Boost_Pack:
  Harga: "500 💰"
  Isi:
    - Coin x2 (1 jam)
    - Speed Up (30 menit)
    - Lucky Fish (30 menit)
    - Energi penuh
  Limit: "1x per hari"
```

---

### 3.6 👷 Pekerja Kota (Auto) - Tiered System

| Tier | Nama | Harga | Level | Fitur |
|------|------|-------|-------|-------|
| 1 | 🚚 Pedagang Kecil | **600 💰** | Lv 3 | Auto-jual hasil panen (basic) |
| 2 | 🏪 Pedagang Kota | 2.500 💰 | Lv 6 | Auto-jual + auto-beli bibit |
| 3 | 🏢 Merchant Master | 8.000 💰 | Lv 10 | Auto-jual semua + bonus 10% |
| 4 | 👔 Tycoon Trader | 25.000 💰 | Lv 15 | Auto-optimize price + 20% bonus |

---

### 3.7 🎨 Dekorasi (Unlock Progression)

**Problem:** Dekorasi "Terbuka di Level 5" tanpa preview.

**Solusi:**
```yaml
Preview_System:
  - Tampilkan semua dekorasi dengan watermark "LOCKED"
  - Hover untuk lihat info & syarat unlock
  - Klik untuk lihat detail 3D/preview

Dekorasi_Tier:
  Tier_1_Lv_1-3:
    - 🌸 Bunga Pot (50 💰)
    - 🪨 Batu Hias (80 💰)
    - 🌳 Pohon Kecil (100 💰)
  
  Tier_2_Lv_4-6:
    - ⛲ Air Mancur (500 💰)
    - 🗿 Patung (800 💰)
    - 🏮 Lampion (300 💰)
  
  Tier_3_Lv_7-10:
    - 🏰 Istana Mini (5.000 💰)
    - 🌈 Taman Ajaib (3.000 💰)
    - 🎡 Kincir Ria (8.000 💰)
```

---

### 3.8 📚 Tutorial Kota & Fitur

```
Step 1/6:
┌─────────────────────────────────┐
│ 🏙️ KOTA & FITUR                 │
├─────────────────────────────────┤
│ Tab ini adalah pusat upgrade    │
│ dan fitur advanced game kamu!   │
│                                 │
│ Di sini kamu bisa:              │
│ • Upgrade bangunan              │
│ • Memancing di danau            │
│ • Masak masakan laut            │
│ • Beli booster & pekerja        │
│                                 │
│ [Lanjut →]                      │
└─────────────────────────────────┘

Step 2/6:
┌─────────────────────────────────┐
│ 🏗️ BANGUNAN                     │
├─────────────────────────────────┤
│ Bangunan memberikan bonus       │
│ permanen untuk farm kamu!       │
│                                 │
│ Contoh:                         │
│ • Silo = Lebih banyak inventory │
│ • Kandang = Lebih banyak hewan  │
│ • Menara Air = Siram otomatis   │
│                                 │
│ Upgrade sesuai kebutuhanmu!     │
│                                 │
│ [Lanjut →]                      │
└─────────────────────────────────┘

Step 3/6:
┌─────────────────────────────────┐
│ 🎣 DANAU PEMANCINGAN            │
├─────────────────────────────────┤
│ Memancing adalah cara santai    │
│ untuk dapat uang & bahan masak! │
│                                 │
│ Klik danau untuk mulai memancing│
│ (Butuh energi - regenerasi      │
│ otomatis)                       │
│                                 │
│ [Coba Memancing →]              │
└─────────────────────────────────┘

Step 4/6:
┌─────────────────────────────────┐
│ 🍣 DAPUR IKAN                   │
├─────────────────────────────────┤
│ Olah hasil pancingan menjadi    │
│ masakan bernilai tinggi!        │
│                                 │
│ Ikan Goreng (35💰) > Ikan       │
│ mentah (10-20💰)                │
│                                 │
│ Level naik = resep baru terbuka │
│                                 │
│ [Lanjut →]                      │
└─────────────────────────────────┘

Step 5/6:
┌─────────────────────────────────┐
│ ⚡ BOOSTER                       │
├─────────────────────────────────┤
│ Booster memberikan bonus        │
│ temporary untuk boost progress! │
│                                 │
│ Tips:                           │
│ • Coin x2 = Double income       │
│ • Speed Up = 2x lebih cepat     │
│ • Gunakan saat aktif bermain    │
│                                 │
│ [Lihat Booster →]               │
└─────────────────────────────────┘

Step 6/6:
┌─────────────────────────────────┐
│ ✅ SIAP MENGEMBANGKAN KOTA!     │
├─────────────────────────────────┤
│ Tips Pro:                       │
│ • Prioritaskan Silo & Kandang   │
│   di awal untuk ekspansi        │
│ • Memancing saat menunggu       │
│   tanaman/hewan                 │
│ • Masak ikan untuk profit lebih │
│ • Beli booster saat event       │
│                                 │
│ [Mulai Eksplorasi!]             │
└─────────────────────────────────┘
```

---

## 4. SPESIFIKASI TEKNIS & MEKANIK

### 4.1 Database Schema

```sql
-- Tabel Buildings
CREATE TABLE buildings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    type ENUM('silo', 'barn', 'water_tower', 'greenhouse', 'windmill'),
    level INT DEFAULT 0,
    max_level INT,
    base_price INT,
    price_multiplier DECIMAL(3,2) DEFAULT 1.5,
    effect_type VARCHAR(50),
    effect_value DECIMAL(10,2),
    required_level INT
);

-- Tabel Fishing
CREATE TABLE fish_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    sell_price INT,
    xp_reward INT,
    catch_chance DECIMAL(5,2),
    min_level INT DEFAULT 1
);

CREATE TABLE player_fishing_stats (
    player_id INT PRIMARY KEY,
    energy_current INT DEFAULT 10,
    energy_max INT DEFAULT 10,
    regen_rate INT DEFAULT 5, -- minutes per energy
    total_caught INT DEFAULT 0,
    best_catch_id INT,
    FOREIGN KEY (best_catch_id) REFERENCES fish_types(id)
);

CREATE TABLE fishing_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT,
    fish_id INT,
    caught_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    energy_used INT,
    FOREIGN KEY (fish_id) REFERENCES fish_types(id)
);

-- Tabel Decorations
CREATE TABLE decorations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    price INT,
    required_level INT,
    type ENUM('plant', 'statue', 'fountain', 'building'),
    size_x INT,
    size_y INT,
    is_premium BOOLEAN DEFAULT FALSE
);

CREATE TABLE player_decorations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT,
    decoration_id INT,
    position_x INT,
    position_y INT,
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (decoration_id) REFERENCES decorations(id)
);

-- Tabel Boosters
CREATE TABLE boosters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    type ENUM('coin_double', 'speed_up', 'lucky_fish', 'green_thumb'),
    price INT,
    duration_minutes INT,
    effect_multiplier DECIMAL(5,2),
    cooldown_minutes INT DEFAULT 0
);

CREATE TABLE player_active_boosters (
    player_id INT,
    booster_id INT,
    activated_at TIMESTAMP,
    expires_at TIMESTAMP,
    PRIMARY KEY (player_id, booster_id),
    FOREIGN KEY (booster_id) REFERENCES boosters(id)
);
```

### 4.2 API Endpoints

```yaml
# Get building info
GET /api/buildings
Response:
  - id: 1
    name: "Silo"
    type: "silo"
    level: 0
    max_level: 3
    next_upgrade_price: 150
    required_level: 1
    effect: "+10 inventory slots"

# Upgrade building
POST /api/buildings/upgrade
Body:
  building_id: 1
Response:
  success: true
  new_level: 1
  cost: 150
  effect_applied: "+10 inventory slots"

# Fishing - Start
POST /api/fishing/start
Response:
  success: true
  energy_used: 1
  energy_remaining: 9
  estimated_time: "15-30 seconds"
  session_id: "fishing_12345"

# Fishing - Get Result
GET /api/fishing/result/{session_id}
Response:
  success: true
  fish:
    id: 3
    name: "Ikan Nila"
    rarity: "uncommon"
    sell_price: 50
    xp: 3
  message: "Dapat Ikan Nila!"

# Buy booster
POST /api/boosters/buy
Body:
  booster_id: 1
Response:
  success: true
  cost: 50
  duration: "30 minutes"
  activated: true
  expires_at: "2026-06-14T11:30:00Z"

# Cook fish recipe
POST /api/kitchen-fish/cook
Body:
  recipe_id: 1
Response:
  success: true
  estimated_time: 20
  ingredients_used:
    - name: "Ikan Kecil"
      quantity: 1

# Place decoration
POST /api/decorations/place
Body:
  decoration_id: 5
  position_x: 10
  position_y: 15
Response:
  success: true
  cost: 100
  placed: true
```

### 4.3 Frontend Components

```javascript
// Component: FishingPond.vue
<template>
  <div class="fishing-pond">
    <div class="pond-area" @click="startFishing">
      <div class="water-effect"></div>
      <button 
        v-if="canFish" 
        class="fish-btn"
        :disabled="isFishing"
      >
        🎣 {{ isFishing ? 'Memancing...' : 'MULAI MEMANCING' }}
      </button>
      
      <div v-if="isFishing" class="fishing-animation">
        <div class="bobber"></div>
        <div class="ripples"></div>
      </div>
    </div>
    
    <div class="energy-bar">
      <div class="energy-info">
        <span>⚡ Energi:</span>
        <span>{{ playerEnergy }}/{{ maxEnergy }}</span>
      </div>
      <div class="energy-progress">
        <div 
          class="energy-fill" 
          :style="{ width: energyPercent + '%' }"
        ></div>
      </div>
      <div class="regen-info">
        (+1 dalam {{ regenTime }} menit)
      </div>
    </div>
    
    <div class="fishing-stats">
      <h4>Statistik Hari Ini</h4>
      <div class="stat-row">
        <span>🐟 Ikan ditangkap:</span>
        <span>{{ todayStats.caught }}</span>
      </div>
      <div class="stat-row">
        <span>💰 Total nilai:</span>
        <span>{{ todayStats.totalValue }} 💰</span>
      </div>
      <div class="stat-row" v-if="todayStats.bestCatch">
        <span>🏆 Ikan terbesar:</span>
        <span>{{ todayStats.bestCatch.name }}</span>
      </div>
    </div>
    
    <!-- Fish Result Modal -->
    <Modal v-if="showResult" @close="closeResult">
      <div class="fish-result">
        <h2>🎉 DAPAT IKAN!</h2>
        <div class="fish-display">
          <span class="fish-icon">{{ caughtFish.icon }}</span>
          <h3>{{ caughtFish.name }}</h3>
          <span class="rarity" :class="caughtFish.rarity">
            {{ caughtFish.rarity }}
          </span>
        </div>
        <div class="fish-info">
          <p>Nilai jual: {{ caughtFish.sellPrice }} 💰</p>
          <p>XP: +{{ caughtFish.xp }}</p>
        </div>
        <div class="action-buttons">
          <button @click="sellFish" class="btn-sell">
            Jual ({{ caughtFish.sellPrice }} 💰)
          </button>
          <button @click="keepFish" class="btn-keep">
            Simpan
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isFishing: false,
      playerEnergy: 8,
      maxEnergy: 10,
      regenTime: 10,
      showResult: false,
      caughtFish: null,
      todayStats: {
        caught: 12,
        totalValue: 450,
        bestCatch: { name: 'Ikan Mas', value: 500 }
      }
    };
  },
  computed: {
    canFish() {
      return this.playerEnergy > 0 && !this.isFishing;
    },
    energyPercent() {
      return (this.playerEnergy / this.maxEnergy) * 100;
    }
  },
  methods: {
    async startFishing() {
      if (!this.canFish) return;
      
      this.isFishing = true;
      this.playerEnergy--;
      
      // Simulate fishing time (15-30 seconds)
      const fishingTime = Math.floor(Math.random() * 15000) + 15000;
      
      setTimeout(() => {
        this.getCatchResult();
      }, fishingTime);
    },
    
    async getCatchResult() {
      try {
        const response = await api.get('/api/fishing/result');
        this.caughtFish = response.fish;
        this.showResult = true;
      } catch (error) {
        console.error('Fishing error:', error);
      } finally {
        this.isFishing = false;
      }
    },
    
    sellFish() {
      api.post('/api/fish/sell', { fishId: this.caughtFish.id });
      this.$store.commit('addMoney', this.caughtFish.sellPrice);
      this.$store.commit('addXP', this.caughtFish.xp);
      this.showResult = false;
      this.todayStats.caught++;
      this.todayStats.totalValue += this.caughtFish.sellPrice;
    },
    
    keepFish() {
      api.post('/api/fish/keep', { fishId: this.caughtFish.id });
      this.showResult = false;
    },
    
    closeResult() {
      this.showResult = false;
    }
  }
};
</script>

<style scoped>
.fishing-pond {
  position: relative;
}

.pond-area {
  background: linear-gradient(180deg, #4A90E2 0%, #2E5C8A 100%);
  height: 300px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.water-effect {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 20px,
    rgba(255,255,255,0.1) 20px,
    rgba(255,255,255,0.1) 40px
  );
  animation: wave 3s linear infinite;
}

@keyframes wave {
  0% { transform: translateY(0); }
  100% { transform: translateY(40px); }
}

.fish-btn {
  z-index: 10;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
  transition: transform 0.2s;
}

.fish-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.fish-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fishing-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.bobber {
  width: 20px;
  height: 20px;
  background: red;
  border-radius: 50%;
  animation: bob 1s ease-in-out infinite;
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.ripples {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 3px solid rgba(255,255,255,0.6);
  border-radius: 50%;
  animation: ripple 2s ease-out infinite;
}

@keyframes ripple {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.energy-bar {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.energy-progress {
  width: 100%;
  height: 12px;
  background: #ddd;
  border-radius: 6px;
  margin: 8px 0;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}

.fish-result {
  text-align: center;
  padding: 20px;
}

.fish-display {
  margin: 30px 0;
}

.fish-icon {
  font-size: 80px;
  display: block;
  margin-bottom: 10px;
}

.rarity {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.rarity.common { background: #9E9E9E; color: white; }
.rarity.uncommon { background: #4CAF50; color: white; }
.rarity.rare { background: #2196F3; color: white; }
.rarity.epic { background: #9C27B0; color: white; }
.rarity.legendary { background: #FF9800; color: white; }

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-sell, .btn-keep {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-sell {
  background: #4CAF50;
  color: white;
}

.btn-keep {
  background: #2196F3;
  color: white;
}
</style>

// Component: BuildingUpgrade.vue
<template>
  <div class="building-card" :class="{ 'max-level': isMaxLevel }">
    <div class="building-header">
      <span class="building-icon">{{ building.icon }}</span>
      <div class="building-info">
        <h3>{{ building.name }}</h3>
        <span class="level-badge">
          Lv {{ building.level }}/{{ building.maxLevel }}
        </span>
      </div>
    </div>
    
    <div class="building-description">
      {{ building.description }}
    </div>
    
    <div class="current-effect" v-if="building.level > 0">
      <span class="effect-label">Efek aktif:</span>
      <span class="effect-value">{{ building.currentEffect }}</span>
    </div>
    
    <div class="next-level-info" v-if="!isMaxLevel">
      <div class="upgrade-cost">
        <span class="cost-label">Upgrade ke Lv {{ building.level + 1 }}</span>
        <span class="cost-value">{{ building.upgradePrice }} 💰</span>
      </div>
      
      <div class="next-effect">
        Efek baru: {{ building.nextEffect }}
      </div>
      
      <button 
        @click="upgrade" 
        class="upgrade-btn"
        :disabled="!canAfford || !meetsLevelRequirement"
      >
        {{ canAfford ? 'Upgrade' : 'Uang Tidak Cukup' }}
      </button>
      
      <div v-if="!meetsLevelRequirement" class="level-req">
        Butuh Level {{ building.requiredLevel }}
      </div>
    </div>
    
    <div v-else class="max-level-badge">
      ✅ MAX LEVEL
    </div>
  </div>
</template>

<script>
export default {
  props: {
    building: {
      type: Object,
      required: true
    }
  },
  computed: {
    isMaxLevel() {
      return this.building.level >= this.building.maxLevel;
    },
    canAfford() {
      return this.$store.state.money >= this.building.upgradePrice;
    },
    meetsLevelRequirement() {
      return this.$store.state.playerLevel >= this.building.requiredLevel;
    }
  },
  methods: {
    async upgrade() {
      if (!this.canAfford || !this.meetsLevelRequirement) return;
      
      try {
        await api.post('/api/buildings/upgrade', {
          building_id: this.building.id
        });
        
        this.$store.commit('subtractMoney', this.building.upgradePrice);
        this.$emit('upgraded', this.building.id);
        
        this.$toast.success(`${this.building.name} upgraded!`);
      } catch (error) {
        this.$toast.error('Upgrade failed: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>
.building-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.building-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.building-card.max-level {
  border-color: #4CAF50;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%);
}

.building-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.building-icon {
  font-size: 32px;
}

.building-info h3 {
  margin: 0;
  font-size: 16px;
}

.level-badge {
  display: inline-block;
  background: #2196F3;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 4px;
}

.current-effect {
  background: #E3F2FD;
  padding: 8px 12px;
  border-radius: 6px;
  margin: 12px 0;
  font-size: 14px;
}

.effect-label {
  font-weight: bold;
  margin-right: 8px;
}

.effect-value {
  color: #1976D2;
  font-weight: 600;
}

.next-level-info {
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
  margin-top: 12px;
}

.upgrade-cost {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.cost-value {
  font-weight: bold;
  color: #FF9800;
  font-size: 16px;
}

.next-effect {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.upgrade-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.upgrade-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.upgrade-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.level-req {
  color: #f44336;
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
}

.max-level-badge {
  text-align: center;
  color: #4CAF50;
  font-weight: bold;
  font-size: 16px;
  padding: 12px;
}
</style>
```

### 4.4 Game Balance Formula

```javascript
// Building upgrade price calculation
function calculateBuildingPrice(basePrice, currentLevel, multiplier = 1.5) {
  return Math.floor(basePrice * Math.pow(multiplier, currentLevel));
}

// Example:
// Silo Lv 1: 150 * 1.5^0 = 150 💰
// Silo Lv 2: 150 * 1.5^1 = 225 💰
// Silo Lv 3: 150 * 1.5^2 = 338 💰

// Fishing catch probability
function calculateCatchProbability(rarity, luckyBooster = false) {
  const baseRates = {
    common: 60,
    uncommon: 30,
    rare: 8,
    epic: 2,
    legendary: 0.5
  };
  
  let rate = baseRates[rarity];
  
  if (luckyBooster) {
    rate *= 1.2; // +20% chance
  }
  
  return rate;
}

// Energy regeneration time
function calculateRegenTime(baseMinutes, upgradeLevel) {
  const reductions = {
    0: 5,   // 1 per 5 min
    1: 3,   // 1 per 3 min
    2: 2,   // 1 per 2 min
    3: 1    // 1 per 1 min
  };
  
  return reductions[upgradeLevel] || 5;
}

// Booster price with dynamic pricing
function calculateBoosterPrice(basePrice, purchaseCount, lastPurchaseTime) {
  // Price increases with frequent purchases
  const hoursSinceLast = (Date.now() - lastPurchaseTime) / (1000 * 60 * 60);
  
  if (hoursSinceLast < 1) {
    return Math.floor(basePrice * 1.5); // +50% if bought within 1 hour
  }
  
  return basePrice;
}

// Fish cooking profit multiplier
function getCookingProfitMultiplier(recipeLevel) {
  const multipliers = {
    1: 1.5,  // +50% profit
    2: 1.8,  // +80% profit
    3: 2.2,  // +120% profit
    4: 2.8,  // +180% profit
    5: 3.5   // +250% profit
  };
  
  return multipliers[recipeLevel] || 1.5;
}

// Worker auto-sell commission
function calculateWorkerCommission(baseCommission, workerTier) {
  const commissions = {
    1: 0,     // 0% commission (basic)
    2: 0,     // 0% commission
    3: -0.10, // +10% bonus
    4: -0.20  // +20% bonus
  };
  
  return commissions[workerTier] || 0;
}
```

---

## 5. DAFTAR BUG & ISSUE

### 🔴 CRITICAL (Must Fix Before Launch)

| ID | Issue | Impact | Severity |
|----|-------|--------|----------|
| C001 | Danau pancingan tidak interaktif | Fitur utama tidak berfungsi | Critical |
| C002 | Semua resep ikan terkunci (Lv 6+) | Tidak ada value untuk fish | Critical |
| C003 | Bangunan termurah 1.000💰 (10x uang player) | Tidak ada progression | Critical |
| C004 | Tidak ada cara dapat ikan | Bahan masakan tidak tersedia | Critical |

### 🟡 HIGH (Should Fix Sprint 1)

| ID | Issue | Impact | Severity |
|----|-------|--------|----------|
| H001 | Booster Coin x2 = 100% uang player | No incentive to buy | High |
| H002 | Pekerja Kota 12.000💰 (120x uang) | Unaffordable | High |
| H003 | Tidak ada tutorial tab ini | Player tidak tahu fungsi | High |
| H004 | Dekorasi locked tanpa preview | No motivation | High |

### 🟢 MEDIUM (Sprint 2)

| ID | Issue | Impact | Severity |
|----|-------|--------|----------|
| M001 | Tidak ada sistem energi/stamina | Bisa spam memancing | Medium |
| M002 | Tidak ada inventory untuk ikan | Tidak bisa stockpile | Medium |
| M003 | Cross-tab link tidak jelas | Confusing material flow | Medium |
| M004 | Tidak ada achievement memancing | Kurang retention | Medium |

### 🔵 LOW (Polish)

| ID | Issue | Impact | Severity |
|----|-------|--------|----------|
| L001 | Danau biru polos | Visual boring | Low |
| L002 | Tidak ada animasi air | Kurang immersion | Low |
| L003 | Tidak ada sound effect | Kurang satisfying | Low |
| L004 | Layout bisa lebih compact | Space inefficient | Low |

---

## 6. CHECKLIST IMPLEMENTASI

### Phase 1: Core Fishing System (Week 1)
- [ ] Implementasi danau interaktif (klik untuk memancing)
- [ ] Sistem energi (10 energi, regen 1/5 menit)
- [ ] Random fish generation (common-epic)
- [ ] Inventory untuk ikan
- [ ] Jual ikan langsung
- [ ] Resep Ikan Goreng (Lv 1) & Sup Ikan (Lv 2)

### Phase 2: Building Rebalance (Week 2)
- [ ] Turunkan harga bangunan tier 1 (150-500💰)
- [ ] Adjust level requirement (Lv 1-3)
- [ ] Implementasi efek bangunan (inventory, auto-water)
- [ ] Visual progress upgrade
- [ ] Toast notification saat upgrade

### Phase 3: Advanced Features (Week 3)
- [ ] Resep dapur ikan Lv 4-7 (Pepes, Sushi, Ikan Bakar)
- [ ] Booster system (Coin x2, Speed Up, Lucky Fish)
- [ ] Pekerja Kota tiered (600💰 - 25.000💰)
- [ ] Energy upgrade system
- [ ] Fishing statistics tracking

### Phase 4: UX & Tutorial (Week 4)
- [ ] Tutorial popup 6 step
- [ ] Preview dekorasi (watermark locked)
- [ ] Animasi memancing (bobber, ripples)
- [ ] Glow effect saat dapat ikan rare
- [ ] Sound effects (cast, catch, upgrade)
- [ ] Toast notifications

### Phase 5: Polish & Optimization (Week 5)
- [ ] Visual danau upgrade (wave effect, fish jump)
- [ ] Particle effects (splash, coins)
- [ ] Mobile responsive layout
- [ ] Performance optimization (many decorations)
- [ ] Balance testing (profit margins)
- [ ] **DEPLOY TO PRODUCTION** 

---

## 📎 APPENDIX

### A. Progression Loop Ideal (Lv 1-5)

```
START: 100 💰, Lv 1

Day 1:
├─ Beli Silo Lv 1 (150💰) → Butuh 50💰 lagi
├─ Main Pertanian/Peternakan → Dapat 200💰
├─ Beli Silo (150💰) → Inventory +10
├─ Memancing (gratis, pakai energi) → Dapat 5 ikan
│  ├─ 3 Ikan Kecil (jual 30💰)
│  ├─ 1 Ikan Nila (jual 50💰)
│  └─ 1 Ikan Lele (jual 150💰)
├─ Total dari pancing: 230💰
├─ Masak Ikan Goreng (35💰) → Profit +15💰
└─ Uang akhir: ~400💰, XP cukup untuk Lv 2

Day 2:
├─ Lv 2 → Buka Kandang Lv 1 (300💰)
└─ Beli Kandang → Slot hewan +2
├─ Beli booster Coin x2 (50💰)
├─ Main dengan booster → 2x income
├─ Upgrade Menara Air Lv 1 (500💰)
└─ Uang akhir: ~600💰, Lv 3

Day 3-4:
├─ Lv 3 → Buka Kincir Angin (1.000💰)
├─ Beli Pekerja Kota (600💰)
├─ Auto-jual hasil panen
├─ Energy upgrade (500💰) → 15 energi max
└─ Uang akhir: ~1.500💰, Lv 4-5

Day 5+:
├─ Lv 5 → Dekorasi terbuka
├─ Sushi recipe (Lv 5)
├─ Upgrade bangunan tier 2
└─ Fokus ke optimization & collection
```

### B. Cross-Tab Integration Map

```
PERTANIAN              PETERNAKAN              KOTA & FITUR
┌─────────────┐       ┌─────────────┐        ┌─────────────┐
│ 🌾 Gandum   │       │ 🐔 Ayam     │        │ 🎣 Danau    │
│ 🌽 Jagung   │       │ 🐄 Sapi     │        │             │
│ 🥕 Wortel   │       │ 🐝 Lebah    │        │ 🍣 Dapur    │
│ 🍅 Tomat    │       │             │        │ 🏗️ Bangunan │
└──────┬──────┘       └──────┬──────┘        └──────┬──────┘
       │                     │                      │
       │ Daun Pisang         │ Telur                │ Ikan
       │ (untuk Pepes)       │ (untuk Kue)          │ (untuk Sushi)
       │                     │                      │
       └──────────┬──────────┴──────────────────────┘
                  │
            DAPUR PRODUCTION
       (Olah jadi produk bernilai tinggi)
                  │
                  ↓
            JUAL → 💰💰
```

### C. Economy Balance Check

```
Income Sources (Lv 1):
├─ Pertanian: Gandum → +40💰 per 30s
├─ Peternakan: Ayam → +10💰 per 10s (telur)
└─ Memancing: Ikan → +30-50💰 per 30s (avg)

Combined Income (1 hour):
├─ Pertanian (120 cycles): 4.800💰
├─ Peternakan (360 cycles): 3.600💰
└─ Memancing (120 cycles): 4.800💰
Total: ~13.200💰 per hour (active play)

Upgrade Costs (Tier 1):
├─ Silo Lv 1: 150💰 (1.1% of hourly income)
├─ Kandang Lv 1: 300💰 (2.3%)
├─ Menara Air Lv 1: 500💰 (3.8%)
└─ Kincir Angin Lv 1: 1.000💰 (7.6%)

Verdict: ✅ AFFORDABLE dengan 5-30 menit play
```

### D. Referensi Desain
- [Animal Crossing Fishing System](https://animal-crossing.fandom.com/wiki/Fishing)
- [Stardew Valley Building Upgrades](https://stardewvalleywiki.com/Buildings)
- [Hay Day Decorations](https://hayday.fandom.com/wiki/Decorations)
- [FarmVille Boosters](https://farmville.fandom.com/wiki/Boosters)

---

**Dokumen ini dibuat oleh:** [Nama Anda]  
**Tanggal:** 14 Juni 2026  
**Status:** Draft - Menunggu Review  
**Next Review:** 21 Juni 2026

---

*© 2026 Farm Tycoon Development Team. Confidential.*

---

## 🚀 QUICK START GUIDE

**Untuk Developer:**
1. Copy file ini ke `/docs/kota-fitur-fixes.md`
2. **PRIORITAS UTAMA:** Implementasi sistem memancing (C001)
3. Rebalance harga bangunan (turunkan 70-85%)
4. Tambahkan resep ikan Lv 1-2
5. Update checklist setiap sprint

**Untuk Designer:**
1. Fokus pada visual danau (wave animation, fish jump)
2. Buat mockup fishing UI dengan modal result
3. Design rarity badges (common-legendary)
4. Icon set untuk bangunan & dekorasi

**Untuk Product Manager:**
1. Validate economy balance dengan spreadsheet
2. Pastikan progression smooth (Lv 1-5 dalam 1 minggu)
3. Monitor engagement rate tab Kota & Fitur
4. A/B test harga booster (50💰 vs 75💰)

---

**END OF DOCUMENT**
