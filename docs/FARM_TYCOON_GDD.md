
---
title: Farm Tycoon — Game Design Document
version: 1.0 (Code-Accurate)
last_updated: 2026-07-20
---

# Farm Tycoon — Game Design Document (GDD)

> **Status**: Final — mencerminkan kondisi kode setelah semua perbaikan P1–P3 dan code quality fix.
> **Tech Stack**: Next.js 14 (App Router) + Zustand (state management) + Tailwind CSS + Framer Motion + Howler.js + Web Audio API

---

## 1. Executive Summary

Farm Tycoon adalah idle-farming game berbasis web dengan 6 area gameplay yang saling terhubung: **Ladang, Peternakan, Tambang, Memancing, Restoran, dan Kota**. Pemain menanam tanaman, memelihara hewan, menambang mineral, memancing ikan, memasak resep, melayani pelanggan, menyelesaikan order board, dan membangun hubungan dengan NPC.

Game berjalan sepenuhnya di client-side (localStorage) dengan game loop tick 1 detik. Mendukung offline progress, auto workers (5 tipe), sistem cuaca/musim, daily quests, combo system, wheel of fortune, dan achievement system dengan 21 achievement.

---

## 2. Game Overview

| Aspek | Detail |
|-------|--------|
| **Platform** | Web (PWA-ready) |
| **Genre** | Idle Farming / Tycoon / Simulation |
| **Target Player** | Casual, mobile-first |
| **Session Length** | 5–30 menit (daily check-in) |
| **Monetization** | None (free-to-play murni) |
| **Save Method** | localStorage via Zustand persist middleware |
| **Offline Progress** | Didukung untuk Auto Farmer, Auto Rancher, Auto Fisher, Auto Miner |

### 2.1 Player Progression

- **Level**: 1–11+ (XP kumulatif, setiap level butuh `level * 100` XP)
- **Energy**: 100 base + `(level - 1) * 10`, cap 200 di level 11
- **Max Energy**: 200
- **Energy reset**: Setiap "hari" (7 tick musim → 1 hari → energi full restore)
- **Coins**: Currency utama, bisa dari jual item, order, quest, wheel, streak, serve pelanggan

### 2.2 XP Sources

| Aksi | XP |
|------|----|
| Panen tanaman | 10 |
| Tambang mineral | 15 |
| Memancing ikan | 15 |
| Kolek hasil ternak | 8 |
| Bonus beri pakan ternak | 3 |
| Masak resep | 0 (via `recipe.xp`) |

---

## 3. Game World & Setting

### 3.1 Navigation

6 tab utama via sidebar (`src/lib/nav.js`):

| ID | Label | Emoji | Route |
|----|-------|-------|-------|
| `pertanian` | Ladang | 🌱 | `/pertanian` |
| `peternakan` | Ternak | 🐄 | `/peternakan` |
| `tambang` | Tambang | ⛏️ | `/tambang` |
| `kota` | Kota | 🏪 | `/kota` |
| `restoran` | Restoran | 🍰 | `/restoran` |
| `profil` | Profil | 🧑‍🌾 | `/profil` |

### 3.2 Musim (Seasons)

Siklus 4 musim, masing-masing 7 hari (180 tick/hari):

| Musim | Emoji | Durasi |
|-------|-------|--------|
| Spring (Semi) | 🌸 | 7 hari |
| Summer (Panas) | ☀️ | 7 hari |
| Autumn (Gugur) | 🍂 | 7 hari |
| Winter (Dingin) | ❄️ | 7 hari |

**Musim mempengaruhi**: bibit mana yang bisa ditanam (tanpa Greenhouse).

### 3.3 Cuaca (Weather)

Berubah setiap 300 tick. Dipengaruhi musim:

| Cuaca | Efek |
|-------|------|
| ☀️ Cerah | Normal |
| ⛅ Berawan | Normal |
| 🌧️ Hujan | Semua tanaman otomatis tersiram |
| ⛈️ Badai | Mining regen 50%, animal produce 80% |
| 🌫️ Berkabut | Fishing rare 70%, customer rate 120% |
| 🌬️ Berangin | Crop growth 110% |
| ☃️ Bersalju (winter only) | Tanaman growing → layu |

Weather effects di-cache di `state.weatherEffects` dan digunakan oleh farming, mining, ranching, fishing, dan customer slices.

---

## 4. Core Gameplay Mechanics

### 4.1 Energy System

- Setiap aksi mengkonsumsi 1–2 energy
- Energy terisi penuh saat ganti hari
- Tidak ada mekanisme "makan" untuk restore energy selain ganti hari
- Jika energy tidak cukup, aksi gagal dengan toast

### 4.2 Combo System

- Window: 2.5 detik antar aksi
- Multiplier: `1 + (count - 1) * 0.25`, max 4.0x
- Threshold ≥3 untuk bonus coins otomatis
- Reset saat window expired

### 4.3 Daily Streak

- Login harian: reward coins [100, 200, 300, 400, 500, 750, 1500]
- Streak terputus jika lewat 1 hari

### 4.4 Wheel of Fortune

- 1× spin per hari
- Reward: 100–200 (60%), 500 (25%), 2000 (10%), 5000 (5%)

### 4.5 Daily Quests

- 3 quest random per hari dari pool 9 quest
- Tipe: harvest, mine, fish, collect
- Reward: coins + XP
- Progress dilacak per aksi

---

## 5. Resource & Economy System

### 5.1 Currency

- **Coins**: Satu-satunya mata uang, tidak ada premium currency

### 5.2 Inventory

- Flat object `{ [itemId]: quantity }` di Zustand store
- Item tidak punya stack limit
- Item otomatis terhapus dari inventory jika quantity ≤ 0

### 5.3 Selling Price Logic (`src/lib/data/item-helpers.js`)

| Tipe Item | Formula Harga Jual |
|-----------|-------------------|
| Bibit (seed) | **Tidak bisa dijual** (`isSellableProduce` = false) |
| Hasil panen (crop) | `seed.price * 1.5` |
| Produk ternak | `animal.price * 0.5` |
| Ikan | `priceNormal` (dari data fish) |
| Mineral | `price` (dari data mineral) |
| Resep masakan | `recipe.price` |
| Alat tambang/bait | **Tidak bisa dijual** |

### 5.4 Market Price Fluctuation (`updateMarket`)

- Setiap hari (ganti musim tick), harga crop diacak `0.7–1.3×` dari base price
- Disimpan di `state.todayPrices` dan `state.marketTrend` (up/down)

### 5.5 Price Multipliers

- **Coin Booster** (30 menit): ×2 semua penjualan
- **Silo building**: +15% harga jual tanaman
- **Event "Festival Panen"**: ×2 harga tanaman
- **Event "Hari Bahari"**: ×2 harga ikan

### 5.6 Special Items (Cross-System)

| Item | Source | Usage |
|------|--------|-------|
| Cacing Tanah 🪱 | Drop tambang batu (20%) | Craft Umpan Cacing |
| Pupuk Kandang 🌿 | Drop kolek ternak (15%) | Auto-pakai saat tanam (-15% grow time) |

---

## 6. Farming System (Ladang)

### 6.1 Plot Grid

- 30 plot (`GRID.PLOTS = 30`), setiap plot punya state: `empty` / `growing` / `ready` / `dead`
- Plot bisa di-swap (drag) via `swapPlots(id1, id2)`
- Normalisasi plot (migrasi dari legacy state) di `normalizePlot()`

### 6.2 Seeds

12 bibit dengan properti `{ id, cropId, name, emoji, price, time (detik), season }`:

| Bibit | Harga | Waktu | Musim |
|-------|-------|-------|-------|
| Wortel 🥕 | 10 | 15 | All |
| Jagung 🌽 | 20 | 30 | All |
| Tomat 🍅 | 35 | 60 | Summer |
| Stroberi 🍓 | 75 | 120 | Spring |
| Tulip 🌷 | 100 | 100 | Spring |
| Gandum 🌾 | 90 | 135 | Autumn |
| Tebu 🎋 | 110 | 140 | Summer |
| Semangka 🍉 | 120 | 150 | Summer |
| Apel 🍎 | 140 | 180 | Autumn |
| Labu 🎃 | 160 | 200 | Autumn |
| Jamur 🍄 | 500 | 300 | Winter |
| Nanas 🍍 | 200 | 220 | Summer |
| Kentang 🥔 | 180 | 190 | Autumn |

### 6.3 Planting Flow (`plantSeed`)

1. Cek season compatibility (kecuali Greenhouse)
2. Remove seed dari inventory (`removeItem`)
3. Consume 1 energy (`consumeEnergy`)
4. Auto-pakai Pupuk Kandang jika ada (-15% grow time)
5. Plant plot via `plant()`

### 6.4 Watering

- 1 energy per siram
- Mengurangi sisa grow time sebesar 18%
- Status `watered: true`

### 6.5 Harvesting

- Consume 1 energy
- Hasil: +1 crop ke inventory, +10 XP
- Tracking: `stats.totalHarvested`, `markSessionAction('harvested')`
- Combo bonus: jika count ≥3, bonus coins
- Auto check achievement

### 6.6 Growth Calculation

```
growTime = (seed.time * 1000) / growthMultiplier
growthMultiplier = state.growthMultiplier (booster) * weatherEffects.cropGrowth
```

---

## 7. Animal Husbandry (Peternakan)

### 7.1 Animals

6 tipe hewan, semua di grid 36 slot:

| Hewan | Harga | Produksi (detik) | Produk | Pakan |
|-------|-------|-----------------|--------|-------|
| Ayam 🐔 | 150 | 20 | Telur 🥚 | Jagung ×2 |
| Bebek 🦆 | 300 | 40 | Telur Bebek 🥚 | Jagung ×2 |
| Sapi 🐄 | 500 | 60 | Susu 🥛 | Gandum ×2 |
| Domba 🐑 | 800 | 90 | Bulu 🧶 | Gandum ×2 |
| Babi 🐖 | 1,200 | 120 | Truffle 🍄 | Wortel ×2 |
| Kuda 🐴 | 2,000 | 150 | Tapal 🧲 | Wortel ×3 |

