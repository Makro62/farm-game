# 🚜 Farm Tycoon Web Game

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)

Selamat datang di **Farm Tycoon**, sebuah web-game interaktif dan responsif di mana Anda dapat membangun dan mengelola perkebunan impian Anda langsung dari browser! Dibangun sepenuhnya dengan HTML, CSS, dan JavaScript murni (Vanilla ES Modules) — tanpa framework atau proses build.

## 📸 Screenshots
*(Tambahkan screenshot gameplay di sini, misalnya `![Gameplay](img/screenshot-farm.png)`)*

## 🌐 Live Demo
Coba mainkan langsung: [▶️ Main Sekarang](https://makro62.github.io/farm-game)

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
   *Atau gunakan ekstensi Live Server di VSCode, atau `npx serve`.*

## 🌐 Kompatibilitas Browser
| Browser | Versi Minimum | Status |
|---------|:------------:|--------|
| Chrome  | 90+          | ✅ Full Support |
| Firefox | 88+          | ✅ Full Support |
| Safari  | 14+          | ✅ Full Support |
| Edge    | 90+          | ✅ Full Support |
| IE      | Semua        | ❌ Tidak didukung |
> **Catatan:** Harus dijalankan via HTTP server, bukan `file://`

## 🐛 Laporkan Bug
Menemukan bug atau memiliki saran fitur? 
[Silakan buka Issue baru](https://github.com/Makro62/farm-game/issues/new).

## 🤝 Kontribusi
Bantuan Anda sangat dihargai! Silakan baca [Panduan Kontribusi (CONTRIBUTING.md)](CONTRIBUTING.md) sebelum memulai.
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

## 📝 Perubahan Terbaru (Refactoring)

### Refactoring Code - [Juni 2024]

#### 1. **crop-system.js** - Refaktor Total
Perubahan utama pada sistem pertanian untuk meningkatkan maintainability dan readability:

**Sebelum:**
- Fungsi `clickPlot()` besar dengan nested if-else kompleks (~80 baris)
- Logic bercampur antara validasi, bisnis logic, dan rendering
- Tidak ada pemisahan concern yang jelas
- Duplikasi kode dalam pengecekan inventory

**Sesudah:**
- ✅ **Modular Function Design**: Memecah fungsi besar menjadi fungsi-fungsi kecil dengan single responsibility
  - `clearGrass()` - Membersihkan rumput dari plot
  - `plantSeed()` - Menanam bibit di plot kosong
  - `waterPlant()` - Menyiram tanaman yang sedang tumbuh
  - `harvestCrop()` - Memanen tanaman yang sudah siap
  - `calculateGrowTime()` - Menghitung waktu tumbuh dengan semua modifier

- ✅ **Helper Functions**: Fungsi utilitas untuk validasi dan reusable logic
  - `isInventoryFull()` - Cek apakah gudang penuh
  - `renderIfNeeded()` - Render UI jika fungsi tersedia

- ✅ **Better Error Handling**: Penambahan null check untuk plot yang tidak ditemukan

- ✅ **JSDoc Documentation**: Setiap fungsi memiliki dokumentasi JSDoc yang jelas

- ✅ **Improved Readability**: Menggunakan switch-case untuk state handling alih-alih nested if-else

- ✅ **DRY Principle**: Menghindari duplikasi kode dengan extracting common logic

**Benefits:**
- Lebih mudah untuk testing unit
- Lebih mudah untuk maintenance dan debugging
- Code lebih readable dan self-documenting
- Mengurangi technical debt

#### 2. **animal-system.js** - Refaktor Total
Perubahan pada sistem hewan untuk konsistensi dengan crop-system:

**Sebelum:**
- Validasi tercampur dengan business logic
- Nama variabel singkat (`a`, `conf`) yang kurang deskriptif
- Movement logic dengan temporary variables yang berlebihan
- Tidak ada separation of concerns

**Sesudah:**
- ✅ **Validation Functions**: Memisahkan validasi ke fungsi khusus
  - `canBuyAnimal()` - Validasi level dan coins untuk membeli hewan
  - `isBarnFull()` - Cek kapasitas kandang
  - `isInventoryFull()` - Cek kapasitas inventory

- ✅ **Descriptive Variable Names**: Mengganti nama variabel singkat dengan yang lebih deskriptif
  - `a` → `animal`
  - `conf` → `config`

- ✅ **Simplified Movement Logic**: Refactor movement calculation tanpa temporary variables

- ✅ **Consistent Pattern**: Menggunakan pattern yang sama dengan crop-system untuk konsistensi

- ✅ **JSDoc Documentation**: Dokumentasi lengkap untuk setiap fungsi

**Benefits:**
- Konsistensi codebase across systems
- Lebih mudah dipahami oleh developer baru
- Reduces cognitive load saat membaca code
- Easier untuk menambahkan fitur baru

#### 3. **config.js** - Penambahan Konstanta
- ✅ Menambahkan `DEFAULT_INVENTORY_CAPACITY` sebagai constant untuk menghindari magic numbers

---

### Prinsip Refactoring yang Diterapkan:

1. **Single Responsibility Principle (SRP)**: Setiap fungsi memiliki satu tanggung jawab
2. **Don't Repeat Yourself (DRY)**: Mengeliminasi duplikasi kode
3. **Keep It Simple, Stupid (KISS)**: Menjaga solusi tetap sederhana
4. **Clean Code**: Memberi nama yang deskriptif, dokumentasi yang jelas
5. **Separation of Concerns**: Memisahkan validation, business logic, dan UI rendering

### Impact:
- **Lines of Code**: 
  - `crop-system.js`: 107 → 229 lines (lebih banyak tapi lebih terstruktur)
  - `animal-system.js`: 118 → 189 lines (lebih readable)
  
- **Maintainability Score**: Significantly improved
- **Testability**: Much easier to write unit tests
- **Onboarding**: Developer baru lebih cepat memahami code

Selamat bersenang-senang dan jadilah petani terkaya! 🌻💰
