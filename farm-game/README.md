# 🌾 Farm Tycoon - Game Implementation

Farm Tycoon adalah web-game simulasi pertanian berbasis browser yang dibangun dengan **HTML5, CSS3, dan Vanilla JavaScript (ES Modules)**.

## 📁 Struktur Folder

```
farm-game/
├── index.html                    # Entry point utama
├── css/
│   └── style.css                 # Styling global (glassmorphism)
└── js/src/
    ├── main.js                   # Bootstrap & initialization
    ├── core/
    │   ├── state.js              # Global state management
    │   └── game-engine.js        # Game loop & tick system
    ├── data/
    │   ├── crops.js              # Config tanaman
    │   ├── animals.js            # Config hewan
    │   ├── buildings.js          # Config bangunan
    │   └── crafting.js           # Resep crafting
    ├── systems/                  # (Akan ditambahkan)
    ├── managers/
    │   └── notification-manager.js # Toast notifications
    ├── ui/
    │   ├── core-ui.js            # UI inti (tabs, topbar)
    │   ├── farm-ui.js            # UI pertanian
    │   ├── shop-ui.js            # UI toko
    │   └── inventory-ui.js       # UI inventory
    └── utils/                    # (Akan ditambahkan)
```

## 🚀 Cara Menjalankan

### Opsi 1: Live Server (Recommended)

1. Install extension "Live Server" di VS Code
2. Buka `index.html`
3. Klik kanan → "Open with Live Server"

### Opsi 2: Python Simple HTTP Server

```bash
cd farm-game
python -m http.server 8000
```

Buka browser: `http://localhost:8000`

### Opsi 3: Node.js http-server

```bash
npm install -g http-server
cd farm-game
http-server
```

## 🎮 Fitur Utama

### ✅ Sudah Diimplementasikan

- **Sistem Pertanian**
  - 6×6 grid petak tanah
  - 4 state: grass → empty → growing → ready
  - 6 jenis tanaman dasar (Wortel, Jagung, Tomat, Stroberi, Nanas, Labu)
  - Sistem siram (-30% waktu tumbuh)
  - Progress bar pertumbuhan real-time

- **Sistem Peternakan**
  - 3 hewan awal (Ayam, Sapi, Lebah)
  - Produksi otomatis dengan timer
  - Pergerakan hewan random
  - Sistem kapasitas kandang (upgradeable)

- **Sistem Ekonomi**
  - Koin & XP
  - Leveling system
  - Toko bibit & hewan
  - Jual hasil panen

- **Sistem Bangunan**
  - 4 bangunan upgradeable (Silo, Kandang, Menara Air, Kincir Angin)
  - Efek per level berbeda
  - Biaya upgrade eksponensial

- **Sistem Cuaca**
  - 5 jenis cuaca (Cerah, Berawan, Hujan, Badai, Berangin)
  - Perubahan otomatis setiap 5 menit
  - Modifier waktu tumbuh tanaman

- **Sistem Musim**
  - 4 musim (Semi, Panas, Gugur, Dingin)
  - Siklus 7 hari per musim
  - Bonus khusus per musim

- **UI/UX**
  - Glassmorphism design
  - Responsive layout
  - Tab navigation (Pertanian, Peternakan, Kota, Tambang, Danau)
  - Toast notifications
  - Keyboard shortcuts (1-5 tabs, 6-9 seeds, S save)

- **Save/Load System**
  - Auto-save setiap 30 detik
  - Manual save (tombol 💾 / tekan S)
  - SHA-256 hash verification (anti-cheat)
  - LocalStorage persistence

- **Auto-Farm (Kurcaci)**
  - Kurcaci Petani (5.000 koin)
  - Kurcaci Peternak (8.000 koin)
  - Toggle ON/OFF
  - Auto-harvest & collect

### 🔨 Dalam Pengembangan

- Sistem Pertambangan lengkap
- Mini-game Memancing interaktif
- Crafting system dengan antrian
- Order Board dengan pesanan dinamis
- NPC & Friendship system
- Drag-and-drop layout farm
- Leaderboard & multiplayer
- Event spesial & festival

## 🎯 Keyboard Shortcuts

| Tombol | Fungsi |
|--------|--------|
| `1-5` | Switch tab (Farm, Animals, City, Mine, Lake) |
| `6-9` | Pilih bibit (Carrot, Corn, Tomato, Strawberry) |
| `S` | Save game manual |

## 💡 Tips Bermain

1. **Early Game**: Fokus tanam Wortel (cepat, murah) untuk grinding koin pertama
2. **Mid Game**: Upgrade Silo untuk inventory lebih besar
3. **Late Game**: Beli Kurcaci untuk auto-farming pasif
4. **Musim Semi**: Bonus +20% hasil panen, fokus farming intensif
5. **Musim Gugur**: Harga jual +30%, saatnya jual stok besar
6. **Cuaca Hujan**: Tanaman tumbuh 20% lebih cepat, manfaatkan!

## 🐛 Troubleshooting

### Game tidak muncul/notifikasi error?

- Pastikan menggunakan browser modern (Chrome, Firefox, Edge terbaru)
- Cek Console (F12) untuk error messages
- Pastikan file dibuka via server (bukan langsung dari file://)

### Save tidak tersimpan?

- Browser harus mengizinkan localStorage
- Jangan clear browser data saat bermain
- Gunakan tombol Save manual sebagai backup

### Performance lambat?

- Kurangi jumlah animal di peternakan
- Nonaktifkan gnome jika tidak diperlukan
- Tutup tab browser lain yang berat

## 📝 Roadmap Development

### Phase 1 (✅ DONE)
- [x] Core game loop
- [x] State management
- [x] Basic farming system
- [x] UI framework
- [x] Save/load system

### Phase 2 (🔄 IN PROGRESS)
- [ ] Mining system
- [ ] Fishing mini-game
- [ ] Crafting queue
- [ ] Order board

### Phase 3 (📋 PLANNED)
- [ ] NPC dialogue system
- [ ] Friendship mechanics
- [ ] Seasonal events
- [ ] Achievements

### Phase 4 (🔮 FUTURE)
- [ ] Multiplayer leaderboard
- [ ] Cloud save sync
- [ ] Mobile touch controls
- [ ] PWA support

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Credits

Developed based on Farm Tycoon GDD v2.0
Document reference: `/docs/FARM_TYCOON_GDD.md`

---

**Happy Farming! 🌾🚜**
