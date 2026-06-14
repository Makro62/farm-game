# 📄 Farm Tycoon - Dokumentasi Perbaikan Tab Pertanian

**File:** `pertanian-fixes.md`  
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
Tab **Pertanian** memiliki masalah fundamental yang menghambat *early-game progression*:
- ❌ **Semua bibit terkunci**: Player Lv 1 tidak bisa menanam apa pun.
- ❌ **Area tanam kosong**: Tidak ada petak tanah (plot) yang terlihat atau interaktif.
- ❌ **Tidak ada sumber income dasar**: Tanpa tanaman, player bergantung sepenuhnya pada event atau tab lain (yang juga terkunci).
- ❌ **Harga bibit vs Uang Player**: Bibit termurah (Gandum) butuh Lv 3 & 500💰, sementara player punya 100💰.
- ❌ **Pekerja Auto terlalu mahal**: Harga 8.000 tidak masuk akal untuk ekonomi awal.

### 📊 Data Player Saat Ini
```
💰 Uang: 100
⭐ Level: 1
📈 XP: 0/100
🏆 Prestige: 0
```

---

## 2. ANALISIS KONDISI SAAT INI

### 2.1 Daftar Bibit Tersedia

| Bibit | Harga Beli | Waktu Tumbuh | Hasil Panen | Jual Panen | Syarat | Status |
|-------|------------|--------------|-------------|------------|--------|--------|
| 🌾 Gandum | 500 💰 | 30s | 3 Gandum | 150 💰 (50/satuan) | Lv 3 | 🔒 TERKUNCI |
| 🌽 Jagung | 1.200 💰 | 60s | 2 Jagung | 400 💰 (200/satuan) | Lv 5 | 🔒 TERKUNCI |
| 🥕 Wortel | 3.000 💰 | 120s | 5 Wortel | 1.000 💰 (200/satuan) | Lv 8 | 🔒 TERKUNCI |
| 🍅 Tomat | 8.000 💰 | 300s | 4 Tomat | 3.000 💰 (750/satuan) | Lv 12 | 🔒 TERKUNCI |

**Problem:** Margin keuntungan Gandum = (150 - 500) = **-350 💰**. 
> ⚠️ **BUG KRITIS:** Menanam Gandum justru membuat player BANGKRUT. Harga jual panen harus lebih tinggi dari harga beli bibit, ATAU harga bibit diturunkan drastis.

### 2.2 Area Pertanian

**Kondisi Saat Ini:**
- Area hijau besar polos (mirip tab Peternakan)
- Tidak ada grid/petak tanah
- Tidak ada indikator air/kesuburan
- Tidak ada animasi pertumbuhan

### 2.3 Dapur Produksi (Pertanian)

| Produk Olahan | Waktu | Bahan | Jual | Syarat | Status |
|---------------|-------|-------|------|--------|--------|
| 🍞 Roti Gandum | 45s | 0/3 Gandum | 600 💰 | Lv 5 | 🔒 |
| 🍿 Popcorn | 60s | 0/2 Jagung | 900 💰 | Lv 7 | 🔒 |
| 🥗 Salad Sayur | 90s | 0/2 Wortel, 0/1 Tomat | 2.000 💰 | Lv 10 | 🔒 |

**Problem:** Semua resep terkunci. Player tidak bisa menambah nilai jual hasil panen.

### 2.4 Pekerja Auto

| Pekerja | Harga | Fitur |
|---------|-------|-------|
| Kurcaci Petani | 8.000 💰 | Auto-Panen & Tanam Ulang |

**Problem:** Sama seperti tab Peternakan — 80x lipat uang player.

---

## 3. PERBAIKAN YANG DISARANKAN

### 3.1 🌱 Tambahkan Bibit Starter (Priority: 🔴 CRITICAL)

```yaml
Bibit: "🌿 Benih Rumput / Kentang Mini (Starter)"
Harga_Beli: "GRATIS" atau "20 💰"
Waktu_Tumbuh: "10 detik"
Hasil_Panen: "2 Kentang Mini"
Jual_Panen: "15 💰 per satuan (Total 30 💰)"
Profit: "+10 💰 per siklus"
Syarat_Level: 1
XP_Didapat: 3
Deskripsi: "Tanaman pertama untuk belajar bercocok tanam!"
```

**Alasan:** Memberikan loop ekonomi positif sejak detik pertama. Player bisa melihat uang bertambah → motivasi terus bermain.

---

### 3.2 💰 Rebalance Harga & Profitabilitas

