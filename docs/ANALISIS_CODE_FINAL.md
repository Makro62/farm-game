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
