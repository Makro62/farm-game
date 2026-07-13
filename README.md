# 🚜 Farm Tycoon Web Game

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![Stack](https://img.shields.io/badge/Next.js-16+-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)

Selamat datang di **Farm Tycoon**, sebuah web-game interaktif dan responsif di mana Anda dapat membangun dan mengelola perkebunan impian Anda langsung dari browser! 

Repositori ini baru saja mengalami *rewrite* total dari versi lama (Vanilla JS) menjadi aplikasi berbasis **Next.js modern**.

## 🌟 Tech Stack

Proyek ini menggunakan tumpukan teknologi modern berikut:
- **Next.js 16 (App Router)** — Framework React untuk optimasi performa dan rendering.
- **React 18** — Component-based UI library.
- **JavaScript & TypeScript** — Sebagian besar komponen inti menggunakan JavaScript, dengan pemakaian TypeScript secara bertahap pada hooks/utility tertentu (misalnya `useGameLoop.ts`).
- **Zustand** — Sistem manajemen state yang sangat ringan dan reaktif (menyimpan *save data* secara persisten di LocalStorage).
- **Tailwind CSS** — Utility-first styling untuk membuat antarmuka responsif dengan cepat.
- **Framer Motion** — Animasi deklaratif yang smooth dan Hardware Accelerated (seperti transisi panen tanaman).

## 🕹️ Tata Letak (4 Tab)

Game dibagi menjadi empat area yang dapat dipindah lewat tab navigasi:

- **🌾 Pertanian** — kebun, shop bibit, pekerja kebun otomatis, papan pesanan, quest, dan dapur olahan tanaman.
- **🐔 Peternakan** — beli & pelihara hewan (ayam, sapi, dll) serta pekerja peternak otomatis.
- **⛏️ Tambang** — area untuk mendapatkan mineral berharga (batu, tembaga, emas, berlian) menggunakan pickaxe dan bom.
- **🏘️ Kota & Fitur** — NPC (Maria, Botan, Hadi), sistem persahabatan, cuaca, dan setting game.

## 🚀 Fitur Unggulan

- **Sistem Pertanian Real-Time:** Tanam bibit, tunggu progress bar animasi CSS selesai, dan panen. Semua tereksekusi di background lewat custom hook `useGameLoop`.
- **Sistem Pekerja Otomatis (Auto):** Sewa kurcaci petani untuk secara otomatis menanam dan memanen tanpa campur tangan Anda.
- **Siklus Cuaca & Musim Dinamis:** Mempengaruhi gameplay seperti kecepatan tumbuh tanaman dan keberadaan NPC.
- **Auto-Save Fleksibel:** Progres tersimpan diam-diam (silent save) berkat *Zustand Persist Middleware*.
- **PWA (Progressive Web App):** Dapat diinstal di HP atau desktop berkat dukungan `next-pwa`.

## ⚙️ Cara Menjalankan Server Development

Berbeda dengan versi lama, aplikasi ini berjalan menggunakan Node.js dan Next.js. Ikuti langkah berikut:

1. **Install Dependencies**
   Pastikan Anda sudah menginstal NodeJS, lalu jalankan di root folder:
   ```bash
   npm install
   ```

2. **Jalankan Server Development**
   ```bash
   npm run dev
   ```

3. Buka **`http://localhost:3000`** di browser Anda.

## ☁️ Deployment

Proyek ini sangat dioptimalkan untuk di-deploy ke **Vercel**. 
Cukup impor repositori ini di dashboard Vercel Anda, dan Vercel akan otomatis mengenali framework *Next.js* dan melakukan *build* tanpa memerlukan konfigurasi tambahan.

*Catatan: GitHub Pages workflow (`deploy.yml`) versi lama telah dihapus untuk menghindari konflik build statis.*

## 🗂️ Struktur Proyek

```
farm-game/
├── public/                 # PWA icons, gambar aset game, background music
├── src/
│   ├── app/                # Next.js App Router (layout.js, page.js)
│   ├── components/         # Komponen UI (TabFarm, TabAnimal, dll)
│   │   └── game/           # Sub-komponen modular untuk setiap tab
│   ├── lib/
│   │   ├── store.js        # Global state management dengan Zustand
│   │   ├── hooks/          # Custom hooks seperti useGameLoop
│   │   └── utils.js        # Fungsi helper dan data master (CROP_DATA, dll)
│   └── styles/
│       └── globals.css     # CSS Global (Tailwind & Keyframes)
├── next.config.js          # Pengaturan Next.js dan plugin PWA
└── tailwind.config.js      # Tema dan warna Tailwind
```

## 🐛 Laporkan Bug

Menemukan bug atau punya saran fitur? [Silakan buka Issue baru](https://github.com/Makro62/farm-game/issues/new).
Selamat bersenang-senang dan jadilah petani terkaya! 🌻💰