#### Fix Bug Bangkrut Gandum
```yaml
# OPSI A: Turunkan harga bibit
Gandum:
  Harga_Beli_Lama: 500 💰
  Harga_Beli_Baru: 80 💰
  Hasil_Panen: 3 Gandum
  Jual_Per_Satuan: 40 💰
  Total_Jual: 120 💰
  Profit: +40 💰 ✅

# OPSI B: Naikkan harga jual panen (jika harga bibit ingin tetap)
Gandum:
  Harga_Beli: 500 💰
  Hasil_Panen: 5 Gandum (bukan 3)
  Jual_Per_Satuan: 120 💰
  Total_Jual: 600 💰
  Profit: +100 💰 ✅
```

#### Tabel Rebalance Lengkap

| Bibit | Harga Beli Baru | Waktu | Hasil | Jual/Satuan | Total Jual | Profit | Level |
|-------|-----------------|-------|-------|-------------|------------|--------|-------|
| 🥔 Kentang Mini | GRATIS/20 | 10s | 2 | 15💰 | 30💰 | +10💰 | Lv 1 |
| 🌾 Gandum | 80 💰 | 30s | 3 | 40 | 120💰 | +40💰 | Lv 1 |
| 🌽 Jagung | 300 💰 | 60s | 2 | 200💰 | 400 | +100💰 | Lv 3 |
| 🥕 Wortel | 800 💰 | 120s | 5 | 200💰 | 1.000💰 | +200💰 | Lv 5 |
| 🍅 Tomat | 2.000 💰 | 300s | 4 | 750💰 | 3.000💰 | +1.000💰 | Lv 8 |

---

### 3.3 🟫 Sistem Plot/Area Tanam

**Spesifikasi Grid:**
```
Ukuran_Default: 4x4 (16 slot)
Slot_Awal_Terbuka: 4 slot (baris pertama)
Biaya_Buka_Slot: "300 💰 per slot"
Maksimum_Slot: 36 slot (6x6)
```

**Visual Layout:**
```
┌───────────────────────────────────────┐
│  AREA PERTANIAN                       │
├─────┬─────┬─────┬─────┐               │
│ 🌾  │ 🌱  │  +  │  +  │ ← Baris 1     │
├─────┼─────┼─────┼─────┤   (terbuka)   │
│  +  │  +  │  +  │  +  │ ← Baris 2     │
├──────────┼─────┼─────               │
│ 🔒  │ 🔒  │ 🔒  │ 🔒  │ ← Baris 3-4   │
└──────────┴─────┴─────   (terkunci)  │
                                         │
  🌾 = Tanaman tumbuh                   │
  +  = Tanah kosong (klik untuk tanam)  │
  🔒 = Slot terkunci                    │
  💧 = Butuh disiram (opsional mechanic)│
└───────────────────────────────────────┘
```

**State Tanaman:**
```
1. 🟫 Tanah Kosong → Klik → Pilih Bibit → Tanam
2. 🌱 Tunas (0-30%) → Animasi kecil muncul
3. 🌿 Bertumbuh (30-70%) → Tanaman lebih besar
4. ✨ Siap Panen (100%) → Glow effect + bubble "PANEN!"
5. 🟫 Kembali Kosong setelah dipanen
```

---

### 3.4 🍳 Resep Dapur Level Rendah

#### Resep 1: Tepung Gandum (Lv 1)
```yaml
Nama: "🍞 Tepung Gandum"
Waktu: "20 detik"
Bahan: "2 Gandum"
Jual: "100 💰 (+20 💰 bonus)"
XP: 5
Status: "TERBUKA"
```

#### Resep 2: Jagung Rebus (Lv 2)
```yaml
Nama: "🌽 Jagung Rebus"
Waktu: "30 detik"
Bahan: "1 Jagung"
Jual: "250 💰 (+50 💰 bonus)"
XP: 8
Status: "TERBUKA"
```

#### Resep 3: Jus Wortel (Lv 4)
```yaml
Nama: "🥤 Jus Wortel"
Waktu: "45 detik"
Bahan: "2 Wortel"
Jual: "500 💰 (+100 💰 bonus)"
XP: 12
Status: "TERBUKA"
```

---

### 3.5 👷 Pekerja Auto Bertingkat (Pertanian)

| Tier | Nama | Harga | Level | Fitur |
|------|------|-------|-------|-------|
| 1 | 🧑‍🌾 Kurcaci Pemula | **400 💰** | Lv 1 | Auto-panen 1 plot |
| 2 | 🧑‍🌾 Kurcaci Mahir | 1.500 💰 | Lv 4 | Auto-panen + tanam ulang (3 plot) |
| 3 | 🧑‍🌾 Kurcaci Expert | 4.000 💰 | Lv 8 | Auto semua plot |
| 4 | 👨‍🌾 Master Tani | 12.000 💰 | Lv 15 | Auto semua + auto-olah dapur |
