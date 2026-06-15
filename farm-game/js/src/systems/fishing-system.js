/**
 * Fishing System - Mini-Game Memancing Interaktif
 * Timing-based mini game dengan bar oscillation
 */

import { S } from '../core/state.js';
import { notificationManager } from '../managers/notification-manager.js';
import { addXP } from '../utils/helpers.js';

// Konfigurasi Fishing
export const FISHING_CONFIG = {
  WAIT_TIME_MIN: 5000,  // 5 detik
  WAIT_TIME_MAX: 15000, // 15 detik
  BITE_WINDOW: 2000,    // 2 detik untuk klik saat ikan gigit
  MINI_GAME_DURATION: 10000, // 10 detik max mini-game
  GREEN_ZONE_MIN: 40,   // % posisi bar
  GREEN_ZONE_MAX: 60
};

// Definisi Ikan
export const FISHES = {
  goldfish: {
    id: 'goldfish',
    name: 'Ikan Mas',
    emoji: '🐟',
    sellPrice: 80,
    xpReward: 10,
    dropRate: 0.40,
    difficulty: 1.0,
    size: { min: 0.5, max: 2.0 } // Multiplier koin berdasarkan ukuran
  },
  catfish: {
    id: 'catfish',
    name: 'Lele',
    emoji: '🐠',
    sellPrice: 100,
    xpReward: 15,
    dropRate: 0.30,
    difficulty: 1.2,
    size: { min: 0.5, max: 2.0 }
  },
  clownfish: {
    id: 'clownfish',
    name: 'Ikan Badut',
    emoji: '🐡',
    sellPrice: 200,
    xpReward: 25,
    dropRate: 0.15,
    difficulty: 1.5,
    size: { min: 0.8, max: 2.5 }
  },
  squid: {
    id: 'squid',
    name: 'Cumi-cumi',
    emoji: '🦑',
    sellPrice: 350,
    xpReward: 40,
    dropRate: 0.10,
    difficulty: 1.8,
    size: { min: 1.0, max: 3.0 }
  },
  golden_octopus: {
    id: 'golden_octopus',
    name: 'Gurita Emas',
    emoji: '🐙',
    sellPrice: 2000,
    xpReward: 150,
    dropRate: 0.05,
    difficulty: 2.5,
    size: { min: 2.0, max: 4.0 }
  }
};

// State fishing aktif
let activeFishing = null;
let fishingTimer = null;
let miniGameLoop = null;

/**
 * Inisialisasi sistem fishing
 */
export function initFishingSystem() {
  if (!S.fishing) {
    S.fishing = {
      totalCatches: 0,
      biggestFish: null,
      perfectCatches: 0
    };
  }
}

/**
 * Mulai melempar kail
 */
export function castLine() {
  if (activeFishing) {
    notificationManager.show('⚠️ Sedang memancing!', 'warning');
    return false;
  }

  notificationManager.show('🎣 Menunggu ikan...', 'info');

  // Random wait time
  const waitTime = Math.random() * (FISHING_CONFIG.WAIT_TIME_MAX - FISHING_CONFIG.WAIT_TIME_MIN) + 
                   FISHING_CONFIG.WAIT_TIME_MIN;

  activeFishing = {
    state: 'waiting',
    startTime: Date.now(),
    waitTime: waitTime,
    fish: null
  };

  // Set timer untuk ikan gigit
  fishingTimer = setTimeout(() => {
    onFishBite();
  }, waitTime);

  return true;
}

/**
 * Handle saat ikan gigit
 */
function onFishBite() {
  if (!activeFishing || activeFishing.state !== 'waiting') return;

  activeFishing.state = 'biting';
  
  // Tampilkan indikator visual
  showBiteIndicator();

  // Play sound
  playSound('splash');

  notificationManager.show('💦 Ikan menggigit! KLIK SEKARANG!', 'urgent');

  // Player harus klik dalam waktu tertentu
  const biteWindow = setTimeout(() => {
    if (activeFishing && activeFishing.state === 'biting') {
      onFishEscape();
    }
  }, FISHING_CONFIG.BITE_WINDOW);

  activeFishing.biteTimeout = biteWindow;
}

/**
 * Player berhasil klik saat ikan gigit
 */
export function onPlayerClick() {
  if (!activeFishing) return;

  if (activeFishing.state === 'biting') {
    // Berhasil hook ikan!
    clearTimeout(activeFishing.biteTimeout);
    startMiniGame();
  } else if (activeFishing.state === 'waiting') {
    notificationManager.show('⚠️ Terlalu cepat! Tunggu ikan gigit.', 'warning');
  }
}

