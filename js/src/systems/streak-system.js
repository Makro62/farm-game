/**
 * STREAK SYSTEM - Bonus Login Harian
 * Memberikan reward semakin sering player login berturut-turut
 */

const STREAK_REWARDS = [
  { day: 1,  coins: 100,  xp: 10,  message: 'Selamat datang kembali!' },
  { day: 2,  coins: 200,  xp: 20,  message: 'Streak 2 hari! Mantap!' },
  { day: 3,  coins: 300,  xp: 30,  item: 'bibit_wortel', itemQty: 3, message: '🎁 Bonus bibit!' },
  { day: 4,  coins: 400,  xp: 40,  message: 'Terus semangat!' },
  { day: 5,  coins: 500,  xp: 50,  item: 'pupuk_super', itemQty: 1, message: ' Pupuk super!' },
  { day: 6,  coins: 750,  xp: 75,  message: 'Hampir 1 minggu!' },
  { day: 7,  coins: 1500, xp: 150, item: 'bibit_langka', itemQty: 1, message: '🎉 MINGGU PERTAMA! Item langka!' },
  { day: 14, coins: 3000, xp: 300, item: 'kurcaci_sementara', message: '🏆 2 MINGGU! Kurcaci 3 hari!' },
  { day: 30, coins: 10000, xp: 500, item: 'dekorasi_eksklusif', message: '👑 LEGEND! 30 hari streak!' }
];

/**
 * Claim daily streak reward
 * Dipanggil saat player login atau buka game
 */
export function claimDailyStreak(state) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  // Sudah claim hari ini
  if (state.lastLogin === today) {
    return {
      success: false,
      message: 'Sudah klaim reward hari ini! Kembali besok.',
      alreadyClaimed: true
    };
  }
  
  // Check jika streak putus
  if (state.lastLogin && state.lastLogin !== yesterday) {
    const daysSinceLastLogin = Math.floor((Date.now() - new Date(state.lastLogin).getTime()) / 86400000);
    if (daysSinceLastLogin > 1) {
      state.streak = 0;
      showNotification('😢 Streak kamu putus! Jangan menyerah, mulai lagi!', 'warning');
    }
  }
  
  // Increment streak
  state.streak = (state.streak || 0) + 1;
  state.lastLogin = today;
  
  // Cari reward yang sesuai
  let reward = findStreakReward(state.streak);
  
  if (!reward) {
    // Reward default untuk hari > 30
    reward = {
      day: state.streak,
      coins: 500 + (state.streak * 50),
      xp: 50 + (state.streak * 5),
      message: `Streak ${state.streak} hari! Terus pertahankan!`
    };
  }
  
  // Berikan reward
  const rewards = applyReward(state, reward);
  
  // Show notification
  showStreakNotification(state.streak, rewards);
  
  return {
    success: true,
    streak: state.streak,
    rewards,
    message: reward.message
  };
}

/**
 * Cari reward untuk streak hari ini
 */
function findStreakReward(currentStreak) {
  // Cari reward exact match
  let reward = STREAK_REWARDS.find(r => r.day === currentStreak);
  
  // Jika tidak ada, cari reward milestone terdekat
  if (!reward) {
    const milestones = [30, 14, 7];
    for (const milestone of milestones) {
      if (currentStreak >= milestone && currentStreak % milestone === 0) {
        reward = STREAK_REWARDS.find(r => r.day === milestone);
        break;
      }
    }
  }
  
  return reward;
}

/**
 * Apply reward ke state
 */
function applyReward(state, reward) {
  const rewards = [];
  
  // Coins
  if (reward.coins) {
    state.coins += reward.coins;
    rewards.push({ type: 'coins', amount: reward.coins });
  }
  
  // XP
  if (reward.xp) {
    state.xp += reward.xp;
    rewards.push({ type: 'xp', amount: reward.xp });
    
    // Check level up
    checkLevelUp(state);
  }
  
  // Item
  if (reward.item) {
    state.inventory[reward.item] = (state.inventory[reward.item] || 0) + (reward.itemQty || 1);
    rewards.push({ 
      type: 'item', 
      itemId: reward.item, 
      quantity: reward.itemQty || 1 
    });
  }
  
  return rewards;
}

/**
 * Show notification untuk streak
 */
function showStreakNotification(streak, rewards) {
  let message = `🔥 STREAK ${streak} HARI!\n\n`;
  
  for (const reward of rewards) {
    if (reward.type === 'coins') {
      message += `💰 +${reward.amount} Koin\n`;
    } else if (reward.type === 'xp') {
      message += `⭐ +${reward.amount} XP\n`;
    } else if (reward.type === 'item') {
      message += `🎁 +${reward.quantity}x ${reward.itemId}\n`;
    }
  }
  
  showNotification(message, 'reward');
}

/**
 * Render UI streak indicator
 */
export function renderStreakIndicator(state) {
  const container = document.getElementById('streak-indicator');
  if (!container) return;
  
  const currentStreak = state.streak || 0;
  const nextMilestone = getNextMilestone(currentStreak);
  const progress = calculateStreakProgress(currentStreak, nextMilestone);
  
  let html = `
    <div class="streak-badge">
      <span class="streak-fire">🔥</span>
      <span>${currentStreak} Hari</span>
    </div>
  `;
  
  if (nextMilestone) {
    html += `
      <div style="margin-top: 8px; font-size: 12px; color: #718096;">
        ${nextMilestone - currentStreak} hari lagi sampai hari ke-${nextMilestone}
        <div style="background: #e2e8f0; height: 4px; border-radius: 2px; margin-top: 4px;">
          <div style="background: linear-gradient(90deg, #ff6b6b, #feca57); height: 100%; width: ${progress}%; border-radius: 2px; transition: width 0.3s;"></div>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

function getNextMilestone(current) {
  const milestones = [1, 2, 3, 4, 5, 6, 7, 14, 30];
  for (const m of milestones) {
    if (m > current) return m;
  }
  return current + 7; // Next week
}

function calculateStreakProgress(current, next) {
  const prev = STREAK_REWARDS.find(r => r.day < next)?.day || 0;
  const range = next - prev;
  const progress = current - prev;
  return Math.min(100, (progress / range) * 100);
}

function checkLevelUp(state) {
  const xpNeeded = getXpForLevel(state.level);
  if (state.xp >= xpNeeded) {
    state.level++;
    state.xp -= xpNeeded;
    showNotification(`🎉 LEVEL UP! Level ${state.level}!`, 'levelup');
  }
}

function getXpForLevel(level) {
  return level * 100; // Simple formula: level × 100 XP
}

function showNotification(message, type = 'info') {
  // Implementasi notifikasi - sesuaikan dengan sistem yang ada
  import('../managers/notification-manager.js').then(m => {
    m.NotificationManager.toast(message, type);
  });
}

// Export
export const StreakSystem = {
  STREAK_REWARDS,
  claimDailyStreak,
  renderStreakIndicator
};
