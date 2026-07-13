'use client';

import { motion } from 'framer-motion';
import { Coins, Star, Flame, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { AnimatedCounter } from './ui/AnimatedCounter';
import audioManager from '@/lib/audio';
import TabsNav from './TabsNav';

export default function Topbar() {
  const coins = useGameStore(state => state.coins);
  const level = useGameStore(state => state.level);
  const xp = useGameStore(state => state.xp);
  const streak = useGameStore(state => state.streak);
  const soundEnabled = useGameStore(state => state.soundEnabled);

  const xpNeeded = level * 100;
  const xpProgress = Math.min(100, (xp / xpNeeded) * 100);

  const handleToggleSound = () => {
    const newState = audioManager.toggleAll();
    const store = useGameStore.getState();
    if (store.soundEnabled !== newState) store.toggleSound();
    if (store.musicEnabled !== newState) store.toggleMusic();
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 22 }}
      className="sticky top-0 z-50 hud-bar safe-top w-full backdrop-blur-xl"
    >
      <div className="w-full px-2 sm:px-4 md:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 relative">
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
              <h1 className="font-display text-2xl font-bold text-[#f7f4e8] tracking-tight text-shadow leading-none">
                Farm Tycoon
              </h1>
              <p className="text-[10px] font-bold text-[#d7e4c8]/80 tracking-wide mt-0.5">
                Tanam · Panen · Kembangkan
              </p>
            </div>
          </div>

          <div className="sm:hidden flex items-center gap-2">
            <div className="stat-chip bg-gradient-to-b from-[#ffe08a] to-[#f0b429] text-[#4a3208] !py-1 !px-2.5">
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
            className="stat-chip bg-gradient-to-b from-[#ffe08a] to-[#f0b429] text-[#4a3208]"
          >
            <Coins className="w-4 h-4" />
            <AnimatedCounter value={coins} className="text-sm font-black" />
          </motion.div>

          <div className="relative group">
            <div className="stat-chip bg-gradient-to-b from-[#6fbf55] to-[#2f6b3a] text-white">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-black">Lv {level}</span>
            </div>
            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-[#1c301e] text-[#f7f4e8] text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[#e8d296]/30">
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
            className="p-2 rounded-2xl bg-black/25 hover:bg-black/40 transition-colors border-2 border-white/15"
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#f7f4e8]" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-[#f7f4e8]/50" />
            )}
          </motion.button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${xpProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-[#7ec850] via-[#c6e265] to-[#f0b429]"
        />
      </div>
    </motion.header>
  );
}
