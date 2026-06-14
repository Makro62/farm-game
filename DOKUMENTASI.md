# Dokumentasi Code Farm Tycoon (Farm Game)

Dokumen ini berisi penjelasan struktur kode dari proyek **Farm Tycoon**, ide fitur-fitur baru yang bisa ditambahkan, serta saran perbaikan (improvement) untuk kode yang sudah ada.

---

## 📂 1. Penjelasan Struktur Kode

Proyek ini dibangun menggunakan **HTML, CSS, dan Vanilla JavaScript (ES Modules)**. Kode dipisah menjadi beberapa direktori modular agar lebih mudah dibaca dan dikelola.

### 🌐 `index.html` & `css/style.css`
- **`index.html`**: Entry point utama game. Berisi kerangka UI (User Interface) dasar yang dibagi menjadi 3 tab utama:
  1. **Pertanian** (Tab Farm)
  2. **Peternakan** (Tab Animal)
  3. **Kota & Fitur** (Tab Town)
- **`css/style.css`**: File CSS yang mengatur tampilan game (glassmorphism, layout grid, animasi, responsivitas).

### ⚙️ `js/src/` (Logika Utama Game)
Semua logika JavaScript berada di dalam folder ini, dipecah menjadi beberapa kategori:

#### `main.js`
File eksekusi utama yang mengimpor semua modul, melakukan inisialisasi game (memanggil `initGame`), mengatur event keyboard shortcut (seperti `s` untuk save), dan me-render UI awal.

#### `core/` (Inti Game)
- **`game-engine.js`**: Mengelola *game loop* (looping utama) yang berjalan secara terus-menerus menggunakan `requestAnimationFrame` atau interval untuk memicu event berdasarkan waktu.
- **`save-manager.js`**: Mengelola sistem *save/load* data pemain ke `localStorage`.
- **`state.js`**: Tempat penyimpanan data pemain saat ini secara global (uang, level, inventory, stat pertanian).
- **`security.js`**: Menangani perlindungan dasar terhadap manipulasi curang (cheat) oleh pengguna.

#### `data/` (Konfigurasi & Data Statis)
Berisi definisi objek dan data-data dasar yang tidak berubah, seperti:
- **`crops.js`** (Bibit tanaman, waktu panen, harga beli/jual)
- **`animals.js`** (Jenis hewan, hasil produk, waktu produksi)
- **`fishes.js`** (Data ikan, waktu pancing)
- **`buildings.js`** & **`crafting.js`** (Data bangunan dan resep pembuatan makanan/barang)
- **`items.js`** & **`config.js`** (Definisi item inventory dan konfigurasi dasar game)

#### `systems/` (Sistem Mekanik Game)
Sistem-sistem yang memproses logika bisnis dan aksi:
- **`crop-system.js`**: Mengurus penanaman, pertumbuhan, dan panen tanaman.
- **`animal-system.js`**: Logika peternakan (pemberian pakan, pengumpulan telur/susu).
- **`fish-system.js`**: Logika memancing dan peternakan ikan di danau.
- **`economy-system.js`**: Mengatur pembelian, penjualan, kalkulasi harga, dan sistem XP/Level.
- **`quest-system.js`**: Memproses order (pesanan) dan daily quests yang bisa diselesaikan pemain.
- **`weather-system.js`**: Mengacak dan mengelola sistem cuaca yang mempengaruhi kecepatan tumbuh atau bonus hasil.
- **`gnome-system.js`**: Sistem otomatisasi (pekerja kurcaci) yang akan memanen atau bekerja secara idle.
- **`building-system.js`** & **`crafting-system.js`**: Memproses interaksi pemain dengan bangunan dan antrean masak/produksi.

#### `managers/` (Pengelola Global)
- **`audio-manager.js`**: Mengelola efek suara (BGM, sound effect panen, tombol click).
- **`notification-manager.js`**: Mengelola *toast message* dan modal pop-up konfirmasi.
- **`ui-manager.js`**: Mengatur event listener UI dan menghubungkan tombol-tombol dengan sistem.

#### `ui/` (Tampilan / Rendering DOM)
File-file di sini berfungsi mengubah data di `state.js` menjadi elemen HTML visual (DOM manipulation):
- **`farm-ui.js`**: Render petak tanah dan status pertumbuhan tanaman.
- **`shop-ui.js`**: Render daftar toko bibit dan bangunan.
- **`inventory-ui.js`**: Render isi tas/gudang, quest, dan papan pesanan.
- **`building-ui.js`**, **`crafting-ui.js`**, **`core-ui.js`**: Render elemen-elemen spesifik lainnya.

#### `utils/` (Utilitas Tambahan)
- **`helpers.js`**: Fungsi-fungsi pembantu umum (format angka, konversi waktu, dll).

---

## 🚀 2. Fitur yang Bisa Ditambahkan (Ide Pengembangan)

Untuk membuat game lebih seru dan memiliki nilai *replayability* tinggi, fitur-fitur ini bisa ditambahkan:

