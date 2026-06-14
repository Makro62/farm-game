# 🚜 Farm Tycoon Web Game

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)

Selamat datang di **Farm Tycoon**, sebuah web-game interaktif dan responsif di mana Anda dapat membangun dan mengelola perkebunan impian Anda langsung dari browser! Dibangun sepenuhnya dengan HTML, CSS, dan JavaScript murni (Vanilla ES Modules) — tanpa framework atau proses build.

## 📸 Screenshots
*(Tambahkan screenshot gameplay di sini, misalnya `![Gameplay](img/screenshot-farm.png)`)*

## 🌐 Live Demo
Coba mainkan langsung: [▶️ Main Sekarang](https://makro62.github.io/farm-game)

## 🕹️ Tata Letak (3 Tab)
Game dibagi menjadi tiga area yang dapat dipindah lewat tab di atas:
- **🌾 Pertanian** — kebun, shop bibit, pekerja kebun, papan pesanan, inventory, quest, dan dapur olahan tanaman.
- **🐔 Peternakan** — beli & pelihara hewan, pekerja peternak, serta dapur olahan hasil ternak.
- **🏘️ Kota & Fitur** — danau pemancingan, dapur masakan ikan, dekorasi, bangunan, booster, Pedagang Kota, dan achievements.

## 🌟 Fitur Utama
- **Sistem Pertanian Real-Time**: Tanam berbagai bibit (Wortel, Jagung, Tomat, Stroberi, Nanas, Labu Emas), siram untuk mempercepat tumbuh, lalu panen saat siap.
- **Beli Bibit dalam Jumlah Banyak**: Klik bibit di shop untuk membuka **box input jumlah**, lalu beli sekaligus dalam satu klik.
- **Hewan Ternak**: Beli Ayam, Sapi, dan Lebah Madu yang berkeliaran di lahan dan menghasilkan **Telur, Susu, serta Madu** yang **masuk ke gudang** — siap dijual atau diolah.
- **Peternakan Ikan & Masakan Laut**: Tebar bibit ikan (Nila, Lele, Mas) di danau, panen hasilnya ke gudang, lalu masak menjadi **Sushi, Ikan Bakar, dan Sashimi** di Dapur Ikan.
- **Dapur Produksi (Crafting)**: Tiga dapur terpisah — olahan **tanaman** (Sup, Tepung), olahan **ternak** (Keju, Kue, Pie), dan **masakan ikan** — dengan antrian produksi.
- **Pekerja Otomatis (Auto)**:
  - 🧙‍♂️ **Kurcaci Petani** — panen, tanam ulang, dan kirim pesanan otomatis.
  - 🧑‍🍳 **Kurcaci Peternak** — kumpulkan hasil ternak otomatis ke gudang.
  - 🧑‍💼 **Pedagang Kota** — otomatis menjual seluruh hasil panen saat gudang hampir penuh agar tidak terbuang.
  - Setiap pekerja menampilkan **status (sudah dimiliki / belum)** dan tombol Aktif/Istirahat, serta **berpatroli mengelilingi area**.
- **Papan Pesanan (Order Board)**: Penuhi pesanan untuk hadiah Koin & XP ganda.
- **Bangunan**: Tingkatkan Silo, Kandang, Menara Air, Rumah Kaca, dan Kincir Angin untuk memperluas kapasitas dan mempercepat produksi.
- **Quest Harian per Tempat**: Setiap area punya quest sendiri — Kebun, Peternakan, Dapur, Danau, dan Kota.
- **Siklus Cuaca Dinamis**: Cuaca acak (Cerah, Berawan, Hujan, Badai, Berangin) lengkap dengan efek hujan.
- **Dekorasi & Prestige**: Hias kebun untuk menambah Prestige dan bonus harga jual.
- **Level, XP, & Achievement**: Naik level untuk membuka konten baru dan raih trofi prestasi.
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
   *Atau gunakan ekstensi Live Server di VSCode.*
3. Buka `http://localhost:8000` di browser (Chrome, Safari, Firefox).
4. Mulailah bertani! Progres Anda tersimpan otomatis.

## ⌨️ Pintasan Keyboard
- `1` – `6`: Pilih bibit (Wortel … Labu).
- `S`: Simpan game secara manual.
- `D`: Klaim hadiah harian.
- `Esc`: Tutup modal/dialog.

## 🌐 Kompatibilitas Browser
| Browser | Versi Minimum | Status |
|---------|:------------:|--------|
| Chrome  | 90+          | ✅ Full Support |
| Firefox | 88+          | ✅ Full Support |
| Safari  | 14+          | ✅ Full Support |
| Edge    | 90+          | ✅ Full Support |
| IE      | Semua        | ❌ Tidak didukung |
> **Catatan:** Harus dijalankan via HTTP server, bukan `file://`.

## 🗂️ Struktur Proyek
Kode disusun modular agar mudah dirawat:

```
farm-game/
├── index.html              # Markup & struktur UI (3 tab)
├── css/style.css           # Styling, animasi, skala font, layout responsif
└── js/src/
    ├── main.js             # Entry point: inisialisasi & binding window
    ├── core/               # state, game-engine (loop), save-manager, security
    ├── data/               # crops, animals, fishes, buildings, crafting, items, config
    ├── managers/           # AudioManager, UIManager, NotificationManager
    ├── systems/            # crop, animal, fish, economy, quest, gnome, weather, building, crafting
    ├── ui/                 # core, shop, farm, inventory, building, crafting
    └── utils/              # Helper (addXP, achievements, inventory)
```

### Catatan Arsitektur
- **`data/items.js`** menyediakan `PRODUCTS` (hasil ternak/ikan yang dapat disimpan) dan helper terpusat `getItemData()` untuk resolusi nama/emoji/harga setiap item inventory (bibit, produk mentah, maupun hasil olahan).
- Hasil ternak & ikan kini **masuk ke inventory** menggunakan key tipe hewan/ikan, sehingga dapat langsung dipakai sebagai bahan di dapur produksi.

## 🛠️ Teknologi yang Digunakan
- **HTML5** — struktur dan antarmuka.
- **CSS3** — styling, efek cuaca/partikel, Flexbox & Grid, skala tipografi konsisten.
- **JavaScript (ES6 Modules)** — game loop, state management, dan logika sistem.
- **Web Audio API** — efek suara prosedural.
- **Web Crypto API (SHA-256)** — keamanan data save.

## 🐛 Laporkan Bug
Menemukan bug atau punya saran fitur? [Silakan buka Issue baru](https://github.com/Makro62/farm-game/issues/new).

## 🤝 Kontribusi
Bantuan Anda sangat dihargai! Silakan baca [Panduan Kontribusi (CONTRIBUTING.md)](CONTRIBUTING.md) sebelum memulai.

## 📝 Perubahan Terbaru

### Update Fitur & Konsistensi UI
- **Tipografi konsisten**: skala ukuran font terpusat (`--fs-*`) + kelas kartu (`.ui-card-*`) menggantikan ukuran inline yang tidak seragam.
- **Status pekerja**: tombol pekerja menampilkan badge "✅ Dimiliki" alih-alih hilang saat dibeli.
- **Patroli pekerja**: animasi `gnomePatrol` membuat pekerja mengelilingi area (atas–kanan–bawah–kiri), bukan sekadar geser kiri-kanan.
- **Dapur peternakan berfungsi**: hasil ternak masuk gudang sehingga Keju/Kue/Pie bisa diproduksi.
- **Beli banyak sekaligus**: box input jumlah (modal) untuk membeli bibit.
- **Pekerja Kota (Pedagang)**: auto-jual hasil panen saat gudang hampir penuh.
- **Masakan ikan**: resep Sushi, Ikan Bakar, dan Sashimi di Dapur Ikan.
- **Quest harian per tempat**: Kebun, Peternakan, Dapur, Danau, dan Kota.

### Refactoring Sebelumnya
- `crop-system.js` & `animal-system.js` dipecah menjadi fungsi kecil ber-single-responsibility dengan dokumentasi JSDoc.
- `config.js` menambahkan `DEFAULT_INVENTORY_CAPACITY` untuk menghindari magic number.
- Prinsip yang diterapkan: **SRP**, **DRY**, **KISS**, **Clean Code**, dan **Separation of Concerns**.

Selamat bersenang-senang dan jadilah petani terkaya! 🌻💰