### 7.2 Buying Animals

- `buyAnimal(type, price, produceTime)` — validasi coins, generate unique ID, push ke array animals
- `buyMultipleAnimals(type, amount, unitPrice, produceTime)` — bulk buy

### 7.3 Produksi & Collect

- Setiap hewan punya `lastCollected`, `produceTime`, `fed` status
- Collect: consume 1 energy, +1 produk (+1 bonus jika fed), 15% chance drop Pupuk Kandang
- Reset `fed: false` setelah collect

### 7.4 Feeding System (Fase B)

- Opsional, menggunakan hasil panen
- Bonus: +25% chance bonus produk (+25% FEED_BONUS)
- XP bonus: +3 per kolek jika hewan fed
- Tracking: `totalAnimalsFed`

### 7.5 Produksi Auto (Worker)

Lihat section 11 (Auto Workers).

---

## 8. Mining System (Tambang)

### 8.1 Mining Nodes

- 30 node, tiap node punya: `{ id, status, type, regenAt }`
- 5 tipe mineral dengan weighted random:

| Mineral | Base Weight | Harga Jual | Special Bonus Weight |
|---------|------------|------------|---------------------|
| Batu 🪨 | 50 | 5 | — |
| Tembaga 🔶 | 20 | 30 | — |
| Besi ⚫ | 15 | 80 | +5 (pickaxe ≥2) |
| Emas 🟡 | 10 | 300 | +5 (pickaxe ≥3), +3 (lantern), +5 (event) |
| Berlian 💎 | 5 | 1000 | +3 (pickaxe ≥3), +2 (lantern), +5 (event) |

### 8.2 Mining Action

- Consume 2 energy
- 20% chance drop Cacing (jika node type = batu)
- Regen time berdasarkan pickaxe level, lantern, cuaca
- Combo bonus coins jika ≥3

### 8.3 Pickaxe Levels

| Level | Nama | Regen | Bonus |
|-------|------|-------|-------|
| 1 | Cangkul Kayu 🪨 | 120 detik | — |
| 2 | Pickaxe Besi ⛏️ | 90 detik | +5 besi, -5 batu |
| 3 | Pickaxe Emas 🛠️ | 60 detik | +5 emas, +3 berlian, -8 batu |

### 8.4 Mining Tools (`useMiningTool`)

| Tool | Harga | Efek |
|------|-------|------|
| Bom Kecil 🧨 | 50 | ×2 hasil node siap, atau buka node cooldown |
| Bom Besar 💣 | 100 + 3 tembaga | Tambang semua node ready sekaligus |
| Pickaxe Besi ⛏️ | 200 + 5 besi | Upgrade ke level 2 |
| Pickaxe Emas 🛠️ | 500 + 3 emas + 5 besi | Upgrade ke level 3 |
| Senter Goa 🔦 | 120 | Buff 5 menit: regen 50% + bonus rare ore |
| Tali Tambang 🪢 | 60 | Buka 1 node cooldown |

### 8.5 Lantern (Senter)

- Durasi: 5 menit (300,000 ms)
- Efek: regen 50%, bonus emas +3, berlian +2

---

## 9. Fishing System (Memancing)

### 9.1 Fish Data

5 jenis ikan dengan chance:

| Ikan | Harga Jual (normal/big) | Chance |
|------|------------------------|--------|
| Ikan Mas 🐟 | 80 / 160 | 40% |
| Lele 🐠 | 100 / 200 | 30% |
| Ikan Badut 🐡 | 200 / 400 | 15% |
| Cumi-cumi 🦑 | 350 / 700 | 10% |
| Gurita Emas 🐙 | 2000 / 4000 | 5% |

### 9.2 Bait System

| Umpan | Harga | Wait Mult | Rare Bonus | Craftable |
|-------|-------|-----------|------------|-----------|
| Biasa 🪱 | 15 | 85% | 0% | — |
| Premium 🦐 | 60 | 55% | 12% | — |
| Emas ✨ | 150 | 40% | 25% | — |
| Cacing 🪱 | 0 | 65% | 8% | 2 cacing |

### 9.3 Fishing Minigame Constants

| Parameter | Value |
|-----------|-------|
| Wait min | 2000 ms |
| Wait random | 3000 ms |
| Bite window | 1500 ms |
| Minigame max time | 6000 ms |
| Win threshold | 40 (dari 0–100) |
| Tick rate | 50 ms |
| Auto catch interval | 10 detik |

### 9.4 Auto Fisher

- Auto-catch tiap tick (10% chance per tick)
- Mining area disimulasikan dengan random roll FISHES berdasarkan chance

---

## 10. Restaurant & Crafting

### 10.1 Recipes

28 resep dalam 3 tipe: `kitchen`, `restaurant`, `fish_kitchen`

**Tier 1** (Level 1+): 5 resep
- Sup Wortel, Tepung Jagung, Es Teh Manis, Jus Tomat, Lele Bakar

**Tier 2** (Level 5+): 6 resep
- Keju, Nasi Goreng, Roti Gandum, Susu Stroberi, Kue Wortel, Sushi Ikan Mas

**Tier 3** (Level 10+): 5 resep
- Kue Manis, Pancake, Takoyaki, Nasi Jamur, Kue Apel

**Tier 4** (Level 15+): 2 resep
- Kue Stroberi, Sushi Emas (butuh emas dari tambang)

### 10.2 Crafting Queue

- Max 3 antrean per tipe (`CRAFTING.MAX_QUEUE_PER_TYPE = 3`)
- `startCrafting(recipeId)`: validasi bahan → deduct inventory → push queue
- `processCraftingQueue()`: cek durasi tiap item, jika selesai → add hasil ke inventory + XP
- `collectCraftedItem(queueId)`: collect manual item yang sudah selesai
- `removeCraftingQueue(queueId)`: batalkan + refund bahan

### 10.3 Restaurant Customers

- 9 tipe pelanggan dengan preferensi resep, patience, dan tip multiplier
- Serve: membutuhkan recipe item di inventory
- Tip calculation:
  - patience > 70%: 50% × tipMultiplier
  - patience > 30%: 20% × tipMultiplier
- Pelanggan pergi jika patience = 0
- Spawn: 10% chance per tick × `weatherEffects.customerRate`

### 10.4 Tables

- Default: 4 meja
- Upgrade: `totalTables * 1000` coins per meja, max 9 meja

---

## 11. Town & NPC System (Kota)

### 11.1 Buildings

| Building | Harga | Efek |
|----------|-------|------|
| Silo 🏚️ | 2000 | +15% harga jual tanaman |
| Greenhouse 🏠 | 5000 | Tanam bibit luar musim |

### 11.2 Decorations

| Dekorasi | Harga | Bonus |
|----------|-------|-------|
| Pot Bunga 🪴 | 300 | +5 XP |
| Air Mancur ⛲ | 800 | Visual |
| Patung Koin 🗿 | 1500 | Prestige |

### 11.3 Order Board

- 3 order aktif, digenerate berdasarkan level
- Order punya tier (1–3), timer, items, coins, XP
- Fulfill: validasi inventory → kurangi items → add coins + XP
- Timer: order expired setelah `timer * 1000` ms

### 11.4 NPC Gift System

5 NPC dengan preferensi unik:

| NPC | Role | Suka |
|-----|------|------|
| Chef Maria 🍳 | Koki Kota | tomat, wortel, susu, keju, ikan_mas |
| Pak Tua Botan 👴 | Ahli Tani | tulip, semangka, apel, pupuk_kandang |
| Paman Hadi 🐮 | Peternak | jagung, gandum, truffle, tapal |
| Pak Nelayan Bejo 🎣 | Nelayan | ikan_mas, lele, cumi, umpan_premium |
| Mang Dodi ⛏️ | Penambang | batu, tembaga, besi, emas |

- Gift liked: +50 points
- Gift other: +10 points
- Level up: `points >= level * 100`, max level 5
- Reward level up: `100 * newLevel` XP

### 11.5 Market Price Board

- Harga harian fluktuatif (diupdate setiap ganti hari)
- Ditampilkan di `MarketBoard` component

---

## 12. Event System

### 12.1 Random Events

Trigger: 30% chance setiap ganti hari.

| Event | Efek |
|-------|------|
| 🎊 Festival Panen | Harga jual tanaman ×2 |
| 🎣 Hari Bahari | Harga jual ikan ×2 |
| 💎 Demam Emas | Chance emas +5, berlian +5 (di rollMineralType) |

---

## 13. Auto Workers System

5 tipe worker, masing-masing bisa di-hire dan di-toggle.

| Worker | Biaya | Fungsi |
|--------|-------|--------|
| Petani Budi 👨‍🌾 | 5,000 | Panen otomatis + tanam ulang |
| Peternak Siti 👩‍🌾 | 500 | Kolek hasil ternak otomatis |
| Nelayan Mamat 🎣 | 12,000 | Auto fishing per tick (10% chance) |
| Penambang 🪨 | 15,000 | Auto mine per tick (20% chance per node ready) |
| Koki Juna 👨‍🍳 | 25,000 | Auto masak (selectedRecipe) |

### 13.1 Auto Farmer Logic

- Iterasi semua plot
- Jika ready → panen + tanam ulang dengan seed dari inventory
- Seed dipilih via `pickAutoSeed()` (prioritas selectedSeed, fallback random)
- Growth multiplier applied

### 13.2 Auto Rancher Logic