1. **Sistem Musim (Seasons) 🍂❄️🌸☀️**
   - Tambahkan 4 musim (Spring, Summer, Fall, Winter).
   - Setiap musim memiliki bibit eksklusif yang hanya bisa ditanam di musim tersebut.
   - Pengaruh musim: Winter membuat tanaman tumbuh lebih lama atau butuh efek "Greenhouse".

2. **NPC & Sistem Pertemanan (Friendship) 🧑‍🤝‍🧑**
   - Pemain bisa memberikan hadiah ke karakter NPC di "Town".
   - Jika level pertemanan tinggi, NPC akan memberikan diskon, resep rahasia, atau alat (tools) spesial.

3. **Sistem Pertambangan (Mining) ⛏️**
   - Tambahkan tab "Tambang" di mana pemain bisa menggali batuan (Copper, Iron, Gold).
   - Ore/mineral bisa digunakan untuk *upgrade* alat (cangkul, penyiram air) agar lebih efisien (misal: menyiram 3 kotak sekaligus).

4. **Mini-Game Memancing Interaktif 🎣**
   - Saat ini memancing mungkin hanya berbasis waktu tunggu. Bisa diubah menjadi mini-game interaktif (seperti menahan bar indikator agar ikan tidak lepas).

5. **Kustomisasi Layout Peternakan 🏡**
   - Pemain bisa memindahkan (drag-and-drop) petak tanah, kandang, dan dekorasi sesuka hati, bukan sekadar list yang kaku.

6. **Multiplayer / Leaderboard Global 🏆**
   - Hubungkan game dengan Firebase/Supabase agar pemain bisa melihat pertanian temannya atau memiliki skor leaderboard (uang terbanyak / level tertinggi).

7. **Event Spesial / Festival 🎉**
   - Event yang muncul di hari ke-X (waktu in-game). Pemain bisa mengikuti perlombaan panen terbesar atau hewan tergemuk untuk mendapat koin berlimpah.

---

## 🛠️ 3. Perbaikan & Optimalisasi Code (Refactoring)

Kode saat ini ditulis dengan Vanilla JS. Walaupun struktur folder sudah cukup baik (modular), jika game akan terus dikembangkan menjadi lebih kompleks, berikut hal yang **sebaiknya diperbaiki atau dioptimalkan**:

1. **Gunakan Framework UI (React / Vue / Svelte)**
   - **Masalah:** Saat ini manipulasi tampilan mengandalkan Vanilla JS DOM (membuat elemen dengan `document.createElement` atau menyuntikkan string HTML). Jika data berubah, merender ulang (*re-render*) UI akan berat dan rawan *bug*.
   - **Solusi:** Migrasi ke React, Vue, atau Svelte untuk manajemen state (Reactivity) yang lebih mudah, di mana UI akan langsung berubah sesuai dengan isi `state.js` tanpa harus dipanggil fungsi rendernya secara manual.

2. **Gunakan TypeScript 🟦**
   - **Masalah:** Vanilla JavaScript rentan terhadap *runtime error* (misalnya salah mengetik nama properti `crop.grothTime` yang seharusnya `crop.growthTime`).
   - **Solusi:** Ubah ke TypeScript (`.ts`). Ini akan memastikan tipe data tanaman, sistem uang, dan save file tetap konsisten dan aman dari *bug typo*.

3. **Gunakan Bundler (Vite / Webpack) 📦**
   - **Masalah:** Mengimpor file secara langsung dengan ES Modules di browser bisa membuat banyak *network request* kecil saat game di-load pertama kali.
   - **Solusi:** Gunakan bundler seperti **Vite** untuk mengompres (minify) kode saat rilis ke production (membuat loading game instan dan menyembunyikan source code dari end-user).

4. **Pisahkan File CSS (Modular CSS / SASS) 🎨**
   - **Masalah:** File `style.css` ukurannya cukup besar (21 KB++) dan mencampur styling *Farm*, *Town*, dan elemen dasar secara bersamaan.
   - **Solusi:** Pisahkan CSS per komponen (misal `farm.css`, `inventory.css`, `modal.css`) atau gunakan *CSS Preprocessor* (SASS) atau framework CSS pendukung lainnya.

5. **Manajemen *State* Terpusat yang Lebih Baik 🧠**
   - Daripada menaruh semuanya pada global object `S` atau `window.GameState`, gunakan arsitektur state management (seperti pola Redux/Zustand) yang akan secara otomatis membroadcast "event" saat ada data berubah. Ini membuat sistem seperti *Quest* dan *Achievements* bisa mendengarkan perubahan uang atau panen tanpa perlu dicek satu-per-satu di `game-engine.js`.

6. **Meningkatkan Keamanan Save File (Anti-Cheat) 🔒**
   - Saat ini file diletakkan di `localStorage`. Pemain awam bisa dengan mudah mengubah localStorage untuk menambah Uang/Koin. Bisa ditambahkan mekanisme enkripsi string (base64 + salt/hashing) pada file `save-manager.js` agar data tidak mudah di-edit.
