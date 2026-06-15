# 🚜 Farm Tycoon Web Game

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![Stack](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)

Selamat datang di **Farm Tycoon**, sebuah web-game interaktif dan responsif di mana Anda dapat membangun dan mengelola perkebunan impian Anda langsung dari browser! 

Versi terbaru ini telah **dimigrasikan secara penuh ke ekosistem Next.js modern** untuk menghadirkan performa tingkat produksi, reaktivitas waktu nyata, dan struktur kode kelas _Enterprise_.

## 🌟 Tech Stack Baru (Fase Migrasi)

Proyek ini telah bertransformasi dari sekadar Vanilla JS/HTML menjadi aplikasi React mutakhir dengan tumpukan teknologi berikut:
- **Next.js 14+** — Framerwork React untuk optimasi performa dan *Fast Refresh*.
- **TypeScript** — *Static typing* secara menyeluruh (End-to-End) untuk mengeleminasi _bug_ tersembunyi.
- **Zustand** — Sistem manajemen *State* yang ringan dan sangat reaktif (menggantikan *mutable global state* lama).
- **Tailwind CSS** — *Utility-first styling* untuk antarmuka yang sangat responsif, membuang belasan file CSS monolitik.
- **Framer Motion** — Animasi deklaratif yang _smooth_ dengan 60fps.

## 🕹️ Tata Letak (3 Tab)

Game dibagi menjadi tiga area yang dapat dipindah lewat tab navigasi:

- **🌾 Pertanian** — kebun, shop bibit, pekerja kebun, papan pesanan, inventory, quest, dan dapur olahan tanaman.
- **🐔 Peternakan** — beli & pelihara hewan, pekerja peternak, serta dapur olahan hasil ternak.
- **🏘️ Kota & Fitur** — danau pemancingan, dapur masakan ikan, dekorasi, bangunan, booster, Pedagang Kota, dan achievements.

## 🚀 Fitur Unggulan

- **Sistem Pertanian Real-Time**: Tanam berbagai bibit, siram untuk mempercepat tumbuh, lalu panen saat siap. Seluruh status tersinkronisasi lewat _Zustand Store_.
- **Hewan Ternak & Perikanan**: Pelihara sapi, ayam, dan ikan. Produk akan terakumulasi otomatis ke dalam gudang (Inventory).
- **Pekerja Otomatis (Auto)**: Sistem Kurcaci dan Pedagang Kota yang bekerja otomatis mengumpulkan produk saat Anda AFK.
- **Siklus Cuaca Dinamis**: Efek visual hujan, salju, dan badai yang memengaruhi kecepatan tumbuh tanaman.
- **Auto-Save Fleksibel**: Progres tersimpan secara periodik dan diam-diam _(silent save)_ di LocalStorage berkat _Zustand Persist Middleware_.

## ⚙️ Cara Menjalankan Server Development

Karena menggunakan **Next.js**, Anda harus menjalankan server node:

1. **Install Dependencies**
   Pastikan Anda sudah menginstal NodeJS, lalu jalankan di root folder:
   ```bash
   npm install
   ```

2. **Jalankan Server Development**
   ```bash
   npm run dev
   ```

3. Buka **`http://localhost:3000`** di browser kesayangan Anda.

## 🗂️ Struktur Proyek Modern

Kode kini disusun sangat modular berdasarkan kaidah React/Next.js terbaru:

```
farm-game/
├── src/
│   ├── app/                    # Next.js App Router (layout & entry pages)
│   ├── components/             # React Client Components (FarmGrid, TopBar, AnimalPen)
│   ├── store/                  # Zustand global stores (gameStore.ts, farmStore.ts)
│   ├── types/                  # Definisi antarmuka TypeScript (.ts)
│   ├── hooks/                  # Custom React hooks (useGameLoop.ts)
│   ├── styles/                 # Tailwind global configurations (globals.css)
│   └── lib/                    # Fungsi murni utilitas (utils.ts)
├── public/                     # Aset gambar dan efek suara
├── tailwind.config.js          # Konfigurasi utility Tailwind
├── next.config.js              # Pengaturan Next.js engine
└── package.json                # Daftar dependensi aplikasi
```

## 🐛 Laporkan Bug

Menemukan bug atau punya saran fitur? [Silakan buka Issue baru](https://github.com/Makro62/farm-game/issues/new).

## 🤝 Kontribusi

Bantuan Anda sangat dihargai! Silakan baca [Panduan Kontribusi (CONTRIBUTING.md)](CONTRIBUTING.md) sebelum memulai.

Selamat bersenang-senang dan jadilah petani terkaya di dunia Next.js! 🌻💰
