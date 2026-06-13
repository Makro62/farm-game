# 🚜 Farm Tycoon Web Game

Selamat datang di **Farm Tycoon**, sebuah web-game interaktif dan responsif di mana Anda dapat membangun dan mengelola perkebunan impian Anda langsung dari browser! Dibangun sepenuhnya dengan HTML, CSS, dan JavaScript murni (Vanilla ES Modules) — tanpa framework atau proses build.

## 🌟 Fitur Utama
- **Sistem Pertanian Real-Time**: Tanam berbagai bibit (Wortel, Jagung, Tomat, Stroberi, Nanas, Labu Emas), siram untuk mempercepat tumbuh, lalu panen saat siap.
- **Hewan Ternak**: Beli Ayam, Sapi, dan Lebah Madu yang berkeliaran di lahan dengan animasi dan menghasilkan Telur, Susu, serta Madu secara berkala.
- **Trio Kurcaci Pekerja (Auto-Farm)**: Sewa kurcaci untuk memanen, menanam ulang, memungut hasil ternak, dan mengirim pesanan secara otomatis.
- **Dapur Produksi (Crafting)**: Olah bahan mentah menjadi produk bernilai tinggi (Sup, Tepung, Keju, Kue, Pie) lewat antrian produksi.
- **Papan Pesanan (Order Board)**: Penuhi pesanan untuk hadiah Koin & XP ganda.
- **Bangunan**: Tingkatkan Silo, Kandang, Menara Air, Rumah Kaca, dan Kincir Angin untuk memperluas kapasitas dan mempercepat produksi.
- **Siklus Cuaca Dinamis**: Cuaca acak (Cerah, Berawan, Hujan, Badai, Berangin) lengkap dengan efek hujan.
- **Dekorasi & Prestige**: Hias kebun (Pohon, Bunga, Batu, Rumah, Air Mancur, Patung) untuk menambah Prestige dan bonus harga jual.
- **Level, XP, Achievement & Quest Harian**: Naik level untuk membuka konten baru dan raih trofi prestasi.
- **Pancing di Danau**: Tangkap ikan saat muncul cipratan air untuk koin tambahan.
- **Auto-Save Aman**: Progres tersimpan otomatis di LocalStorage dengan verifikasi hash SHA-256 anti-manipulasi.

## 🚀 Cara Menjalankan Game
Karena game menggunakan **ES Modules**, file harus disajikan lewat HTTP (bukan dibuka langsung via `file://`).

1. **Clone/Download** repositori ini.
2. Jalankan server statis sederhana dari folder proyek, contoh:
   ```bash
   python3 -m http.server 8000
   ```
   atau
   ```bash
   npx serve .
   ```
3. Buka `http://localhost:8000` di browser (Chrome, Safari, Firefox).
4. Mulailah bertani! Progres Anda tersimpan otomatis.

## ⌨️ Pintasan Keyboard
- `1` – `6`: Pilih bibit (Wortel … Labu).
- `S`: Simpan game secara manual.
- `D`: Klaim hadiah harian.
- `Esc`: Tutup modal/dialog.

## 🗂️ Struktur Proyek
Kode disusun modular agar mudah dirawat:

```
farm-game/
├── index.html              # Markup & struktur UI
├── css/style.css           # Seluruh styling, animasi, dan layout responsif
└── js/src/
    ├── main.js             # Entry point: inisialisasi & binding window
    ├── core/               # state, game-engine (loop), save-manager, security
    ├── data/               # Konfigurasi data: crops, animals, buildings, crafting, items, config
    ├── managers/           # AudioManager, UIManager, NotificationManager
    ├── systems/            # Logika game: crop, animal, economy, quest, gnome, weather, building, crafting
    ├── ui/                 # Render UI: core, shop, farm, inventory, building, crafting
    └── utils/              # Helper (addXP, achievements)
```

## 🛠️ Teknologi yang Digunakan
- **HTML5** — struktur dan antarmuka.
- **CSS3** — styling, efek cuaca/partikel, Flexbox & Grid untuk tampilan responsif.
- **JavaScript (ES6 Modules)** — game loop, state management, dan logika sistem.
- **Web Audio API** — efek suara prosedural.
- **Web Crypto API (SHA-256)** — keamanan data save.

Selamat bersenang-senang dan jadilah petani terkaya! 🌻💰
