# Farm Tycoon — Dokumen Perbaikan & Peningkatan

> **Dibuat:** Juli 2026  
> **Tujuan:** Daftar apa yang perlu diperbaiki di kode saat ini, plus roadmap peningkatan agar game makin menarik.  
> **Referensi desain:** Stardew Valley, Hay Day, Fields of Mistria, Coral Island, Cozy Grove.

---

## Daftar Isi

1. [Ringkasan kondisi saat ini](#1-ringkasan-kondisi-saat-ini)
2. [Bug & perbaikan teknis (prioritas tinggi)](#2-bug--perbaikan-teknis-prioritas-tinggi)
3. [Fitur setengah jadi / placeholder](#3-fitur-setengah-jadi--placeholder)
4. [Debt arsitektur & kebersihan kode](#4-debt-arsitektur--kebersihan-kode)
5. [Ide peningkatan gameplay (dari game referensi)](#5-ide-peningkatan-gameplay-dari-game-referensi)
6. [Roadmap prioritas](#6-roadmap-prioritas)
7. [Checklist implementasi](#7-checklist-implementasi)

---

## 1. Ringkasan kondisi saat ini

### Tech stack
- Next.js 16 (App Router) + React 18 + Zustand + Tailwind + Framer Motion
- Persist save di `localStorage` (`farm-game-storage`)
- Routing per area: `/pertanian`, `/peternakan`, `/tambang`, `/kota`
- Store modular: slices di `src/lib/store/slices/`

### Yang sudah jalan
| Area | Fitur |
|------|--------|
| Pertanian | 30 petak, tanam/panen, shop bibit, auto petani, edit layout, crafting dapur, order board, daily quest |
| Peternakan | 6 hewan, collect produk, auto peternak, drag layout |
| Tambang | 30 node, peralatan (bom/pickaxe/senter/tali), auto penambang |
| Kota | fishing minigame, NPC gift, roda harian, booster, pemancing auto |
| Sistem | musim/cuaca (display), event banner, streak, inventory jual semua, offline modal (UI), PWA dasar |

### Masalah besar secara singkat
Banyak sistem **tampil di UI** tapi **efek gameplay belum ter-wire** (pasar, cuaca, event, combo, achievement). Ada juga bug data (ID quest ikan/gandum) dan persist yang belum lengkap (crafting/orders/offline).

---

## 2. Bug & perbaikan teknis (prioritas tinggi)

### 2.1 Quest tidak bisa diselesaikan

| Bug | Lokasi | Perbaikan |
|-----|--------|-----------|
| Quest fishing pakai ID `ikan_teri` / `ikan_lele` | `createPlayerSlice.js` | Samakan dengan `FISHES` di `utils.js` (`ikan_mas`, `lele`, dll.) |
| Quest panen `gandum` | `createPlayerSlice.js` | Ganti target ke crop yang ada di `SHOP_SEEDS`, atau tambah bibit gandum |
| Manual fishing tidak `addXP` / `progressQuest` | `useFishingMinigame.js` | Samakan dengan auto-fisher: XP + progress quest saat tangkap berhasil |

### 2.2 Persist / save rusak atau tidak lengkap

| Bug | Lokasi | Perbaikan |
|-----|--------|-----------|
| `craftingQueue` & `orders` tidak disimpan | `store.js` `partialize` | Tambahkan ke persist |
| `lastSavedAt` di-update tiap tick tapi tidak persist | `createSystemSlice.js` | Persist `lastSavedAt`; update hanya saat save nyata / sebelum unload |
| Offline progress jarang muncul | `OfflineProgressModal` + `calculateOfflineProgress` | Perbaiki delta waktu; hitung panen/tambang yang “matang” saat offline |
| Cancel craft tidak refund bahan | `createPlayerSlice.js` | Refund ingredients saat `removeCraftingQueue` |

### 2.3 Efek sistem hanya kosmetik

| Bug | Lokasi | Perbaikan |
|-----|--------|-----------|
| Event “harga ×2 / rare ore naik” tidak berpengaruh | `advanceSeasonTick` vs `getItemSellPrice` / `rollMineralType` | Baca `activeEvent` saat jual & roll mineral |
| `todayPrices` / `marketTrend` tidak dipakai jual | `createTownSlice.js` + `getItemSellPrice` | Packai harga pasar dinamis di sell / tampilkan UI pasar |
| Cuaca tidak ubah growth/fishing | `changeWeather` | Modifier grow time / chance ikan |
| Semua bibit `season: 'all'` | `SHOP_SEEDS` | Buat beberapa crop musiman; filter shop sesuai musim |
| `coinMultiplier` / `growthMultiplier` permanen | store | Tambah timer expire (mis. 10–30 menit) |
| Combo system mati | `registerCombo` tidak dipanggil | Wire ke harvest/mine/collect, atau hapus |

### 2.4 Data & ekonomi tidak konsisten

| Bug | Lokasi | Perbaikan |
|-----|--------|-----------|
| Harga sewa worker tidak seragam | UI hardcoded vs `constants.js` | Satu sumber: farmer/rancher/fisher/miner di `constants.js` |
| NPC likes item yang tidak bisa didapat | `NPC_LIST` (tulip, apel) | Tambah crop/shop, atau ubah likes ke item yang ada |
| `updateMarket` ikut `day++` saat hydrate | `store-provider.js` | Pisahkan init harga dari advance day |
| Streak double path | auto-claim + tombol Daily | Satu jalur klaim saja |
| Koin NaN (sudah pernah diperbaiki) | operasi `coins - undefined` | Pertahankan `safeCoins` di semua path belanja |

### 2.5 UI / UX yang menyesatkan

| Bug | Perbaikan |
|-----|-----------|
| Banner event klaim efek yang belum ada | Wire efek, atau ubah teks jadi “coming soon” |
| Status “Kurcaci aktif” tanpa feedback jelas | Toast periodik / counter “panen X kali hari ini” |
| Pasar ikan “Buka di Level 10” tanpa progress jelas | Tampilkan requirement + unlock yang benar-benar berfungsi |

---

## 3. Fitur setengah jadi / placeholder

| Fitur | Status | File terkait | Arah |
|-------|--------|--------------|------|
| Shop dekorasi | Placeholder teks | `TabTown.jsx` | Hapus atau implementasi dasar (item kosmetik) |
| Area bangunan | Placeholder | `TabTown.jsx` | Silo / barn / greenhouse (efek kapasitas / grow) |
| Achievement | Tidak ada sistem | — | Ganti “0/12” (jika masih ada) dengan sistem nyata / museum |
| Market UI | Data ada, UI jual tetap | `todayPrices` | Panel “Harga Hari Ini” |
| Offline progress | Logic lemah | `OfflineProgressModal.jsx` | Perbaiki persist + kalkulasi |
| SFX / confetti helpers | Hampir tidak ter-wire | `useSound`, `useConfetti`, `toast.js` | Pasang di panen, level up, quest claim |
| `useGameLoop.ts` | Dead code | `src/lib/hooks/useGameLoop.ts` | Hapus atau ganti loop di `store-provider.js` |
| GDD / README | Outdated | `docs/FARM_TYCOON_GDD.md` | Update: routing, crafting, orders, fishing, slices |

---

## 4. Debt arsitektur & kebersihan kode

1. **State awal diduplikasi** di `store.js` + tiap slice → satukan sumber `initialState`.
2. **`utils.js` monolit** (crops, animals, fish, recipes, orders, helpers) → pecah ke `data/` (crops, animals, fishes, recipes, npc, orders).
3. **`constants.js` tidak lengkap** → pindahkan semua harga worker, timer fishing, cost booster.
4. **Folder kosong** `src/store/`, `src/types/` → pakai atau hapus.
5. **Dependensi berat / jarang dipakai** (beberapa Radix, date-fns) → audit dan bersihkan jika tidak terpakai.
6. **Dokumentasi GDD** masih menyebut arsitektur vanilla JS lama → rewrite singkat sesuai Next + Zustand.

---

## 5. Ide peningkatan gameplay (dari game referensi)

Ide di bawah dipilih karena **mirip fondasi yang sudah ada**, jadi lebih mudah diadaptasi.

### 5.1 Stardew Valley → Skill & otomasi berjenjang

**Yang diambil**
- Level terpisah per aktivitas: `farmingLevel`, `miningLevel`, `fishingLevel`, `ranchingLevel` (bukan hanya level global).
- Naik level → unlock resep craft / tool / seed.
- Otomasi berjenjang (seperti sprinkler): worker Lv1–3 dengan biaya upgrade + efek lebih kuat.

**Adaptasi ke farm-game**
| Sekarang | Target |
|----------|--------|
| 1 level global + XP | XP global tetap, plus skill per tab |
| Worker on/off flat | Worker tier: cepat panen / tanam lebih cerdas / chance bonus |
| Pickaxe 3 level (sudah ada) | Pola yang sama untuk fishing rod & watering / sprinkler |

**Kenapa menarik:** progression terasa berlapis; pemain punya alasan main tiap area, bukan cuma farming.

---

### 5.2 Hay Day → Ekonomi produksi & retention musiman

**Yang diambil**
- Rantai produksi: bahan mentah → barang craft (sudah ada embryo di `RECIPES` / `CraftingWidget`).
- “Farm Pass” musiman: track reward gratis (dan optional premium nanti).
- Pasar dinamis + tempat jual yang jelas (roadside shop / market board).

**Adaptasi ke farm-game**
| Sekarang | Target |
|----------|--------|
| Craft ada, tapi cancel hilang bahan | Queue andal + refund + notifikasi “siap” |
| Sell all flat price | Market board dengan `todayPrices` naik-turun |
| Streak harian sederhana | Farm Pass 7/14/28 hari: seed langka, booster, dekor |

**Kenapa menarik:** cocok skala web/casual; loop “tanam → craft → jual → unlock bangunan” sangat sticky.

---

### 5.3 Fields of Mistria → Request board & koleksi

**Yang diambil**
- Request board dengan reward unik per NPC.
- Museum / koleksi (flora, ikan, mineral, artefak).

**Adaptasi ke farm-game**
| Sekarang | Target |
|----------|--------|
| Order board generik | Order dari NPC tertentu + bonus friendship |
| Achievement kosong | Museum: donasi 1× tiap ikan/mineral/crop langka → reward milestone |
| Gift NPC | Request harian “Maria butuh 3 wortel” dengan reward unik |

**Kenapa menarik:** mengubah achievement dari angka kosong jadi tujuan koleksi yang visual.

---

### 5.4 Coral Island → Dua jalur progress paralel

**Yang diambil**
- Progress kota (NPC / restorasi sosial) vs progress dunia lain (laut / tambang) dengan milestone masing-masing.

**Adaptasi ke farm-game**
| Jalur | Milestone contoh | Reward |
|-------|------------------|--------|
| **Kota** | Total friendship level semua NPC | Unlock shop dekor, dialog baru, event festival |
| **Tambang** | Total ore ditambang / pickaxe max | Unlock lantai tambang / mineral baru |
| **Danau** | Koleksi ikan lengkap | Unlock dapur ikan / bait |

**Kenapa menarik:** XP global saja terasa datar; dua jalur membuat “hari ini fokus kota” vs “hari ini fokus tambang” terasa beda.

---

### 5.5 Cozy Grove → Sesi harian untuk game browser

**Yang diambil**
- Daily quest + resource yang respawn terbatas per hari.
- Tidak ada penalti berat jika daily dibiarkan.
- Konten inti ~30–60 menit/hari, sisanya free play.

**Adaptasi ke farm-game**
| Sekarang | Target |
|----------|--------|
| Daily quest 3 random | Daily quest + “node bonus” (petak/tambang/fishing spot) yang respawn 2–3×/hari |
| Streak | Tetap, tapi digabung Farm Pass |
| PWA ada | Push/notifikasi: “Tanaman siap panen”, “Quest harian reset” |

**Kenapa menarik:** pola main singkat cocok web/mobile; notifikasi PWA jadi alasan kembali.

---

## 6. Roadmap prioritas

### Fase A — Stabilisasi (1–2 minggu)
Fokus: game tidak “bohong” dan tidak rusak.

1. Fix ID quest (fish + gandum) + XP/quest dari fishing manual  
2. Persist `craftingQueue`, `orders`, `lastSavedAt`  
3. Refund craft cancel  
4. Wire event + market ke harga jual / drop  
5. Samakan biaya worker di `constants.js`  
6. Perbaiki offline progress  
7. Hapus / wire dead code (`useGameLoop`, combo, helpers SFX)

### Fase B — Depth ringan (2–4 minggu)
Fokus: tiap sistem yang sudah ada terasa berguna.

1. Efek cuaca & musim pada growth + shop bibit musiman  
2. Market board UI + harga dinamis  
3. Skill level per aktivitas (farming/mining/fishing/ranching)  
4. Worker upgrade tier  
5. Order board terkait NPC + friendship bonus  
6. Museum / koleksi (ikan + mineral dulu)  
7. Booster dengan timer expire  
8. SFX + feedback visual di aksi penting

### Fase C — Retention & daya tarik (1–2 bulan)
Fokus: alasan kembali tiap hari.

1. Farm Pass / battle pass musiman  
2. Dua jalur milestone (Kota vs Tambang/Danau)  
3. Daily resource respawn terbatas (pola Cozy Grove)  
4. Notifikasi PWA (panen siap, quest reset)  
5. Bangunan dasar (silo kapasitas, greenhouse musim)  
6. Festival musiman sederhana  
7. (Opsional) multiplayer/trading — hanya jika ada backend

---

## 7. Checklist implementasi

### Perbaiki dulu (wajib)
- [x] Align quest fish ID dengan `FISHES` → `ikan_mas`, `lele`
- [x] Ganti/hapus quest `gandum` atau tambah bibit gandum → `bibit_gandum` ada di shop
- [x] Manual fishing → `addXP` + `progressQuest`
- [x] Persist `craftingQueue`, `orders`, `lastSavedAt`
- [x] Refund bahan saat cancel craft
- [x] `activeEvent` mempengaruhi jual & mining rare → jual + event `tambang` di `rollMineralType`
- [x] Sell memakai `todayPrices` (+ event multiplier)
- [x] Cuaca & musim mempengaruhi gameplay → cuaca (growth) + bibit musiman
- [x] Worker costs di `constants.js` saja
- [x] Offline progress → `lastSavedAt` tidak lagi di-update tiap tick
- [x] Booster expire (koin & growth, 30 menit)
- [ ] Update GDD/README agar sesuai kode

### Sisa bug / polish Fase A
- [x] Event `tambang` → `rollMineralType` baca `activeEvent`
- [x] Jangan update `lastSavedAt` setiap `processGameTick`
- [x] `updateMarket` jangan `day++` saat hydrate
- [x] Seed musiman + filter shop (+ greenhouse bypass)
- [x] NPC likes `tulip`/`apel` → bibit tersedia di musimnya
- [x] Wire `registerCombo` (panen / collect / mine)
- [x] Hapus placeholder dekorasi & bangunan → shop nyata

### Improve supaya makin menarik
- [ ] Skill tree / level per aktivitas (Stardew)
- [ ] Worker / otomasi berjenjang (Stardew / sprinkler-like)
- [x] Market board + harga dinamis (Hay Day embryo)
- [ ] Request NPC + museum koleksi (Mistria)
- [ ] Milestone paralel Kota vs Tambang (Coral Island)
- [ ] Daily respawn terbatas + PWA notifikasi (Cozy Grove)
- [x] Bangunan & dekorasi dasar (Silo, Greenhouse, 3 dekor)
- [ ] Achievement nyata / museum mengganti “kosong”

> **Status audit:** 13 Jul 2026 — Fase A ~95% selesai. Batch update: event tambang, offline save, musim, combo, market board, bangunan/dekor.

---

## Lampiran — Mapping cepat “ambil dari game mana”

| Game | Ide paling actionable | Fondasi yang sudah ada di farm-game |
|------|------------------------|-------------------------------------|
| **Stardew Valley** | Skill terpisah + otomasi berjenjang | Level XP, workers, pickaxe tier |
| **Hay Day** | Farm Pass + pasar dinamis + rantai craft | Crafting, streak, `todayPrices` |
| **Fields of Mistria** | Request NPC + museum | Order board, NPC gift, minerals/fish |
| **Coral Island** | Progress paralel + milestone | Tabs kota/tambang/pertanian terpisah |
| **Cozy Grove** | Sesi harian + respawn terbatas | Daily quest, streak, PWA |

---

## Catatan untuk developer

- Jangan tambah fitur besar sebelum **Fase A** selesai — banyak “fitur” saat ini hanya UI.
- Setiap sistem baru harus: **(1)** tersimpan di persist jika perlu, **(2)** punya feedback UI, **(3)** mempengaruhi ekonomi atau progression.
- Prefer perluas yang sudah ada (quest, order, craft, worker, market) daripada sistem baru yang parallel mati.

---

*Dokumen ini melengkapi `docs/FARM_TYCOON_GDD.md`. Setelah Fase A, GDD sebaiknya di-update agar tidak bentrok dengan kode aktual.*
