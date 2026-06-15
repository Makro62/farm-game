import toast from 'react-hot-toast';

// Custom toast functions
export const toastSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 2500,
    ...options
  });
};

export const toastError = (message, options = {}) => {
  return toast.error(message, {
    duration: 3000,
    ...options
  });
};

export const toastInfo = (message, options = {}) => {
  return toast(message, {
    icon: 'ℹ️',
    duration: 3000,
    style: {
      background: '#3b82f6',
      color: '#fff'
    },
    ...options
  });
};

export const toastWarning = (message, options = {}) => {
  return toast(message, {
    icon: '⚠️',
    duration: 3000,
    style: {
      background: '#f59e0b',
      color: '#fff'
    },
    ...options
  });
};

export const toastLoading = (message, options = {}) => {
  return toast.loading(message, {
    ...options
  });
};

export const toastDismiss = (toastId) => {
  toast.dismiss(toastId);
};

// Game-specific toasts
export const toastHarvest = (cropName, amount, coins) => {
  return toast.success(
    `🥕 Panen ${cropName}! +${amount} item, +${coins} 💰`,
    {
      duration: 2500,
      style: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        fontSize: '15px'
      }
    }
  );
};

export const toastLevelUp = (newLevel) => {
  return toast(
    (t) => (
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-bounce">⭐</span>
        <div>
          <div className="font-bold text-lg">LEVEL UP!</div>
          <div className="text-sm opacity-90">Level {newLevel}</div>
        </div>
      </div>
    ),
    {
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
        color: '#fff',
        padding: '16px 20px'
      }
    }
  );
};

export const toastAchievement = (title, description) => {
  return toast(
    (t) => (
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏆</span>
        <div>
          <div className="font-bold text-lg">{title}</div>
          <div className="text-sm opacity-90">{description}</div>
        </div>
      </div>
    ),
    {
      duration: 5000,
      style: {
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        color: '#fff',
        padding: '16px 20px'
      }
    }
  );
};

export const toastCoinReward = (amount) => {
  return toast.success(
    `💰 +${amount.toLocaleString()} Koin!`,
    {
      duration: 2000,
      style: {
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    }
  );
};

export const toastCombo = (comboCount, multiplier) => {
  return toast(
    `🔥 ${comboCount}x COMBO! ×${multiplier.toFixed(1)} bonus!`,
    {
      duration: 1500,
      style: {
        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 'bold'
      }
    }
  );
};

export const toastWheelReward = (reward) => {
  return toast(
    (t) => (
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-spin">🎡</span>
        <div>
          <div className="font-bold text-lg">Hadiah Roda!</div>
          <div className="text-sm">{reward}</div>
        </div>
      </div>
    ),
    {
      duration: 3000,
      style: {
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        color: '#fff',
        padding: '16px 20px'
      }
    }
  );
};

export const toastSaveGame = (promise) => {
  return toast.promise(
    promise,
    {
      loading: '💾 Menyimpan game...',
      success: '✓ Game tersimpan!',
      error: '✗ Gagal menyimpan!'
    },
    {
      style: {
        minWidth: '200px'
      }
    }
  );
};

export const toastNotEnoughCoins = (needed, have) => {
  return toast.error(
    `💰 Koin tidak cukup! Butuh ${needed}, punya ${have}`,
    {
      duration: 3000
    }
  );
};

export const toastPlotFull = () => {
  return toast.error(
    '🌱 Lahan penuh! Upgrade atau jual tanaman dulu',
    {
      duration: 2500
    }
  );
};

export const toastCropReady = (cropName) => {
  return toast.success(
    `✨ ${cropName} siap dipanen!`,
    {
      duration: 2000,
      style: {
        background: '#10b981',
        color: '#fff'
      }
    }
  );
};
