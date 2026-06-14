# Changelog

Semua perubahan pada proyek ini akan dicatat dalam dokumen ini.

## [Unreleased]

## [1.0.0] - 2025-06
### Added
- **Sistem Pertanian Dasar**: Mekanik menanam, menyiram, dan memanen tanaman.
- **Sistem Peternakan**: Pemeliharaan hewan (Ayam, Sapi, Lebah) dan pengumpulan produk (Telur, Susu, Madu).
- **Dapur Produksi (Crafting)**: Fitur untuk mengolah bahan mentah menjadi item bernilai tinggi.
- **Sistem Pesanan (Order Board)**: Penuhi pesanan untuk mendapatkan Koin dan XP ganda.
- **Sistem Cuaca Dinamis**: Variasi cuaca acak yang mempengaruhi gameplay.
- **Pekerja Kurcaci (Auto-farm)**: Otomatisasi pemanenan dan pengumpulan hasil produksi.
- **Dekorasi & Prestige**: Beli dekorasi untuk meningkatkan bonus harga jual.
- **Peternakan Ikan**: Pemeliharaan dan pemanenan ikan di danau.
- **Sistem Auto-Save**: Penyimpanan progres otomatis di `localStorage` dengan hash keamanan sederhana.
- **Versioning Save File**: Migrasi data otomatis untuk menjaga kompatibilitas save file saat game diupdate.

### Removed
- **Topup Uang (Cheat)**: Menghapus fitur cheat money dari versi produksi demi keseimbangan permainan.

### Refactored
- Struktur folder menjadi lebih modular (menggunakan ES Modules).
- Memisahkan logika UI, state, dan sistem mekanik game.
