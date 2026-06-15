# 🌾 Farm Tycoon — Dokumen Perbaikan & Pengembangan Lengkap
 
> **Repository:** [github.com/Makro62/farm-game](https://github.com/Makro62/farm-game )
> **Dibuat:** Juni 2026
> **Versi Dokumen:** 2.0
 
---
 
## Daftar Isi
 
1. [Gambaran Umum & Arsitektur Sistem](#1-gambaran-umum--arsitektur-sistem)
2. [Alur Pembelian (Purchase Flow)](#2-alur-pembelian-purchase-flow)
3. [Alur Farming (Crop System)](#3-alur-farming-crop-system)
4. [Alur Peternakan (Animal System)](#4-alur-peternakan-animal-system)
5. [Alur Crafting / Dapur Produksi](#5-alur-crafting--dapur-produksi)
6. [Alur Pesanan (Order Board)](#6-alur-pesanan-order-board)
7. [Sistem Kurcaci (Auto-Farm)](#7-sistem-kurcaci-auto-farm)
8. [Sistem Cuaca & Efeknya](#8-sistem-cuaca--efeknya)
9. [Sistem Bangunan & Upgrade](#9-sistem-bangunan--upgrade)
10. [Sistem Save / Load & Keamanan](#10-sistem-save--load--keamanan)
11. [FITUR BARU: Sistem Musim (Seasons)](#11-fitur-baru-sistem-musim-seasons)
12. [FITUR BARU: NPC & Friendship System](#12-fitur-baru-npc--friendship-system)
13. [FITUR BARU: Sistem Pertambangan](#13-fitur-baru-sistem-pertambangan)
14. [FITUR BARU: Mini-Game Memancing Interaktif](#14-fitur-baru-mini-game-memancing-interaktif)
15. [FITUR BARU: Drag-and-Drop Layout Farm](#15-fitur-baru-drag-and-drop-layout-farm)
16. [FITUR BARU: Leaderboard & Multiplayer](#16-fitur-baru-leaderboard--multiplayer)
17. [FITUR BARU: Event Spesial & Festival](#17-fitur-baru-event-spesial--festival)
18. [Perbaikan Teknis & Refactoring](#18-perbaikan-teknis--refactoring)
19. [Roadmap Implementasi](#19-roadmap-implementasi)
 
---
 
## 1. Gambaran Umum & Arsitektur Sistem
 
Farm Tycoon adalah web-game berbasis browser yang dibangun dengan **HTML5, CSS3, dan Vanilla JavaScript (ES Modules)**. Arsitekturnya modular dengan pemisahan layer yang jelas: Data → Core → Systems → Managers → UI.
 
### 1.1 Struktur Folder Lengkap
 
```
farm-game/
├── index.html                    # Entry point. Struktur HTML 3-tab utama
├── css/
│   └── style.css                 # Styling global: glassmorphism, animasi, responsif (21KB+)
└── js/src/
    ├── main.js                   # Bootstrap: import semua modul, initGame(), keyboard shortcuts
    ├── core/
    │   ├── state.js              # Global state (S): coins, level, XP, inventory, plots, animals
    │   ├── game-engine.js        # Game loop via requestAnimationFrame & setInterval
    │   ├── save-manager.js       # Save/Load localStorage + SHA-256 hash
    │   └── security.js           # Anti-cheat: verifikasi hash setiap load
    ├── data/
    │   ├── crops.js              # Config tanaman: bibit, waktu tumbuh, harga beli/jual
    │   ├── animals.js            # Config hewan: produk, interval produksi, biaya
    │   ├── buildings.js          # Config bangunan: level upgrade, efek, biaya
    │   ├── crafting.js           # Resep produksi: bahan, output, waktu
    │   ├── items.js              # Definisi semua item dalam inventory
    │   ├── fishes.js             # Data ikan dan waktu pancing
    │   └── config.js             # Konstanta global (DEFAULT_INVENTORY_CAPACITY, dll)
    ├── systems/
    │   ├── crop-system.js        # Logic: tanam, siram, panen, kalkulasi grow time
    │   ├── animal-system.js      # Logic: beli hewan, produksi, pergerakan animasi
    │   ├── economy-system.js     # Logic: beli/jual, harga, XP, level
    │   ├── quest-system.js       # Order board, daily quest, reward
    │   ├── weather-system.js     # Cuaca random, efek modifier, siklus timer
    │   ├── gnome-system.js       # Auto-farm: kurcaci panen, tanam, kumpul
    │   ├── building-system.js    # Beli & upgrade bangunan
    │   ├── crafting-system.js    # Antrian produksi, timer craft
    │   └── fish-system.js        # Danau, tebar bibit, tangkap ikan
    ├── managers/
    │   ├── audio-manager.js      # Web Audio API: BGM, SFX
    │   ├── notification-manager.js # Toast popup, modal konfirmasi
    │   └── ui-manager.js         # Event listener, binding tombol ke sistem
    ├── ui/
    │   ├── farm-ui.js            # Render petak tanah & status pertumbuhan
    │   ├── shop-ui.js            # Render daftar toko bibit dan bangunan
    │   ├── inventory-ui.js       # Render inventory, quest, order board
    │   ├── building-ui.js        # Render elemen bangunan
    │   ├── crafting-ui.js        # Render antrian & resep crafting
    │   └── core-ui.js            # Render elemen UI inti (topbar, XP bar)
    └── utils/
        └── helpers.js            # Fungsi utilitas: format angka, addXP, achievements
```
 
### 1.2 Alur Data Utama
 
```
User Interaction
      │
      ▼
UI Event (klik/keyboard)
      │
      ▼
System (crop-system, animal-system, dll)
      │
      ▼
State Update (state.js)
      │
      ▼
UI Re-render (dipanggil manual)
      │
      ▼
DOM Update (tampilan berubah)
```
 
> ⚠️ **Masalah:** UI re-render bersifat **manual** — developer harus memanggil fungsi render secara eksplisit setiap kali state berubah. Rawan lupa dan menyebabkan UI tidak sinkron.
 
### 1.3 Masalah Arsitektur Saat Ini
 
| Masalah | Dampak | Solusi |
|---|---|---|
| UI re-render manual | UI tidak sync jika render terlupa | EventBus / Reaktivitas |
| Global state `S` diakses langsung semua file | Coupling tinggi, sulit di-test | State management terpusat |
| Tidak ada bundler | Banyak HTTP request saat load | Vite |
| Tidak ada TypeScript | Runtime error dari typo properti | Migrasi ke TypeScript |
| `style.css` monolitik 21KB+ | Konflik nama class, sulit maintain | CSS Modules / SASS |
 
---
 
## 2. Alur Pembelian (Purchase Flow)
 
Sistem pembelian mencakup 4 kategori utama: **Bibit Tanaman**, **Hewan Ternak**, **Bangunan**, dan **Dekorasi**. Setiap kategori memiliki validasi bertingkat sebelum transaksi terjadi.
 
### 2.1 Flow Pembelian Bibit Tanaman 🌱
 
```
[1] Buka Tab Pertanian
     └─ UI render sidebar Shop Bibit + grid petak tanah
 
[2] Pilih Bibit
     └─ Klik item bibit di sidebar ATAU tekan tombol 1-6
     └─ state.selectedSeed = cropId
     └─ Tombol bibit mendapat class "active"
 
[3] Klik Plot Tanah
     └─ clickPlot(plotIndex) dipanggil
     └─ Switch-case cek state plot saat ini
 
[4] Validasi (SEMUA harus lulus)
     ├─ S.coins >= cropConfig.buyPrice          → ✅ lanjut / ❌ toast error
     ├─ plot.state === 'empty'                   → ✅ lanjut / ❌ toast info
     └─ !isInventoryFull()                       → ✅ lanjut / ❌ toast warning
 
[5] Deduct Koin
     └─ S.coins -= cropConfig.buyPrice
     └─ UI update #coin-val di topbar
 
[6] Plant Seed
     └─ plot = { cropId, plantedAt: Date.now(), watered: false, growthStage: 0 }
     └─ plot.state = 'growing'
 
[7] Re-render
     └─ renderFarm() dipanggil
     └─ Plot tampilkan emoji bibit + progress bar
 
[8] Notifikasi
     └─ Toast: "🌱 [NamaBibit] ditanam!"
```
 
**Data Bibit Tersedia:**
 
| Bibit | Harga Beli | Waktu Tumbuh | Harga Jual | XP |
|---|---|---|---|---|
| 🥕 Wortel | 15 koin | 30 detik | 50 koin | 5 |
| 🌽 Jagung | 30 koin | 60 detik | 90 koin | 10 |
| 🍅 Tomat | 50 koin | 90 detik | 130 koin | 15 |
| 🍓 Stroberi | 70 koin | 120 detik | 200 koin | 25 |
| 🍍 Nanas | 100 koin | 180 detik | 350 koin | 40 |
| 🎃 Labu Emas | 200 koin | 300 detik | 700 koin | 80 |
 
---
 
### 2.2 Flow Pembelian Hewan 🐄
 
```
[1] Buka Tab Peternakan
     └─ Sidebar tampilkan daftar hewan yang bisa dibeli
 
[2] Klik "Beli [Nama Hewan]"
     └─ canBuyAnimal() dipanggil
 
[3] Validasi canBuyAnimal()
     ├─ S.coins >= animalConfig.price            → ✅ / ❌ "Koin tidak cukup"
     ├─ S.level >= animalConfig.requiredLevel    → ✅ / ❌ "Level belum cukup"
     └─ !isBarnFull()                            → ✅ / ❌ "Kandang penuh, upgrade Barn"
 
[4] Deduct & Spawn
     └─ S.coins -= animalConfig.price
     └─ Buat objek hewan baru:
        { id: uuid(), type, x: random(), y: random(), lastProductTime: Date.now() }
     └─ Push ke S.animals[]
 
[5] Animasi Spawn
     └─ Hewan muncul di area peternakan
     └─ CSS animation "pop-in"
     └─ Mulai movement loop
 
[6] Notifikasi
     └─ Toast: "🐔 Ayam baru bergabung di peternakan!"
```
 
**Data Hewan Ternak:**
 
| Hewan | Harga | Req. Level | Produk | Interval | Nilai Jual |
|---|---|---|---|---|---|
| 🐔 Ayam | 500 koin | Lv 1 | 🥚 Telur | 60 detik | 60 koin |
| 🐄 Sapi | 1.500 koin | Lv 3 | 🥛 Susu | 120 detik | 150 koin |
| 🐝 Lebah Madu | 2.000 koin | Lv 5 | 🍯 Madu | 180 detik | 200 koin |
 
---
 
### 2.3 Flow Pembelian Bangunan & Upgrade 🏗️
 
```
[1] Buka Tab Kota → Sidebar "Bangunan"
 
[2] Klik bangunan target
 
[3] Validasi
     ├─ S.buildings[id].level < maxLevel         → ✅ / ❌ "Sudah level maksimal"
     └─ S.coins >= upgradeCost[currentLevel]     → ✅ / ❌ "Koin tidak cukup"
 
[4] Eksekusi Upgrade
     └─ S.buildings[buildingId].level++
     └─ S.coins -= cost
     └─ Efek langsung aktif (kapasitas, timer, dll berubah)
 
[5] Re-render Building UI + Topbar
```
 
**Data Bangunan:**
 
| Bangunan | Biaya Upgrade (Lv1→Lv5) | Efek per Level |
|---|---|---|
| 🏠 Silo | 500 → 1.500 → 3.000 → 5.000 → 8.000 koin | Inventory +50 slot (max 500) |
| 🏡 Kandang (Barn) | 1.000 → 3.000 → 6.000 → 10.000 → 15.000 koin | Max hewan +3 (max 15) |
| 💧 Menara Air | 800 → 2.000 → 4.000 → 7.000 → 12.000 koin | Grow time -10% per level (max -50%) |
| 🏚️ Rumah Kaca | 2.000 → 8.000 → 20.000 koin | Netralisir cuaca buruk (3 tier) |
| 💨 Kincir Angin | 1.500 → 4.000 → 8.000 → 13.000 → 18.000 koin | Crafting speed +15% per level (max +75%) |
 
---
 
## 3. Alur Farming (Crop System)
 
Sistem farming adalah **inti game**. Setiap plot tanah memiliki state machine 4-state yang dikelola oleh `crop-system.js`.
 
### 3.1 State Machine Plot Tanah
 
```
         ┌──────────────────────────────────────────────┐
         │                                              │
    [EMPTY / RUMPUT]                              [setelah panen]
         │                                              │
         │ klik + ada bibit terpilih                   │
         ▼                                              │
      [GROWING]  ◄──── klik siram (watered: true) ─────┤
         │                                              │
         │ timer growTime selesai                       │
         ▼                                              │
      [READY]                                           │
         │                                              │
         │ klik panen                                   │
         └──────────────────────────────────────────────┘
```
 
**State Detail:**
 
| State | Tampilan UI | Aksi Tersedia |
|---|---|---|
| `empty` (rumput) | Rumput hijau | Klik = `clearGrass()` |
| `empty` (bersih) | Kotak kosong | Klik + bibit = `plantSeed()` |
| `growing` | Emoji bibit + progress bar | Klik = `waterPlant()` |
| `ready` | Emoji tanaman penuh + glow | Klik = `harvestCrop()` |
 
---
 
### 3.2 Kalkulasi Waktu Tumbuh
 
Fungsi `calculateGrowTime()` menghitung waktu tumbuh final dengan semua modifier:
 
```
growTime = baseGrowTime × weatherModifier × buildingModifier × boosterModifier × waterModifier
```
 
**Tabel Modifier:**
 
| Faktor | Modifier | Catatan |
|---|---|---|
| ☀️ Cerah | 1.0x | Normal |
| ⛅ Berawan | 1.05x | Sedikit lebih lambat |
| 🌧️ Hujan | 0.8x | 20% lebih cepat |
| ⛈️ Badai | 1.3x | 30% lebih lambat |
| 💨 Berangin | 0.9x | 10% lebih cepat |
| 💧 Menara Air Lv1 | 0.9x | -10% waktu |
| 💧 Menara Air Lv3 | 0.7x | -30% waktu |
| 💧 Menara Air Lv5 | 0.5x | -50% waktu |
| ⚡ Growth Booster | 0.67x | ×1.5 kecepatan (50 koin, 5 menit) |
| 💦 Sudah Disiram | 0.7x | -30% waktu jika `watered: true` |
| 🏚️ Rumah Kaca | Netralisir cuaca | Cuaca buruk → diabaikan |
 
---
 
### 3.3 Flow Lengkap Satu Siklus Farming
 
```
LANGKAH 1: Pilih Bibit
  └─ Tekan 1-6 atau klik sidebar
  └─ state.selectedSeed = 'carrot' (contoh)
 
LANGKAH 2: Klik Plot
  └─ clickPlot(3) dipanggil (plot index 3)
  └─ switch(plot.state):
 
  CASE 'grass' → clearGrass()
    └─ plot.state = 'empty'
    └─ Render ulang plot
    └─ [Perlu klik sekali lagi untuk tanam]
 
  CASE 'empty' + selectedSeed → plantSeed()
    └─ Validasi coins & inventory
    └─ S.coins -= cropConfig.buyPrice
    └─ plot = { cropId: 'carrot', plantedAt: Date.now(), watered: false }
    └─ plot.state = 'growing'
 
  CASE 'growing' → waterPlant()
    └─ if (!plot.watered):
         plot.watered = true
         plot.wateredAt = Date.now()
         growTime dikurangi ×0.7
         Toast: "💧 Tanaman disiram!"
    └─ else: Toast: "Tanaman sudah disiram"
 
  CASE 'ready' → harvestCrop()
    └─ hasil = cropConfig.yield × prestigeBonus
    └─ addToInventory(cropId, hasil)
    └─ addXP(cropConfig.xp)
    └─ plot.state = 'empty'
    └─ checkQuestCompletion()  ← auto-check semua order
 
LANGKAH 3: Game Loop Tick (setiap 1 detik)
  └─ updateCrops() dipanggil
  └─ Untuk setiap plot 'growing':
       progress = (Date.now() - plantedAt) / growTime
       if (progress >= 1.0) → plot.state = 'ready'
       else → update progress bar DOM
```
 
---
 
### 3.4 Fungsi Modular crop-system.js (Setelah Refactor)
 
Refactor yang sudah dilakukan membagi `clickPlot()` besar menjadi fungsi-fungsi kecil dengan *single responsibility*:
 
```javascript
// Sebelum Refactor (80+ baris nested if-else)
function clickPlot(index) {
  if (plot.state === 'grass') {
    if (selectedSeed) {
      if (coins >= price) {
        if (!inventoryFull) {
          // ... 30+ baris lagi
        }
      }
    }
  }
}
 
// Sesudah Refactor (clean, modular)
function clickPlot(index) {
  const plot = S.plots[index];
  if (!plot) return;
 
  switch (plot.state) {
    case 'grass':   return clearGrass(plot);
    case 'empty':   return plantSeed(plot, S.selectedSeed);
    case 'growing': return waterPlant(plot);
    case 'ready':   return harvestCrop(plot);
  }
}
 
function isInventoryFull() { return S.inventory.length >= S.config.maxInventory; }
function calculateGrowTime(cropId) { /* semua modifier */ }
function clearGrass(plot) { /* single concern */ }
function plantSeed(plot, cropId) { /* single concern */ }
function waterPlant(plot) { /* single concern */ }
function harvestCrop(plot) { /* single concern */ }
```
 
---
 
## 4. Alur Peternakan (Animal System)
 
Hewan bergerak bebas di area peternakan dengan animasi real-time. Setiap hewan memiliki timer produksi independen.
 
### 4.1 Siklus Hidup & Produksi Hewan
 
```
[1] SPAWN
     └─ canBuyAnimal() validasi (coins, level, barn space)
     └─ Hewan spawn di posisi random CSS absolute
     └─ { id, type, x: rand(), y: rand(), lastProductTime: Date.now() }
 
[2] MOVEMENT LOOP (setiap 2 detik via game-engine tick)
     └─ Untuk setiap hewan di S.animals[]:
          newX = animal.x + (Math.random() * 10 - 5)
          newY = animal.y + (Math.random() * 10 - 5)
          // Clamp dalam boundary area
          animal.x = Math.max(5, Math.min(90, newX))
          animal.y = Math.max(5, Math.min(85, newY))
          // Update CSS position
          el.style.left = animal.x + '%'
          el.style.top  = animal.y + '%'
 
[3] PRODUCTION CHECK (setiap game tick)
     └─ elapsed = Date.now() - animal.lastProductTime
     └─ if (elapsed >= animalConfig.productionInterval):
          triggerProduction(animal)
 
[4] triggerProduction()
     └─ S.animalProducts.push({ type: productId, producedAt: Date.now() })
     └─ Bubble emoji muncul di atas hewan (CSS animation)
     └─ Sound effect diputar
     └─ animal.lastProductTime = Date.now()
 
[5] COLLECT
     Manual: Klik hewan/bubble → collectProduct()
     Auto:   Kurcaci Peternak scan setiap 5 detik
 
[6] collectProduct()
     └─ if (!isInventoryFull()):
          addToInventory(productId, 1)
          addXP(productConfig.xp)
          S.animalProducts splice item
     └─ else: Toast warning "Inventory penuh!"
```
 
### 4.2 Pergerakan Hewan — Detail Teknis
 
```javascript
// Sebelum Refactor (nama variabel singkat, confusing)
function updateAnimal(a) {
  let conf = ANIMALS[a.type];
  let tx = a.x + (Math.random() - 0.5) * conf.speed;
  let ty = a.y + (Math.random() - 0.5) * conf.speed;
  a.x = Math.max(0, Math.min(100, tx));
  a.y = Math.max(0, Math.min(100, ty));
}
 
// Sesudah Refactor (descriptive, clear)
function updateAnimalPosition(animal) {
  const config = ANIMAL_CONFIG[animal.type];
  const speedFactor = config.movementSpeed ?? 5;
 
  animal.x = clampPosition(animal.x + (Math.random() - 0.5) * speedFactor, 5, 90);
  animal.y = clampPosition(animal.y + (Math.random() - 0.5) * speedFactor, 5, 85);
 
  const element = document.getElementById(`animal-${animal.id}`);
  if (element) {
    element.style.left = `${animal.x}%`;
    element.style.top  = `${animal.y}%`;
  }
}
```
 
---
 
## 5. Alur Crafting / Dapur Produksi
 
Crafting mengolah bahan mentah menjadi produk bernilai tinggi via **antrian produksi (queue)**.
 
### 5.1 Flow Crafting Lengkap
 
```
[1] Pilih Resep
     └─ Klik resep di panel Dapur Produksi
     └─ Tab Farm → produk tanaman | Tab Peternakan → produk hewan
 
[2] Validasi Bahan
     └─ crafting-system.js cek setiap bahan di S.inventory
     └─ Kurang 1 bahan saja → Toast error merah "Bahan tidak cukup"
 
[3] Deduct Bahan & Masuk Queue
     └─ Kurangi setiap bahan dari inventory
     └─ Push ke craftingQueue: { recipeId, startTime: Date.now(), duration }
 
[4] Timer Crafting (game loop setiap detik)
     └─ Progress = (Date.now() - startTime) / duration
     └─ Progress bar diupdate di UI
     └─ if (progress >= 1.0) → completeCraft()
 
[5] completeCraft()
     └─ Output masuk S.inventory
     └─ addXP(recipeConfig.xp)
     └─ Toast hijau "✅ [Produk] selesai dibuat!"
     └─ Queue item dihapus
     └─ Item berikutnya di queue langsung startTime = Date.now()
```
 
### 5.2 Daftar Resep Crafting
 
| Produk | Bahan | Waktu | Nilai Jual | XP |
|---|---|---|---|---|
| 🥣 Sup Wortel | 3x Wortel + 1x Air | 5 menit | 200 koin | 30 |
| 🌾 Tepung Jagung | 4x Jagung | 4 menit | 180 koin | 25 |
| 🧀 Keju | 5x Susu | 8 menit | 500 koin | 60 |
| 🎂 Kue | 2x Tepung + 2x Telur + 1x Susu | 12 menit | 800 koin | 90 |
| 🥧 Pie Tomat | 3x Tomat + 2x Tepung | 10 menit | 600 koin | 70 |
| 🍓 Selai Stroberi | 5x Stroberi + 1x Gula | 7 menit | 450 koin | 50 |
| 🫙 Madu Premium | 3x Madu + 1x Toples | 6 menit | 650 koin | 65 |
 
> 💡 **Tips:** Upgrade Kincir Angin untuk kurangi waktu crafting hingga **75%** di level maksimal. Queue hingga 5 resep sekaligus agar produksi berjalan idle.
 
---
 
## 6. Alur Pesanan (Order Board)
 
Order Board menghasilkan pesanan dinamis dengan timer. Menyelesaikan pesanan memberikan bonus Koin & XP lebih besar dari menjual langsung.
 
### 6.1 Flow Order Board
 
```
[1] Generate Orders
     └─ Saat game load → generate 3-5 order aktif
     └─ Setiap 10 menit → refresh order yang expired
     └─ Struktur order:
        {
          id: uuid(),
          items: [{ itemId: 'carrot', qty: 5 }, { itemId: 'milk', qty: 2 }],
          reward: { coins: 800, xp: 120 },
          timer: 600,  // detik
          type: 'normal' | 'premium' | 'express'
        }
 
[2] Tampilan UI
     └─ Setiap order = card di #order-board
     └─ Tampilkan: item yang diminta, reward, countdown timer
     └─ Timer berjalan real-time (update setiap detik)
 
[3] Fulfill Order
     └─ Pemain klik tombol "Penuhi"
     └─ Validasi: apakah semua item ada di S.inventory?
     └─ Deduct item dari inventory
     └─ S.coins += reward.coins × prestigeMultiplier
     └─ addXP(reward.xp)
     └─ Order dihapus → generate order baru sebagai pengganti
 
[4] Order Expired
     └─ Timer mencapai 0 → order hilang tanpa reward
     └─ Generate order baru
     └─ Toast: "⏰ Pesanan [nama] expired!"
```
 
### 6.2 Tipe Pesanan
 
| Tipe | Item yang Diminta | Reward | Timer | Catatan |
|---|---|---|---|---|
| Normal | 1–3 item bahan mentah | 100–500 koin + 20–80 XP | 10 menit | Paling umum |
| Premium | 3–5 item campuran crafting | 500–2.000 koin + 100–300 XP | 20 menit | Butuh produk crafting |
| Express | 1–2 item | ×2 koin dari normal | 3 menit | Urgensi tinggi, reward besar |
| Festival | Item langka/musiman | Item eksklusif + koin besar | 30 menit | Hanya saat event aktif |
 
---
 
## 7. Sistem Kurcaci (Auto-Farm)
 
Kurcaci adalah pekerja otomatis yang melakukan tugas farming/peternakan tanpa interaksi pemain.
 
### 7.1 Kurcaci Petani 🧙‍♂️
 
**Harga:** 5.000 koin | **Toggle:** Tombol "🧙‍♂️ Auto: OFF/ON" di farm header
 
```
Loop setiap 5 detik saat gnome.active === true:
 
  HARVEST SCAN
  └─ for (plot of S.plots where state === 'ready'):
       harvestCrop(plot)
       → item masuk inventory
 
  REPLANT
  └─ for (plot of S.plots where state === 'empty' && !isGrass):
       if (S.inventory.has(lastCropSeed)):
         plantSeed(plot, lastCropSeed)
 
  WATER SCAN (setiap 10 detik)
  └─ for (plot of S.plots where state === 'growing' && !watered):
       waterPlant(plot)
 
  ORDER CHECK (setiap 15 detik)
  └─ for (order of activeOrders):
       if (inventoryHasAllItems(order.items)):
         fulfillOrder(order)
```
 
### 7.2 Kurcaci Peternak 🧑‍🍳
 
**Harga:** 8.000 koin | **Toggle:** Tombol "🧑‍🍳 Auto: OFF/ON" di animal header
 
```
Loop setiap 5 detik saat gnomeAnimal.active === true:
 
  COLLECT SCAN
  └─ for (product of S.animalProducts):
       if (!isInventoryFull()):
         collectProduct(product)
 
  AUTO CRAFT (setiap 30 detik)
  └─ for (recipe of availableRecipes):
       if (inventoryHasAllIngredients(recipe) && queueLength < 5):
         addToCraftQueue(recipe)
 
  ORDER DELIVERY (setiap 15 detik)
  └─ Sama seperti Kurcaci Petani
```
 
---
 
## 8. Sistem Cuaca & Efeknya
 
Cuaca berubah secara acak setiap **5 menit** dan mempengaruhi kecepatan tumbuh, produksi hewan, dan visual game.
 
### 8.1 Jenis Cuaca & Efek
 
| Cuaca | Grow Time | Produksi Hewan | Efek Visual |
|---|---|---|---|
| ☀️ Cerah | 1.0x | 1.0x | Latar terang, tidak ada partikel |
| ⛅ Berawan | 1.05x | 0.95x | Bayangan ringan, awan bergerak CSS |
| 🌧️ Hujan | 0.8x | 0.9x | Animasi rain particle, tanaman auto-watered |
| ⛈️ Badai | 1.3x | 0.7x | Hujan lebat + petir, hewan freeze animasi |
| 💨 Berangin | 0.9x | 1.1x | Daun bergerak, kincir angin cepat |
 
### 8.2 Flow Pergantian Cuaca
 
```
Timer cuaca (default 5 menit)
  │
  ▼
weatherSystem.changeWeather()
  │
  ├─ Random pilih cuaca baru (weighted probability)
  │    Cerah: 35% | Berawan: 25% | Hujan: 20% | Badai: 10% | Berangin: 10%
  │
  ├─ Update S.weather.current
  ├─ Update modifier di game-engine
  ├─ Update #weather-chip di topbar
  ├─ Update visual (add/remove CSS class di body)
  └─ Reset countdown timer
```
 
### 8.3 Interaksi dengan Bangunan
 
```
Rumah Kaca (Greenhouse) aktif?
  ├─ YA:
  │    ├─ Cuaca negatif (Badai, Berawan) → grow modifier diabaikan (tetap 1.0x)
  │    └─ Cuaca positif (Hujan, Berangin) → TETAP memberikan bonus
  └─ TIDAK:
       └─ Semua modifier cuaca berlaku penuh
```
 
---
 
## 9. Sistem Bangunan & Upgrade
 
Bangunan memberikan efek permanen yang meningkat per level. Biaya upgrade menggunakan **kurva eksponensial**.
 
### 9.1 Detail Upgrade Per Bangunan
 
**🏠 Silo (Kapasitas Inventory)**
 
| Level | Biaya | Kapasitas |
|---|---|---|
| Lv 1 | 500 koin | 50 slot |
| Lv 2 | 1.500 koin | 100 slot |
| Lv 3 | 3.000 koin | 150 slot |
| Lv 4 | 5.000 koin | 250 slot |
| Lv 5 | 8.000 koin | 500 slot |
 
**🏡 Kandang / Barn (Max Hewan)**
 
| Level | Biaya | Max Hewan |
|---|---|---|
| Lv 1 | 1.000 koin | 3 ekor |
| Lv 2 | 3.000 koin | 6 ekor |
| Lv 3 | 6.000 koin | 9 ekor |
| Lv 4 | 10.000 koin | 12 ekor |
| Lv 5 | 15.000 koin | 15 ekor |
 
**💧 Menara Air (Grow Time Reduction)**
 
| Level | Biaya | Efek |
|---|---|---|
| Lv 1 | 800 koin | −10% grow time |
| Lv 2 | 2.000 koin | −20% grow time |
| Lv 3 | 4.000 koin | −30% grow time |
| Lv 4 | 7.000 koin | −40% grow time |
| Lv 5 | 12.000 koin | −50% grow time |
 
---
 
## 10. Sistem Save / Load & Keamanan
 
### 10.1 Flow Save
 
```
TRIGGER:
  ├─ Auto: setiap 30 detik
  └─ Manual: tombol "💾 Save" atau tekan S
 
PROSES:
  [1] Serialize
       └─ saveData = JSON.stringify(S)
 
  [2] Generate Hash
       └─ hash = await crypto.subtle.digest('SHA-256',
            encode(saveData + SECRET_SALT))
       └─ hashHex = Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2,'0')).join('')
 
  [3] Store
       └─ localStorage.setItem('farmGame_save', saveData)
       └─ localStorage.setItem('farmGame_hash', hashHex)
       └─ Toast: "💾 Game tersimpan!"
```
 
### 10.2 Flow Load
 
```
TRIGGER: initGame() saat pertama load
 
PROSES:
  [1] Read
       └─ saveData = localStorage.getItem('farmGame_save')
       └─ storedHash = localStorage.getItem('farmGame_hash')
 
  [2] Verify
       └─ computedHash = SHA-256(saveData + SECRET_SALT)
       └─ if (computedHash !== storedHash):
            ❌ CHEAT DETECTED → resetGame() → Toast warning merah
 
  [3] Parse & Merge
       └─ parsed = JSON.parse(saveData)
       └─ S = mergeWithDefaults(parsed)  // isi field baru yang belum ada
       └─ Game lanjut dari state tersimpan
```
 
### 10.3 Kelemahan & Rekomendasi Perbaikan
 
| Kelemahan | Risiko | Solusi |
|---|---|---|
| Salt hardcoded di JS | Advanced user bisa reverse engineer | Dynamic salt (device fingerprint) |
| SHA-256 saja | Rentan jika salt bocor | AES-256 encryption sebelum store |
| Tidak ada server validation | Tidak bisa detect cheat antar-device | Backend sync & validation |
| localStorage visible | User bisa melihat (tapi tidak edit) | IndexedDB + enkripsi |
 
---
 
## 11. FITUR BARU: Sistem Musim (Seasons)
 
Salah satu fitur terbesar untuk meningkatkan **replayability**. Setiap musim berlangsung 7 hari in-game (30 menit real-time per hari = ~3.5 jam per musim).
 
### 11.1 Siklus Musim
 
```
Spring (Semi) 🌸 → Summer (Panas) ☀️ → Autumn (Gugur) 🍂 → Winter (Dingin) ❄️
     └──────────────────────────────────────────────────────────────────────────┘
                            (loop kembali ke Spring)
```
 
### 11.2 Efek Per Musim
 
| Musim | Efek Farming | Efek Hewan | Cuaca Dominan |
|---|---|---|---|
| 🌸 **Spring** | Tanaman +20% hasil | Lebah produksi ×2 | Cerah + Hujan ringan |
| ☀️ **Summer** | Grow time −15%, butuh siram 2x | Sapi normal, Ayam +10% | Panas (modifier baru), Cerah |
| 🍂 **Autumn** | Harga jual +30% | Madu produksi ×1.5 | Berangin |
| ❄️ **Winter** | Grow time +50% (kecuali Greenhouse) | Susu ×1.5, butuh pakan extra | Salju, Dingin |
 
### 11.3 Bibit Eksklusif Per Musim
 
| Musim | Bibit | Harga | Jual | Keunikan |
|---|---|---|---|---|
| 🌸 Spring | 🌷 Tulip | 200 koin | 400 koin | Bahan Parfum (crafting 1.500 koin) |
| ☀️ Summer | 🍉 Semangka | 120 koin | 300 koin | Yield ×2 di Greenhouse |
| 🍂 Autumn | 🍎 Apel | 150 koin | 250 koin | Chance 5% drop Golden Apple (2.000 koin) |
| ❄️ Winter | 🍄 Truffle | 500 koin | 1.200 koin | Sangat langka, bahan crafting premium |
 
### 11.4 Implementasi Teknis
 
**Tambahan ke `state.js`:**
```javascript
season: {
  current: 'spring',   // 'spring' | 'summer' | 'autumn' | 'winter'
  day: 1,              // 1-7
  tick: 0,             // progress dalam hari (0-29 menit)
}
```
 
**Tambahan ke `game-engine.js`:**
```javascript
// Setiap 60 detik real-time = 1 tick in-game
function updateSeasonTick() {
  S.season.tick++;
 
  if (S.season.tick >= 30) {      // 30 tick = 1 hari
    S.season.tick = 0;
    S.season.day++;
 
    if (S.season.day > 7) {       // 7 hari = 1 musim
      S.season.day = 1;
      advanceSeason();
    }
  }
}
 
function advanceSeason() {
  const order = ['spring', 'summer', 'autumn', 'winter'];
  const idx = order.indexOf(S.season.current);
  S.season.current = order[(idx + 1) % 4];
 
  // Trigger efek pergantian musim
  weatherSystem.applySeasonModifiers(S.season.current);
  shopSystem.refreshSeasonalSeeds(S.season.current);
  showSeasonTransitionAnimation(S.season.current);
  notificationManager.show(`🌸 Musim ${S.season.current} telah tiba!`, 'season');
}
```
 
### 11.5 Flow Pergantian Musim (User Experience)
 
```
Timer mencapai hari ke-8
  │
  ▼
Layar fade-out singkat (0.5 detik)
  │
  ▼
Animasi partikel musim baru (salju/bunga/daun/sinar)
  │
  ▼
Banner besar: "❄️ MUSIM DINGIN TELAH TIBA!"
  │
  ▼
Popup info: tanaman baru yang unlock, efek musim
  │
  ▼
Bibit musim lama tidak bisa dibeli lagi
Bibit musim baru muncul di shop
  │
  ▼
Semua modifier cuaca diperbarui
```
 
---
 
## 12. FITUR BARU: NPC & Friendship System
 
NPC (Non-Player Character) memberikan dimensi sosial. Setiap NPC memiliki preferensi unik dan reward berbasis level persahabatan.
 
### 12.1 Daftar NPC
 
| NPC | Lokasi | Menyukai | Reward Friendship Max |
|---|---|---|---|
| 👩‍🍳 **Chef Maria** | Town Square | Produk crafting (Kue, Sup, Pie) | Resep eksklusif + diskon crafting 20% |
| 🧙‍♂️ **Pak Tua Botan** | Pinggir Farm | Bibit langka & tanaman musim | "Magical Seeds" (tumbuh 3x lebih cepat) |
| 🏪 **Saudagar Ben** | Pasar | Hasil panen banyak & bernilai | "Premium Market" unlock (harga jual ×2) |
| 🐮 **Paman Hadi** | Area Peternakan | Produk hewan & Madu | Diskon beli hewan 25% + hewan legendary |
 
### 12.2 Flow Friendship
 
```
[1] Buka Tab Kota → Klik NPC
 
[2] Dialog Panel terbuka
     └─ Tampilkan: friendship level, progress bar, item yang disukai
 
[3] Berikan Hadiah
     └─ Pilih item dari inventory
     └─ hitungPoin(item, npc):
          if (item === npc.favorite):   points = item.value × 2
          elif (item === npc.liked):    points = item.value × 1
          elif (item === npc.disliked): points = item.value × 0.5
 
[4] Update Friendship
     └─ S.npc[npcId].points += hitungPoin(...)
     └─ if (points >= threshold[currentLevel]):
          S.npc[npcId].level++
          giveReward(npcId, newLevel)
          Toast: "🎉 Pertemanan dengan [NPC] naik ke Level [N]!"
 
[5] Cooldown Hadiah
     └─ 1 hadiah per NPC per hari in-game (cegah grinding)
```
 
### 12.3 Sistem Reward Bertingkat
 
| Friendship Level | Reward |
|---|---|
| Lv 1 | Unlock dialog NPC, hint item favorit |
| Lv 3 | Diskon 5% di toko terkait |
| Lv 5 | Item hadiah eksklusif (1 kali) |
| Lv 7 | Akses resep/item langka |
| Lv 10 | Reward legendary (permanent buff) |
 
---
 
## 13. FITUR BARU: Sistem Pertambangan
 
Tab **⛏️ Tambang** memberikan resource mineral untuk upgrade alat farming dan loop gameplay tambahan.
 
### 13.1 Flow Mining Lengkap
 
```
[1] Unlock Tab Tambang
     └─ Tersedia setelah Lv 5
 
[2] Buka Tab Tambang
     └─ Grid batu 6×4 = 24 node penggalian
     └─ Setiap node punya type: 'stone' | 'copper' | 'iron' | 'gold' | 'diamond'
     └─ Type ditentukan saat generate (weighted random)
 
[3] Pilih Alat Tambang
     └─ Sidebar: alat yang dimiliki + durasi mining per batu
 
[4] Klik Batu
     └─ Progress bar mulai mengisi
     └─ Durasi: 2–10 detik (tergantung alat & jenis batu)
 
[5] Mining Selesai
     └─ Roll mineral:
          Stone:   80% (selalu ada)
          Copper:  50% (hanya jika node copper)
          Iron:    30% (hanya jika node iron)
          Gold:    15% (hanya jika node gold)
          Diamond:  5% (hanya jika node diamond)
     └─ Item masuk inventory
     └─ Sound effect "klink!"
 
[6] Node Regenerate
     └─ 5 menit per node (atau 2 menit dengan Mining Perk Lv3)
     └─ Node kosong tampil warna abu-abu
```
 
### 13.2 Alat Tambang & Upgrade
 
| Alat | Speed | Upgrade Requirement | Bonus |
|---|---|---|---|
| 🪨 Cangkul Kayu | 1.0x | — (default) | — |
| 🔶 Cangkul Tembaga | 1.5x | 5x Copper Ore | +10% drop chance |
| ⚫ Cangkul Besi | 2.5x | 5x Iron + 3x Copper | +25% drop chance, regen −1 menit |
| 🟡 Cangkul Emas | 4.0x | 3x Gold + 10x Iron | +50% drop chance, regen −2 menit |
| 💎 Cangkul Diamond | 6.0x | 2x Diamond + 5x Gold | ×2 drop semua mineral |
 
### 13.3 Kegunaan Mineral
 
| Mineral | Jual Langsung | Crafting / Upgrade |
|---|---|---|
| 🪨 Batu | 5 koin | Dekorasi paving (+2 Prestige/tile) |
| 🔶 Tembaga | 30 koin | Upgrade cangkul, pipa irigasi (−15% kebutuhan air) |
| ⚫ Besi | 80 koin | Upgrade cangkul, Silo expansion, pagar kandang |
| 🟡 Emas | 300 koin | Upgrade cangkul, dekorasi premium |
| 💎 Berlian | 1.000 koin | Upgrade cangkul, aksesori +50 Prestige |
 
---
 
## 14. FITUR BARU: Mini-Game Memancing Interaktif
 
Sistem memancing diubah dari "tunggu-klik" pasif menjadi **mini-game timing aktif**.
 
### 14.1 Flow Mini-Game Memancing
 
```
[1] Lempar Kail
     └─ Klik area danau
     └─ Animasi kail terbang + suara "plop"
     └─ Mulai timer "tunggu gigitan" (acak 5–15 detik)
 
[2] Indikator Gigitan
     └─ Saat ikan gigit:
          - Ikon 💦 cipratan muncul
          - SFX "splash!" diputar
          - HARUS klik dalam 2 detik → jika tidak: ikan lepas, ulang dari [1]
 
[3] Tarik Pancing — Mini-Game Bar
     └─ Bar horizontal muncul di atas danau
     └─ Indikator bergerak naik-turun (oscilasi sinusoidal)
     └─ "Zona Hijau" di tengah bar
     └─ Pemain: TAHAN KLIK saat indikator di zona hijau
 
         [====[  ZONA HIJAU  ]====]
              ◄── indikator →
 
[4] Hasil Berdasarkan Durasi di Zona Hijau
     ├─ ≥ 3 detik: Ikan Besar  → koin ×2
     ├─ 1–3 detik: Ikan Normal → koin ×1
     └─ < 1 detik: Ikan Kecil  → koin ×0.5
 
[5] Koleksi
     └─ Ikan masuk inventory
     └─ Bisa dijual atau masuk Fish Tank untuk ekspor
```
 
### 14.2 Daftar Ikan
 
| Ikan | Drop Rate | Nilai Normal | Nilai Besar | Kegunaan Lain |
|---|---|---|---|---|
| 🐟 Ikan Mas | 40% | 80 koin | 160 koin | — |
| 🐠 Lele | 30% | 100 koin | 200 koin | — |
| 🐡 Ikan Badut | 15% | 200 koin | 400 koin | Dekorasi Fish Tank |
| 🦑 Cumi-cumi | 10% | 350 koin | 700 koin | Bahan Takoyaki (900 koin) |
| 🐙 Gurita Emas | 5% | 2.000 koin | 4.000 koin | Hanya drop dari mancing sempurna |
 
### 14.3 Implementasi Teknis
 
```javascript
// Mini-game bar oscillation
function startFishingMiniGame() {
  const bar = document.getElementById('fishing-bar');
  bar.style.display = 'block';
 
  let position = 50;        // 0-100%
  let direction = 1;
  let speed = 2 + Math.random() * 3;  // makin besar ikan, makin cepat
  let timeInGreenZone = 0;
 
  const gameLoop = setInterval(() => {
    position += direction * speed;
    if (position >= 90 || position <= 10) direction *= -1;
 
    bar.querySelector('.indicator').style.left = `${position}%`;
 
    const inGreenZone = position >= 40 && position <= 60;
    if (inGreenZone && isPlayerHolding) {
      timeInGreenZone += 0.1;  // per tick (100ms)
    }
  }, 100);
 
  return { getScore: () => timeInGreenZone, stop: () => clearInterval(gameLoop) };
}
```
 
---
 
## 15. FITUR BARU: Drag-and-Drop Layout Farm
 
Pemain bisa mengatur layout pertanian secara visual dengan drag-and-drop.
 
### 15.1 Flow Drag-and-Drop
 
```
[1] Aktifkan Mode Edit
     └─ Klik "✏️ Edit Layout" di header
     └─ Farm grid → edit mode (outline dashed, cursor: grab)
     └─ Semua interaksi normal (tanam, panen) dinonaktifkan sementara
 
[2] Drag Item
     └─ mousedown/touchstart pada plot atau dekorasi
     └─ Buat ghost element mengikuti cursor
     └─ Highlight slot tujuan:
          ├─ Hijau: valid (kosong)
          └─ Merah: tidak valid (ada item lain, locked)
 
[3] Drop
     └─ mouseup/touchend di slot tujuan
     └─ Jika valid: swap posisi kedua item
     └─ CSS transition smooth (0.3 detik)
     └─ Update S.layout array
 
[4] Simpan Layout
     └─ "💾 Simpan Layout" atau auto-save saat keluar edit mode
     └─ S.layout = [{ itemId, type, gridX, gridY }, ...]
     └─ Layout tersimpan bersama game save
```
 
### 15.2 Implementasi Teknis
 
```javascript
// State layout di state.js
S.layout = [
  { id: 'plot-0',  type: 'plot',  gridX: 0, gridY: 0 },
  { id: 'deco-1',  type: 'deco',  gridX: 3, gridY: 2, decoType: 'tree' },
  { id: 'plot-5',  type: 'plot',  gridX: 2, gridY: 1 },
];
 
// Drag handler (pointer events untuk mobile compatibility)
element.addEventListener('pointerdown', startDrag);
document.addEventListener('pointermove', duringDrag);
document.addEventListener('pointerup', endDrag);
```
 
---
 
## 16. FITUR BARU: Leaderboard & Multiplayer
 
### 16.1 Leaderboard Global
 
```
[1] Sync Data ke Server
     └─ Setiap 5 menit → kirim snapshot state ke backend
     └─ Data: coins, level, totalXP, achievements, prestige
 
[2] Ranking Categories
     ├─ Richest Farmers (total coins)
     ├─ Highest Level (XP total)
     ├─ Best Collectors (achievements count)
     └─ Weekly Champions (XP gained this week)
 
[3] Display
     └─ Tab khusus "🏆 Leaderboard"
     └─ Show top 100 + posisi pemain
     └─ Filter by category
```
 
### 16.2 Multiplayer Features (Future)
 
| Fitur | Deskripsi |
|---|---|
| 👥 Visit Farm | Kunjungi farm pemain lain, lihat layout |
| 🎁 Gift System | Kirim hadiah harian ke teman |
| 🤝 Trading | Barter item dengan pemain lain |
| 🏅 Guilds/Co-ops | Bergabung dengan koperasi petani |
 
---
 
## 17. FITUR BARU: Event Spesial & Festival
 
### 17.1 Event Calendar
 
```
Event Types:
  ├─ Seasonal Events (berdasarkan musim nyata)
  │    🎄 Winter Festival (Desember)
  │    🎃 Harvest Moon (Oktober)
  │    🌸 Cherry Blossom (Maret)
  │
  ├─ Special Weekends
  │    💰 Double Coins Weekend
  │    ⚡ Double XP Weekend
  │    🎁 Lucky Draw Event
  │
  └─ Limited-Time Challenges
       🏆 Speed Run Challenge
       📦 Collection Contest
       💎 Treasure Hunt
```
 
### 17.2 Event Mechanics
 
```
[1] Event Announcement
     └─ 1 hari sebelum event → banner di topbar
     └─ Countdown timer hingga event mulai
 
[2] During Event
     └─ Special quests tersedia
     └─ Limited-time items di shop
     └─ Modified drop rates / rewards
     └─ Event currency (tokens) dapat dikumpulkan
 
[3] Event Rewards
     ├─ Participation Trophy (semua peserta)
     ├─ Milestone Rewards (capai target tertentu)
     └─ Ranking Rewards (top 10/50/100)
 
[4] Post-Event
     └─ Leaderboard公布 winners
     └─ Distribusi reward
     └─ Event items tetap bisa digunakan (tidak expire)
```
 
---
 
## 18. Perbaikan Teknis & Refactoring
 
### 18.1 Prioritas Refactoring
 
| Priority | Task | Impact | Effort |
|---|---|---|---|
| 🔴 High | EventBus untuk UI re-render | Mencegah bug UI tidak sync | Medium |
| 🔴 High | Enkripsi save file (AES-256) | Keamanan data player | Low |
| 🟡 Medium | Migrasi ke Vite | Performance loading 3x lebih cepat | Medium |
| 🟡 Medium | CSS Modules | Maintainability styling | High |
| 🟢 Low | TypeScript migration | Type safety, fewer bugs | Very High |
 
### 18.2 Code Quality Improvements
 
```javascript
// BEFORE: Global state accessed directly
S.coins -= 100;
renderCoins();
 
// AFTER: Action-based state mutation with auto-render
dispatch('DEDUCT_COINS', { amount: 100 });
// → Automatically triggers coin UI update via EventBus
```
 
### 18.3 Performance Optimization
 
| Optimization | Before | After | Benefit |
|---|---|---|---|
| DOM Updates | Every tick | Throttled 60fps | -40% CPU usage |
| Image Assets | No compression | WebP + lazy load | -60% load time |
| Event Listeners | Multiple handlers | Event delegation | -30% memory |
| Save Frequency | Every action | Debounced 30s | Less localStorage I/O |
 
---
 
## 19. Roadmap Implementasi
 
### Phase 1: Foundation (Week 1-2)
- [x] Dokumentasi GDD lengkap
- [ ] EventBus implementation
- [ ] Save system encryption
- [ ] Bug fixes dari testing
 
### Phase 2: New Features (Week 3-6)
- [ ] Sistem Musim (Seasons)
- [ ] NPC & Friendship System
- [ ] Mini-game Memancing Interaktif
- [ ] Sistem Pertambangan
 
### Phase 3: Polish & UX (Week 7-8)
- [ ] Drag-and-Drop Layout Farm
- [ ] Tutorial system untuk new players
- [ ] Achievement system expansion
- [ ] Mobile responsiveness improvements
 
### Phase 4: Social & Events (Week 9-12)
- [ ] Leaderboard backend integration
- [ ] Event system framework
- [ ] First seasonal event (Harvest Festival)
- [ ] Community feedback integration
 
### Phase 5: Advanced (Future)
- [ ] Multiplayer visit system
- [ ] Guild/Co-op features
- [ ] Cross-platform save sync
- [ ] Modding support (custom crops/animals)
 
---
 
## Appendix A: Glossary
 
| Istilah | Definisi |
|---|---|
| **Plot** | Satu petak tanah yang bisa ditanami |
| **Grow Time** | Waktu yang dibutuhkan tanaman untuk siap panen |
| **Modifier** | Faktor pengali yang mempengaruhi game mechanics |
| **Queue** | Antrian produksi di crafting system |
| **Tick** | Satu unit waktu dalam game loop (1 detik) |
| **Prestige** | Sistem multiplier untuk advanced players |
| **NPC** | Non-Player Character, karakter komputer |
| **Buff** | Efek bonus temporary atau permanent |
 
---
 
## Appendix B: Keyboard Shortcuts
 
| Shortcut | Aksi |
|---|---|
| `1-6` | Select seed slot |
| `S` | Save game |
| `L` | Load game |
| `ESC` | Close modal/cancel selection |
| `H` | Toggle help/tooltips |
| `M` | Toggle music |
| `SPACE` | Quick harvest (when on ready plot) |
 
---
 
*Dokumen ini adalah living document dan akan diperbarui seiring perkembangan game. Terakhir diupdate: Juni 2026.*
