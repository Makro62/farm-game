# CHANGELOG — Farm Tycoon

Ringkasan semua perubahan yang dilakukan dalam sesi pengembangan ini, diurutkan per fase beserta commit-nya.

---

## Fase 0 — Perbaikan 13 Bug (commit `47166b6`)

1. **Kategori inventori** — `useProfile.ts` kini memakai `getItemCategory` (bukan hardcode `null`) dengan fallback label `"lainnya"`.
2. **Restoran** — chip bahan menu membaca `.qty` per-kategori; tombol makan memakai `getItemCategory(recipeId)` agar produk tidak dianggap bahan.
3. **Auto Worker** — `isWorkerActive` membaca `workers[type].isAutoMode` (bukan kunci legacy `auto*`).
4. **Plot mati (🥀)** — plot berstatus `dead` bisa ditanam ulang; ada visual layu di `PlotGrid`; auto-farmer membersihkan plot mati.
5. **Worker mogok selamanya** — worker kembali bekerja saat gaji dibayar (+10 happiness).
6. **Bom Tambang** — `bom_besar` & `bom_kecil` benar-benar menghasilkan mineral ke inventori.
7. **Give Gift** — `giveGift` melakukan merge data NPC (tidak lagi mereset hati & `dailyGiftGiven`).
8. **Buy Building** — `buyBuilding` menyimpan objek proper `{unlocked, level, maxLevel, ...}` untuk silo, greenhouse, mill, well, workshop, coop, barn.
9. **Refund energi** — `plantSeed` mengembalikan 1 energi saat penanaman gagal.
10. **Pricing berkualitas** — `sellItem`/`sellAllInventory` memakai `getItemSellPrice(itemId, { quality })`; file `createEconomySlice.ts` yang mati dihapus.
11. **Progression quest** — `batchProgressQuest` mendukung quest tipe `chain`.
12. **Notifikasi** — `enqueueNotification` dedup/replace berbasis `options.id`; dialog konfirmasi `upgradeTables` menampilkan biaya mineral; `checkOrders` aman dari `timer: 0`.
13. **Build bersih** — `npm run typecheck` & `npm run build` lulus.

### File terkait
`src/lib/hooks/useProfile.ts`, `src/components/pages/TabRestaurant.tsx`, `src/lib/store/utils.ts`, `src/lib/store/slices/createFarmSlice.ts`, `createMiningSlice.ts`, `createPlayerSlice.ts`, `createSystemSlice.ts`, `createEconomySlice.ts` (dihapus), `src/components/game/PlotGrid.tsx`.

---

## Fase 1 — Upgrade Restoran & Mobile (commit `18c6d52`)

1. **CraftingWidget mode `queueOnly`** — widget dapur hanya menampilkan antrean crafting (tanpa daftar resep), dengan **progress bar animasi**, ETA hitung mundur per detik, dan tombol batalkan.
2. **TabRestaurant** — `KitchenSlots` usang diganti `<CraftingWidget queueOnly title="Dapur Saya" icon="🍳" />`.
3. **ProcessingPlant** — setiap slot kini menampilkan **progress bar** (update per 100ms) plus countdown sisa detik.
4. **Touch controls (mobile)** — tombol yang tadinya `opacity-0 group-hover` (jual / beri makan hewan, pin chef) diubah menjadi `md:opacity-0 md:group-hover:opacity-100`, sehingga **selalu terlihat di layar sentuh** (<768px).

### File
`src/components/ui/CraftingWidget.tsx`, `src/components/pages/TabRestaurant.tsx`, `src/components/game/ProcessingPlant.tsx`, `src/components/pages/TabAnimal.tsx`.

---

## Fase 2 — Scarecrow, Sprinkler & Upgrade Plot (commit `e94b3b6`)

1. **Scarecrow (🪄)** — bangunan baru (1.500 💰 + 2 kayu + 10 batu). Selama terpasang, **hama tidak menyerang lad** (normal 20% peluang per hari). Badge muncul di TabFarm.
2. **Sprinkler (🚿)** — bangunan baru (2.500 💰 + 15 besi + 10 tembaga). **Menyiram semua tanaman otomatis setiap hari gim**.
3. **Sistem Hama (🐛)** — hama menyerang satu tanaman acak (tanam tambah 2×). PlotGrid menampilkan badge 🐛; `syncPlots` & auto-farmer memperhitungkan perlambatan.
4. **Upgrade Plot (⭐ Lv1–3)** — tool baru "Upgrade" di ladang; biaya:
   - Lv1→2: 300💰 + 10 batu + 5 besi → tumbuh 15% lebih cepat.
   - Lv2→3: 800💰 + 10 besi + 6 emas → tumbuh 30% lebih cepat.
   - Faktor level dipakai `autoPlant` dan `plantSeed`. Panen/reset **mempertahankan level** plot.