/**
 * Ikan lepas
 */
function onFishEscape() {
  notificationManager.show('😢 Ikan lepas...', 'error');
  resetFishing();
}

/**
 * Mulai mini-game tarik ikan
 */
function startMiniGame() {
  activeFishing.state = 'mini-game';
  
  // Roll ikan yang didapat
  activeFishing.fish = rollFish();
  
  const fish = FISHES[activeFishing.fish];
  notificationManager.show(`🎣 ${fish.name} terhook! Tahan di zona hijau!`, 'info');

  // Tampilkan UI mini-game
  showMiniGameUI(fish);

  // Start oscillation loop
  let position = 50;
  let direction = 1;
  const speed = 2 + fish.difficulty; // Makin sulit, makin cepat
  let timeInGreenZone = 0;
  let startTime = Date.now();

  miniGameLoop = setInterval(() => {
    // Update posisi indicator
    position += direction * speed;
    
    // Bounce di edges
    if (position >= 95 || position <= 5) {
      direction *= -1;
    }

    // Cek apakah di green zone
    const inGreenZone = position >= FISHING_CONFIG.GREEN_ZONE_MIN && 
                        position <= FISHING_CONFIG.GREEN_ZONE_MAX;
    
    // Update UI
    updateMiniGameUI(position, inGreenZone);

    // Hitung waktu di green zone
    if (inGreenZone && activeFishing.isHolding) {
      timeInGreenZone += 0.1; // 100ms per tick
    }

    // Cek timeout
    const elapsed = Date.now() - startTime;
    if (elapsed >= FISHING_CONFIG.MINI_GAME_DURATION) {
      completeMiniGame(timeInGreenZone);
    }
  }, 100);

  // Track hold state
  document.addEventListener('mousedown', onHoldStart);
  document.addEventListener('mouseup', onHoldEnd);
  document.addEventListener('touchstart', onHoldStart);
  document.addEventListener('touchend', onHoldEnd);
}

function onHoldStart(e) {
  if (activeFishing && activeFishing.state === 'mini-game') {
    activeFishing.isHolding = true;
    e.preventDefault();
  }
}

function onHoldEnd(e) {
  if (activeFishing && activeFishing.state === 'mini-game') {
    activeFishing.isHolding = false;
    e.preventDefault();
  }
}

/**
 * Selesai mini-game dan tentukan hasil
 */
function completeMiniGame(timeInGreenZone) {
  clearInterval(miniGameLoop);
  document.removeEventListener('mousedown', onHoldStart);
  document.removeEventListener('mouseup', onHoldEnd);
  document.removeEventListener('touchstart', onHoldStart);
  document.removeEventListener('touchend', onHoldEnd);

  const fish = FISHES[activeFishing.fish];
  
  // Tentukan ukuran berdasarkan waktu di green zone
  let sizeMultiplier;
  let quality;
  
  if (timeInGreenZone >= 3.0) {
    sizeMultiplier = fish.size.max;
    quality = 'besar';
    S.fishing.perfectCatches = (S.fishing.perfectCatches || 0) + 1;
  } else if (timeInGreenZone >= 1.0) {
    sizeMultiplier = (fish.size.min + fish.size.max) / 2;
    quality = 'normal';
  } else {
    sizeMultiplier = fish.size.min;
    quality = 'kecil';
  }

  // Hitung reward
  const coins = Math.floor(fish.sellPrice * sizeMultiplier);
  const xp = Math.floor(fish.xpReward * sizeMultiplier);

  // Tambahkan ke inventory
  const existingFish = S.inventory.find(inv => inv.id === activeFishing.fish);
  if (existingFish) {
    existingFish.qty++;
  } else {
    S.inventory.push({ id: activeFishing.fish, qty: 1 });
  }

  addXP(xp);
  S.fishing.totalCatches = (S.fishing.totalCatches || 0) + 1;

  // Update biggest fish record
  if (!S.fishing.biggestFish || sizeMultiplier > S.fishing.biggestFish.multiplier) {
    S.fishing.biggestFish = {
      type: activeFishing.fish,
      multiplier: sizeMultiplier,
      date: Date.now()
    };
  }

  // Tampilkan hasil
  hideMiniGameUI();
  notificationManager.show(
    `🎉 Dapat ${fish.name} (${quality})! +${coins} koin, +${xp} XP`,
    'success'
  );

  resetFishing();
}

