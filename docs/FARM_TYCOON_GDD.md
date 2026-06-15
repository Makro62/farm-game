# 🌾 Farm Tycoon — Game Design Document (Unified)

Dokumen ini adalah sumber utama (*Source of Truth*) untuk semua fitur, mekanik, dan arsitektur di dalam Farm Tycoon.

## 1. Arsitektur & Teknologi
- **Framework**: Next.js 14 (App Router) + React
- **Styling**: Tailwind CSS + Framer Motion (untuk animasi UI & drag-and-drop)
- **State Management**: Zustand + Middleware `persist` (Local Storage)
- **Global Game Loop**: Berjalan di `src/app/page.js` menggunakan `setInterval` (1 detik = 1 tick).

## 2. Fitur Utama & Mekanik

### A. Pertanian (Farming)
- **Sistem Musim**: Terdiri dari Spring, Summer, Autumn, dan Winter. Tiap musim berlangsung 7 hari. (1 Hari = 3 menit real-time / 180 tick). Musim mempengaruhi bibit apa yang bisa dibeli.
- **Cuaca**: Berubah setiap 5 menit (Cerah, Hujan, Berawan, Badai).
- **Bibit & Panen**: Terdapat tanaman reguler (Wortel, Jagung) dan tanaman musiman (Tulip, Semangka, dll). Setiap bibit memiliki durasi tumbuh.
- **Auto-Farmer (Kurcaci Petani)**: Bisa disewa (5000 koin) untuk otomatis menanam dan memanen lahan kosong (interval 1.5 detik).

### B. Peternakan (Animal Husbandry)
- Hewan dibeli dari Shop dan memiliki waktu produksi (Cooldown).
- Setelah waktu habis, hewan menghasilkan barang (Telur, Susu, Wol, dll).
- **Auto-Rancher (Kurcaci Peternak)**: Bisa disewa (500 koin) untuk otomatis mengambil hasil ternak.

### C. Kota & Warga (Town & NPCs)
- Terdapat 3 NPC (Chef Maria, Pak Tua Botan, Paman Hadi).
- Pemain dapat memberikan hadiah (item dari inventory). Barang kesukaan memberikan 50 poin, barang biasa 10 poin. Maksimal Level 5.
- Kenaikan level persahabatan memberikan hadiah XP kepada pemain.

### D. Fitur Mini-Games
1. **Memancing (Fishing)**: Sistem klik & tahan (Hold). Indikator harus tetap berada di zona hijau untuk menambah skor. Berhasil mencapai 50 skor menghasilkan ikan acak (Ikan Mas, Lele, Gurita Emas).
2. **Pertambangan (Mining)**: 24 Node batu yang bisa dihancurkan. Sistem Gacha batu/mineral (Batu, Tembaga, Besi, Emas, Berlian). Node akan kembali normal setelah 2 menit.

### E. Event Acak & Ekonomi
- **Event**: Saat pergantian hari, ada 30% peluang muncul event (Festival Panen, Hari Bahari, Demam Emas) yang dapat menaikkan harga jual atau peluang barang langka.
- **Fluktuasi Harga (Market)**: Harga tanaman bisa naik/turun acak.

## 3. Fitur Selanjutnya (Drag-and-Drop)
Area Pertanian (Plots) dan Peternakan (Animals) akan dirombak agar pemain dapat menyusun posisi lahan dan hewan secara bebas dengan cara men-drag-and-drop elemen di layar menggunakan `framer-motion`. Posisi X dan Y disimpan di dalam Zustand store.