### File
`src/lib/data/shop.ts`, `src/lib/store/slices/createTownSlice.ts`, `createFarmingSlice.ts`, `createSystemSlice.ts`, `src/lib/store/utils.ts`, `initialState.ts`, `src/types/game.ts`, `src/components/pages/TabFarm.tsx`, `src/components/game/PlotGrid.tsx`.

---

## Fase 3 — Museum, Bank & Smeltery (commit `3654654`)

1. **Museum (🏛️)** — tab baru di Kota. Donasikan mineral/berlian & ikan langka. Milestone **100/300/600/1000 pts** memberi bonus. `dan mereka museumPoints ditambahkan ke beberapa fish & mineral.
2. **Bank Tani (🏦)** — tab baru di Kota. **Bunga 2% per hari gim**, deposit & penarikan koin.
3. **Smeltery (🔥)** — aktif di TabMine:
   - Unlock: 2.500💰 + 10 besi + 20 batu.
   - Menampilkan mineral smelatable (contoh besi → batangan besi).
   - Antrean maks 3 job, butuh 5 batu sebagai bahan bakar, diproses `syncSmeltery` setiap tick.
4. **Combo ke penjualan** — `sellItem`/`sellAllInventory` mengalih hasil dengan `combo.multiplier` (aktif saat combo ≥ 3) lalu mereset kombo.

Action baru: `bankDeposit`, `bankWithdraw`, `donateToMuseum` (town slice); `unlockSmeltery`, `smeltItem`, `syncSmeltery` (mining slice).

### File
`src/lib/store/slices/createTownSlice.ts`, `createMiningSlice.ts`, `createPlayerSlice.ts`, `src/lib/data/minerals.ts`, `fishes.ts`, `src/components/game/BankPanel.tsx` *(baru)*, `MuseumPanel.tsx` *(baru)*, `src/components/pages/TabMine.tsx`, `TabTown.tsx`.

---

## Fase 4 — Leaderboard & Konten Baru (commit `d13e32e`)
1. **Catatan Terbaik (📈)** — section di Profil menampilkan: Total Revenue, Panen, Mineral, Ikan, Masakan, Order selesai, Streak terbaik, Combo terbaik & Poin Museum. Tracking baru: `stats.totalRevenue`, `stats.bestStreak`, `stats.maxCombo`.
2. **Event musiman baru** (di `advanceSeasonTick`):
   - 🌻 **Hari Berkebun** — semua tanaman tumbuh **2×** (via `growthMultiplier`).
   - 🎉 **Pasar Rakyat** — semua penjualan **+50%**.
3. **Bibit baru** — **Kubis (🥬)** (musim dingin), bibit 80💰, waktu 90s, unlock level 3.
4. **Resep baru**:
   - **Sup Kubis (🥘)** — 2 kubis + 1 wortel, 220💰, level 5.
   - **Sup Ikan (🍲)** — 1 ikan_mas + 2 kentang, 350💰, level 5 (referensi dari `fishes.ts` yang sebelumnya kosong).

### File
`src/lib/store/slices/createPlayerSlice.ts`, `createSystemSlice.ts`, `src/lib/data/crops.ts`, `recipes.ts`, `src/components/pages/TabProfil.tsx`.

---

## Ringkasan Status Fitur

| Area | Fitur | Status |
|---|---|---|
| Ladang | Upgrade plot Lv1–3, scarecrow anti-hama, sprinkler, hama 🔥 | ✅ Aktif |
| Tambang | Smeltery (lebur mineral), bom menghasilkan bar ore | ✅ Aktif |
| Kota | Museum donasi + milestone, Bank bunga 2%, hadiah NPC | ✅ Aktif |
| Restoran | Dapur queue + progress bar, tombol mobile tetap terlihat | ✅ Aktif |
| Profil | Catatan terbaik & tracking statistik | ✅ Aktif |
| Event | Hari Berkebun (2×), Pasar Rakyat (+50%) | ✅ Aktif |

**Verifikasi**: `npm run typecheck` dan `npm run build` lulus di setiap fase.
**Total commit**: 5 — `47166b6`, `18c6c52`, `e90b3b6`, `365391` dan `d13e32e`.