- Iterasi semua hewan
- Jika `now - lastCollected >= produceTime` → collect otomatis
- Produk langsung ke inventory
- XP: 8 per kolek

### 13.3 Auto Fisher Logic

- 10% chance per tick (`CHANCES.FISHER_TICK`)
- Random roll dari FISHES berdasarkan chance

### 13.4 Auto Miner Logic

- 20% chance per tick per node ready (`CHANCES.MINER_AUTO_TICK`)
- Mine node pertama yang ready
- XP: 15 per mine

### 13.5 Auto Chef Logic

- Cek inventory untuk recipe requirements
- Jika cukup → push ke crafting queue (max 3 per type)
- Setiap tick cek queue selesai

### 13.6 Offline Simulation

Worker aktif tetap berjalan saat offline:
- Farmer: harvest matang
- Rancher: cycles = `deltaSeconds / produceTimeSecs`
- Fisher: `expectedCatches = floor(attempts * 0.1)`
- Miner: `minedGems = floor(attempts * 0.5)`

Offline report ditampilkan di modal saat kembali.

---

## 14. Achievement System

21 achievement dalam 7 kategori, tracking 15+ stat.

### 14.1 Achievement Categories

| Kategori | Jumlah | Contoh |
|----------|--------|--------|
| Ladang 🌾 | 4 | Panen pertama, 100, 500, pupuk |
| Ternak 🐄 | 4 | Beli hewan, kolek 50, feed 10, pupuk 20 |
| Tambang ⛏️ | 5 | Tambang pertama, 100, berlian, cacing 10, pickaxe emas |
| Pancing 🎣 | 3 | Ikan pertama, 50, umpan cacing |
| Restoran 🍽️ | 4 | Masak pertama, 20, serve 50, sushi emas |
| Kota 🏘️ | 3 | Order pertama, 10, gift 5 |
| Spesial ⭐ | 2 | All Rounder, Supply Chain |

### 14.2 Custom Achievement Conditions

- `pickaxeGold`: `mining.pickaxeLevel >= 3`
- `allRounder`: semua 5 area dalam 1 sesi (tracked via `sessionActions`)
- `supplyChain`: pupuk digunakan + masak sesuatu

### 14.3 Stats Tracked

totalHarvested, totalMined, totalFished, totalCooked, totalServed, totalCollected, totalOrdersFulfilled, totalGiftsGiven, totalFertilizerUsed, totalFertilizerDropped, totalAnimalsFed, totalAnimalsOwned, totalWormsFound, totalWormBaitUsed, totalDiamondsMined, totalSushiEmasMade

---

## 15. Audio System

### 15.1 SFX (Web Audio API Synthesis)

Semua SFX disintesis real-time — tidak ada file audio eksternal.

