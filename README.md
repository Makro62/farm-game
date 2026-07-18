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
- **JavaScript & TypeScript** — Sebagian besar komponen inti menggunakan JavaScript, dengan rencana migrasi ke TypeScript. Beberapa file utility seperti `useSound.ts` sudah bermigrasi.
- **Zustand** — Sistem manajemen state yang sangat ringan dan reaktif (menyimpan *save data* secara persisten di LocalStorage).
- **Tailwind CSS** — Utility-first styling untuk membuat antarmuka responsif dengan cepat.
- **Framer Motion** — Animasi deklaratif yang smooth dan Hardware Accelerated (seperti transisi panen tanaman).

## 🕹️ Tata Letak

Navigasi lewat **sidebar** (desktop) atau **bottom nav** (mobile):

- **🌾 Pertanian** — kebun, shop bibit, pekerja kebun otomatis, pasar, dan quest
- **🐔 Peternakan** — beli & pelihara hewan serta pekerja peternak otomatis
- **⛏️ Tambang** — mineral (batu, tembaga, emas, berlian) dengan pickaxe dan bom
- **🏘️ Kota** — plaza, memancing, NPC, bangunan, dan papan pesanan
- **🍽️ Restoran** — memasak hidangan dan koki otomatis
- **🧑‍🌾 Profil** — stats pemain dan gudang (jual per-item / jual semua)

## 🚀 Fitur Unggulan

- **Sistem Pertanian Real-Time:** Tanam bibit, siram, panen — loop game di `store-provider.js`
- **Pekerja Otomatis:** Sewa kurcaci petani / peternak / penambang / pemancing / koki
- **Cuaca & Musim:** Ditampilkan di sidebar; mempengaruhi pertumbuhan tanaman
- **Auto-Save:** Zustand Persist ke LocalStorage
- **PWA:** *(Dalam tahap perbaikan Service Worker)*. Fitur instalasi PWA dinonaktifkan sementara.

## ⚙️ Cara Menjalankan

1. `npm install`
2. `npm run dev`
3. Buka `http://localhost:3000`

## ☁️ Deployment (Vercel)

Impor repositori di dashboard Vercel — framework Next.js terdeteksi otomatis.

## 🗂️ Struktur Proyek

```
farm-game/
├── public/                 # PWA icons, aset gambar, musik
├── src/
│   ├── app/                # App Router (halaman per tab)
│   ├── components/
│   │   ├── game/           # PlotGrid, shops, boards
│   │   └── ui/             # Button, TabPage, ShopItemCard, dll
│   ├── lib/
│   │   ├── data/           # crops, shop, recipes, fishes, minerals, npcs
│   │   ├── store/          # Zustand slices + initialState
│   │   ├── hooks/          # useFishingMinigame, dll
│   │   ├── nav.js          # NAV_TABS & SEASON_META
│   │   └── utils.js        # Helper UI (cn, formatNumber)
│   └── styles/
│       └── globals.css     # Design tokens + komponen CSS
├── next.config.js
└── tailwind.config.js
```

## 🐛 Laporkan Bug

Menemukan bug atau punya saran fitur? [Buka Issue baru](https://github.com/Makro62/farm-game/issues/new).
Selamat bersenang-senang dan jadilah petani terkaya!
