# 📄 Farm Tycoon - Dokumentasi Pembaruan Sistem (Versi Terbaru)

**File:** `pembaruan-sistem-game.md`  
**Tanggal:** 14 Juni 2026  
**Status:** Selesai / Terimplementasi

---

## 📋 DAFTAR ISI
1. [Arsitektur Kode (CSS Refactoring)](#1-arsitektur-kode-css-refactoring)
2. [Ekspansi Kapasitas & Variasi](#2-ekspansi-kapasitas--variasi)
3. [Pasar Ikan Kota](#3-pasar-ikan-kota)
4. [Sistem Pelanggan Dinamis](#4-sistem-pelanggan-dinamis)

---

## 1. ARSITEKTUR KODE (CSS REFACTORING)
Untuk mempermudah pengembangan game di masa depan, *file* `style.css` yang sebelumnya berukuran sangat besar (monolitik) telah dipecah menjadi beberapa *file* terpisah berdasarkan area fungsional:
- `base.css`: Variabel warna, *reset* margin/padding, font, dan kelas utilitas dasar.
- `layout.css`: Tata letak grid utama, *Sidebar*, *Right Panel*, *Topbar*, dan *Tabs*.
- `components.css`: Komponen UI yang digunakan berulang seperti tombol (`shop-btn`), *progress bar*, sistem *Toast* (notifikasi), dan *Modal* konfirmasi.
- `farm.css`: Gaya spesifik untuk *Tab Pertanian* (petak tanah, proses tumbuh tanaman).
- `animal.css`: Gaya spesifik untuk *Tab Peternakan* (slot hewan, produk hewan).
- `town.css`: Gaya spesifik untuk *Tab Kota & Fitur* (Danau Pemancingan).
- `effects.css`: Seluruh animasi `@keyframes` seperti *Gnome Patrol* (pekerja yang bergerak), cuaca hujan/salju, dan efek pantulan (*bounce*).

*Semua referensi CSS telah diperbarui di dalam file `index.html` dengan urutan hierarki yang benar.*

---

## 2. EKSPANSI KAPASITAS & VARIASI
### Kapasitas Maksimal
- **Kandang (Barn):** Kapasitas awal hewan ditingkatkan secara drastis dari 2 menjadi **50 ekor** pada level dasar. Kapasitas maksimum setelah di-*upgrade* mencapai **300 ekor**.
- **Danau Pemancingan:** Kapasitas maksimal ikan di dalam danau ditingkatkan dari 10 menjadi **50 ekor**. (Batas ini juga dihormati oleh *Kurcaci Pemancing Kota* saat auto-buy).

### Penambahan Aset Hewan
- **Bebek (🦆):** Harga 200💰 (Terbuka di Lv 2) | Produk: Telur Bebek (🥚)
- **Domba (🐑):** Harga 3.000💰 (Terbuka di Lv 5) | Produk: Bulu Domba (🧶)
- **Babi (🐖):** Harga 10.000💰 (Terbuka di Lv 10) | Produk: Truffle (🍄)

### Penambahan Aset Ikan
- **Gurame (🐠):** Harga 2.500💰 (Terbuka di Lv 10) | Produk: Gurame Besar
- **Salmon (🍣):** Harga 8.000💰 (Terbuka di Lv 15) | Produk: Daging Salmon
- **Hiu Putih (🦈):** Harga 20.000💰 (Terbuka di Lv 20) | Produk: Sirip Hiu

---

## 3. PASAR IKAN KOTA
Sebelumnya tidak ada cara langsung untuk menjual ikan selain diolah di dapur. Kini telah ditambahkan antarmuka **Pasar Ikan Kota**.
- Terletak di *Tab Kota & Fitur*, di bawah Danau Pemancingan.
- **Mekanik:** Secara otomatis membaca seluruh isi *Inventory* (Gudang/Silo). Jika terdapat hasil tangkapan laut/ikan, panel akan memunculkan daftar ikan beserta kuantitasnya.
- **Penjualan Instan:** Pemain dapat menekan tombol **Jual** untuk menukarkan seluruh stok ikan tertentu dengan Koin emas secara langsung.

---

## 4. SISTEM PELANGGAN DINAMIS
Papan Pesanan (Order Board) sebelumnya hanya menampilkan permintaan *Crops* (sayuran) secara acak. Fitur ini dirombak total menjadi **Sistem Pelanggan**.
- **Avatar & Nama:** Setiap pesanan kini terikat pada pelanggan *virtual* dengan nama dan emoji *avatar* (contoh: 👨‍🍳 Chef Budi, 👵 Nenek Sari, 🎣 Juragan Ikan).
- **Cakupan Item Universal:** Pelanggan tidak hanya meminta sayuran, melainkan bisa meminta Susu, Telur, Daging Salmon, Sirip Hiu, Madu, atau item lainnya yang tersedia di dalam game.
- **Sistem Prioritas Pintar (Smart Demand):** 
  - Saat meng-*generate* pesanan baru, ada probabilitas **70%** pesanan akan meminta barang yang **sudah dimiliki pemain di gudang saat itu**.
  - Sisa 30% probabilitas akan meminta barang acak yang telah terbuka sesuai level pemain. 
  - Hal ini mencegah pemain "stuck" pada pesanan barang yang tidak ingin mereka produksi, sekaligus mempercepat laju sirkulasi ekonomi.
