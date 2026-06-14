/**
 * WHEEL SYSTEM - Roda Keberuntungan
 * Mini-game spin wheel sekali sehari untuk hadiah acak
 */

const WHEEL_SEGMENTS = [
  { label: '+100 💰',   color: '#e17055', min: 0,    max: 35,  reward: { coins: 100 } },
  { label: '+300 💰',   color: '#00b894', min: 35,   max: 60,  reward: { coins: 300 } },
  { label: '+500 💰',   color: '#0984e3', min: 60,   max: 80,  reward: { coins: 500 } },
  { label: '3× Bibit',  color: '#6c5ce7', min: 80,   max: 90,  reward: { item: 'bibit_acak', qty: 3 } },
  { label: '+2000 💰',  color: '#fdcb6e', min: 90,   max: 97,  reward: { coins: 2000 } },
  { label: '💎 JACKPOT',color: '#fd79a8', min: 97,   max: 100, reward: { coins: 5000, item: 'bibit_langka', qty: 1 } }
];

/**
 * Spin the wheel
 */
export function spinWheel(state) {
  const today = new Date().toDateString();
  
  // Check jika sudah spin hari ini
  if (state.lastWheelSpin === today) {
    return {
      success: false,
      message: '⏰ Roda sudah diputar hari ini. Kembali besok!',
      alreadySpun: true
    };
  }
  
  // Roll random number 0-100
  const roll = Math.random() * 100;
  
  // Tentukan segment yang menang
  const winningSegment = WHEEL_SEGMENTS.find(seg => 
    roll >= seg.min && roll < seg.max
  );
  
  if (!winningSegment) {
    console.error('Invalid roll:', roll);
    return { success: false, message: 'Error saat spin' };
  }
  
  // Berikan reward
  const rewards = applyWheelReward(state, winningSegment.reward);
  
  // Update state
  state.lastWheelSpin = today;
  state.wheelSpinCount = (state.wheelSpinCount || 0) + 1;
  
  // Show notification
  showWheelResult(winningSegment, rewards);
  
  return {
    success: true,
    roll,
    segment: winningSegment,
    rewards
  };
}

/**
 * Apply reward dari wheel
 */
function applyWheelReward(state, reward) {
  const rewards = [];
  
  if (reward.coins) {
    state.coins += reward.coins;
    rewards.push({ type: 'coins', amount: reward.coins });
  }
  
  if (reward.item) {
    state.inventory[reward.item] = (state.inventory[reward.item] || 0) + (reward.qty || 1);
    rewards.push({ type: 'item', itemId: reward.item, quantity: reward.qty || 1 });
  }
  
  return rewards;
}

/**
 * Show hasil spin
 */
function showWheelResult(segment, rewards) {
  let message = `🎡 HASIL SPIN:\n\n${segment.label}\n\n`;
  
  for (const reward of rewards) {
    if (reward.type === 'coins') {
      message += `💰 +${reward.amount}\n`;
    } else if (reward.type === 'item') {
      message += `🎁 +${reward.quantity}x ${reward.itemId}\n`;
    }
  }
  
  const type = segment.label.includes('JACKPOT') ? 'reward' : 'success';
  showNotification(message, type);
}

/**
 * Render wheel UI dengan Canvas
 */
export function renderWheelModal(state) {
  const canSpin = state.lastWheelSpin !== new Date().toDateString();
  
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.style.display = 'flex';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal">
      <h2>🎡 Roda Keberuntungan</h2>
      <p style="color: #718096; margin-bottom: 20px;">
        Putar roda untuk dapatkan hadiah menarik!<br>
        <strong>Sekali sehari</strong>
      </p>
      
      <div class="wheel-container">
        <div class="wheel-pointer">▼</div>
        <canvas id="wheel-canvas" width="300" height="300"></canvas>
      </div>
      
      <div class="modal-btns" style="margin-top: 20px;">
        <button id="btn-spin" ${!canSpin ? 'disabled' : ''} class="act-btn primary" style="width: 100%;">
          ${canSpin ? '🎰 PUTAR SEKARANG!' : '⏰ KEMBALI BESOK'}
        </button>
      </div>
      
      ${!canSpin ? `
        <p class="muted" style="margin-top: 12px; font-size: 13px;">
          Reset dalam: <span id="wheel-timer">${getTimeUntilMidnight()}</span>
        </p>
      ` : ''}
      
      <div class="modal-btns" style="margin-top: 10px;">
        <button class="act-btn" onclick="this.closest('.modal-bg').remove()">
          Tutup
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Draw wheel
  const canvas = document.getElementById('wheel-canvas');
  drawWheel(canvas);
  
  // Add spin event
  const btnSpin = document.getElementById('btn-spin');
  if (btnSpin && canSpin) {
    btnSpin.addEventListener('click', () => {
      btnSpin.disabled = true;
      animateWheelSpin(canvas, () => {
        const result = spinWheel(state);
        if (result.success) {
          setTimeout(() => {
            modal.remove();
          }, 3000);
        }
      });
    });
  }
  
  // Update timer jika ada
  if (!canSpin) {
    startWheelTimer();
  }
}

/**
 * Draw wheel segments
 */
function drawWheel(canvas) {
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 140;
  
  const segmentAngle = (2 * Math.PI) / WHEEL_SEGMENTS.length;
  
  WHEEL_SEGMENTS.forEach((segment, index) => {
    const startAngle = index * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle;
    
    // Draw segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.fillText(segment.label, radius - 10, 5);
    ctx.restore();
  });
  
  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Draw center icon
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎡', centerX, centerY);
}

/**
 * Animate wheel spin
 */
function animateWheelSpin(canvas, callback) {
  canvas.classList.add('wheel-spinning');
  
  // Play sound effect
  playSound('spin');
  
  setTimeout(() => {
    canvas.classList.remove('wheel-spinning');
    callback();
  }, 3000);
}

/**
 * Get time until midnight
 */
function getTimeUntilMidnight() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours}j ${minutes}m ${seconds}d`;
}

/**
 * Start countdown timer
 */
function startWheelTimer() {
  const timerEl = document.getElementById('wheel-timer');
  if (!timerEl) return;
  
  const interval = setInterval(() => {
    const time = getTimeUntilMidnight();
    timerEl.textContent = time;
    
    if (time === '0j 0m 0d') {
      clearInterval(interval);
      location.reload(); // Reload untuk reset wheel
    }
  }, 1000);
}

function playSound(type) {
  // Implementasi sound effect
  if(window.SoundManager) window.SoundManager.play(type === 'spin' ? 'sell' : 'buy');
}

function showNotification(message, type) {
  import('../managers/notification-manager.js').then(m => {
    m.NotificationManager.toast(message, type);
  });
}

// Export
export const WheelSystem = {
  WHEEL_SEGMENTS,
  spinWheel,
  renderWheelModal
};
