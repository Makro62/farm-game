# Contributing to Farm Tycoon

Terima kasih atas minat Anda untuk berkontribusi pada proyek Farm Tycoon! Panduan ini akan membantu Anda memulai.

## Setup Lokal

1. Clone repositori ini ke komputer lokal Anda:
   ```bash
   git clone https://github.com/Makro62/farm-game.git
   cd farm-game
   ```
2. Jalankan HTTP server lokal (karena game menggunakan ES Modules):
   ```bash
   python3 -m http.server 8000
   # atau menggunakan Node.js:
   # npx serve .
   ```
3. Buka browser dan arahkan ke `http://localhost:8000`.

## Standar Kode

- Game ini saat ini dibangun menggunakan Vanilla JavaScript (ES Modules). Pastikan untuk tidak menambahkan library atau framework eksternal tanpa diskusi terlebih dahulu.
- Semua gaya (CSS) harus ditempatkan di `css/style.css`. Harap hindari penggunaan _inline style_.
- Jangan menggunakan *magic numbers* langsung di kode logika; letakkan konstanta di dalam `js/src/data/config.js`.

## Konvensi Commit

Gunakan standar [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` untuk fitur baru
- `fix:` untuk perbaikan bug
- `refactor:` untuk refactoring kode tanpa mengubah fungsionalitas
- `docs:` untuk perubahan pada dokumentasi (seperti README)
- `style:` untuk perubahan formatting atau UI/CSS
- `chore:` untuk pemeliharaan umum

Contoh: `feat: tambah sistem cuaca musim dingin`

## Pengajuan Pull Request (PR)

- Buat branch baru untuk fitur atau perbaikan Anda, contoh: `feature/nama-fitur` atau `fix/bug-tertentu`.
- Pastikan commit Anda jelas dan deskriptif.
- Ajukan Pull Request ke branch `main`.
- Berikan deskripsi detail tentang apa yang diubah pada PR Anda.
