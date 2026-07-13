'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Star, Flame, Volume2, VolumeX, Zap } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { AnimatedCounter } from './ui/AnimatedCounter';
import audioManager from '@/lib/audio';
import TabsNav from './TabsNav';
import { GAME_CONSTANTS } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function Topbar() {
  const coins = useGameStore((state) => state.coins);
  const level = useGameStore((state) => state.level);
  const xp = useGameStore((state) => state.xp);
  const streak = useGameStore((state) => state.streak);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const checkStreak = useGameStore((state) => state.checkStreak);
  const resetGame = useGameStore((state) => state.resetGame);
  const openConfirm = useGameStore((state) => state.openConfirm);
  const touchSaveTimestamp = useGameStore((state) => state.touchSaveTimestamp);
  const spendCoins = useGameStore((state) => state.spendCoins);
  const activateCoinBooster = useGameStore((state) => state.activateCoinBooster);
  const buyGrowthBooster = useGameStore((state) => state.buyGrowthBooster);
  const coinMultiplier = useGameStore((state) => state.coinMultiplier);
  const growthMultiplier = useGameStore((state) => state.growthMultiplier);

  const [showBoosters, setShowBoosters] = useState(false);

  const xpNeeded = level * 100;
  const xpProgress = Math.min(100, (xp / xpNeeded) * 100);

  const handleToggleSound = () => {
    const newState = audioManager.toggleAll();
    const store = useGameStore.getState();
    if (store.soundEnabled !== newState) store.toggleSound();
    if (store.musicEnabled !== newState) store.toggleMusic();
  };

  const handleClaimDaily = () => {
    const result = checkStreak();
    if (result.claimed) toast.success(result.message);
    else toast(result.message, { icon: '📅' });
  };

  const handleSave = () => {
    touchSaveTimestamp?.();
    toast.success('Game tersimpan!');
  };

  const handleReset = () => {
    openConfirm(
      'Reset Game',
      'Semua progress (koin, level, tanaman, hewan) akan hilang. Yakin?',
      () => {
        resetGame();
        toast.success('Game di-reset ke awal!');
      }
    );
  };

  const handleBuyGrowth = () => {
    if (growthMultiplier > 1) {
      toast('Booster Growth sudah aktif!', { icon: '⚡' });
      return;
    }
    openConfirm(
      'Beli Booster Growth',
      `Beli Booster Growth ×1.5 seharga ${GAME_CONSTANTS.COSTS.GROWTH_BOOSTER} 💰?`,
      () => {
        if (buyGrowthBooster(GAME_CONSTANTS.COSTS.GROWTH_BOOSTER)) {
          toast.success('Booster Growth ×1.5 Aktif!', { icon: '🌱' });
          setShowBoosters(false);
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleBuyCoin = () => {
    if (coinMultiplier > 1) {
      toast('Booster Koin sudah aktif!', { icon: '⚡' });
      return;
    }
    openConfirm(
      'Beli Booster Koin',
      `Beli Booster Koin ×2 seharga ${GAME_CONSTANTS.COSTS.COIN_BOOSTER} 💰?`,
      () => {
        if (spendCoins(GAME_CONSTANTS.COSTS.COIN_BOOSTER)) {
          activateCoinBooster();
          toast.success('Booster Koin ×2 Aktif!', { icon: '💰' });
          setShowBoosters(false);
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 22 }}
      className="sticky top-0 z-50 hud-bar safe-top w-full backdrop-blur-xl"
    >
      <div className="w-full px-2 sm:px-4 md:px-6 py-2.5 sm:py-3 flex flex-col gap-2 relative">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <motion.img
                src="/img/logo.png"
                alt="Farm Tycoon Logo"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-lg"
              />
              <div className="hidden lg:block">
                <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] tracking-tight text-shadow leading-none">
                  Farm Tycoon
                </h1>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wide mt-0.5">
                  Tanam · Panen · Kembangkan
                </p>
              </div>
            </div>

            <div className="sm:hidden flex items-center gap-2">
              <div className="stat-chip bg-gradient-to-b from-[#FFE08A] to-[var(--gold)] text-[var(--text-primary)] !py-1 !px-2.5">
                <Coins className="w-3.5 h-3.5" />
                <AnimatedCounter value={coins} className="text-xs font-black" />
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center w-full sm:w-auto overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            <TabsNav />
          </div>

          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <motion.div
              key={coins}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              className="stat-chip bg-gradient-to-b from-[#FFE08A] to-[var(--gold)] text-[var(--text-primary)]"
            >
              <Coins className="w-4 h-4" />
              <AnimatedCounter value={coins} className="text-sm font-black" />
            </motion.div>

            <div className="relative group">
              <div className="stat-chip bg-gradient-to-b from-[var(--primary-light)] to-[var(--primary)] text-[var(--text-primary)]">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-black">Lv {level}</span>
              </div>
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-[var(--panel)] text-[var(--text-primary)] text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border-2 border-[var(--wood)] shadow-md z-20">
                XP {xp}/{xpNeeded}
              </div>
            </div>

            {streak > 0 && (
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="stat-chip bg-gradient-to-b from-[#ff9a5a] to-[#e85d4c] text-white"
              >
                <Flame className="w-4 h-4 animate-wiggle" />
                <span className="text-sm font-black">{streak}</span>
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleSound}
              className="p-2 rounded-2xl bg-[var(--card)] hover:brightness-105 transition-colors border-2 border-[var(--wood)] shadow-[0_3px_0_var(--wood-light)]"
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-primary)]" />
              ) : (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-secondary)]" />
              )}
            </motion.button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 sm:gap-2 pb-1 relative">
          <button type="button" onClick={handleClaimDaily} className="btn-gold !px-3 !py-1.5 !text-xs sm:!text-sm">
            Daily
          </button>
          <button type="button" onClick={handleSave} className="btn-secondary !px-3 !py-1.5 !text-xs sm:!text-sm">
            Save
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBoosters((v) => !v)}
              className={`btn-primary !px-3 !py-1.5 !text-xs sm:!text-sm flex items-center gap-1 ${
                coinMultiplier > 1 || growthMultiplier > 1 ? 'ring-2 ring-[var(--gold)]' : ''
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Booster
            </button>
            <AnimatePresence>
              {showBoosters && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-full mt-2 z-50 w-56 glass-panel !p-3 shadow-xl"
                >
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] mb-2">Booster global (semua tab)</p>
                  <button type="button" onClick={handleBuyGrowth} className="btn-primary w-full !text-xs mb-2 !py-2">
                    Growth ×1.5 {growthMultiplier > 1 ? '· AKTIF' : `· ${GAME_CONSTANTS.COSTS.GROWTH_BOOSTER}💰`}
                  </button>
                  <button type="button" onClick={handleBuyCoin} className="btn-gold w-full !text-xs !py-2">
                    Coin ×2 {coinMultiplier > 1 ? '· AKTIF' : `· ${GAME_CONSTANTS.COSTS.COIN_BOOSTER}💰`}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button type="button" onClick={handleReset} className="btn-danger !px-3 !py-1.5 !text-xs sm:!text-sm opacity-90">
            Reset
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[var(--wood)]/25">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${xpProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-[var(--primary)] via-[#c6e265] to-[var(--gold)]"
        />
      </div>
    </motion.header>
  );
}
