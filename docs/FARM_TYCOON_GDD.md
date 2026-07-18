# 🌾 Farm Tycoon — Dokumen Desain Game (GDD)

> **Repository:** [github.com/Makro62/farm-game](https://github.com/Makro62/farm-game)  
> **Dibuat:** Juni 2026  
> **Terakhir Diperbarui:** Juli 2026  
> **Versi Dokumen:** 4.1 (Detail Ekstensif)

---

## Daftar Isi

1. [Gambaran Umum & Arsitektur Sistem](#1-gambaran-umum--arsitektur-sistem)
2. [Alur Pembelian (Purchase Flow)](#2-alur-pembelian-purchase-flow)
3. [Alur Farming (Crop System)](#3-alur-farming-crop-system)
4. [Alur Peternakan (Animal System)](#4-alur-peternakan-animal-system)
5. [Alur Restoran & Crafting (Dapur Dewi Hidangan)](#5-alur-restoran--crafting-dapur-dewi-hidangan)
6. [Sistem Pekerja Otomatis (Auto Workers)](#6-sistem-pekerja-otomatis-auto-workers)
7. [Sistem Cuaca & Efeknya](#7-sistem-cuaca--efeknya)
8. [Sistem Musim (Seasons)](#8-sistem-musim-seasons)
9. [NPC & Friendship System](#9-npc--friendship-system)
10. [Sistem Pertambangan](#10-sistem-pertambangan)
11. [Sistem Memancing](#11-sistem-memancing)
12. [Sistem Audio](#12-sistem-audio)
13. [Sistem Save / Load](#13-sistem-save--load)
14. [Event Spesial & Festival](#14-event-spesial--festival)
15. [Sistem UI & Responsivitas](#15-sistem-ui--responsivitas)
16. [Roadmap Implementasi](#16-roadmap-implementasi)
17. [Rencana Pembangunan Fitur (Plans)](#17-rencana-pembangunan-fitur-plans)

---

## 1. Gambaran Umum & Arsitektur Sistem

Farm Tycoon adalah web-game berbasis browser yang dibangun dengan **Next.js 16 (React 18)** menggunakan **App Router**, **Zustand** untuk state management, dan **TailwindCSS** untuk styling. Arsitekturnya menggunakan pendekatan page-based routing yang dikombinasikan dengan centralized store.

### 1.1 Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| **Next.js** | 16.2.10 (Turbopack) | Framework React, App Router, SSR/SSG, routing |
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
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker for offline support
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.js             # Root layout: fonts, metadata, GameProvider, Toaster
│   │   ├── page.js               # Main redirection/home
│   │   ├── kota/                 # Route untuk Kota (Town)
│   │   ├── pertanian/            # Route untuk Pertanian (Farm)
│   │   ├── peternakan/           # Route untuk Peternakan (Animal)
│   │   ├── profil/               # Route untuk Profil pemain
│   │   ├── restoran/             # Route untuk Restoran (Crafting)
│   │   └── tambang/              # Route untuk Tambang (Mine)
│   ├── components/
│   │   ├── ClientLayout.jsx      # Layout utama klien, mengatur struktur game & sidebar
│   │   ├── GameSidebar.jsx       # Sidebar menu navigasi utama
│   │   ├── TabFarm.jsx           # UI Pertanian: plots, shop bibit, inventory
│   │   ├── TabAnimal.jsx         # UI Peternakan: animals grid, shop hewan
│   │   ├── TabMine.jsx           # UI Tambang: mine nodes, alat
│   │   ├── TabTown.jsx           # UI Kota: NPCs, market, wheel
│   │   ├── TabRestaurant.jsx     # UI Restoran: dapur dewi hidangan, resep, koki
│   │   ├── TabProfil.jsx         # UI Profil: stat player, progres, pengaturan
│   │   ├── Modals.jsx            # Confirm/prompt/NPC gift modals
│   │   ├── ui/                   # Reusable UI components (CraftingWidget, dll)
│   │   └── game/                 # Game-specific components
│   ├── lib/
│   │   ├── store.js              # Zustand store: semua state & actions (49KB)
│   │   ├── store-provider.js     # GameProvider: hydration, game loop, streak
│   │   ├── audio.ts              # AudioManager: Web Audio API synth + Howler music
│   │   ├── constants.js          # Definisi konstanta game
│   │   ├── utils.js              # Fungsi helper
│   │   └── data/                 # Data resep, item, dll
│   └── styles/
│       └── globals.css           # Global styles, glassmorphism, layout utilities
├── docs/
│   └── FARM_TYCOON_GDD.md        # Dokumen ini
├── next.config.js                # Next.js config (PWA, turbopack)
├── tailwind.config.js            # TailwindCSS config
└── package.json                  # Dependencies
```

### 1.3 Alur Data (Reactive Architecture)

State management diurus secara tersentralisasi oleh **Zustand** dan dihubungkan ke React components menggunakan provider. UI re-render secara **otomatis** dan presisi setiap kali nilai pada state berubah.

### 1.4 Game Loop

Game loop berjalan setiap **1 detik** via `setInterval` di `store-provider.js`, mengeksekusi:

```
processGameTick() setiap 1 detik:
  ├─ advanceSeasonTick()    → update musim & hari
  ├─ changeWeather()        → countdown & random cuaca baru
  ├─ syncPlots()            → ubah 'growing' → 'ready' saat waktunya
  ├─ syncMiningNodes()      → regenerasi petak tambang
  └─ runAutoWorkers()       → petani, peternak, pemancing, koki
```

---

## 2. Alur Pembelian (Purchase Flow)

Sistem pembelian menggunakan side-dock/panel di masing-masing area untuk **Bibit Tanaman**, **Hewan Ternak**, **Alat Tambang**, **Resep/Koki**, dan **Pekerja Otomatis**.

```
[1] User buka panel Shop di sebelah kanan/sidebar komponen.
[2] Validasi kecukupan koin (coins >= price).
[3] store.buyItem() atau aksi serupa dipanggil.
[4] Koin dikurangi, item ditambahkan ke inventory / state pekerja diaktifkan.
[5] Notifikasi via react-hot-toast muncul.
```

---

## 3. Alur Farming (Crop System)

Setiap petak (plot) pertanian memiliki state machine 3-state yang dikelola oleh Zustand store.

### 3.1 State Machine Plot Tanah

```
     [EMPTY]
        │ (klik + ada bibit terpilih)
        ▼
     [GROWING]  ──── timer growTime selesai ────→  [READY]
        │                                            │ (klik panen)
        ▼                                            ▼
      (Batal) ─────────────────────────────── kembali [EMPTY]
```

Pemain juga bisa mengatur layout petak pertanian dengan **Drag-and-Drop** melalui tombol edit layout.

### 3.2 Data Bibit & Tanaman Tersedia

Bibit dapat ditanam lebih cepat (+1.5x) menggunakan Growth Booster (50 Koin).

| Bibit / Crop | Harga (💰) | Waktu Tumbuh | Musim Favorit |
|---|---|---|---|
| 🥕 Wortel | 10 | 15 dtk | Semua |
| 🌽 Jagung | 20 | 30 dtk | Semua |
| 🍅 Tomat | 35 | 60 dtk | Summer |
| 🍓 Stroberi | 75 | 120 dtk | Spring |
| 🌷 Tulip | 100 | 100 dtk | Spring |
| 🌾 Gandum | 90 | 135 dtk | Autumn |
| 🎋 Tebu | 110 | 140 dtk | Summer |
| 🍉 Semangka | 120 | 150 dtk | Summer |
| 🍎 Apel | 140 | 180 dtk | Autumn |
| 🎃 Labu | 160 | 200 dtk | Autumn |
| 🍄 Jamur | 500 | 300 dtk | Winter |

---

## 4. Alur Peternakan (Animal System)

Hewan ditampilkan dalam grid di area peternakan. Setiap hewan memiliki timer produksi independen. Saat progress = 100%, hewan akan bersinar kuning dan siap dipanen manual (diklik) atau dipanen otomatis oleh pekerja.

### 4.1 Data Hewan Ternak

| Hewan | Harga (💰) | Waktu Prod. | Hasil (Produk) |
|---|---|---|---|
| 🐔 Ayam | 150 | 20 dtk | 🥚 Telur |
| 🦆 Bebek | 300 | 40 dtk | 🥚 Telur Bebek |
| 🐄 Sapi | 500 | 60 dtk | 🥛 Susu |
| 🐑 Domba | 800 | 90 dtk | 🧶 Bulu |
| 🐷 Babi | 1.200 | 120 dtk | 🍄 Truffle |
| 🐴 Kuda | 2.000 | 150 dtk | 🧲 Tapal Kuda |

---

## 5. Alur Restoran & Crafting (Dapur Dewi Hidangan)

**Status:** Selesai Diimplementasikan ✅

Dapur Produksi (Restoran) memungkinkan pemain mengolah hasil panen menjadi hidangan bernilai tinggi melalui antrean produksi.

### 5.1 Mekanik Restoran
- **Papan Menu**: Pemain dapat melihat resep yang tersedia.
- **Ketersediaan Bahan**: Resep hanya bisa dibuat (`startCrafting()`) jika bahan mentah di inventaris mencukupi.
- **Dapur Saya**: Terdapat 3 slot antrean maksimal per jenis menu. Saat resep dibuat, bahan baku dikonsumsi dan item masak masuk ke slot antrean untuk durasi tertentu sebelum siap.

### 5.2 Data Resep Makanan

| Resep | Waktu | Jual (💰) | XP | Bahan Baku Dibutuhkan |
|---|---|---|---|---|
| 🥣 Sup Wortel | 3 menit | 150 | 50 | 4x Wortel |
| 🌾 Tepung Jagung| 3 menit | 200 | 60 | 4x Jagung |
| 🧀 Keju | 5 menit | 400 | 120 | 3x Susu |
| 🍰 Kue Stroberi | 10 menit | 800 | 200 | 3x Stroberi, 2x Telur, 1x Susu, 1x Tebu |
| 🥕 Kue Wortel | 8 menit | 600 | 150 | 3x Wortel, 2x Gandum, 1x Telur, 1x Tebu |
| 🥧 Kue Apel | 9 menit | 750 | 180 | 3x Apel, 2x Gandum, 1x Susu, 1x Tebu |
| 🥮 Kue Manis | 6m 40s | 500 | 120 | 2x Gandum, 2x Susu, 2x Tebu |
| 🍣 Sushi Ikan Mas| 4 menit | 300 | 100 | 2x Ikan Mas, 2x Tomat |
| 🍢 Lele Bakar | 5 menit | 400 | 150 | 2x Lele, 1x Jagung |
| 🧆 Takoyaki | 6 menit | 1.000 | 300 | 2x Cumi-cumi, 2x Telur |

### 5.3 Pekerja: Koki Juna 👨‍🍳
- Pemain bisa menyewa Koki Juna dari toko.
- Setelah aktif (Auto: ON), pemain dapat memilih salah satu resep sebagai **Target Masak**. Koki Juna akan secara otomatis memasak resep tersebut selama bahan baku masih tersedia.

---

## 6. Sistem Pekerja Otomatis (Auto Workers)

Pekerja otomatis melakukan tugas berulang tanpa interaksi pemain. Dipicu oleh `runAutoWorkers()` di game loop setiap 1 detik.

| Pekerja | Harga Sewa (💰) | Deskripsi Aksi Otomatis |
|---|---|---|
| **Peternak Siti** | 500 | Mengumpulkan hasil dari hewan yang telah siap (100%). |
| **Petani Budi** | 5.000 | Panen plot yang *ready* dan menanam ulang bibit terakhir. |
| **Nelayan Mamat**| 12.000 | Memancing otomatis dengan probabilitas per detik. |
| **Penambang** | 15.000 | Menambang node tambang yang *ready* secara otomatis. |
| **Koki Juna** | 25.000 | Memasak resep spesifik asalkan bahan baku tersedia di Dapur. |

---

## 7. Sistem Cuaca & Efeknya

Cuaca berubah secara acak setiap **5 menit** (300 tick). Terdapat 5 cuaca: ☀️ Cerah, ⛅ Berawan, 🌧️ Hujan, ⛈️ Badai, 💨 Berangin. 

---

## 8. Sistem Musim (Seasons)

Siklus musim berjalan 🌸 Spring → ☀️ Summer → 🍂 Autumn → ❄️ Winter. 
Setiap musim berlangsung **7 hari in-game** (1 hari = 180 tick / 3 menit real-time).

---

## 9. NPC & Friendship System

Pemain dapat mengunjungi area **Kota** untuk memberikan hadiah kepada 3 NPC utama (Max Level 5). Pemberian item kesukaan mereka memberikan poin ganda.

| NPC | Peran | Hadiah Kesukaan (Likes) |
|---|---|---|
| **👩‍🍳 Chef Maria** | Koki Kota | Tomat, Wortel, Susu |
| **👴 Pak Tua Botan**| Ahli Tani | Tulip, Semangka, Apel |
| **🐮 Paman Hadi** | Peternak | Jagung, Gandum |

---

## 10. Sistem Pertambangan

Grid tambang terdiri dari 30 node. Pemain dapat menggunakan alat seperti **Bom Kecil/Besar** atau **Senter Goa**. Pemain juga dapat membeli Pickaxe yang lebih kuat.

### 10.1 Data Mineral (Drop Rate)

| Mineral | Emoji | Peluang | Jual (💰) |
|---|---|---|---|
| Batu | 🪨 | 80% | 5 |
| Tembaga | 🔶 | 50% | 30 |
| Besi | ⚫ | 30% | 80 |
| Emas | 🟡 | 15% | 300 |
| Berlian | 💎 | 5% | 1.000 |

### 10.2 Upgrade Pickaxe

- **Lv 1 (Cangkul Kayu)**: Regen rate 120 detik (Default)
- **Lv 2 (Pickaxe Besi)**: Regen rate 90 detik (Harga: 300 Koin)
- **Lv 3 (Pickaxe Emas)**: Regen rate 60 detik + Bonus Drop Rare Ore (Harga: 800 Koin)

---

## 11. Sistem Memancing

Memancing ikan ditangani oleh auto worker (Nelayan Mamat). Drops bervariasi dari Ikan Mas hingga Gurita Emas dengan rarity berbeda.

### 11.1 Data Ikan

| Ikan | Emoji | Peluang Drop | Harga (Normal) | Harga (Besar) |
|---|---|---|---|---|
| Ikan Mas | 🐟 | 40% | 80 | 160 |
| Lele | 🐠 | 30% | 100 | 200 |
| Ikan Badut | 🐡 | 15% | 200 | 400 |
| Cumi-cumi | 🦑 | 10% | 350 | 700 |
| Gurita Emas | 🐙 | 5% | 2.000 | 4.000 |

---

## 12. Sistem Audio

Audio terbagi menjadi 2:
- **Web Audio API**: Efek suara sintesis (SFX) yang di-generate via kode (harvest, plant, coin, levelup) sehingga sangat ringan.
- **Howler.js**: Untuk musik latar (BGM) seperti `farm-theme.mp3`.
Dapat di-toggle via Topbar.

---

## 13. Sistem Save / Load

Zustand Persist menyimulasikan "Auto-Save" ke `localStorage` dengan key `farm-game-storage`. Data yang di-persist termasuk: statistik (koin, level), inventaris, plot, data pekerja, data hewan, NPC, dan konfigurasi lainnya. Game memastikan backwards-compatibility lewat migrasi logika (normalize old state) ketika skema berubah.

---

## 14. Event Spesial & Festival

- **Random Events**: Ada peluang 30% pada awal hari baru untuk event khusus (Festival Panen: harga tanaman x2, dll).
- **Streak System**: Bonus koin harian bila login beruntun.
- **Lucky Spin (Wheel)**: Spin roda harian dengan peluang 5% untuk mendapatkan 5.000 Koin.

---

## 15. Sistem UI & Responsivitas

Antarmuka menggunakan arsitektur modular yang dibalut `ClientLayout` dan `GameSidebar`. Desain menggunakan **Glassmorphism** dengan palet cerah khas pertanian. Mendukung *responsive layout* secara adaptif pada ukuran desktop, tablet, dan ponsel. Telah disiapkan untuk PWA sehingga dapat diinstal layaknya native application.

---

## 16. Roadmap Implementasi

### ✅ Sudah Selesai
- [x] Migrasi ke Next.js + React + Zustand dengan App Router
- [x] Sistem farming lengkap (drag and drop, 11 jenis bibit tanaman)
- [x] Sistem peternakan lengkap (6 jenis hewan ternak)
- [x] Sistem pertambangan (alat, regenerasi node, 5 mineral)
- [x] Crafting / Dapur Produksi (Koki Juna, 10 Resep Queueing)
- [x] Auto workers (5 tipe pekerja otomatis)
- [x] Fitur kota (3 NPC Friendship, Market Board, Wheel Spin)
- [x] Sistem Musim (4 musim) & Cuaca (5 cuaca)
- [x] Audio system (synthesized SFX + BGM)
- [x] PWA support, Responsive layout, Auto-save

### 🚧 Dalam Pengembangan / Tertunda
- [x] Order Board (papan pesanan dinamik)
- [ ] Mini-game memancing interaktif
- [ ] Tutorial system untuk new players

### 📋 Rencana Masa Depan
- [ ] Leaderboard & sistem multiplayer sederhana
- [ ] Seasonal events khusus & Guild/Co-op
- [ ] Achievement system
- [ ] Cross-platform save sync (Cloud Save)

---

## 17. Rencana Pembangunan Fitur (Plans)

Bagian ini memaparkan rencana mendetail *(technical design/plan)* untuk pengerjaan fitur-fitur yang masih dalam tahap antrean pengembangan.

### Plan 1: Order Board (Papan Pesanan Dinamis)
**Tujuan**: Memberikan variasi cara pemain mendapatkan koin/XP dengan memenuhi kombinasi barang permintaan (pesanan), bukan sekadar menjual hasil panen lewat tombol "Sell All".
- **State Store (`store.js`)**: 
  - Tambahkan array `activeOrders: []`. Setiap order memiliki `{ id, itemsRequired: { cropId: qty, ... }, rewardCoins, rewardXP, expiryTimer }`.
  - Fungsi: `generateOrder()`, `fulfillOrder(orderId)`, `removeExpiredOrders()`.
- **Game Loop (`store-provider.js`)**: 
  - Periksa setiap beberapa siklus tick (misal setiap 60 detik) untuk memanggil `generateOrder()` jika `activeOrders.length < maxOrders`.
- **UI (`TabTown.jsx` atau Route Khusus `app/pesanan`)**:
  - Tampilkan UI Kanban/Board yang memuat kartu pesanan.
  - Kartu memvisualisasikan *progress bar* jumlah bahan di inventory dibanding kebutuhan pesanan. Tombol "Kirim Pesanan" aktif bila kriteria terpenuhi.
- *(Note)*: Data template pesanan *(Tier 1-3)* sudah dikoding di `ORDER_TEMPLATES` dalam file `constants.js`/`recipes.js` dan siap diintegrasikan.

### Plan 2: Mini-game Memancing Interaktif
**Tujuan**: Mengubah memancing dari sekadar pasif (menunggu Nelayan Mamat) menjadi kegiatan aktif pemain dengan mini-game.
- **Konsep Mekanik**: 
  - Mirip game *Stardew Valley*. Bar hijau yang bisa digerakkan naik turun (diklik/tahan) untuk mencocokkan dengan posisi icon ikan yang bergerak tak beraturan.
- **Komponen (`components/game/FishingMiniGame.jsx`)**:
  - Gunakan `requestAnimationFrame` untuk menangani physics gerak bar dan ikon ikan.
  - State lokal: `fishPosition`, `catchBarPosition`, `progress` (0-100%).
- **Integrasi Store**: 
  - Tambahkan method `startFishingMiniGame()` yang mengatur status UI. Saat menang (progress 100%), panggil `rewardFish(rarity)` lalu tutup modal.

### Plan 3: Sistem Tutorial untuk Pemain Baru
**Tujuan**: Menurunkan *learning curve* dengan panduan on-boarding yang memandu step-by-step.
- **State (`store.js`)**: 
  - Tambahkan state `tutorialStep` (default: 0). Nilai -1 jika tutorial selesai/di-skip.
- **Komponen (`components/ui/TutorialOverlay.jsx`)**:
  - Komponen pop-over *absolute* yang menargetkan bounding box elemen UI tertentu berbekal React `ref` atau `id` yang diatur via `dataset`.
  - **Langkah 1**: Tunjuk ke sidebar bibit -> "Beli Bibit Wortel".
  - **Langkah 2**: Tunjuk ke plot kosong -> "Tanam Wortel di sini".
  - **Langkah 3**: Berikan growth booster instan (khusus tutorial) -> "Panen Wortel".
  - **Langkah 4**: Buka inventory -> "Jual hasil panen".
- Kondisi transisi antar *step* dijalankan secara otomatis saat listener di Zustand mendeteksi aksi terpenuhi (misal inventory bertambah karena panen).

### Plan 4: Cloud Save & Leaderboard
**Tujuan**: Menghindari kehilangan save data jika `localStorage` terhapus, dan memantik jiwa kompetitif.
- **Backend (Supabase / Firebase)**:
  - Gunakan autentikasi simpel (Google/Email) atau anonim (UUID mapping).
  - Skema DB: `users (id, name, level, total_coins, state_json)`.
- **Mekanik Sinkronisasi**:
  - Tombol "Sync to Cloud" di tab Profil.
  - Saat dipencet, merangkai current Zustand state, mengonversinya menjadi base64/JSON, lalu update ke backend DB.
  - Fetch 50 top level pemain dari database untuk ditampilkan di halaman "Papan Peringkat".

---
*Dokumen ini adalah living document dan akan diperbarui seiring perkembangan game. Terakhir diupdate: Juli 2026.*
