# 🔍 Audit & Daftar Perbaikan – `Makro62/farm-game`

**Repo:** https://github.com/Makro62/farm-game
**Tanggal Audit:** Juni 2025
**Status Proyek:** Active Development — Vanilla JS ES Modules

> Dokumen ini merinci **semua hal yang perlu diperbaiki, ditingkatkan, dan ditambahkan** pada repo Farm Tycoon, dikelompokkan berdasarkan kategori prioritas.

---

## 📋 Daftar Isi

- [Ringkasan Eksekutif](#-ringkasan-eksekutif)
- [🔴 KRITIS – Harus Diperbaiki](#-kritis--harus-diperbaiki-sekarang)
- [🟠 TINGGI – Penting untuk Kualitas](#-tinggi--penting-untuk-kualitas)
- [🟡 SEDANG – Peningkatan Signifikan](#-sedang--peningkatan-signifikan)
- [🟢 RENDAH – Nice to Have](#-rendah--nice-to-have)
- [📁 Struktur File yang Perlu Diubah](#-struktur-file-yang-perlu-diubah)
- [🏗️ Arsitektur & Refactoring](#️-arsitektur--refactoring)
- [🎮 Fitur Game yang Belum Lengkap](#-fitur-game-yang-belum-lengkap)
- [🐛 Potensi Bug yang Perlu Dicek](#-potensi-bug-yang-perlu-dicek)
- [📱 UI & Aksesibilitas](#-ui--aksesibilitas)
- [🔒 Keamanan & Data](#-keamanan--data)
- [🚀 DevOps & Deployment](#-devops--deployment)
- [Roadmap Perbaikan](#️-roadmap-perbaikan)

---

## 📊 Ringkasan Eksekutif

| Kategori | Jumlah Temuan | Prioritas |
|----------|:-------------:|-----------|
| 🔴 Kritis | 5 | Perbaiki sekarang |
| 🟠 Tinggi | 8 | Sprint berikutnya |
| 🟡 Sedang | 10 | Backlog |
| 🟢 Rendah | 6 | Future |
| **Total** | **29** | |

**Kondisi umum repo:** Struktur folder sudah sangat baik dan modular. Fitur game cukup kaya (ternak, crafting, cuaca, kurcaci, dll). Namun ada beberapa celah kritis di area keamanan, UX, dan kelengkapan fitur yang perlu segera ditangani.

---

## 🔴 KRITIS – Harus Diperbaiki Sekarang

### 1. ❌ Fitur "Topup Uang (Cheat)" Masih Aktif di Produksi

**Lokasi:** `index.html` baris 170–176 (Tab Kota & Fitur)

```html
<!-- KODE BERMASALAH INI MASIH ADA DI index.html -->
<div class="section-title" style="margin-top:20px;">💰 Topup Uang (Cheat)</div>
<div style="display:flex; gap:8px;">
    <input type="number" id="cheat-money-input" ...>
    <button class="act-btn primary" id="btn-cheat-money">Tambah</button>
</div>
```

**Masalah:** Fitur cheat uang ter-expose langsung di UI publik. Ini menghancurkan keseimbangan game bagi semua pemain dan tidak boleh ada di versi rilis.

**Solusi:**
```javascript
// Opsi 1: Hapus total dari HTML & JS
// Opsi 2: Sembunyikan di balik kode rahasia (Konami Code, dll)
// Opsi 3: Aktifkan hanya di mode dev lewat environment variable / URL param
if (new URLSearchParams(location.search).has('dev')) {
    document.getElementById('cheat-section').style.display = 'block';
}
```

**Tindakan:** Hapus elemen HTML tersebut dan handler JS-nya dari `ui-manager.js` / `economy-system.js`.

---

### 2. ❌ Tidak Ada `LICENSE` File

**Lokasi:** Root repo (hanya ada `.gitignore`, `README.md`, `DOKUMENTASI.md`)

**Masalah:** Tanpa file `LICENSE`, secara hukum seluruh kode berstatus "All Rights Reserved". Tidak ada orang yang boleh menggunakan, menyalin, atau berkontribusi secara legal meski repo bersifat publik.

**Solusi:** Buat file `LICENSE` di root repo.

```
# Untuk proyek edukasi/portofolio, pilih salah satu:
MIT License         → Paling bebas, cocok untuk portfolio
Apache 2.0          → Lebih formal, ada perlindungan paten
GNU GPL v3          → Mengharuskan fork tetap open-source
```

**Cara cepat:** Di GitHub → Settings → klik "Add license" → pilih MIT.

---

### 3. ❌ Tidak Ada `CONTRIBUTING.md`

**Masalah:** Tidak ada panduan bagi kontributor. Jika ada orang ingin membantu, mereka tidak tahu: cara setup lokal, konvensi penamaan, cara submit PR, atau standar commit message.

**Solusi:** Buat file `CONTRIBUTING.md`:

```markdown
# Contributing to Farm Tycoon

## Setup Lokal
1. Clone repo
2. Jalankan: `python3 -m http.server 8000`
3. Buka: `http://localhost:8000`

## Konvensi
- Commit: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`
- Branch: `feature/nama-fitur`, `fix/nama-bug`
- Setiap PR harus menyertakan deskripsi perubahan

## Standar Kode
- Gunakan JSDoc untuk setiap fungsi publik
- Tidak ada magic number — taruh di `config.js`
- Ikuti pola yang ada di `crop-system.js` (post-refactor)
```

---

### 4. ❌ Tidak Ada Penanganan Error di Game Loop

**Lokasi:** `js/src/core/game-engine.js`

**Masalah:** Game loop berbasis `requestAnimationFrame` atau `setInterval`. Jika terjadi error di tengah loop (misalnya `undefined` property dari state yang corrupt), **seluruh game akan freeze tanpa pesan apapun ke user.**

**Solusi:**
```javascript
// SEBELUM (rawan crash total)
function gameLoop(timestamp) {
    updateWeather(timestamp);
    updateCrops(timestamp);
    updateAnimals(timestamp);
    requestAnimationFrame(gameLoop);
}

// SESUDAH (dengan error recovery)
function gameLoop(timestamp) {
    try {
        updateWeather(timestamp);
        updateCrops(timestamp);
        updateAnimals(timestamp);
    } catch (err) {
        console.error('[GameLoop Error]', err);
        showNotification('⚠️ Terjadi error. Coba refresh halaman.', 'error');
        // Jangan stop loop — isolate error agar game tetap jalan
    }
    requestAnimationFrame(gameLoop);
}
```

---

### 5. ❌ Save Game Tidak Ada Validasi Versi (Schema Migration)

**Lokasi:** `js/src/core/save-manager.js`

**Masalah:** Jika struktur `state.js` berubah (tambah field, ganti nama key) setelah pemain sudah menyimpan data lama di localStorage, game akan **crash saat load** karena data lama tidak punya field baru.

**Solusi:** Tambah sistem versi pada save file:

```javascript
const SAVE_VERSION = 3; // Naikkan setiap ada perubahan struktur state

function saveGame(state) {
    const saveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        data: state
    };
    localStorage.setItem('farmTycoonSave', JSON.stringify(saveData));
}

function loadGame() {
    const raw = localStorage.getItem('farmTycoonSave');
    if (!raw) return null;

    const save = JSON.parse(raw);

    // Migrasi otomatis dari versi lama
    if (save.version < SAVE_VERSION) {
        return migrateSave(save); // Fungsi yang handle upgrade bertahap
    }

    return save.data;
}

function migrateSave(oldSave) {
    if (oldSave.version < 2) {
        // Tambahkan field baru dengan nilai default
        oldSave.data.prestige = oldSave.data.prestige ?? 0;
    }
    if (oldSave.version < 3) {
        oldSave.data.gnomeLevel = oldSave.data.gnomeLevel ?? 1;
    }
    return oldSave.data;
}
```

---

## 🟠 TINGGI – Penting untuk Kualitas

### 6. ⚠️ README Tidak Menyebutkan Cara Berkontribusi / Issue

**Lokasi:** `README.md`

**Masalah:** README bagus tapi tidak ada:
- Badge status (build passing, license, last commit)
- Screenshot atau GIF gameplay
- Link ke demo live (GitHub Pages)
- Bagian "Known Issues" atau "Bug Report"
- Cara submit bug

**Tambahkan di README:**

```markdown
## 🖼️ Screenshot
![Farm Tycoon Gameplay](img/screenshot.png)

## 🌐 Demo Live
Coba langsung: [https://makro62.github.io/farm-game](https://makro62.github.io/farm-game)

## 🐛 Laporkan Bug
Temukan bug? [Buka Issue baru](https://github.com/Makro62/farm-game/issues/new)

## 📸 Screenshots
(Tambahkan 2-3 screenshot gameplay di sini)
```

---

### 7. ⚠️ Tidak Ada GitHub Pages / Demo Publik

**Masalah:** Game ini 100% static (HTML/CSS/JS), tapi tidak ada deployment. Orang yang melihat repo harus clone dulu untuk mencoba — ini barrier yang besar.

**Solusi (2 menit setup):**

1. Buka Settings repo → Pages
2. Source: `Deploy from branch` → Branch: `main` → Folder: `/ (root)`
3. Save → game otomatis tersedia di `https://makro62.github.io/farm-game`

**Tambahkan di README:**
```markdown
## 🌐 Live Demo
[▶️ Main Sekarang](https://makro62.github.io/farm-game)
```

---

### 8. ⚠️ `index.html` Menggunakan Inline Style Berlebihan

**Lokasi:** `index.html` (hampir semua div)

**Masalah:** Hampir setiap `<div>` di `index.html` menggunakan `style="..."` inline yang panjang. Ini melanggar separation of concerns dan membuat CSS tidak bisa di-override atau di-theme dengan mudah.

**Contoh masalah:**
```html
<!-- BURUK — style inline tersebar di mana-mana -->
<div id="right-panel" class="glass-panel" style="width: 280px; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; max-height: calc(100vh - 140px);">
```

**Solusi:**
```html
<!-- BAIK — class semantik, style di CSS -->
<div id="right-panel" class="glass-panel right-panel">
```
```css
/* css/style.css */
.right-panel {
    width: 280px;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: calc(100vh - 140px);
}
```

**Pekerjaan:** Audit seluruh `index.html` dan pindahkan semua inline style ke `style.css`.

---

### 9. ⚠️ Tidak Ada `.env` atau Config untuk Mode Dev vs Prod

**Masalah:** Tidak ada cara membedakan environment dev dan production. Fitur debug (cheat money, console.log berlebihan) ikut terbawa ke produksi.

**Solusi sederhana (tanpa build tool):**

Buat file `js/src/data/config.js` dengan flag:
```javascript
// js/src/data/config.js
export const CONFIG = {
    DEV_MODE: false,           // Ganti ke true saat development lokal
    SAVE_VERSION: 3,
    AUTO_SAVE_INTERVAL: 30000, // ms
    GROWTH_SPEED_MULTIPLIER: 1, // Set 10 di dev untuk test cepat
    // ... konfigurasi lain
};
```

---

### 10. ⚠️ Commit Message Tidak Konsisten

**Masalah berdasarkan history 22 commits:** Berdasarkan pola pengembangan yang terlihat, kemungkinan besar commit message tidak mengikuti standar (`feat:`, `fix:`, dll). Ini mempersulit tracking perubahan dan changelog otomatis.

**Solusi:** Terapkan [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: tambah sistem kurcaci untuk auto-harvest
fix: perbaiki bug tanaman tidak tumbuh saat hujan deras  
refactor: pecah clickPlot() menjadi fungsi-fungsi kecil
docs: update README dengan cara install
style: format ulang crop-system.js
cheat: (JANGAN commit ini ke main!)
```

**Tools:** Pasang `commitlint` atau gunakan template commit:
```bash
git config commit.template .gitmessage
```

---

### 11. ⚠️ Tidak Ada File `.gitignore` yang Lengkap

**Masalah:** File `.gitignore` ada tapi isinya perlu dicek. Folder `.vscode` sudah di-commit ke repo (terlihat dari file tree). Ini seharusnya di-ignore.

**Perbaiki `.gitignore`:**
```gitignore
# Editor
.vscode/
.idea/
*.sublime-project

# OS
.DS_Store
Thumbs.db

# Dev artifacts
*.log
node_modules/
dist/

# Jika pakai bundler nanti
.env
.env.local
```

**Tindakan:** Hapus folder `.vscode` dari repo:
```bash
git rm -r --cached .vscode/
git commit -m "chore: remove .vscode from tracking"
```

---

### 12. ⚠️ Tidak Ada `CHANGELOG.md`

**Masalah:** Sudah ada 22 commit dan refactoring besar, tapi tidak ada changelog. Pengguna tidak bisa tahu apa yang berubah antar versi.

**Buat `CHANGELOG.md`:**
```markdown
# Changelog

## [Unreleased]

## [1.1.0] - 2025-06
### Changed
- Refactor `crop-system.js`: pecah `clickPlot()` menjadi fungsi modular
- Refactor `animal-system.js`: perbaiki nama variabel + validasi terpisah
- Tambah `DEFAULT_INVENTORY_CAPACITY` di config.js

## [1.0.0] - 2025-05
### Added
- Sistem pertanian dasar (tanam, siram, panen)
- Sistem peternakan (Ayam, Sapi, Lebah)
- Dapur produksi (crafting)
- Papan pesanan (order board)
- Sistem cuaca dinamis
- Kurcaci pekerja (auto-farm)
- Dekorasi & prestige
- Auto-save dengan SHA-256 hash
```

---

### 13. ⚠️ CSS Terlalu Monolitik (`style.css` 21KB+)

**Lokasi:** `css/style.css`

**Masalah:** Satu file CSS besar mencampur semua komponen. Susah di-maintain, susah debug, dan tidak bisa di-lazy load.

**Solusi modular:**
```
css/
├── base.css          → Reset, variabel CSS, typography
├── layout.css        → Grid, flexbox, tab system
├── components/
│   ├── topbar.css
│   ├── sidebar.css
│   ├── farm-grid.css
│   ├── modal.css
│   ├── toast.css
│   └── shop.css
├── animations.css    → Efek cuaca, partikel, hover
└── responsive.css    → Media queries
```

Atau minimal bagi jadi 3 file:
```html
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/animations.css">
```

---

## 🟡 SEDANG – Peningkatan Signifikan

### 14. Tidak Ada Loading Screen

**Masalah:** Game menggunakan ES Modules. Browser harus fetch dan parse 15+ file JS sebelum game bisa dimulai. Di koneksi lambat, user melihat halaman kosong selama beberapa detik.

**Solusi:**
```html
<!-- Di index.html, tambahkan sebelum </body> -->
<div id="loading-screen">
    <div class="loading-logo">🌾</div>
    <div class="loading-text">Memuat Farm Tycoon...</div>
    <div class="loading-bar"><div id="loading-progress"></div></div>
</div>
```
```javascript
// Di main.js, paling akhir setelah initGame()
document.getElementById('loading-screen').style.display = 'none';
```

---

### 15. Tidak Ada Keyboard Shortcut yang Didokumentasikan di UI

**Masalah:** README menyebutkan shortcut `1–6`, `S`, `D`, `Esc`, tapi tidak ada hint di dalam UI game sendiri. User yang tidak baca README tidak akan tahu.

**Solusi:** Tambahkan tooltip atau panel "?" di topbar:
```html
<button id="btn-help" title="Shortcut Keyboard">⌨️</button>
```
```
Saat diklik, tampilkan modal:
1-6    : Pilih bibit
S      : Save manual
D      : Klaim daily reward
Esc    : Tutup dialog
```

---

### 16. Sistem Quest Harian Tidak Jelas Kapan Reset

**Masalah:** Quest harian ada, tapi tidak terlihat jelas di UI kapan quest reset (jam berapa? setelah berapa menit in-game?). User tidak tahu apakah harus menunggu atau bisa refresh.

**Solusi:**
```javascript
// Tambahkan countdown timer di UI quest
<div class="quest-reset-timer">
    Reset dalam: <span id="quest-timer">23:45:10</span>
</div>
```
Gunakan `localStorage` untuk simpan `lastQuestResetDate` dan hitung countdown.

---

### 17. Tidak Ada Konfirmasi Sebelum `Reset Game`

**Lokasi:** `index.html` baris 61, button `btn-reset-game`

**Masalah:** Tombol "🔄 Reset" ada di topbar dekat tombol Save. Satu klik salah = **seluruh progress hilang permanen**. Modal konfirmasi ada di HTML tapi perlu dipastikan selalu muncul untuk aksi ini.

**Solusi — pastikan di handler JS:**
```javascript
document.getElementById('btn-reset-game').addEventListener('click', () => {
    showModal({
        title: '⚠️ Reset Game',
        message: 'Semua progress AKAN DIHAPUS PERMANEN. Ketik "RESET" untuk konfirmasi.',
        requireInput: 'RESET',  // User harus ketik ini
        onConfirm: () => resetGame()
    });
});
```

---

### 18. Tidak Ada Indikator Progress Bangunan

**Masalah:** Setelah membeli bangunan (Silo, Kandang, dll), tidak jelas apa dampaknya saat ini vs setelah upgrade. User perlu menebak-nebak manfaat dari tiap level bangunan.

**Solusi:** Tampilkan stats bangunan secara eksplisit:
```
🏚️ Kandang — Level 2
Kapasitas: 4/6 hewan
Upgrade ke Lv3: 500💰 → Kapasitas 8 hewan
```

---

### 19. Sistem Crafting Tidak Ada Estimasi Waktu Selesai

**Masalah:** Di antrian crafting, tidak ada indikator berapa lama lagi item selesai dimasak/diproduksi. User harus menebak.

**Solusi:**
```
🍳 Antrian Dapur:
  [Sup Wortel]  ████░░░░░░ 2:30 lagi
  [Tepung]      Menunggu...
```

---

### 20. Tidak Ada Feedback Visual Saat Klik Plot yang Tidak Valid

**Masalah:** Saat user klik petak dengan aksi yang tidak valid (misal tanam di tanah yang sudah ada tanaman), hanya muncul toast notifikasi. Petak tidak memberikan visual feedback (shake, flash merah, dll).

**Solusi:**
```javascript
function shakeElement(el) {
    el.classList.add('shake-error');
    setTimeout(() => el.classList.remove('shake-error'), 500);
}
```
```css
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
}
.shake-error { animation: shake 0.4s ease; border-color: #f44336 !important; }
```

---

### 21. Kurcaci (Auto-Farm) Tidak Ada Visual Gerak yang Jelas

**Masalah:** Sistem kurcaci ada, tapi tombolnya tersembunyi (`display:none` awal) dan tidak jelas apa yang sedang dilakukan kurcaci secara visual.

**Solusi:** Tambahkan status panel kurcaci:
```
🧙‍♂️ Kurcaci #1 — [Aktif]
  Sedang: Memanen Jagung di petak C3
  Selesai dalam: 5 detik

🧙‍♂️ Kurcaci #2 — [Idle]
  Menunggu tugas...
```

---

### 22. Tidak Ada System Requirements / Browser Support di README

**Masalah:** Game pakai ES Modules dan Web Crypto API (SHA-256). Tidak semua browser support. README tidak menyebutkan ini.

**Tambahkan di README:**
```markdown
## 🌐 Kompatibilitas Browser
| Browser | Versi Minimum | Status |
|---------|:------------:|--------|
| Chrome  | 90+          | ✅ Full Support |
| Firefox | 88+          | ✅ Full Support |
| Safari  | 14+          | ✅ Full Support |
| Edge    | 90+          | ✅ Full Support |
| IE      | Semua        | ❌ Tidak didukung |

> **Catatan:** Harus dijalankan via HTTP server, bukan `file://`
```

---

### 23. Sistem Prestige Tidak Dijelaskan di UI

**Masalah:** Ada stat "✨ Prestige: 0" di topbar, tapi tidak ada tooltip atau penjelasan: apa itu prestige, bagaimana mendapatkannya, apa bonusnya.

**Solusi:** Tambahkan tooltip atau halaman info:
```html
<div class="stat-chip" title="Bonus harga jual +1% per Prestige Point. Dapatkan dari dekorasi!">
    ✨ Prestige: <span id="prestige-val">0</span> ℹ️
</div>
```

---

## 🟢 RENDAH – Nice to Have

### 24. Tidak Ada Favicon

**Masalah:** Tab browser menampilkan ikon default. Kesempatan branding yang mudah dan gratis terlewat.

**Solusi:**
```html
<!-- Di <head> index.html -->
<link rel="icon" href="img/favicon.ico" type="image/x-icon">
<!-- Atau pakai emoji sebagai favicon (modern browsers) -->
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌾</text></svg>">
```

---

### 25. Tidak Ada `meta description` untuk SEO

**Lokasi:** `index.html` `<head>`

**Solusi:**
```html
<meta name="description" content="Farm Tycoon - Game simulasi pertanian berbasis web. Tanam, ternak, craft, dan bangun kebun impianmu!">
<meta property="og:title" content="🌾 Farm Tycoon">
<meta property="og:description" content="Game farming web dengan sistem crafting, peternakan, dan kurcaci pekerja!">
<meta property="og:image" content="img/og-preview.png">
```

---

### 26. Tab Browser Menampilkan Judul Statis

**Masalah:** `<title>🌾 Farm Tycoon</title>` tidak berubah. Bisa dibuat dinamis untuk meningkatkan engagement.

**Solusi:**
```javascript
// Update judul setiap kali ada tanaman siap panen
function updatePageTitle(readyCount) {
    document.title = readyCount > 0
        ? `(${readyCount}) 🌽 Farm Tycoon — Siap Panen!`
        : '🌾 Farm Tycoon';
}
```

---

### 27. Tidak Ada Animasi Transisi antar Tab

**Masalah:** Switching antara Tab Pertanian, Peternakan, dan Kota langsung tanpa animasi. Terasa "kasar".

**Solusi:**
```css
.tab-pane {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.tab-pane.active {
    opacity: 1;
    transform: translateY(0);
}
```

---

### 28. Folder `img/` Tidak Ada Isinya yang Didokumentasikan

**Masalah:** Folder `img/` ada di repo tapi tidak jelas apa isinya. README tidak menyebutkan asset apa saja yang digunakan.

**Tindakan:**
- Pastikan semua gambar yang di-reference di CSS/JS sudah ada di `img/`
- Tambahkan `img/README.md` yang daftar semua asset
- Tambahkan screenshot gameplay untuk README utama

---

### 29. Tidak Ada Unit Test

**Masalah:** Logika game (crop-system, economy, save-manager) tidak punya test. Bug bisa masuk tanpa ketahuan.

**Solusi jangka panjang:** Tambahkan testing dengan Vitest (ringan, tanpa bundler):

```bash
npm init -y
npm install --save-dev vitest
```

```javascript
// js/tests/crop-system.test.js
import { describe, it, expect } from 'vitest';
import { calculateGrowTime } from '../src/systems/crop-system.js';

describe('calculateGrowTime', () => {
    it('returns base time without modifiers', () => {
        expect(calculateGrowTime('wortel', {})).toBe(60);
    });
    it('reduces time when watered', () => {
        expect(calculateGrowTime('wortel', { watered: true })).toBeLessThan(60);
    });
});
```

---

## 📁 Struktur File yang Perlu Diubah

### File yang Perlu Ditambahkan

```
farm-game/
├── LICENSE                    ← 🔴 KRITIS - Belum ada
├── CONTRIBUTING.md            ← 🔴 KRITIS - Belum ada
├── CHANGELOG.md               ← 🟠 TINGGI - Belum ada
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md      ← 🟡 SEDANG - Template bug report
│   │   └── feature_request.md ← 🟡 SEDANG - Template feature request
│   └── PULL_REQUEST_TEMPLATE.md ← 🟡 SEDANG
├── img/
│   ├── screenshot-farm.png    ← 🟠 TINGGI - Untuk README
│   ├── screenshot-animal.png  ← 🟠 TINGGI
│   └── favicon.ico            ← 🟢 RENDAH
└── docs/
    ├── GAMEPLAY.md            ← 🟡 SEDANG - Panduan main
    └── API.md                 ← 🟡 SEDANG - Dokumentasi sistem
```

### File yang Perlu Dimodifikasi

```
├── .gitignore                 ← 🟠 Tambahkan .vscode/, hapus folder .vscode dari tracking
├── README.md                  ← 🟠 Tambah screenshot, live demo, kompatibilitas, badge
├── DOKUMENTASI.md             ← 🟡 Sudah baik, tambahkan contoh kode lebih konkret
├── index.html                 ← 🔴 Hapus cheat money, pindahkan inline style ke CSS
└── css/style.css              ← 🟠 Pecah jadi beberapa file modular
```

---

## 🏗️ Arsitektur & Refactoring

### State Management — Masalah Potensial

**File:** `js/src/core/state.js`

Berdasarkan pola yang terlihat, state global disimpan sebagai plain object. Ini berisiko karena:

```javascript
// RAWAN — mutasi langsung di mana saja
state.coins += 100;  // Bisa dipanggil dari mana saja
state.plots[3].crop = 'wortel'; // Tidak ada validasi

// LEBIH BAIK — gunakan fungsi setter
function addCoins(amount) {
    if (amount < 0 && state.coins + amount < 0) {
        throw new Error('Koin tidak boleh negatif');
    }
    state.coins += amount;
    triggerEvent('coinsChanged', state.coins);
}
```

Pertimbangkan pola **Observer/EventEmitter** agar sistem seperti Quest otomatis trigger saat coins berubah tanpa perlu di-check manual di `game-engine.js`.

---

### Modularisasi `ui-manager.js`

`ui-manager.js` kemungkinan sudah sangat besar karena menangani event listener untuk seluruh game. Pertimbangkan pecah menjadi:

```
managers/
├── ui-manager.js          → Hanya koordinator utama
├── farm-manager.js        → Event listener khusus tab farm
├── animal-manager.js      → Event listener khusus tab hewan
└── town-manager.js        → Event listener khusus tab kota
```

---

### Rekomendasi Jangka Panjang: Migrasi ke Vite

Saat ini ES Modules di browser membuat banyak HTTP request kecil. Dengan Vite, semua file JS digabung menjadi satu bundle optimized:

```bash
npm create vite@latest farm-game-v2 -- --template vanilla
# Pindahkan file ke struktur Vite
npm run build  # Output ke dist/ — siap deploy
npm run dev    # HMR, jauh lebih cepat dari python server
```

Keuntungan:
- Load time jauh lebih cepat (single bundle vs 15+ file)
- Hot Module Replacement saat development
- Build optimization otomatis
- Siap pakai TypeScript kapan pun mau migrasi

---

## 🎮 Fitur Game yang Belum Lengkap

Berdasarkan README dan DOKUMENTASI.md, fitur-fitur ini **disebutkan tapi belum tentu diimplementasi penuh:**

| Fitur | Status | Catatan |
|-------|--------|---------|
| Sistem Musim | 🔲 Belum ada | Disebutkan di DOKUMENTASI.md sebagai "Ide" |
| Leaderboard Online | 🔲 Belum ada | Perlu backend/Firebase |
| NPC & Sistem Pertemanan | 🔲 Belum ada | Ide pengembangan |
| Mini-game Memancing Interaktif | ⚠️ Mungkin sederhana | Belum interaktif |
| Kustomisasi Layout Drag-Drop | 🔲 Belum ada | Masih list statis |
| Event Festival | 🔲 Belum ada | Ide pengembangan |
| Upgrade Alat (dari Ore) | 🔲 Belum ada | Disebutkan sebagai ide |
| Multiple Gnome | ❓ Perlu dicek | Ada 2 tombol gnome (farm & animal) |
| Achievement System | ⚠️ Parsial | Counter ada tapi sistem lengkap? |

**Rekomendasi:** Buat GitHub Issues untuk setiap fitur ini dengan label `enhancement` agar trackable.

---

## 🐛 Potensi Bug yang Perlu Dicek

Berdasarkan analisis kode HTML dan pola arsitektur:

### Bug 1 — Race Condition di Auto-Save + Game Loop

Jika `auto-save` (setiap X detik) berjalan bersamaan dengan `game-loop` yang sedang update state, ada kemungkinan data tersimpan dalam kondisi **partial/inconsistent**.

**Cek di:** `save-manager.js` + `game-engine.js`

```javascript
// Solusi: Gunakan flag atau simpan snapshot state
let isSaving = false;

async function saveGame() {
    if (isSaving) return;
    isSaving = true;
    const snapshot = JSON.parse(JSON.stringify(state)); // Deep copy
    await persistToStorage(snapshot);
    isSaving = false;
}
```

---

### Bug 2 — Memory Leak di `setInterval` Hewan

Setiap hewan yang dibeli kemungkinan membuat `setInterval` baru. Jika hewan dijual atau game di-reset, interval lama **tidak di-clear**.

**Cek di:** `animal-system.js`

```javascript
// BERMASALAH
function buyAnimal(type) {
    const animal = { ...ANIMALS[type] };
    animal.intervalId = setInterval(() => produceItem(animal), animal.productionTime);
    state.animals.push(animal);
}

// Saat reset game atau jual hewan, WAJIB:
function sellAnimal(animal) {
    clearInterval(animal.intervalId); // ← Jangan lupa ini!
    state.animals = state.animals.filter(a => a.id !== animal.id);
}
```

---

### Bug 3 — SHA-256 Anti-Cheat Bisa Bypass

Sistem keamanan SHA-256 di `security.js` mungkin hanya meng-hash data save, tapi jika logika hash bisa dibaca dari source code (karena JS tidak di-obfuscate), pemain teknis bisa generate hash yang valid untuk data yang dimanipulasi.

**Rekomendasi:** Ini adalah limitasi dari client-side security. Untuk game single-player, cukup beri peringatan "data terdeteksi dimodifikasi" tanpa block total. Untuk true anti-cheat, perlu server-side validation.

---

### Bug 4 — Petak yang Sedang Tumbuh bisa Hilang Saat Tab Tidak Aktif

Browser mengurangi frekuensi `requestAnimationFrame` dan `setInterval` saat tab tidak aktif (Page Visibility API). Tanaman yang seharusnya selesai tumbuh dalam 5 menit bisa molor.

**Solusi:**
```javascript
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Hitung waktu yang terlewat sejak tab di-hide
        const elapsed = Date.now() - state.lastActiveTime;
        catchUpGrowth(elapsed); // Proses semua pertumbuhan yang tertunda
    } else {
        state.lastActiveTime = Date.now();
    }
});
```

---

## 📱 UI & Aksesibilitas

### Masalah Aksesibilitas

| Masalah | Lokasi | Solusi |
|---------|--------|--------|
| Tombol tanpa `aria-label` | Semua `<button>` dengan emoji | Tambahkan `aria-label="Tanam bibit jagung"` |
| Grid farm tidak bisa diakses keyboard | `#farm-grid` | Tambahkan `tabindex="0"` dan `role="button"` pada setiap plot |
| Tidak ada skip navigation | `index.html` | Tambahkan `<a href="#farm-grid" class="skip-link">Skip to game</a>` |
| Kontras warna belum dicek | `css/style.css` | Gunakan https://webaim.org/resources/contrastchecker/ |
| Efek hujan CSS mungkin mengganggu | `.rain-overlay` | Hormati `prefers-reduced-motion` |

```css
/* Hormati preferensi aksesibilitas */
@media (prefers-reduced-motion: reduce) {
    .rain-overlay,
    .weather-overlay,
    * {
        animation: none !important;
        transition: none !important;
    }
}
```

### Responsif Mobile

Cek apakah game playable di mobile (layar < 768px). Layout 3 kolom (sidebar + farm + right-panel) kemungkinan terlalu sempit di HP. Pertimbangkan:
- Di mobile: collapse sidebar menjadi bottom sheet atau drawer
- Farm grid: ukuran plot minimal 44×44px (standar touch target)
- Topbar: gunakan hamburger menu untuk stat yang overflow

---

## 🔒 Keamanan & Data

### Ringkasan Isu Keamanan

| Isu | Risiko | Solusi |
|-----|--------|--------|
| Cheat money UI publik | 🔴 Tinggi | Hapus dari produksi |
| Tidak ada schema migration | 🔴 Tinggi | Tambah versi save + migrator |
| JS source code terbuka | 🟡 Sedang | Acceptable untuk open-source |
| localStorage tidak terenkripsi | 🟡 Sedang | SHA-256 hash sudah ada, pertahankan |
| Tidak ada rate limiting aksi | 🟢 Rendah | Acceptable untuk single-player |

---

## 🚀 DevOps & Deployment

### Checklist yang Belum Ada

```
[ ] GitHub Pages setup (deploy otomatis)
[ ] GitHub Actions workflow untuk auto-deploy ke Pages
[ ] Branch protection (require PR review sebelum merge ke main)
[ ] Issue templates (bug report, feature request)
[ ] PR template
[ ] Dependabot (jika nanti pakai npm dependencies)
```

### Contoh GitHub Actions untuk Auto-Deploy

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy ke GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'  # Upload seluruh root (karena static site)
      - id: deployment
        uses: actions/deploy-pages@v4
```

Setelah ini, setiap push ke `main` otomatis deploy ke `https://makro62.github.io/farm-game`.

---

## 🗺️ Roadmap Perbaikan

Urutan pengerjaan yang direkomendasikan berdasarkan impact vs effort:

### Sprint 1 — Kritis (1–2 hari)
```
[ ] 1. Hapus fitur cheat money dari index.html + JS handler
[ ] 2. Tambah file LICENSE (MIT)
[ ] 3. Hapus .vscode dari git tracking + update .gitignore
[ ] 4. Setup GitHub Pages (deploy ke makro62.github.io/farm-game)
[ ] 5. Tambah error recovery di game loop
[ ] 6. Tambah schema versioning di save-manager.js
```

### Sprint 2 — Kualitas (3–5 hari)
```
[ ] 7. Buat CONTRIBUTING.md
[ ] 8. Buat CHANGELOG.md
[ ] 9. Ambil screenshot gameplay → tambahkan ke README
[ ] 10. Tambahkan Live Demo link di README
[ ] 11. Pindahkan semua inline style dari index.html ke style.css
[ ] 12. Update README: badge, kompatibilitas browser, cara report bug
```

### Sprint 3 — Peningkatan UX (1–2 minggu)
```
[ ] 13. Buat loading screen saat startup
[ ] 14. Tambahkan progress timer di crafting queue
[ ] 15. Perbaiki feedback visual petak (shake saat aksi invalid)
[ ] 16. Tambahkan countdown reset quest harian
[ ] 17. Dokumen prestige system di UI (tooltip/info)
[ ] 18. Keyboard shortcut hint di UI
[ ] 19. Cek memory leak interval hewan
[ ] 20. Handle Page Visibility API untuk pertumbuhan saat tab tidak aktif
```

### Sprint 4 — Skalabilitas (jangka panjang)
```
[ ] 21. Setup Vite bundler
[ ] 22. Migrasi ke TypeScript
[ ] 23. Buat unit tests dengan Vitest
[ ] 24. CSS modularisasi per komponen
[ ] 25. Tambah GitHub Actions CI/CD
[ ] 26. Issue templates di .github/
[ ] 27. Implementasi Observer pattern untuk state management
```

---

## 📝 Template File yang Perlu Dibuat

### `LICENSE` (MIT)
```
MIT License

Copyright (c) 2025 Makro62

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

### `.github/ISSUE_TEMPLATE/bug_report.md`
```markdown
---
name: 🐛 Bug Report
about: Laporkan bug atau perilaku yang tidak diharapkan
labels: bug
---

## Deskripsi Bug
Jelaskan apa yang terjadi secara singkat dan jelas.

## Langkah Reproduksi
1. Buka tab '...'
2. Klik tombol '...'
3. Lihat error

## Perilaku yang Diharapkan
Apa yang seharusnya terjadi?

## Screenshot
Jika memungkinkan, tambahkan screenshot.

## Environment
- Browser: [Chrome 120 / Firefox 121 / Safari 17]
- OS: [Windows / macOS / Android / iOS]
- Versi Game: [cek di pojok kanan bawah]

## Informasi Tambahan
```

---

*Dokumen ini dibuat berdasarkan audit repo [Makro62/farm-game](https://github.com/Makro62/farm-game) pada Juni 2025.*
*Update dokumen ini setiap sprint selesai untuk track progress perbaikan.*