/**
 * Roll ikan berdasarkan drop rate
 */
function rollFish() {
  const rand = Math.random();
  let cumulative = 0;

  for (const [key, fish] of Object.entries(FISHES)) {
    cumulative += fish.dropRate;
    if (rand <= cumulative) {
      return key;
    }
  }

  return 'goldfish'; // Default
}

/**
 * Reset state fishing
 */
function resetFishing() {
  if (fishingTimer) clearTimeout(fishingTimer);
  if (miniGameLoop) clearInterval(miniGameLoop);
  activeFishing = null;
  hideBiteIndicator();
  hideMiniGameUI();
}

/**
 * Tampilkan indikator gigitan
 */
function showBiteIndicator() {
  const indicator = document.getElementById('fishing-bite-indicator');
  if (indicator) {
    indicator.style.display = 'block';
    indicator.classList.add('animating');
  }
}

function hideBiteIndicator() {
  const indicator = document.getElementById('fishing-bite-indicator');
  if (indicator) {
    indicator.style.display = 'none';
    indicator.classList.remove('animating');
  }
}

/**
 * Tampilkan UI mini-game
 */
function showMiniGameUI(fish) {
  const container = document.getElementById('fishing-mini-game');
  if (!container) return;

  container.innerHTML = `
    <div class="fishing-mini-game active">
      <div class="fish-info">
        <span>${fish.emoji} ${fish.name}</span>
        <span class="difficulty">Kesulitan: ${'⭐'.repeat(Math.round(fish.difficulty))}</span>
      </div>
      <div class="fishing-bar-container">
        <div class="fishing-bar">
          <div class="green-zone" style="left: ${FISHING_CONFIG.GREEN_ZONE_MIN}%; width: ${FISHING_CONFIG.GREEN_ZONE_MAX - FISHING_CONFIG.GREEN_ZONE_MIN}%"></div>
          <div class="indicator" id="fishing-indicator"></div>
        </div>
      </div>
      <div class="instruction">TAHAN KLIK saat indikator di zona hijau!</div>
      <button class="btn-cancel" onclick="window.cancelFishing()">❌ Batal</button>
    </div>
  `;

  container.style.display = 'block';
}

function updateMiniGameUI(position, inGreenZone) {
  const indicator = document.getElementById('fishing-indicator');
  if (indicator) {
    indicator.style.left = `${position}%`;
    indicator.classList.toggle('in-zone', inGreenZone);
  }
}

function hideMiniGameUI() {
  const container = document.getElementById('fishing-mini-game');
  if (container) {
    container.style.display = 'none';
  }
}

// Expose ke window
window.cancelFishing = () => {
  if (activeFishing) {
    notificationManager.show('🚫 Membatalkan memancing...', 'info');
    resetFishing();
  }
};

window.startFishing = () => {
  castLine();
};

window.onFishingClick = () => {
  onPlayerClick();
};

/**
 * Render UI area danau
 */
export function renderFishingArea() {
  const container = document.getElementById('fishing-area');
  if (!container) return;

  container.innerHTML = `
    <div class="fishing-lake" onclick="window.onFishingClick()">
      <div class="lake-surface">
        <div class="water-animation"></div>
        ${activeFishing ? `
          <div class="fishing-status ${activeFishing.state}">
            ${activeFishing.state === 'waiting' ? '🎣 Menunggu...' : ''}
            ${activeFishing.state === 'biting' ? '💦 IKAN MENGGIGIT! KLIK!' : ''}
            ${activeFishing.state === 'mini-game' ? '🎮 Mini-game aktif!' : ''}
          </div>
        ` : ''}
      </div>
      <div id="fishing-bite-indicator" class="bite-indicator"></div>
    </div>
    <div id="fishing-mini-game"></div>
    <div class="fishing-stats">
      <h4>📊 Statistik Memancing</h4>
      <p>Total Tangkapan: ${S.fishing?.totalCatches || 0}</p>
      <p>Tangkapan Sempurna: ${S.fishing?.perfectCatches || 0}</p>
      ${S.fishing?.biggestFish ? `
        <p>Ikan Terbesar: ${FISHES[S.fishing.biggestFish.type].emoji} 
           ${FISHES[S.fishing.biggestFish.type].name} 
           (×${S.fishing.biggestFish.multiplier.toFixed(2)})</p>
      ` : ''}
    </div>
  `;
}

export default {
  initFishingSystem,
  castLine,
  onPlayerClick,
  renderFishingArea,
  FISHES,
  FISHING_CONFIG
};
