# 📖 Implementation Guide - Farm Tycoon Improvements

## Cara Mengintegrasikan Sistem Baru

### 1. Visual Upgrades (CSS)

**Langkah:**
1. Copy semua isi `css/visual-upgrades.css` ke file CSS utama game kamu
2. Tambahkan class `.season-theme` ke `<body>` untuk aktivasi tema
3. Tambahkan progress bar ke setiap plot yang sedang tumbuh

**Contoh integrasi progress bar:**
```javascript
// Di fungsi render plot
function renderPlot(plot) {
  if (plot.status === 'growing') {
    const progress = calculateProgress(plot.plantedAt, plot.growTime);
    return `
      <div class="plot growing">
        <span class="crop-icon">${plot.crop.emoji}</span>
        <div class="plot-progress-wrap">
          <div class="plot-progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="plot-timer-label">${formatTime(plot.timeRemaining)}</div>
      </div>
    `;
  }
}
```

---

### 2. Market System

**Integrasi ke game engine:**
```javascript
// Di game-engine.js
import { updateDailyMarket } from './systems/market-system.js';

function triggerNewDay(state) {
  state.day++;
  
  // Update market prices
  updateDailyMarket(state);
  
  // Save game
  saveGame(state);
}

// Di fungsi jual item
import { sellItem } from './systems/market-system.js';

function handleSell(itemId, quantity) {
  const result = sellItem(state, itemId, quantity);
  
  showFloatText(`+${result.totalCoins} 💰`, 'big-money');
  updateUI();
}
```

---

### 3. Streak System

**Panggil saat game load:**
```javascript
// Di main.js atau game-init.js
import { claimDailyStreak, renderStreakIndicator } from './systems/streak-system.js';

function initGame() {
  const state = loadGame();
  
  // Check dan claim streak
  setTimeout(() => {
    const result = claimDailyStreak(state);
    if (result.success) {
      // Show reward modal
      showStreakRewardModal(result);
    }
  }, 1000);
  
  // Render streak indicator di HUD
  renderStreakIndicator(state);
  
  // ... init lainnya
}
```

---

### 4. Wheel System

**Tambahkan tombol di UI:**
```html
<!-- Di sidebar atau menu -->
<button onclick="openWheel()" class="btn-wheel">
  🎡 Roda Keberuntungan
</button>
```

```javascript
// Di event handler
import { renderWheelModal } from './systems/wheel-system.js';

function openWheel() {
  renderWheelModal(state);
}
```

---

### 5. Combo System

**Integrasikan dengan fungsi panen:**
```javascript
// Di farm-actions.js
import { registerComboAction } from './systems/combo-system.js';

function harvestPlot(plotId) {
  const plot = state.plots[plotId];
  const baseReward = calculateHarvestValue(plot);
  
  // Register untuk combo
  const comboResult = registerComboAction(
    state,
    'harvest',
    baseReward,
    document.getElementById(`plot-${plotId}`)
  );
  
  // Gunakan actual reward
  state.coins += comboResult.actualReward;
  
  showFloatText(`+${comboResult.actualCoins} 💰`, 'big-money');
  updateUI();
}
```

---

## Testing Checklist

### Visual Upgrades
- [ ] Progress bar muncul di plot yang sedang tumbuh
- [ ] Animasi glow muncul saat tanaman siap panen
- [ ] Floating text muncul saat panen/jual
- [ ] Toast notification muncul dengan warna yang benar

### Market System
- [ ] Harga berubah setiap hari baru
- [ ] Indikator trend (↑/↓) muncul
- [ ] Jual item menggunakan harga pasar, bukan harga base

### Streak System
- [ ] Reward claim berhasil saat pertama login
- [ ] "Sudah claim" muncul jika claim 2x dalam 1 hari
- [ ] Streak reset jika tidak login >1 hari
- [ ] Progress bar streak update

### Wheel System
- [ ] Wheel bisa diputar sekali sehari
- [ ] Animasi spin berjalan smooth
- [ ] Reward diberikan sesuai segment
- [ ] Timer countdown muncul setelah spin

### Combo System
- [ ] Combo counter naik saat panen berturut-turut
- [ ] Multiplier bertambah (1.25×, 1.5×, dst)
- [ ] Combo reset setelah 2.5 detik tidak ada aksi
- [ ] Mega combo (5×+) memberikan bonus

---

## Performance Optimization

### Tips:
1. **Debouncing** untuk update UI yang sering
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Penggunaan
const updateUI = debounce(() => {
  // Update DOM
}, 100);
```

2. **CSS Containment** untuk plot yang banyak
```css
.plot {
  contain: layout style paint;
}
```

3. **RequestAnimationFrame** untuk animasi smooth
```javascript
function animateProgress() {
  updateProgressBar();
  requestAnimationFrame(animateProgress);
}
```

---

## Debugging Tools

Tambahkan console commands untuk testing:

```javascript
// Di console browser
// Force trigger new day
game.debug.nextDay();

// Add coins
game.debug.addCoins(10000);

// Reset streak
game.debug.resetStreak();

// Force spin wheel
game.debug.spinWheel();

// Set combo count
game.debug.setCombo(10);
```

Implementasi:
```javascript
// Di game-engine.js
export function setupDebugTools(state) {
  window.game = window.game || {};
  window.game.debug = {
    nextDay: () => {
      triggerNewDay(state);
      console.log('Day advanced');
    },
    addCoins: (amount) => {
      state.coins += amount;
      updateUI();
      console.log(`Added ${amount} coins`);
    },
    resetStreak: () => {
      state.streak = 0;
      state.lastLogin = null;
      console.log('Streak reset');
    },
    spinWheel: () => {
      state.lastWheelSpin = null;
      console.log('Wheel ready to spin');
    },
    setCombo: (count) => {
      comboState.count = count;
      console.log(`Combo set to ${count}`);
    }
  };
}
```

---

## Rollback Plan

Jika ada masalah, rollback dengan cara:

1. **Hapus import** sistem baru dari file utama
2. **Comment out** kode yang bermasalah
3. **Restore** file CSS ke versi sebelumnya
4. **Clear localStorage** jika ada corrupt data

```javascript
// Backup save sebelum update
function backupSave() {
  const currentSave = localStorage.getItem('farmGameSave');
  localStorage.setItem('farmGameSave_backup', currentSave);
}

// Restore jika perlu
function restoreBackup() {
  const backup = localStorage.getItem('farmGameSave_backup');
  if (backup) {
    localStorage.setItem('farmGameSave', backup);
    location.reload();
  }
}
```

---

## Support & Resources

- **Discord:** [Link community]
- **GitHub Issues:** https://github.com/Makro62/farm-game/issues
- **Documentation:** https://github.com/Makro62/farm-game/docs

---

**Last Updated:** 14 Juni 2026  
**Version:** 1.0.0
