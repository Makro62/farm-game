/**
 * COMBO SYSTEM - Multiplier untuk Panen Berturut-turut
 * Membuat panen lebih satisfying dengan combo multiplier
 */

import { S } from '../core/state.js';

let comboState = {
  count: 0,
  timer: null,
  multiplier: 1,
  lastAction: null
};

const COMBO_WINDOW = 2500; // 2.5 detik antar aksi
const MAX_MULTIPLIER = 4.0; // Max 4×

/**
 * Register aksi panen/crafting untuk combo
 */
export function registerComboAction(state, type, baseReward, element) {
  // Increment combo
  comboState.count++;
  clearTimeout(comboState.timer);
  
  // Hitung multiplier (linear growth, max 4×)
  comboState.multiplier = Math.min(
    1 + (comboState.count - 1) * 0.25,
    MAX_MULTIPLIER
  );
  
  // Hitung actual reward
  const actualReward = Math.round(baseReward * comboState.multiplier);
  const bonusCoins = actualReward - baseReward;
  
  // Tampilkan feedback visual
  if (comboState.count >= 2 && element) {
    showComboFeedback(element, comboState.count, comboState.multiplier, bonusCoins);
    updateComboBar(comboState.count, comboState.multiplier);
  }
  
  // Reset combo setelah window waktu
  comboState.timer = setTimeout(() => {
    resetCombo(state);
  }, COMBO_WINDOW);
  
  comboState.lastAction = Date.now();
  
  return {
    baseReward,
    actualReward,
    multiplier: comboState.multiplier,
    bonus: bonusCoins,
    comboCount: comboState.count
  };
}

/**
 * Show feedback visual untuk combo
 */
function showComboFeedback(element, count, multiplier, bonusCoins) {
  // Floating text
  const text = document.createElement('div');
  text.className = 'float-text combo';
  text.innerHTML = `×${multiplier.toFixed(1)} COMBO!<br>+${bonusCoins} 💰`;
  
  const rect = element.getBoundingClientRect();
  text.style.left = `${rect.left + rect.width / 2}px`;
  text.style.top = `${rect.top}px`;
  text.style.position = 'fixed';
  
  document.body.appendChild(text);
  setTimeout(() => text.remove(), 1000);
  
  // Particle effect untuk combo besar
  if (count >= 5) {
    createComboParticles(element);
  }
}

/**
 * Create particle effect untuk mega combo
 */
function createComboParticles(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'harvest-particle';
    particle.textContent = ['⭐', '💫', '🔥', '✨'][Math.floor(Math.random() * 4)];
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 150}px`);
    particle.style.setProperty('--dy', `${-100 - Math.random() * 100}px`);
    particle.style.fontSize = `${20 + Math.random() * 15}px`;
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }
}

/**
 * Update combo bar UI
 */
function updateComboBar(count, multiplier) {
  let bar = document.getElementById('combo-bar');
  
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'combo-bar';
    bar.className = 'combo-bar';
    document.body.appendChild(bar);
  }
  
  const timeLeft = COMBO_WINDOW / 1000;
  
  bar.innerHTML = `
    <span class="combo-count">🔥 ${count}x</span>
    <span class="combo-multiplier">×${multiplier.toFixed(1)}</span>
    <div class="combo-timer">
      <div class="combo-timer-fill" style="animation-duration: ${timeLeft}s"></div>
    </div>
  `;
  
  // Animasi untuk combo besar
  if (count >= 10) {
    bar.style.animation = 'pulse 0.5s infinite';
  }
}

/**
 * Reset combo state
 */
function resetCombo(state) {
  if (comboState.count >= 5) {
    // Bonus untuk mega combo
    const bonus = comboState.count * 50;
    state.coins += bonus;
    
    showNotification(
      `🔥 ${comboState.count}x MEGA COMBO!\nBonus: +${bonus} 💰`,
      'reward'
    );
    
    // Floating text besar
    const topBar = document.querySelector('.topbar') || document.body;
    showFloatText(topBar, `MEGA COMBO ×${comboState.count}!`, 'level-up');
  }
  
  // Hide combo bar
  const bar = document.getElementById('combo-bar');
  if (bar) {
    bar.style.animation = 'slide-out 0.3s ease-out forwards';
    setTimeout(() => bar.remove(), 300);
  }
  
  // Reset state
  comboState = {
    count: 0,
    timer: null,
    multiplier: 1,
    lastAction: null
  };
}

/**
 * Get current combo state
 */
export function getComboState() {
  return { ...comboState };
}

/**
 * Force reset combo (untuk debug atau event tertentu)
 */
export function forceResetCombo(state) {
  if (comboState.timer) {
    clearTimeout(comboState.timer);
  }
  resetCombo(state);
}

function showNotification(message, type) {
  import('../managers/notification-manager.js').then(m => {
    m.NotificationManager.toast(message, type);
  });
}

function showFloatText(element, text, type) {
  import('../utils/effects.js').then(e => {
    e.showFloatText(element, text, type);
  });
}

// Export
export const ComboSystem = {
  registerComboAction,
  getComboState,
  forceResetCombo,
  COMBO_WINDOW,
  MAX_MULTIPLIER
};
