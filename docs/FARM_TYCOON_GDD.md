# 🌾 Farm Tycoon — Dokumen Desain Game (GDD)
 
> **Repository:** [github.com/Makro62/farm-game](https://github.com/Makro62/farm-game)  
> **Dibuat:** Juni 2026  
> **Terakhir Diperbarui:** Juli 2026  
> **Versi Dokumen:** 3.0
 
---
 
## Daftar Isi
 
1. [Gambaran Umum & Arsitektur Sistem](#1-gambaran-umum--arsitektur-sistem)
2. [Alur Pembelian (Purchase Flow)](#2-alur-pembelian-purchase-flow)
3. [Alur Farming (Crop System)](#3-alur-farming-crop-system)
4. [Alur Peternakan (Animal System)](#4-alur-peternakan-animal-system)
5. [Alur Crafting / Dapur Produksi](#5-alur-crafting--dapur-produksi)
6. [Alur Pesanan (Order Board)](#6-alur-pesanan-order-board)
7. [Sistem Pekerja Otomatis (Auto Workers)](#7-sistem-pekerja-otomatis-auto-workers)
8. [Sistem Cuaca & Efeknya](#8-sistem-cuaca--efeknya)
9. [Sistem Musim (Seasons)](#9-sistem-musim-seasons)
10. [NPC & Friendship System](#10-npc--friendship-system)
11. [Sistem Pertambangan](#11-sistem-pertambangan)
12. [Sistem Memancing](#12-sistem-memancing)
13. [Drag-and-Drop Layout Farm](#13-drag-and-drop-layout-farm)
14. [Sistem Audio](#14-sistem-audio)
15. [Sistem Save / Load](#15-sistem-save--load)
16. [Event Spesial & Festival](#16-event-spesial--festival)
17. [Sistem UI & Responsivitas](#17-sistem-ui--responsivitas)
18. [Roadmap Implementasi](#18-roadmap-implementasi)
 
---
 
## 1. Gambaran Umum & Arsitektur Sistem
 
Farm Tycoon adalah web-game berbasis browser yang dibangun dengan **Next.js 16 (React 18)**, **Zustand** untuk state management, dan **TailwindCSS** untuk styling. Arsitekturnya menggunakan component-based approach dengan centralized store.

### 1.1 Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| **Next.js** | 16.2.10 (Turbopack) | Framework React, SSR/SSG, routing |
| **React** | 18 | UI component library |
| **Zustand** | 4.5.0 | State management (persisted to localStorage) |
| **TailwindCSS** | 3.4.0 | Utility-first CSS framework |
| **Framer Motion** | 11.18.2 | Animasi & transisi UI |
| **Howler.js** | 2.2.4 | Background music streaming |
| **Web Audio API** | Native | Synthesized sound effects |
| **Lucide React** | 0.300.0 | Icon library |
| **react-hot-toast** | 2.6.0 | Toast notifications |
| **canvas-confetti** | 1.9.4 | Efek visual celebration |
| **@ducanh2912/next-pwa** | 10.2.6 | Progressive Web App support |
 
### 1.2 Struktur Folder
 
```
farm-game/
├── public/
│   ├── icons/                    # PWA icons (192, 512)
│   ├── img/                      # Game images (backgrounds, animals, logo)
│   ├── music/                    # BGM tracks (farm-theme, menu-theme, event-theme)
│   ├── sounds/                   # Legacy sound files (unused, diganti Web Audio API)
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker for offline support
├── src/
│   ├── app/
│   │   ├── layout.js             # Root layout: fonts, metadata, GameProvider, Toaster
│   │   └── page.js               # Main page: tab switching, auto-save, dev shortcuts
│   ├── components/
│   │   ├── Topbar.jsx            # Header: logo, coins, level, streak, sound toggle
│   │   ├── TabsNav.jsx           # Tab navigation: Pertanian, Peternakan, Tambang, Kota
│   │   ├── TabFarm.jsx           # Farm tab: plots, shop bibit, inventory, quests
│   │   ├── TabAnimal.jsx         # Animal tab: animals grid, shop hewan, auto worker
│   │   ├── TabMine.jsx           # Mining tab: mine nodes, pickaxe, tools shop
│   │   ├── TabTown.jsx           # Town tab: NPCs, fishing, market, wheel, settings
│   │   ├── StatusHeader.jsx      # Season/weather display, daily/save/reset buttons
│   │   ├── InventoryWidget.jsx   # Inventory display + sell all button
│   │   ├── Modals.jsx            # Confirm/prompt/NPC gift modals
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── AnimatedCounter.jsx
│   │   │   ├── CropIcon.jsx
│   │   │   ├── AnimalIcon.jsx
│   │   │   ├── FloatingText.jsx
│   │   │   ├── GameAreaHeader.jsx
│   │   │   └── ShopItemCard.jsx
│   │   └── game/                 # (Reserved for future game-specific components)
│   ├── lib/
│   │   ├── store.js              # Zustand store: semua state & actions (49KB)
│   │   ├── store-provider.js     # GameProvider: hydration, game loop, streak, quests
│   │   ├── audio.ts              # AudioManager: Web Audio API synth + Howler music
│   │   ├── utils.js              # Data definitions, helper functions
│   │   ├── confetti.js           # Confetti effects
│   │   ├── toast.js              # Custom toast utilities
│   │   └── hooks/
│   │       └── useSound.ts       # React hooks for playing sounds
│   ├── styles/
│   │   └── globals.css           # Global styles, glassmorphism, layout utilities
│   └── types/                    # (Reserved for TypeScript types)
├── docs/
│   └── FARM_TYCOON_GDD.md       # Dokumen ini
├── next.config.js                # Next.js config (PWA, turbopack)
├── tailwind.config.js            # TailwindCSS config (custom colors, animations)
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```
 
### 1.3 Alur Data (Reactive Architecture)
 
```
User Interaction (klik, tap)
      │
      ▼
React Component (TabFarm, TabAnimal, dll)
      │
      ▼
Zustand Store Action (store.js)
      │
      ▼
State Update (immutable via set())
      │
      ▼
React Auto Re-render (subscriber components)
      │
      ▼
DOM Update (otomatis via React reconciliation)
```

> ✅ **Sudah Terselesaikan:** UI re-render sekarang **otomatis** — React + Zustand subscription memastikan komponen re-render saat state berubah. Tidak perlu manual `renderFarm()` lagi.
 
### 1.4 Game Loop

Game loop berjalan setiap **1 detik** via `setInterval` di `store-provider.js`, menjalankan:

```
processGameTick() setiap 1 detik:
  ├─ advanceSeasonTick()    → update musim & hari
  ├─ changeWeather()        → countdown & random cuaca baru
  ├─ syncPlots()            → ubah 'growing' → 'ready' saat waktunya
  ├─ syncMiningNodes()      → regenerasi petak tambang + auto-miner
  └─ runAutoWorkers()       → kurcaci petani, peternak, pemancing
```

---
 
## 2. Alur Pembelian (Purchase Flow)
 
Sistem pembelian mencakup: **Bibit Tanaman**, **Hewan Ternak**, **Alat Tambang**, dan **Pekerja Otomatis**.
 
### 2.1 Flow Pembelian Bibit Tanaman 🌱
 
```
[1] Buka Tab Pertanian → Sidebar "Shop Bibit"

[2] Atur Jumlah
     └─ Tombol +/- untuk mengatur jumlah pembelian

[3] Klik "Beli"
     └─ store.buyItem(seedId, amount, unitPrice) dipanggil

[4] Validasi
     ├─ coins >= price × amount                    → ✅ / ❌ toast error
     └─ amount > 0                                 → ✅ / ❌ skip

[5] Eksekusi
     └─ coins -= totalCost
     └─ inventory[seedId] += amount

[6] Notifikasi
     └─ Toast: "Berhasil membeli [jumlah] [nama]!"
```
 
**Data Bibit Tersedia:**
 
| Bibit | Harga | Waktu Tumbuh | Musim |
|---|---|---|---|
| 🥕 Bibit Wortel | 10 💰 | 15 detik | Semua |
| 🌽 Bibit Jagung | 20 💰 | 30 detik | Semua |
| 🍅 Bibit Tomat | 35 💰 | 60 detik | Semua |
| 🍓 Bibit Stroberi | 75 💰 | 120 detik | Semua |
| 🍉 Bibit Semangka | 120 💰 | 150 detik | Semua |
| 🍄 Spora Jamur | 500 💰 | 300 detik | Semua |
 
---
 
### 2.2 Flow Pembelian Hewan 🐄
 
```
[1] Buka Tab Peternakan → Sidebar "Shop Hewan"

[2] Atur Jumlah, Klik "Beli"
     └─ store.buyMultipleAnimals(type, amount, price, produceTime)

[3] Validasi
     ├─ coins >= price × amount                    → ✅ / ❌ toast error
     └─ amount > 0                                 → ✅ / ❌ skip

[4] Spawn Hewan
     └─ coins -= totalCost
     └─ Buat array hewan baru:
        { id: unique, type, status: 'producing', lastCollected: Date.now(), produceTime }
     └─ Push semua ke state.animals[]

[5] Notifikasi
     └─ Toast: "Berhasil membeli [jumlah] [nama]!"
```
 
**Data Hewan Ternak:**
 
| Hewan | Harga | Produk | Interval Produksi |
|---|---|---|---|
| 🐔 Ayam | 150 💰 | 🥚 Telur | 20 detik |
| 🦆 Bebek | 300 💰 | 🥚 Telur Bebek | 40 detik |
| 🐄 Sapi | 500 💰 | 🥛 Susu | 60 detik |
| 🐑 Domba | 800 💰 | 🧶 Bulu | 90 detik |
| 🐷 Babi | 1.200 💰 | 🍄 Truffle | 120 detik |
| 🐴 Kuda | 2.000 💰 | 🧲 Tapal | 150 detik |

---

## 3. Alur Farming (Crop System)
 
Farming adalah **inti game**. Setiap petak (plot) memiliki state machine 3-state yang dikelola oleh Zustand store.
 
### 3.1 State Machine Plot Tanah
 
```
     [EMPTY]
        │
        │ klik + ada bibit terpilih
        ▼
     [GROWING]  ──── timer growTime selesai ────→  [READY]
        │                                            │
        │                                            │ klik panen
        │                                            ▼
        └──────────────────────────────────── kembali [EMPTY]
```
 
**State Detail:**
 
| State | Tampilan UI | Aksi |
|---|---|---|
| `empty` | Kotak cokelat kosong | Klik + bibit terpilih = `plant()` |
| `growing` | Emoji tanaman + progress bar | Menunggu timer |
| `ready` | Emoji tanaman besar + glow kuning | Klik = `harvest()` |
 
### 3.2 Flow Satu Siklus Farming

```
LANGKAH 1: Pilih Bibit dari Inventory
  └─ Klik bibit di panel "Bibit Tanaman" sidebar kiri
  └─ state.selectedSeed = 'bibit_wortel'

LANGKAH 2: Klik Plot Kosong
  └─ handlePlotClick(plot) dipanggil
  └─ plot.status === 'empty':
       removeItem(selectedSeed, 1)  → kurangi bibit dari inventory
       plant(plot.id, cropId, growTime / growthMultiplier)
       └─ plot = { status: 'growing', crop: 'wortel', plantedAt: Date.now(), growTime }

LANGKAH 3: Game Loop Tick (setiap 1 detik)
  └─ syncPlots() dipanggil
  └─ Untuk setiap plot 'growing':
       if (Date.now() - plantedAt >= growTime) → status = 'ready'

LANGKAH 4: Panen
  └─ Klik plot 'ready'
  └─ harvest(plotId):
       inventory[crop] += 1
       addXP(10)
       progressQuest('harvest', crop, 1)
       plot → reset ke 'empty'
```

### 3.3 Growth Booster

Pemain bisa membeli Growth Booster seharga 50 💰 yang mempercepat tanaman ×1.5:

```
buyGrowthBooster(50):
  └─ growthMultiplier = 1.5
  └─ Semua tanaman yang ditanam SETELAH pembelian akan menggunakan growTime / 1.5
```

---
 
## 4. Alur Peternakan (Animal System)
 
Hewan ditampilkan dalam grid di area peternakan. Setiap hewan memiliki timer produksi independen.
 
### 4.1 Siklus Produksi Hewan
 
```
[1] SPAWN → hewan muncul di grid peternakan

[2] PRODUCING → timer berjalan (lastCollected + produceTime)

[3] READY → progress >= 100%, glow kuning

[4] COLLECT
     Manual: Klik hewan → collectAnimal(animalId, productType)
     Auto:   Kurcaci Peternak (jika aktif)

[5] collectAnimal():
     └─ inventory[productType] += 1
     └─ addXP(8)
     └─ progressQuest('collect', productType, 1)
     └─ animal.lastCollected = Date.now()  → reset timer
```

---

## 5. Alur Crafting / Dapur Produksi

> 🚧 **Status:** Fitur ini **belum diimplementasikan** (UI placeholder "Fitur ini akan segera hadir"). Desain di bawah adalah rencana.

Crafting mengolah bahan mentah menjadi produk bernilai tinggi via antrian produksi.

| Produk | Bahan | Waktu | Nilai Jual |
|---|---|---|---|
| 🥣 Sup Wortel | 3× Wortel + 1× Air | 5 menit | 200 💰 |
| 🌾 Tepung Jagung | 4× Jagung | 4 menit | 180 💰 |
| 🧀 Keju | 5× Susu | 8 menit | 500 💰 |
| 🎂 Kue | 2× Tepung + 2× Telur + 1× Susu | 12 menit | 800 💰 |

---
 
## 6. Alur Pesanan (Order Board)

> 🚧 **Status:** UI placeholder "Belum ada pesanan masuk" sudah tersedia. Sistem pesanan **belum aktif**.

Order Board akan menghasilkan pesanan dinamis. Menyelesaikan pesanan memberikan bonus Koin & XP lebih besar dari menjual langsung.

### Quest Harian (Sudah Aktif ✅)

Setiap hari, 3 quest acak di-generate:

```
generateDailyQuests():
  └─ Pilih 3 dari pool quest acak
  └─ Setiap quest: { type, targetId, required, rewardCoins, rewardXp }
  └─ Progress di-track otomatis via progressQuest()
```

**Contoh Quest:**

| Quest | Target | Reward |
|---|---|---|
| Panen Wortel | 10 Wortel | 100 💰 + 50 ⭐ |
| Panen Tomat | 15 Tomat | 150 💰 + 80 ⭐ |
| Tambang Batu | 15 Batu | 120 💰 + 60 ⭐ |
| Tambang Besi | 3 Besi | 250 💰 + 120 ⭐ |
| Pancing Ikan Lele | 3 Lele | 150 💰 + 80 ⭐ |
| Kumpulkan Telur | 5 Telur Ayam | 100 💰 + 50 ⭐ |

---
 
## 7. Sistem Pekerja Otomatis (Auto Workers)
 
Pekerja otomatis melakukan tugas berulang tanpa interaksi pemain. Dipicu oleh `runAutoWorkers()` di game loop setiap 1 detik.

### 7.1 Petani Budi 🧑‍🌾

**Harga:** 5.000 💰 | **Toggle:** Tombol "🧙‍♂️ Auto: OFF/ON" di farm header

```
Setiap game tick (1 detik):

  HARVEST SCAN
  └─ for setiap plot 'ready' atau ('growing' yang sudah selesai):
       harvest → item masuk inventory
       addXP(10)

  REPLANT
  └─ for setiap plot 'empty':
       pickAutoSeed(inventory, selectedSeed, season)
       └─ Pilih bibit yang tersedia di inventory (prioritas selectedSeed)
       └─ consumeInventoryItem → tanam otomatis
       └─ growTime = seedData.time × 1000 / growthMultiplier
```

### 7.2 Peternak Siti 🧑‍🌾

**Harga:** 5.000 💰 | **Toggle:** Tombol auto di animal header

```
Setiap game tick:
  └─ for setiap hewan yang produceTime sudah tercapai:
       collectAnimal → item masuk inventory
       addXP(8)
```

### 7.3 Nelayan Mamat 🎣

**Harga:** 5.000 💰 | **Toggle:** Tombol auto di town

```
Setiap game tick (probabilitas 10%):
  └─ Roll ikan berdasarkan drop rate
  └─ inventory[fish] += 1
  └─ addXP(15)
```

### 7.4 Penambang ⛏️

**Harga:** 5.000 💰 | **Toggle:** Tombol auto di mine

```
Setiap game tick (probabilitas 20%):
  └─ Cari node 'ready' pertama
  └─ Mine → item masuk inventory
  └─ Node → cooldown + regen timer
  └─ addXP(15)
```

---
 
## 8. Sistem Cuaca & Efeknya
 
Cuaca berubah secara acak setiap **5 menit** (300 tick) dan ditampilkan di StatusHeader.
 
### 8.1 Jenis Cuaca
 
| Cuaca | Probabilitas |
|---|---|
| ☀️ Cerah | Equal random |
| ⛅ Berawan | Equal random |
| 🌧️ Hujan | Equal random |
| ⛈️ Badai | Equal random |
| 💨 Berangin | Equal random |

### 8.2 Flow Pergantian Cuaca

```
changeWeather() setiap game tick:
  └─ nextChangeIn -= 1
  └─ if (nextChangeIn <= 0):
       random pilih cuaca baru
       nextChangeIn = 300 (5 menit)
       update state.weather
```

---

## 9. Sistem Musim (Seasons)

Setiap musim berlangsung **7 hari in-game** (180 tick per hari = 3 menit real-time per hari ≈ 21 menit per musim).

### 9.1 Siklus Musim

```
🌸 Spring → ☀️ Summer → 🍂 Autumn → ❄️ Winter → 🌸 Spring (loop)
```

### 9.2 Implementasi

```
advanceSeasonTick() setiap game tick:
  └─ tick += 1
  └─ if (tick >= 180):            → 1 hari baru
       tick = 0, day += 1
       Random event check (30% chance)
  └─ if (day > 7):               → musim baru
       day = 1
       seasons rotate: spring → summer → autumn → winter
```

### 9.3 Random Events

Setiap hari baru ada 30% chance event spesial:

| Event | Efek |
|---|---|
| 🎊 Festival Panen | Harga jual semua tanaman ×2 |
| 🎣 Hari Bahari | Ikan terjual dengan harga ×2 |
| 💎 Demam Emas | Peluang mendapat Emas & Berlian meningkat |

---

## 10. NPC & Friendship System

3 NPC yang bisa diberi hadiah untuk meningkatkan level pertemanan. Max level 5.

### 10.1 Daftar NPC

| NPC | Role | Menyukai |
|---|---|---|
| 👩‍🍳 Chef Maria | Koki Kota | Tomat, Wortel, Susu |
| 🧙‍♂️ Pak Tua Botan | Ahli Tani | Tulip, Semangka, Apel |
| 🐮 Paman Hadi | Peternak | Jagung, Gandum |

### 10.2 Flow Friendship

```
[1] Buka Tab Kota → Klik NPC

[2] Pilih item dari inventory

[3] giveGift(npcId, itemId, isLiked):
     └─ inventory[itemId] -= 1
     └─ if (isLiked): points += 50
     └─ else: points += 10

[4] Level Up Check:
     └─ if (points >= level × 100):
          level += 1
          addXP(100 × newLevel)
          Toast: "Pertemanan naik!"
```

---

## 11. Sistem Pertambangan

Tab **⛏️ Tambang** dengan grid 30 node penggalian.

### 11.1 Tipe Mineral

| Mineral | Harga Jual | Drop Rate |
|---|---|---|
| 🪨 Batu | 5 💰 | 50% |
| 🔶 Tembaga | 30 💰 | 20% |
| ⚫ Besi | 80 💰 | 15% |
| 🟡 Emas | 300 💰 | 10% |
| 💎 Berlian | 1.000 💰 | 5% |

### 11.2 Flow Mining

```
[1] Klik node 'ready'
     └─ mineNode(nodeId)
     └─ inventory[nodeType] += 1
     └─ node.status = 'cooldown'
     └─ node.regenAt = Date.now() + regenTime
     └─ addXP(15)

[2] Regenerasi
     └─ syncMiningNodes() setiap tick
     └─ if (Date.now() >= regenAt):
          status = 'ready'
          type = rollMineralType(pickaxeLevel, lanternActive)
```

### 11.3 Alat Tambang & Pickaxe

| Pickaxe | Regen Time | Bonus |
|---|---|---|
| 🪨 Cangkul Kayu (Lv 1) | 120 detik | Default |
| ⛏️ Pickaxe Besi (Lv 2) | 90 detik | +4% rare ore |
| 🛠️ Pickaxe Emas (Lv 3) | 60 detik | +8% rare ore |

**Alat Tambang Shop:**

| Alat | Harga | Efek |
|---|---|---|
| 🧨 Bom Kecil | 50 💰 | ×2 hasil / buka petak tertutup |
| 💣 Bom Besar | 150 💰 | Tambang SEMUA petak siap sekaligus |
| ⛏️ Pickaxe Besi | 300 💰 | Upgrade ke Lv 2 (regen 90 detik) |
| 🛠️ Pickaxe Emas | 800 💰 | Upgrade ke Lv 3 (regen 60 detik) |
| 🔦 Senter Goa | 120 💰 | Buff 5 menit: regen 2× lebih cepat + bonus ore |
| 🪢 Tali Tambang | 60 💰 | Pulihkan 1 petak tertutup |

---

## 12. Sistem Memancing

Memancing dikelola otomatis oleh **Nelayan Mamat** (auto worker) atau bisa dilakukan manual di Tab Kota.

### 12.1 Daftar Ikan

| Ikan | Drop Rate | Harga Normal | Harga Besar |
|---|---|---|---|
| 🐟 Ikan Mas | 40% | 80 💰 | 160 💰 |
| 🐠 Lele | 30% | 100 💰 | 200 💰 |
| 🐡 Ikan Badut | 15% | 200 💰 | 400 💰 |
| 🦑 Cumi-cumi | 10% | 350 💰 | 700 💰 |
| 🐙 Gurita Emas | 5% | 2.000 💰 | 4.000 💰 |

---

## 13. Drag-and-Drop Layout Farm

Pemain bisa mengatur layout petak pertanian dengan drag-and-drop.

### 13.1 Flow

```
[1] Klik "✏️ Edit Layout" di header Area Pertanian
     └─ isEditMode = true
     └─ Grid tampil border dashed, cursor grab
     └─ Interaksi tanam/panen dinonaktifkan

[2] Drag Plot
     └─ HTML5 drag event: dataTransfer.setData('plotId', plot.id)
     └─ Element opacity 50% saat drag

[3] Drop ke Plot Lain
     └─ swapPlots(draggedId, targetId)
     └─ Kedua plot bertukar posisi di array

[4] Klik "💾 Selesai Edit"
     └─ isEditMode = false
     └─ Layout tersimpan otomatis via Zustand persist
```

---

## 14. Sistem Audio

### 14.1 Arsitektur Audio

Audio menggunakan **dua engine** yang saling melengkapi:

| Engine | Kegunaan | Teknologi |
|---|---|---|
| **Web Audio API** | Sound effects (SFX) | Synthesized oscillators, gain envelopes |
| **Howler.js** | Background music | Streaming `.mp3`, looping, fade in/out |

### 14.2 Sound Effects (Synthesized)

Setiap sound di-generate secara programmatic — tidak ada file audio external:

| Sound | Deskripsi | Trigger |
|---|---|---|
| 🌾 `harvest` | Arpeggio naik ceria (C-E-G-C) | Panen tanaman |
| 🌱 `plant` | Soft bubbly pop | Tanam bibit |
| 💰 `sell` | Cash register ka-ching | Jual item |
| 🛒 `buy` | Soft confirmation 2-note | Beli item |
| 👆 `click` | Subtle descending tap | Klik button |
| ✅ `success` | 3-note triumphant | Aksi berhasil |
| ❌ `error` | Descending square buzz | Aksi gagal |
| 🪙 `coin` | Bright ascending jingle | Dapat koin |
| 🎉 `levelup` | Epic 4-note fanfare + harmony | Naik level |
| 🏆 `achievement` | 5-note celebration | Dapat achievement |
| ⚡ `combo` | Power-up sawtooth whoosh | Combo aktif |
| 🎡 `wheel` | Ratchet spin ticking | Spin wheel |

### 14.3 Toggle On/Off

```
Topbar → Klik tombol 🔊/🔇
  └─ audioManager.toggleAll()
       └─ enabled = !enabled
       └─ musicEnabled = !enabled
       └─ if OFF: stopMusic(300ms fade)
       └─ if ON: playMusic('main', 1000ms fade-in)
  └─ Sync Zustand store (soundEnabled, musicEnabled)
  └─ Save ke localStorage('audio-settings')
```

### 14.4 Background Music

3 track tersedia di `/music/`:

| Track | File | Penggunaan |
|---|---|---|
| Farm Theme | `farm-theme.mp3` | Gameplay utama |
| Menu Theme | `menu-theme.mp3` | (Reserved) |
| Event Theme | `event-theme.mp3` | (Reserved) |

---

## 15. Sistem Save / Load

### 15.1 Persistence (Zustand Persist)

Game state disimpan otomatis ke `localStorage` key `farm-game-storage` menggunakan Zustand `persist` middleware.

```
Zustand Persist:
  ├─ Auto-save: setiap kali state berubah
  ├─ Key: 'farm-game-storage'
  ├─ Storage: localStorage
  ├─ Partialize: hanya simpan data penting (bukan functions/modals)
  └─ Merge: normalisasi data lama saat load (migrasi)
```

### 15.2 Data yang Disimpan

| Data | Deskripsi |
|---|---|
| `coins`, `level`, `xp`, `day` | Stats pemain |
| `streak`, `lastLogin` | Streak system |
| `plots[30]` | Status semua petak tanah |
| `inventory` | Semua item (key-value pairs) |
| `animals[]` | Daftar hewan ternak |
| `workers`, `autoFarmer/Rancher/Fisher/Miner` | Status pekerja |
| `season`, `weather` | Musim dan cuaca |
| `mining` | Node tambang, pickaxe level, lantern |
| `npcs` | Level pertemanan NPC |
| `dailyQuests` | Quest harian aktif |
| `soundEnabled`, `musicEnabled` | Pengaturan audio |
| `todayPrices`, `marketTrend` | Harga pasar hari ini |
| `lastWheelSpin` | Cooldown wheel spin |
| `coinMultiplier`, `growthMultiplier` | Booster aktif |

### 15.3 Migrasi Data Lama

Store secara otomatis menangani migrasi dari save lama:

- **Plot normalization**: field lama (`state: 'grass'`) → field baru (`status: 'empty'`)
- **Animal type migration**: English keys (`chicken`) → Indonesian (`ayam`)
- **Worker migration**: legacy gnome flags → worker system baru
- **Mining nodes padding**: expand ke 30 nodes jika kurang
- **Coin safety**: NaN/Infinity → reset ke 100

### 15.4 Manual Save/Reset

```
Tombol "💾 Save" → feedback toast (Zustand persist sudah auto-save)
Tombol "🔄 Reset" → openConfirm() → resetGame() → set(initialState)
```

---

## 16. Event Spesial & Festival

### 16.1 Random Events (Sudah Aktif ✅)

Setiap hari in-game baru, ada 30% chance random event:

| Event | Efek |
|---|---|
| 🎊 Festival Panen | Harga jual tanaman ×2 |
| 🎣 Hari Bahari | Ikan terjual ×2 |
| 💎 Demam Emas | Drop rate mineral langka meningkat |

### 16.2 Daily Rewards (Streak System) ✅

```
checkStreak() saat game load:
  └─ if lastLogin === hari ini → sudah klaim
  └─ if lastLogin === kemarin → streak += 1
  └─ else → streak = 1

Reward per hari streak:
  Day 1: 100 💰 | Day 2: 200 💰 | Day 3: 300 💰
  Day 4: 400 💰 | Day 5: 500 💰 | Day 6: 750 💰
  Day 7: 1.500 💰
```

### 16.3 Wheel Spin (Lucky Spin) ✅

1× per hari, pemain bisa spin wheel:

| Roll | Reward | Probabilitas |
|---|---|---|
| Common | 100–300 💰 | 60% |
| Uncommon | 500 💰 | 25% |
| Rare | 2.000 💰 | 10% |
| Legendary | 5.000 💰 | 5% |

---

## 17. Sistem UI & Responsivitas

### 17.1 Layout System

```
game-container (max-width: 1800px, centered)
  └─ game-tab-grid (3-column grid di desktop)
       ├─ game-sidebar-left   (minmax 220–260px)
       ├─ game-main           (minmax 0, 3–3.5fr)
       └─ game-sidebar-right  (minmax 220–260px)
```

### 17.2 Responsive Breakpoints

| Breakpoint | Lebar | Layout |
|---|---|---|
| Mobile | < 640px | 1 kolom, stacked |
| Tablet | 640–1023px | 1 kolom, wider cards |
| Desktop | 1024px+ | 3 kolom grid |
| Wide | 1536px+ | 3 kolom, wider sidebars |

### 17.3 Design System

- **Background**: Fixed gradient (`#191654` → `#43C6AC`) yang konsisten saat scroll
- **Cards**: Glassmorphism (`backdrop-blur`, `bg-white/10`, `border-white/20`)
- **Buttons**: Gradient dengan hover elevation effect
- **Animations**: Framer Motion untuk enter/exit, CSS keyframes untuk glow/wiggle/float
- **Font**: Inter (Google Fonts)
- **PWA**: Installable, offline support via service worker

---

## 18. Roadmap Implementasi

### ✅ Sudah Selesai
- [x] Migrasi ke Next.js + React + Zustand
- [x] Sistem farming lengkap (30 plot, 6 jenis bibit)
- [x] Sistem peternakan (6 jenis hewan)
- [x] Sistem pertambangan (30 nodes, 3 level pickaxe, 6 alat)
- [x] Auto workers (petani, peternak, pemancing, penambang)
- [x] Quest harian (3 quest/hari)
- [x] Wheel spin harian
- [x] Streak & daily login rewards
- [x] NPC & friendship system (3 NPC, max level 5)
- [x] Musim & cuaca system
- [x] Random events
- [x] Drag-and-drop plot layout
- [x] Inventory & sell all
- [x] Market dengan fluktuasi harga
- [x] Combo system (XP multiplier)
- [x] Booster (growth, coin)
- [x] Audio system (synthesized SFX + BGM)
- [x] PWA support (offline, installable)
- [x] Responsive layout (mobile → desktop)
- [x] Auto-save (Zustand persist)

### 🚧 Dalam Pengembangan
- [ ] Crafting / Dapur Produksi
- [ ] Order Board (papan pesanan)
- [ ] Mini-game memancing interaktif
- [ ] Tutorial system untuk new players

### 📋 Rencana Masa Depan
- [ ] Leaderboard & multiplayer
- [ ] Seasonal events (Harvest Festival, dll)
- [ ] Guild / Co-op features
- [ ] Achievement system
- [ ] Cross-platform save sync
- [ ] Bibit eksklusif per musim

---

## Appendix A: Glossary

| Istilah | Definisi |
|---|---|
| **Plot** | Satu petak tanah yang bisa ditanami |
| **Grow Time** | Waktu yang dibutuhkan tanaman untuk siap panen |
| **Modifier** | Faktor pengali yang mempengaruhi game mechanics |
| **Tick** | Satu unit waktu dalam game loop (1 detik) |
| **NPC** | Non-Player Character, karakter komputer |
| **Buff** | Efek bonus temporary atau permanent |
| **Zustand** | Library state management untuk React |
| **Persist** | Middleware yang menyimpan state ke localStorage otomatis |
| **PWA** | Progressive Web App, bisa diinstal seperti native app |

---

## Appendix B: Keyboard Shortcuts (Development)

| Shortcut | Aksi | Mode |
|---|---|---|
| `Ctrl+Shift+C` | +1000 koin | Dev only |
| `Ctrl+Shift+L` | Level up | Dev only |
| `Ctrl+Shift+R` | Reset semua plot | Dev only |

---

*Dokumen ini adalah living document dan akan diperbarui seiring perkembangan game. Terakhir diupdate: Juli 2026.*