| Sound | Teknik |
|-------|--------|
| harvest | Ascending arpeggio (C5-E5-G5-C6) |
| plant | Frequency sweep 300→600→400 Hz |
| sell | Cash register bell (1200+1500+2400 Hz) |
| buy | Soft confirmation (A4-C#5) |
| click | Subtle 800→500 Hz tap |
| hover | Very soft 1000 Hz tick |
| success | Triumphant 3-note arpeggio |
| error | Descending square wave 300→200 Hz |
| coin | Bright jingle 1047+1319+1568 Hz |
| levelup | 4-note fanfare (C5-E5-G5-C6) + harmony |
| achievement | Celebration 5-note (G4-B4-D5-G5-B5) |
| combo | Sawtooth whoosh 200→1200 Hz |
| wheel | Ratchet spin (6 ticks) |

### 15.2 Music (Howler.js)

3 tracks MP3:
- `main` — farm theme (loop)
- `menu` — menu theme (loop)
- `event` — event theme (loop)

### 15.3 AudioManager Class

- Singleton (`audioManager`)
- Lazy-init Web Audio context (first user interaction)
- Settings sync dari Zustand store (dual-storage: Zustand persist + AudioManager config)

---

## 16. Save / Load & Persistence

### 16.1 Storage

- **Key**: `farm-game-storage` di localStorage
- **Middleware**: Zustand `persist` + `createJSONStorage`
- **Skip hydration**: `skipHydration: true` (manual via `useGameStore.persist.rehydrate()`)

### 16.2 Partialize

37 fields disimpan (coins, level, xp, energy, plots, inventory, animals, workers, mining, season, weather, npcs, craftingQueue, orders, buildings, achievements, stats, totalTables, tutorialStep, dll).

State ephemeral yang TIDAK disimpan: combo, modals, selectedSeed, selectedMiningTool, selectedBait, selectedRecipe, weatherEffects, sessionActions, notificationsEnabled (di partialize).

### 16.3 Merge & Migration

`merge()` function menangani:
- Normalisasi plots (legacy state → current format)
- Normalisasi animals (readyToCollect → producing)
- Migrasi legacy workers dari key `farmTycoonSave`
- Migrasi tipe hewan (chicken → ayam, duck → bebek, dll)
- Default values untuk fields baru (achievements, stats, weatherEffects)
- NPC defaults (bejo, dodi)
- Padding mining nodes < 30
- Auto-enable worker toggles untuk migration

### 16.4 Game Loop (store-provider.js)

- `GameProvider` wraps app, handles:
  1. Rehydrate store (15s timeout)
  2. Boot: `updateMarket()` + `generateDailyQuests()`
  3. Tick interval: `processGameTick()` setiap 1000 ms
- Error state dengan tombol "Reset & Reload" jika gagal load

### 16.5 processGameTick()

Urutan eksekusi setiap tick:
1. `advanceSeasonTick()` — musim, hari, event
2. `changeWeather()` — cuaca + efek instan
3. `syncPlots()` — cek tanaman ready
4. `syncMiningNodes()` — regen node + auto miner
5. `runAutoWorkers()` — farmer, rancher, fisher, miner, chef
6. `processCraftingQueue()` — selesaikan crafting
7. `checkOrders()` — expire orders, generate baru
8. `tickCustomers()` + `spawnCustomer()` — restoran
9. Check booster expiration

### 16.6 Offline Progress

- Threshold: 60 detik offline
- `calculateOfflineProgress()` dipanggil saat rehidrasi
- Simulasi: farmer (panen), rancher (produk), fisher (catch), miner (mine)

---

## 17. Technical Architecture

### 17.1 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.js           # Root layout: fonts, GameProvider, Toaster
│   ├── page.js             # Home / redirect
│   ├── pertanian/page.js   # Farming page
│   ├── peternakan/page.js  # Ranching page
│   ├── tambang/page.js     # Mining page
│   ├── kota/page.js        # Town page
│   ├── restoran/page.js    # Restaurant page
│   └── profil/page.js      # Profile page
├── components/
│   ├── ClientLayout.jsx    # Layout shell + GameSidebar
│   ├── GameSidebar.jsx     # Main navigation + HUD (448 lines)
│   ├── Modals.jsx          # Prompt, confirm, npc gift modals
│   ├── OfflineProgressModal.jsx
│   ├── ClearServiceWorker.jsx
│   ├── TabFarm.jsx         # Farming tab
│   ├── TabAnimal.jsx       # Ranching tab
│   ├── TabMine.jsx         # Mining tab
│   ├── TabTown.jsx         # Town tab
│   ├── TabRestaurant.jsx   # Restaurant tab
│   ├── TabProfil.jsx       # Profile tab
│   ├── game/               # Sub-components
│   │   ├── PlotGrid.jsx
│   │   ├── SeedShop.jsx
│   │   ├── MarketBoard.jsx
│   │   ├── OrderBoard.jsx
│   │   ├── TownPlaza.jsx
│   │   ├── TownShop.jsx
│   │   └── QuestPanel.jsx
│   └── ui/                 # Shared UI components
│       ├── AnimalIcon.jsx, Button.jsx, CropIcon.jsx
│       ├── AnimatedCounter.jsx, FloatingText.jsx
│       ├── CraftingWidget.jsx, GameAreaHeader.jsx
│       ├── QtyControl.jsx, ShopItemCard.jsx
│       ├── SideDock.jsx, TabPage.jsx, ToolChip.jsx
│       └── TutorialOverlay.jsx
├── lib/
│   ├── store.js            # Zustand store (persist + 9 slices)
│   ├── store-provider.js   # GameProvider + game loop
│   ├── constants.js        # GAME_CONSTANTS (82 lines)
│   ├── nav.js              # NAV_TABS, SEASON_META
│   ├── audio.ts            # AudioManager (Web Audio + Howler)
│   ├── logger.js           # Configurable logger (NEXT_PUBLIC_LOG_LEVEL)
│   ├── utils.js            # cn() utility
│   ├── store/
│   │   ├── initialState.js # Default state (142 lines)
│   │   ├── utils.js        # Pure helpers (201 lines)
│   │   └── slices/
│   │       ├── createFarmingSlice.js     # 209 lines
│   │       ├── createMiningSlice.js      # 282 lines
│   │       ├── createRanchingSlice.js    # 130 lines
│   │       ├── createEconomySlice.js     # 122 lines
│   │       ├── createPlayerSlice.js      # 535 lines
│   │       ├── createTownSlice.js        # 96 lines
│   │       ├── createSystemSlice.js      # 557 lines
│   │       ├── createCustomerSlice.js    # 144 lines
│   │       └── createAchievementSlice.js # 91 lines
│   └── data/               # Game data (static)
│       ├── crops.js        # CROP_DATA + SHOP_SEEDS
│       ├── shop.js          # Animals, mining tools, bait, buildings, decorations
│       ├── fishes.js        # 5 ikan
│       ├── minerals.js      # 5 mineral
│       ├── recipes.js       # 18 resep + 9 order templates
│       ├── npcs.js          # 5 NPC
│       ├── customers.js     # 9 tipe pelanggan
│       ├── achievements.js  # 21 achievement
│       └── item-helpers.js  # Sell price, emoji, display name helpers
├── styles/
│   └── globals.css          # Tailwind base + custom styles
└── public/
    ├── manifest.json
    ├── icons/
    └── music/               # MP3 tracks
```

### 17.2 State Management (Zustand)

- 9 slices di-merge via spread operator
- Persist middleware dengan `partialize` (37 fields) + `merge` (migration logic)
- Selector hooks: `useCoins`, `useLevel`, `usePlots`, `useInventory`, `useSettings`, `useSeason`, `useWeather`, `useMining`, `useNpcs`, `useActiveEvent`

### 17.3 Key Dependencies

- `next`, `react`, `react-dom` — framework
- `zustand` — state management + persist
- `framer-motion` — animations
- `howler` — music playback
- `lucide-react` — icons
- `react-hot-toast` — toast notifications
- `tailwindcss` — styling

### 17.4 Logic Distribution

| Area | Slice File | Lines |
|------|-----------|-------|
| Farming | `createFarmingSlice.js` | 209 |
| Ranching | `createRanchingSlice.js` | 130 |
| Mining | `createMiningSlice.js` | 282 |
| Economy | `createEconomySlice.js` | 122 |
| Player (XP, energy, inventory, crafting, orders, quests, combo, streak, tutorial) | `createPlayerSlice.js` | 535 |
| Town (NPC, market, buildings) | `createTownSlice.js` | 96 |
| System (weather, season, auto workers, offline, tick, modals, settings, wheel) | `createSystemSlice.js` | 557 |
| Restaurant customers | `createCustomerSlice.js` | 144 |
| Achievements | `createAchievementSlice.js` | 91 |
| Game loop | `store-provider.js` | 105 |
| Store assembly | `store.js` | 314 |
| Utility functions | `store/utils.js` | 201 |

### 17.5 Key Constants (GAME_CONSTANTS)

| Group | Key Constants |
|-------|--------------|
| GRID | PLOTS=30, MINING_NODES=30, ANIMAL_SLOTS=36 |
| LEVEL | XP_PER_LEVEL=100, MAX_ENERGY=200, MAX_ENERGY_PER_LEVEL=10 |
| STARTING | COINS=100, ENERGY=100 |
| CHANCES | WORM_DROP=0.2, FERTILIZER_DROP=0.15, AUTO_FISHER_CATCH=0.1, WATER_BOOST=0.18, FISHER_TICK=0.1, MINER_AUTO_TICK=0.2, FEED_BONUS=0.25 |
| COSTS | WORKER_FARMER=5000, WORKER_RANCHER=500, WORKER_MINER=15000, FISHER_WORKER=12000, WORKER_CHEF=25000 |
| MULTIPLIERS | GROWTH_BOOSTER=1.5, COIN_BOOSTER=2 |
| TIMERS | FARM_TICK_RATE=1000 |
| FISHING | WAIT_MIN_MS=2000, BITE_WINDOW_MS=1500, WIN_THRESHOLD=40 |
| MINING | REGEN_MS={1:120000, 2:90000, 3:60000}, LANTERN_DURATION_MS=300000 |
| OFFLINE | MIN_SECONDS=60 |
| SYSTEM | SEASON_TICKS_PER_DAY=180, RANDOM_EVENT_CHANCE=0.3 |
| COMBO | WINDOW_MS=2500, MULTIPLIER_STEP=0.25, MAX_MULTIPLIER=4.0 |
| CRAFTING | MAX_QUEUE_PER_TYPE=3 |

---

## 18. UI Structure

### 18.1 Sidebar (GameSidebar.jsx)

- Collapsible (desktop) / slide-in (mobile)
- HUD: coins, level, XP bar, energy bar, streak, combo, boosters
- Season + weather display
- Navigation: 6 tabs dengan active indicator + notification badge (produk siap panen/ternak/tambang)
- Tombol: save, music toggle, SFX toggle

### 18.2 Tab Pages

Setiap tab menggunakan `TabPage` wrapper + `GameAreaHeader`:

| Tab | Key Components |
|-----|---------------|
| Ladang | PlotGrid, SeedShop (shop sidebar) |
| Ternak | Animal grid, feed button, shop sidebar |
| Tambang | Node grid, tool inventory, shop sidebar |
| Kota | TownPlaza (NPC), MarketBoard, OrderBoard, TownShop |
| Restoran | CraftingWidget, customer tables, recipe list |
| Profil | Stats, achievements, settings, wheel, tutorial |

### 18.3 Modals

- Prompt, Confirm, NPC Gift (unified via `Modals.jsx`)
- Offline progress (`OfflineProgressModal.jsx`)
- Tutorial overlay (`TutorialOverlay.jsx`)

---

## 19. Bug Fixes Applied (P1–P3)

### P1 — Critical
1. **buyAnimal() gratis**: Ditambahkan validasi `safeCoins(state.coins) < price` di `createRanchingSlice.js:9`
2. **processCraftingQueue() loop tak terbatas**: Diubah `for` loop jadi reverse iteration + `splice` di `createPlayerSlice.js:376`
3. **rollMineralType() totalWeight overflow**: Ditambahkan guard `if (weights[k] < 0) weights[k] = 0` di `store/utils.js:32`

### P2 — Persistence
4. **totalTables persist**: Ditambahkan `totalTables` ke `partialize()` di `store.js:148`
5. **tutorialStep persist**: Ditambahkan `tutorialStep` ke `partialize()` di `store.js:149`
6. **Sound dual-storage**: AudioManager.readSettings() → default, sync via `syncFromStore()`
7. **tickCustomers() persist**: Ditambahkan `activeCustomers` ke `partialize()`

### P3 — UX / Code Quality
8. **Sidebar badge area**: Ditambahkan `computeBadgeCounts()` selector
9. **Summary ticker di GameSidebar**: Ditambahkan animated summary ticker component
10. **Toast bahan kurang detail**: Improved error messages di `startCrafting()`
11. **Loading/error state**: Ditambahkan di `store-provider.js` dengan 15s timeout
12–19: Magic number → constants, NaN guards, logger config via ENV, dll.

---

## 20. Roadmap

### Completed
- Semua 6 area gameplay (Ladang, Ternak, Tambang, Pancing, Restoran, Kota)
- Sistem cuaca & musim
- 5 Auto Workers
- Crafting & restaurant customers
- NPC gift system
- Achievement system (21 achievements)
- Order board
- Daily quests, streak, wheel of fortune
- Offline progress
- PWA support (manifest + service worker cleanup)
- Audio (Web Audio SFX + Howler music)

### Future Possibilities
- Multiplayer / leaderboard
- Premium currency atau battle pass
- Expanding recipe & crop data
- Fishing minigame visual refinement
- More events & seasonal content
- Mobile app via PWA

---

*Dokumen ini mencerminkan kondisi kode aktual per 20 Juli 2026 setelah implementasi perbaikan P1–P3, persist fix, UX fix, dan code quality enhancement. Build lulus dengan 0 error.*


# Analisis Kode Final — Farm Tycoon

> **Status:** ✅ Build lolos (0 error, 2.4s)
> **Versi Kode:** Post-P0/P1/P2 fixes + Refactoring #1 #2 #3

---

## 1. Ringkasan Proyek

| Aspek | Detail |
|---|---|
| Framework | Next.js 16.2.10 (Turbopack) |
| State Management | Zustand v4 + persist middleware |
| Styling | Tailwind CSS v3 |
| Animasi | Framer Motion v11 |
| Audio | Howler.js + Web Audio API (synthesized SFX) |
| PWA | @ducanh2912/next-pwa |
| Bahasa | JavaScript (JSX) + TypeScript minimal (audio.ts) |
| Total Halaman | 6 tab game + 1 redirect |

---

## 2. Struktur Proyek

```
src/
├── app/                          # Next.js App Router
│   ├── layout.js                 # RootLayout (fonts, PWA, GameProvider, Toaster)
│   ├── page.js                   # Redirect ke /pertanian
│   ├── pertanian/page.js         # TabFarm
│   ├── peternakan/page.js        # TabAnimal
│   ├── tambang/page.js           # TabMine
│   ├── kota/page.js              # TabTown
│   ├── restoran/page.js          # TabRestaurant
│   └── profil/page.js            # TabProfil
├── components/
│   ├── game/                     # Sub-komponen spesifik
│   │   ├── PlotGrid.jsx          # 30 plot + drag-swap
│   │   ├── SeedShop.jsx          # Beli benih
│   │   ├── MarketBoard.jsx       # Harga pasar harian
│   │   ├── OrderBoard.jsx        # Order fulfillment
│   │   ├── TownPlaza.jsx         # NPC, wheel, bangunan
│   │   ├── TownShop.jsx          # Toko kota
│   │   └── QuestPanel.jsx        # Quest harian
│   ├── ui/                       # Komponen UI umum
│   │   ├── TabPage.jsx, SideDock.jsx, GameAreaHeader.jsx
│   │   ├── Button.jsx, ToolChip.jsx, QtyControl.jsx
│   │   ├── AnimatedCounter.jsx, FloatingText.jsx
│   │   ├── CraftingWidget.jsx, ShopItemCard.jsx
│   │   ├── AnimalIcon.jsx, CropIcon.jsx
│   │   └── TutorialOverlay.jsx
│   ├── TabFarm.jsx               # Halaman pertanian
│   ├── TabAnimal.jsx             # Halaman peternakan
│   ├── TabMine.jsx               # Halaman tambang
│   ├── TabTown.jsx               # Halaman kota
│   ├── TabRestaurant.jsx         # Halaman restoran
│   ├── TabProfil.jsx             # Halaman profil
│   ├── GameSidebar.jsx           # Sidebar + HUD (448 baris)
│   ├── ClientLayout.jsx          # App shell + offline calc + dev keybinds
│   ├── Modals.jsx                # Modal confirm/prompt/NPC gift
│   ├── OfflineProgressModal.jsx  # Laporan offline
│   └── ClearServiceWorker.jsx    # PWA cleanup
├── lib/
│   ├── store.js                  # Zustand store entry (160 baris, panggil 9 slices)
│   ├── store-provider.js         # GameProvider + game loop (1s tick)
│   ├── store/
│   │   ├── initialState.js       # State default (142 baris)
│   │   ├── utils.js              # Helper murni (201 baris)
│   │   ├── migrations.js         # merge/persist + legacy migration (86 baris)
│   │   └── slices/
│   │       ├── createSystemSlice.js      # ~594 baris — modal, settings, auto worker, season/weather, tick, offline
│   │       ├── createPlayerSlice.js      # ~668 baris — XP, energy, inventory, crafting, orders, quests, combo, tutorial
│   │       ├── createFarmingSlice.js     # ~209 baris — plant, water, harvest, swap
│   │       ├── createMiningSlice.js      # ~282 baris — mine, tools, sync
│   │       ├── createRanchingSlice.js    # ~152 baris — buy, feed, collect, sell, swap
│   │       ├── createEconomySlice.js     # ~122 baris — buy/sell, coins
│   │       ├── createTownSlice.js        # ~118 baris — market, buildings, NPC gifts
│   │       ├── createCustomerSlice.js    # ~161 baris — spawn, serve, tick
│   │       └── createAchievementSlice.js # ~97 baris — achievements, stats, session
│   ├── data/
│   │   ├── crops.js              # 13 crops + seeds
│   │   ├── shop.js               # Animals (6), bait (4), mining tools (6), buildings (2), decorations (3), feed
│   │   ├── fishes.js             # 5 ikan dengan weight chance
│   │   ├── minerals.js           # 5 mineral dengan chance
│   │   ├── recipes.js            # 18 resep (4 tier) + 9 order templates
│   │   ├── achievements.js       # 21 achievements (7 kategori)
│   │   ├── customers.js          # 9 tipe pelanggan
│   │   ├── npcs.js               # 5 NPC
│   │   └── item-helpers.js       # getItemEmoji, getItemSellPrice, getItemSource, dll
│   ├── hooks/
│   │   ├── useFishingMinigame.js  # State machine fishing (idle→waiting→bite→minigame→result)
│   │   └── useSound.ts           # SFX + Music hooks (AudioManager)
│   ├── constants.js              # Semua balance numbers (82 baris)
│   ├── nav.js                    # NAV_TABS (6) + SEASON_META (4)
│   ├── utils.js                  # cn(), formatNumber, formatCurrency, duration, storage, isMobile
│   ├── logger.js                 # Logger configurable (NEXT_PUBLIC_LOG_LEVEL)
│   └── audio.ts                  # AudioManager class (Web Audio API synth + Howler.js)
├── styles/
│   └── globals.css               # Tailwind base + custom (glassmorphism, grid, market-board)
```

---

## 3. State Management — Zustand Store

### Arsitektur

```
store.js
  ├── initialState
  ├── createFarmingSlice      (set, get) → { plant, harvest, water, ... }
  ├── createMiningSlice       (set, get) → { mineNode, useMiningTool, ... }
  ├── createRanchingSlice     (set, get) → { buyAnimal, feed, collect, sell, ... }
  ├── createEconomySlice      (set, get) → { addCoins, spendCoins, sellItem, ... }
  ├── createPlayerSlice       (set, get) → { addXP, addItem, crafting, orders, quests, ... }
  ├── createTownSlice         (set, get) → { updateMarket, buyBuilding, giveGift, ... }
  ├── createSystemSlice       (set, get) → { tick, auto workers, season, weather, offline, ... }
  ├── createCustomerSlice     (set, get) → { spawnCustomer, serveCustomer, tickCustomers, ... }
  ├── createAchievementSlice  (set, get) → { checkAchievements, incrementStat, ... }
  ├── resetGame
  └── dev                     { addCoins, addEnergy, setLevel, ... }
```

### Persist (zustand/middleware)

- **Key:** `farm-game-storage`
- **skipHydration:** true
- **partialize:** 48 fields (coins, level, plots, inventory, animals, dll — lihat `migrations.js`)
- **merge:** `mergeSavedState` (fungsi terextrak di `migrations.js`)

Menu:
- `migrations.js` menangani: normalisasi plot, mining nodes, workers, hewan (chicken→ayam), default stats/achievements/NPC, legacy worker migration (`farmTycoonSave` from localStorage)
- `onRehydrateStorage`: log error + NaN guard (coins→100)

### Selector Hooks

`useCoins`, `useLevel`, `useXP`, `useDay`, `useStreak`, `usePlots`, `useInventory`, `useSettings`, `useSeason`, `useWeather`, `useMining`, `useNpcs`, `useActiveEvent`

---

## 4. Sistem Game — Detail per Area

### 4.1 Farming (createFarmingSlice)

| Fungsi | Deskripsi |
|---|---|
| `plant(plotId)` | Set plot ke 'growing', simpan `plantedAt` |
| `plantSeed(plotId, seedId)` | Validasi musim (kecuali greenhouse), kurangi seed, 1 energy, auto-fertilizer (-15%) |
| `waterPlot(plotId)` | Kurangi 18% sisa waktu |
| `harvest(plotId)` | +1 inventory, +10 XP, combo, stat totalHarvested |
| `swapPlots(id1, id2)` | Drag-swap |
| `syncPlots()` | Cek plot yang sudah siap panen |

### 4.2 Peternakan (createRanchingSlice)

| Fungsi | Deskripsi |
|---|---|
| `buyAnimal(type, price, time)` | Kurangi koin, tambah animal dengan `fed: false`, stat |
| `feedAnimal(id)` | Butuh hasil panen (jagung/gandum/wortel), set `fed: true`, +25% bonus chance |
| `collectAnimal(id, product)` | Wajib fed dulu. 15% fertilizer drop, bonus drop jika fed. +8 XP (+3 jika fed) |
| `sellAnimal(id)` | Jual 50% harga beli (fungsi baru, ganti setState langsung) |
| `swapAnimals(id1, id2)` | Drag-swap |

### 4.3 Tambang (createMiningSlice)

| Fungsi | Deskripsi |
|---|---|
| `mineNode(id)` | 2 energy, roll mineral (80% batu, 20% worm). XP, combo, stat |
| `useMiningTool(toolId)` | pickaxe_besi (lvl2), pickaxe_emas (lvl3), senter (5min -50% regen), bom_besar (all ready nodes), bom_kecil (1 node), tali (restore regen) |
| `syncMiningNodes()` | Regen cooldown + auto miner |

**Mineral weights:** batu 80%, tembaga 50%, besi 30%, emas 15%, berlian 5%

### 4.4 Memancing (useFishingMinigame + store functions)

| State Machine | Keterangan |
|---|---|
| `idle` → `waiting` | Pakai umpan (opsional), tunggu 2-5 detik |
| `waiting` → `bite` | Ikan menggigit, window 1.5 detik untuk klik |
| `bite` → `minigame` | Timing bar 0-100, threshold 40 |
| `minigame` → `result` | Berhasil → +item +15 XP +quest + stat totalFished |

**Umpan:** biasa (15), premium (60, -45% wait, +12% rare), emas (150, -60% wait, +25% rare), cacing (craft 2 cacing)

**Ikan:** mas (40%, 80), lele (30%, 100), badut (15%, 200), cumi (10%, 350), gurita (5%, 2000)

### 4.5 Restoran & Crafting (createPlayerSlice)

| Fungsi | Deskripsi |
|---|---|
| `startCrafting(recipeId)` | Validasi bahan, max 3 queue per tipe, progress per tick |
| `collectCraftedItem(recipeId)` | Ambil hasil masakan jadi |
| `processCraftingQueue()` | Kurangi timer, selesaikan craft |
| `removeCraftingQueue(recipeId)` | Cancel + refund |
| `eatFood(recipeId)` | Makan → restore energy |

**18 Resep (4 tier):**
- Tier 1 (lvl 1, 8 resep): roti, jus, sup, keju, dll — 100-200s, 150-300 coins
- Tier 2 (lvl 5, 5 resep): pancake, omelet, steak, sushi, wine — 200-400s, 350-500 coins
- Tier 3 (lvl 10, 3 resep): cake, ice cream, sushi_emas — 350-500s, 600-800 coins
- Tier 4 (lvl 15, 2 resep): feast, kue_pesta — 600s, 1000-1200 coins

### 4.6 Kota & NPC (createTownSlice + createCustomerSlice)

| Fungsi | Deskripsi |
|---|---|
| `updateMarket()` | Randomize harga jual +-30% |
| `buyBuilding(id)` | Silo (20 batu+10 besi) / Greenhouse (30 batu+15 tembaga+5 emas) |
| `buyDecoration(id)` | Bunga (300), Air Mancur (800), Patung (1500) |
| `giveGift(npcId, itemId)` | Liked 50pts, other 10pts; level up di level*100 pts |
| `spawnCustomer()` | 10% chance/tick × customerRate |
| `serveCustomer(tableId, recipeId)` | Tip berdasar patience% + harga resep |
| `tickCustomers()` | Kurangi patience tiap tick, remove jika habis |
| `upgradeTables()` | Tambah meja (max 9) |

### 4.7 Quest Harian (createPlayerSlice)

- 3 quest random per hari
- 9 tipe quest: harvest, collect, mine, fish, craft, serve, gift, fertilizer, feed
- **Cross-chain (lvl 5+):** gandum→roti, wortel→sup, susu→keju
- **Lvl 10+:** farm-to-table, tambang→sushi_emas
- Hadiah: 100-300 coins + 30-50 XP

### 4.8 Achievement (createAchievementSlice)

- 21 achievements, 7 kategori (ladang/ternak/tambang/pancing/restoran/kota/special)
- **Stat-based:** totalHarvested≥1000, totalMined≥500, dll
- **Custom:** pickaxeGold, allRounder (5 area 1 session), supplyChain (fertilizer + cook)

### 4.9 Sistem Tick & Offline (createSystemSlice)

**Game Loop (1000ms):**
```
processGameTick:
  ├── advanceSeasonTick (180 tick/hari)
  ├── changeWeather (300 tick)
  ├── syncPlots (growing→ready)
  ├── syncMiningNodes (regen + auto miner)
  ├── runAutoWorkers (farmer/rancher/fisher/chef)
  ├── processCraftingQueue
  ├── checkOrders (expired)
  ├── tickCustomers (patience)
  ├── spawnCustomer (10%)
  └── booster expiry (coin/growth)
```

**Offline Progress:**
- Threshold: 60 detik
- Simulasi auto workers: farmer (panen+tanam ulang), rancher (kolek+feed), fisher (10% catch rate), chef (craft queue)
- Miner: roll mineral tiap 120 detik dengan `rollMineralType()` (bonus pickaxe/lantern/event)
- `offlineReport`: total koin dari harga jual item terkumpul

### 4.10 Auto Workers

| Worker | Cost | Fungsi |
|---|---|---|
| Farmer (Budi) | 5000 | Panen + tanam ulang plot siap |
| Rancher (Siti) | 500 | Kolek + feed semua hewan |
| Fisher (Mamat) | 12000 | 10% chance/tick menangkap ikan |
| Miner (Joko) | 15000 | Mine nodes siap setiap 120 detik |
| Chef (Rina) | 25000 | Auto-craft dari queue |

---

## 5. Sistem Ekonomi

### Harga Jual per Item

| Kategori | Formula |
|---|---|
| Benih | Tidak bisa dijual |
| Tanaman | `price * 1.5` (+15% jika silo) |
| Produk Hewan | `price * 0.5` |
| Ikan | `priceNormal` |
| Mineral | `price` |
| Masakan | `recipe.price` |
| Umpan/Mining Tools | Tidak bisa dijual |

### Booster
- **Coin Booster:** 100 coins → 2× koin selama 30 menit
- **Growth Booster:** 50 coins → 1.5× growth selama 30 menit

### Combo System
- Window: 2.5 detik antar aksi
- Multiplier: +0.25 per aksi, max 4×
- Threshold 3: bonus koin (floor(4 × mult))

---

## 6. Persist & Migration (migrations.js)

**Merge flow:**
1. Shallow merge persisted → current
2. `normalizePlots()` — legacy 'state' → 'status', pad 30
3. Mining defaults (pickaxeLevel, lanternUntil)
4. Worker defaults + legacy migration (`farmTycoonSave`)
5. Auto-enable worker toggles (jika worker owned)
6. Normalize animals (readyToCollect→producing, chicken→ayam, etc.)
7. Default achievements/stats/session/weather/NPC keys
8. Pad mining nodes ke 30
9. Default buildings/tables

---

## 7. Data Layer — Semua Item

| Tipe | Jumlah | Sumber Data |
|---|---|---|
| Tanaman/Benih | 13 | crops.js |
| Hewan | 6 | shop.js |
| Ikan | 5 | fishes.js |
| Mineral | 5 | minerals.js |
| Resep | 18 | recipes.js |
| Order Template | 9 | recipes.js |
| Umpan | 4 | shop.js |
| Mining Tools | 6 | shop.js |
| Bangunan | 2 | shop.js |
| Dekorasi | 3 | shop.js |
| Achievement | 21 | achievements.js |
| Pelanggan | 9 | customers.js |
| NPC | 5 | npcs.js |
| Bahan Khusus | 2 (cacing, pupuk_kandang) | shop.js |

---

## 8. Constants — Balance Numbers

| Konstanta | Nilai |
|---|---|
| GRID.PLOTS | 30 |
| GRID.MINING_NODES | 30 |
| GRID.ANIMAL_SLOTS | 36 |
| LEVEL.XP_PER_LEVEL | 100 |
| LEVEL.MAX_ENERGY | 200 (+10/level) |
| CHANCES.WORM_DROP | 20% |
| CHANCES.FERTILIZER_DROP | 15% |
| CHANCES.FEED_BONUS | 25% |
| TIMERS.FARM_TICK_RATE | 1000ms |
| OFFLINE.MIN_SECONDS | 60 |
| COMBO.WINDOW_MS | 2500 |
| CRAFTING.MAX_QUEUE_PER_TYPE | 3 |
| MINING.REGEN_MS[lvl1] | 120s |
| MINING.LANTERN_DURATION_MS | 300s |
| SYSTEM.SEASON_TICKS_PER_DAY | 180 |
| SYSTEM.RANDOM_EVENT_CHANCE | 30% |

---

## 9. Komponen UI — Mapping

| Halaman | Tab Component | SideDock Items | Grid/List |
|---|---|---|---|
| /pertanian | TabFarm | SeedShop, MarketBoard, QuestPanel | 30 plot |
| /peternakan | TabAnimal | Animal Shop, Info | 36 hewan |
| /tambang | TabMine | Mining Shop, Tools | 30 node |
| /kota | TabTown | TownShop | NPC, wheel, buildings |
| /restoran | TabRestoran | Recipe filter, MenuBoard | 9 meja |
| /profil | TabProfil | Inventory, Achievements, Settings | — |

---

## 10. Refactoring yang Sudah Dilakukan

### #1 — Ekstrak merge ke migrations.js
- `store.js` turun ≈300 → 160 baris
- Semua logika migrasi di `store/migrations.js:1-86`
- Memisahkan normalisasi per domain (plots, mining, workers, animals, defaults)

### #2 — Hardcoded emoji → Single Source
- `getAnimalEmoji()` di item-helpers.js:73 tinggal 1 baris
- Ambil dari `SHOP_ANIMALS[n].emoji` (field baru di shop.js)

### #3 — Direct useGameStore.setState → Slice Functions
- `useFishingMinigame.js`: `get().incrementStat('totalFished')` dan `'totalWormBaitUsed'`
- `TabAnimal.jsx`: `get().sellAnimal(animal.id)`
- Fungsi baru: `incrementStat(key, amount)` di createAchievementSlice, `sellAnimal(id)` di createRanchingSlice

---

## 11. Potential Issues

| Sev | Issue | Saran |
|---|---|---|
| Medium | `createSystemSlice.js` ~594 baris — terlalu besar | Split: createModalSlice, createWeatherSlice, createWorkerSlice, createTickSlice |
| Medium | `createPlayerSlice.js` ~668 baris — terlalu besar | Split: createCraftingSlice, createQuestSlice, createInventorySlice |
| Low | Store spread merge 9 slices → potensi naming collision | Prefix functions atau namespaced sub-stores |
| Low | Beberapa state transient dipersist (selectedSeed, selectedBait, dll) | Review partialize list |
| Info | Game tick 1000ms jalankan 9+ aksi sinkron — re-render semua subscriber | Batch atau requestAnimationFrame |
| Low | Mayoritas file JS, TypeScript minimal | Migrasi bertahap ke TypeScript |
| Info | Inventory flat map, string ID cross-referenced — risk typo | Enum/file konstanta untuk semua item ID |
| Low | Tidak ada unit test (vitest terinstall tapi 0 test) | Test untuk pure functions (rollMineralType, normalizePlot) |
| Info | `migrateLegacyWorkers` baca `farmTycoonSave` dari localStorage | Migration version flag, cleanup di rilis depan |
| Info | Balance worker cost: Rancher 500 → Chef 25000 (steep) | Review intentional design |


# Analisis Kode Final — Farm Tycoon

> **Status:** ✅ Build lolos (0 error, 2.4s)
> **Versi Kode:** Post-P0/P1/P2 fixes + Refactoring #1 #2 #3

---

## 1. Ringkasan Proyek

| Aspek | Detail |
|---|---|
| Framework | Next.js 16.2.10 (Turbopack) |
| State Management | Zustand v4 + persist middleware |
| Styling | Tailwind CSS v3 |
| Animasi | Framer Motion v11 |
| Audio | Howler.js + Web Audio API (synthesized SFX) |
| PWA | @ducanh2912/next-pwa |
| Bahasa | JavaScript (JSX) + TypeScript minimal (audio.ts) |
| Total Halaman | 6 tab game + 1 redirect |

---

## 2. Struktur Proyek

```
src/
├── app/                          # Next.js App Router
│   ├── layout.js                 # RootLayout (fonts, PWA, GameProvider, Toaster)
│   ├── page.js                   # Redirect ke /pertanian
│   ├── pertanian/page.js         # TabFarm
│   ├── peternakan/page.js        # TabAnimal
│   ├── tambang/page.js           # TabMine
│   ├── kota/page.js              # TabTown
│   ├── restoran/page.js          # TabRestaurant
│   └── profil/page.js            # TabProfil
├── components/
│   ├── game/                     # Sub-komponen spesifik
│   │   ├── PlotGrid.jsx          # 30 plot + drag-swap
│   │   ├── SeedShop.jsx          # Beli benih
│   │   ├── MarketBoard.jsx       # Harga pasar harian
│   │   ├── OrderBoard.jsx        # Order fulfillment
│   │   ├── TownPlaza.jsx         # NPC, wheel, bangunan
│   │   ├── TownShop.jsx          # Toko kota
│   │   └── QuestPanel.jsx        # Quest harian
│   ├── ui/                       # Komponen UI umum
│   │   ├── TabPage.jsx, SideDock.jsx, GameAreaHeader.jsx
│   │   ├── Button.jsx, ToolChip.jsx, QtyControl.jsx
│   │   ├── AnimatedCounter.jsx, FloatingText.jsx
│   │   ├── CraftingWidget.jsx, ShopItemCard.jsx
│   │   ├── AnimalIcon.jsx, CropIcon.jsx
│   │   └── TutorialOverlay.jsx
│   ├── TabFarm.jsx               # Halaman pertanian
│   ├── TabAnimal.jsx             # Halaman peternakan
│   ├── TabMine.jsx               # Halaman tambang
│   ├── TabTown.jsx               # Halaman kota
│   ├── TabRestaurant.jsx         # Halaman restoran
│   ├── TabProfil.jsx             # Halaman profil
│   ├── GameSidebar.jsx           # Sidebar + HUD (448 baris)
│   ├── ClientLayout.jsx          # App shell + offline calc + dev keybinds
│   ├── Modals.jsx                # Modal confirm/prompt/NPC gift
│   ├── OfflineProgressModal.jsx  # Laporan offline
│   └── ClearServiceWorker.jsx    # PWA cleanup
├── lib/
│   ├── store.js                  # Zustand store entry (160 baris, panggil 9 slices)
│   ├── store-provider.js         # GameProvider + game loop (1s tick)
│   ├── store/
│   │   ├── initialState.js       # State default (142 baris)
│   │   ├── utils.js              # Helper murni (201 baris)
│   │   ├── migrations.js         # merge/persist + legacy migration (86 baris)
│   │   └── slices/
│   │       ├── createSystemSlice.js      # ~594 baris — modal, settings, auto worker, season/weather, tick, offline
│   │       ├── createPlayerSlice.js      # ~668 baris — XP, energy, inventory, crafting, orders, quests, combo, tutorial
│   │       ├── createFarmingSlice.js     # ~209 baris — plant, water, harvest, swap
│   │       ├── createMiningSlice.js      # ~282 baris — mine, tools, sync
│   │       ├── createRanchingSlice.js    # ~152 baris — buy, feed, collect, sell, swap
│   │       ├── createEconomySlice.js     # ~122 baris — buy/sell, coins
│   │       ├── createTownSlice.js        # ~118 baris — market, buildings, NPC gifts
│   │       ├── createCustomerSlice.js    # ~161 baris — spawn, serve, tick
│   │       └── createAchievementSlice.js # ~97 baris — achievements, stats, session
│   ├── data/
│   │   ├── crops.js              # 13 crops + seeds
│   │   ├── shop.js               # Animals (6), bait (4), mining tools (6), buildings (2), decorations (3), feed
│   │   ├── fishes.js             # 5 ikan dengan weight chance
│   │   ├── minerals.js           # 5 mineral dengan chance
│   │   ├── recipes.js            # 18 resep (4 tier) + 9 order templates
│   │   ├── achievements.js       # 21 achievements (7 kategori)
│   │   ├── customers.js          # 9 tipe pelanggan
│   │   ├── npcs.js               # 5 NPC
│   │   └── item-helpers.js       # getItemEmoji, getItemSellPrice, getItemSource, dll
│   ├── hooks/
│   │   ├── useFishingMinigame.js  # State machine fishing (idle→waiting→bite→minigame→result)
│   │   └── useSound.ts           # SFX + Music hooks (AudioManager)
│   ├── constants.js              # Semua balance numbers (82 baris)
│   ├── nav.js                    # NAV_TABS (6) + SEASON_META (4)
│   ├── utils.js                  # cn(), formatNumber, formatCurrency, duration, storage, isMobile
│   ├── logger.js                 # Logger configurable (NEXT_PUBLIC_LOG_LEVEL)
│   └── audio.ts                  # AudioManager class (Web Audio API synth + Howler.js)
├── styles/
│   └── globals.css               # Tailwind base + custom (glassmorphism, grid, market-board)
```

---

## 3. State Management — Zustand Store

### Arsitektur

```
store.js
  ├── initialState
  ├── createFarmingSlice      (set, get) → { plant, harvest, water, ... }
  ├── createMiningSlice       (set, get) → { mineNode, useMiningTool, ... }
  ├── createRanchingSlice     (set, get) → { buyAnimal, feed, collect, sell, ... }
  ├── createEconomySlice      (set, get) → { addCoins, spendCoins, sellItem, ... }
  ├── createPlayerSlice       (set, get) → { addXP, addItem, crafting, orders, quests, ... }
  ├── createTownSlice         (set, get) → { updateMarket, buyBuilding, giveGift, ... }
  ├── createSystemSlice       (set, get) → { tick, auto workers, season, weather, offline, ... }
  ├── createCustomerSlice     (set, get) → { spawnCustomer, serveCustomer, tickCustomers, ... }
  ├── createAchievementSlice  (set, get) → { checkAchievements, incrementStat, ... }
  ├── resetGame
  └── dev                     { addCoins, addEnergy, setLevel, ... }
```

### Persist (zustand/middleware)

- **Key:** `farm-game-storage`
- **skipHydration:** true
- **partialize:** 48 fields (coins, level, plots, inventory, animals, dll — lihat `migrations.js`)
- **merge:** `mergeSavedState` (fungsi terextrak di `migrations.js`)

Menu:
- `migrations.js` menangani: normalisasi plot, mining nodes, workers, hewan (chicken→ayam), default stats/achievements/NPC, legacy worker migration (`farmTycoonSave` from localStorage)
- `onRehydrateStorage`: log error + NaN guard (coins→100)

### Selector Hooks

`useCoins`, `useLevel`, `useXP`, `useDay`, `useStreak`, `usePlots`, `useInventory`, `useSettings`, `useSeason`, `useWeather`, `useMining`, `useNpcs`, `useActiveEvent`

---

## 4. Sistem Game — Detail per Area

### 4.1 Farming (createFarmingSlice)

| Fungsi | Deskripsi |
|---|---|
| `plant(plotId)` | Set plot ke 'growing', simpan `plantedAt` |
| `plantSeed(plotId, seedId)` | Validasi musim (kecuali greenhouse), kurangi seed, 1 energy, auto-fertilizer (-15%) |
| `waterPlot(plotId)` | Kurangi 18% sisa waktu |
| `harvest(plotId)` | +1 inventory, +10 XP, combo, stat totalHarvested |
| `swapPlots(id1, id2)` | Drag-swap |
| `syncPlots()` | Cek plot yang sudah siap panen |

### 4.2 Peternakan (createRanchingSlice)

| Fungsi | Deskripsi |
|---|---|
| `buyAnimal(type, price, time)` | Kurangi koin, tambah animal dengan `fed: false`, stat |
| `feedAnimal(id)` | Butuh hasil panen (jagung/gandum/wortel), set `fed: true`, +25% bonus chance |
| `collectAnimal(id, product)` | Wajib fed dulu. 15% fertilizer drop, bonus drop jika fed. +8 XP (+3 jika fed) |
| `sellAnimal(id)` | Jual 50% harga beli (fungsi baru, ganti setState langsung) |
| `swapAnimals(id1, id2)` | Drag-swap |

### 4.3 Tambang (createMiningSlice)

| Fungsi | Deskripsi |
|---|---|
| `mineNode(id)` | 2 energy, roll mineral (80% batu, 20% worm). XP, combo, stat |
| `useMiningTool(toolId)` | pickaxe_besi (lvl2), pickaxe_emas (lvl3), senter (5min -50% regen), bom_besar (all ready nodes), bom_kecil (1 node), tali (restore regen) |
| `syncMiningNodes()` | Regen cooldown + auto miner |

**Mineral weights:** batu 80%, tembaga 50%, besi 30%, emas 15%, berlian 5%

### 4.4 Memancing (useFishingMinigame + store functions)

| State Machine | Keterangan |
|---|---|
| `idle` → `waiting` | Pakai umpan (opsional), tunggu 2-5 detik |
| `waiting` → `bite` | Ikan menggigit, window 1.5 detik untuk klik |
| `bite` → `minigame` | Timing bar 0-100, threshold 40 |
| `minigame` → `result` | Berhasil → +item +15 XP +quest + stat totalFished |

**Umpan:** biasa (15), premium (60, -45% wait, +12% rare), emas (150, -60% wait, +25% rare), cacing (craft 2 cacing)

**Ikan:** mas (40%, 80), lele (30%, 100), badut (15%, 200), cumi (10%, 350), gurita (5%, 2000)

### 4.5 Restoran & Crafting (createPlayerSlice)

| Fungsi | Deskripsi |
|---|---|
| `startCrafting(recipeId)` | Validasi bahan, max 3 queue per tipe, progress per tick |
| `collectCraftedItem(recipeId)` | Ambil hasil masakan jadi |
| `processCraftingQueue()` | Kurangi timer, selesaikan craft |
| `removeCraftingQueue(recipeId)` | Cancel + refund |
| `eatFood(recipeId)` | Makan → restore energy |

**18 Resep (4 tier):**
- Tier 1 (lvl 1, 8 resep): roti, jus, sup, keju, dll — 100-200s, 150-300 coins
- Tier 2 (lvl 5, 5 resep): pancake, omelet, steak, sushi, wine — 200-400s, 350-500 coins
- Tier 3 (lvl 10, 3 resep): cake, ice cream, sushi_emas — 350-500s, 600-800 coins
- Tier 4 (lvl 15, 2 resep): feast, kue_pesta — 600s, 1000-1200 coins

### 4.6 Kota & NPC (createTownSlice + createCustomerSlice)

| Fungsi | Deskripsi |
|---|---|
| `updateMarket()` | Randomize harga jual +-30% |
| `buyBuilding(id)` | Silo (20 batu+10 besi) / Greenhouse (30 batu+15 tembaga+5 emas) |
| `buyDecoration(id)` | Bunga (300), Air Mancur (800), Patung (1500) |
| `giveGift(npcId, itemId)` | Liked 50pts, other 10pts; level up di level*100 pts |
| `spawnCustomer()` | 10% chance/tick × customerRate |
| `serveCustomer(tableId, recipeId)` | Tip berdasar patience% + harga resep |
| `tickCustomers()` | Kurangi patience tiap tick, remove jika habis |
| `upgradeTables()` | Tambah meja (max 9) |

### 4.7 Quest Harian (createPlayerSlice)

- 3 quest random per hari
- 9 tipe quest: harvest, collect, mine, fish, craft, serve, gift, fertilizer, feed
- **Cross-chain (lvl 5+):** gandum→roti, wortel→sup, susu→keju
- **Lvl 10+:** farm-to-table, tambang→sushi_emas
- Hadiah: 100-300 coins + 30-50 XP

### 4.8 Achievement (createAchievementSlice)

- 21 achievements, 7 kategori (ladang/ternak/tambang/pancing/restoran/kota/special)
- **Stat-based:** totalHarvested≥1000, totalMined≥500, dll
- **Custom:** pickaxeGold, allRounder (5 area 1 session), supplyChain (fertilizer + cook)

### 4.9 Sistem Tick & Offline (createSystemSlice)

**Game Loop (1000ms):**
```
processGameTick:
  ├── advanceSeasonTick (180 tick/hari)
  ├── changeWeather (300 tick)
  ├── syncPlots (growing→ready)
  ├── syncMiningNodes (regen + auto miner)
  ├── runAutoWorkers (farmer/rancher/fisher/chef)
  ├── processCraftingQueue
  ├── checkOrders (expired)
  ├── tickCustomers (patience)
  ├── spawnCustomer (10%)
  └── booster expiry (coin/growth)
```

**Offline Progress:**
- Threshold: 60 detik
- Simulasi auto workers: farmer (panen+tanam ulang), rancher (kolek+feed), fisher (10% catch rate), chef (craft queue)
- Miner: roll mineral tiap 120 detik dengan `rollMineralType()` (bonus pickaxe/lantern/event)
- `offlineReport`: total koin dari harga jual item terkumpul

### 4.10 Auto Workers

| Worker | Cost | Fungsi |
|---|---|---|
| Farmer (Budi) | 5000 | Panen + tanam ulang plot siap |
| Rancher (Siti) | 500 | Kolek + feed semua hewan |
| Fisher (Mamat) | 12000 | 10% chance/tick menangkap ikan |
| Miner (Joko) | 15000 | Mine nodes siap setiap 120 detik |
| Chef (Rina) | 25000 | Auto-craft dari queue |

---

## 5. Sistem Ekonomi

### Harga Jual per Item

| Kategori | Formula |
|---|---|
| Benih | Tidak bisa dijual |
| Tanaman | `price * 1.5` (+15% jika silo) |
| Produk Hewan | `price * 0.5` |
| Ikan | `priceNormal` |
| Mineral | `price` |
| Masakan | `recipe.price` |
| Umpan/Mining Tools | Tidak bisa dijual |

### Booster
- **Coin Booster:** 100 coins → 2× koin selama 30 menit
- **Growth Booster:** 50 coins → 1.5× growth selama 30 menit

### Combo System
- Window: 2.5 detik antar aksi
- Multiplier: +0.25 per aksi, max 4×
- Threshold 3: bonus koin (floor(4 × mult))

---

## 6. Persist & Migration (migrations.js)

**Merge flow:**
1. Shallow merge persisted → current
2. `normalizePlots()` — legacy 'state' → 'status', pad 30
3. Mining defaults (pickaxeLevel, lanternUntil)
4. Worker defaults + legacy migration (`farmTycoonSave`)
5. Auto-enable worker toggles (jika worker owned)
6. Normalize animals (readyToCollect→producing, chicken→ayam, etc.)
7. Default achievements/stats/session/weather/NPC keys
8. Pad mining nodes ke 30
9. Default buildings/tables

---

## 7. Data Layer — Semua Item

| Tipe | Jumlah | Sumber Data |
|---|---|---|
| Tanaman/Benih | 13 | crops.js |
| Hewan | 6 | shop.js |
| Ikan | 5 | fishes.js |
| Mineral | 5 | minerals.js |
| Resep | 18 | recipes.js |
| Order Template | 9 | recipes.js |
| Umpan | 4 | shop.js |
| Mining Tools | 6 | shop.js |
| Bangunan | 2 | shop.js |
| Dekorasi | 3 | shop.js |
| Achievement | 21 | achievements.js |
| Pelanggan | 9 | customers.js |
| NPC | 5 | npcs.js |
| Bahan Khusus | 2 (cacing, pupuk_kandang) | shop.js |

---

## 8. Constants — Balance Numbers

| Konstanta | Nilai |
|---|---|
| GRID.PLOTS | 30 |
| GRID.MINING_NODES | 30 |
| GRID.ANIMAL_SLOTS | 36 |
| LEVEL.XP_PER_LEVEL | 100 |
| LEVEL.MAX_ENERGY | 200 (+10/level) |
| CHANCES.WORM_DROP | 20% |
| CHANCES.FERTILIZER_DROP | 15% |
| CHANCES.FEED_BONUS | 25% |
| TIMERS.FARM_TICK_RATE | 1000ms |
| OFFLINE.MIN_SECONDS | 60 |
| COMBO.WINDOW_MS | 2500 |
| CRAFTING.MAX_QUEUE_PER_TYPE | 3 |
| MINING.REGEN_MS[lvl1] | 120s |
| MINING.LANTERN_DURATION_MS | 300s |
| SYSTEM.SEASON_TICKS_PER_DAY | 180 |
| SYSTEM.RANDOM_EVENT_CHANCE | 30% |

---

## 9. Komponen UI — Mapping

| Halaman | Tab Component | SideDock Items | Grid/List |
|---|---|---|---|
| /pertanian | TabFarm | SeedShop, MarketBoard, QuestPanel | 30 plot |
| /peternakan | TabAnimal | Animal Shop, Info | 36 hewan |
| /tambang | TabMine | Mining Shop, Tools | 30 node |
| /kota | TabTown | TownShop | NPC, wheel, buildings |
| /restoran | TabRestoran | Recipe filter, MenuBoard | 9 meja |
| /profil | TabProfil | Inventory, Achievements, Settings | — |

---

## 10. Refactoring yang Sudah Dilakukan

### #1 — Ekstrak merge ke migrations.js
- `store.js` turun ≈300 → 160 baris
- Semua logika migrasi di `store/migrations.js:1-86`
- Memisahkan normalisasi per domain (plots, mining, workers, animals, defaults)

### #2 — Hardcoded emoji → Single Source
- `getAnimalEmoji()` di item-helpers.js:73 tinggal 1 baris
- Ambil dari `SHOP_ANIMALS[n].emoji` (field baru di shop.js)

### #3 — Direct useGameStore.setState → Slice Functions
- `useFishingMinigame.js`: `get().incrementStat('totalFished')` dan `'totalWormBaitUsed'`
- `TabAnimal.jsx`: `get().sellAnimal(animal.id)`
- Fungsi baru: `incrementStat(key, amount)` di createAchievementSlice, `sellAnimal(id)` di createRanchingSlice

---

## 11. Isu & Perbaikan Terbaru (Agustus 2026)

### ✅ Resolved Issues (Telah Diperbaiki)

| Bug/Isu | Status & Solusi |
|---|---|
| **Fishing RNG Selalu Ikan Mas** | **FIXED.** Fungsi `rollFish` kini membaca parameter `baseChance` (bukan `chance`), sehingga *rate* penangkapan ikan-ikan langka seperti Gurita Emas sudah berjalan sesuai dengan mekanisme probabilitas. |
| **Size Tier Ikan Tidak Berfungsi** | **FIXED.** Fungsi `rollFishSize` kini dipanggil saat ikan berhasil ditangkap. Kualitas ikan (Kecil, Biasa, Besar, Trophy) disimpan dan dievaluasi saat penjualan. |
| **Alat Tambang Tidak Tersimpan** | **FIXED.** Variabel `selectedMiningTool` telah dimasukkan ke dalam konfigurasi `partializeState` di file `migrations.ts`. Alat yang dipilih pemain tidak akan ter-*reset* saat me-refresh *browser*. |
| **Celah Keamanan Objek Dev** | **FIXED.** Objek `dev` (berisi *cheat*) pada `store.ts` telah dibatasi khusus untuk mode *development* (`NODE_ENV !== "production"`). |

### 🔍 Potential Issues & Rekomendasi (Outstanding)

| Sev | Issue | Rekomendasi Selanjutnya |
|---|---|---|
| Medium | `createSystemSlice.js` dan `createPlayerSlice.js` terlalu besar (God Objects) | Refactor/Split: Pisahkan menjadi *slice* yang lebih terfokus (misal: `createQuestSlice`, `createInventorySlice`). |
| Medium | Worker RPG System belum beroperasi (XP, Stamina, Level) | Rancang mekanisme Worker Leveling. Tentukan dampak level terhadap kecepatan kerja dan cara mengembalikan stamina. |
| Low | Banyak *state* sementara (transient) yang masih di-*persist* | Review ulang *array partialize* di `migrations.ts` agar *localStorage* tidak penuh oleh data sementara. |
| Info | *Game tick* (1000ms) memicu banyak re-render | Evaluasi *subscriber* di UI agar tidak me-render ulang seluruh aplikasi setiap 1 detik. Gunakan *selector* yang presisi. |
| Info | File konfigurasi linting (`eslint-config-next`) rusak | Perbaiki dan perbarui konfigurasi linting agar *codebase* tetap bersih dan terstandarisasi di masa depan. |

---
*Dokumen ini merupakan sumber kebenaran (Source of Truth) kondisi sistem Farm Tycoon saat ini.*
