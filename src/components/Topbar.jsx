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
  const xpProgress = (xp / xpNeeded) * 100;
  
  const handleToggleSound = () => {
    // Toggle all audio (SFX + Music) in the engine
    const newState = audioManager.toggleAll();
    // Sync Zustand store to match
    const store = useGameStore.getState();
    if (store.soundEnabled !== newState) store.toggleSound();
    if (store.musicEnabled !== newState) store.toggleMusic();
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-xl safe-top w-full"
    >
      <div className="w-full px-2 sm:px-4 md:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 relative overflow-hidden">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <motion.img
              src="/img/logo.png"
              alt="Farm Tycoon Logo"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md"
            />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md whitespace-nowrap hidden lg:block">
              Farm Tycoon
            </h1>
          </div>
          
          {/* On mobile, we can optionally show stats next to logo, but let's keep it clean */}
          <div className="sm:hidden flex items-center gap-2">
            {/* Small mobile coin display */}
            <div className="stat-chip bg-gradient-to-r from-yellow-400 to-yellow-500 text-white !py-1 !px-2">
              <Coins className="w-3 h-3" />
              <AnimatedCounter value={coins} className="text-xs" />
            </div>
          </div>
        </div>
        
        {/* Center: TabsNav */}
        <div className="flex-1 flex justify-center w-full sm:w-auto overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
          <TabsNav />
        </div>
        
        {/* Right: Stats (Hidden on very small mobile, shown on SM up, or we can adapt) */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          {/* Coins */}
          <motion.div
            key={coins}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="stat-chip bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md shadow-yellow-500/20"
          >
            <Coins className="w-4 h-4" />
            <AnimatedCounter value={coins} className="text-sm font-bold" />
          </motion.div>
            
            {/* Level & XP */}
            <div className="relative group">
              <div className="stat-chip bg-green-500 text-white cursor-help">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-black">Lv {level}</span>
              </div>
              {/* Tooltip for XP */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                XP: {xp} / {xpNeeded}
              </div>
            </div>
            
            {/* Streak */}
            {streak > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="stat-chip bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-red-500/20"
              >
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-wiggle" />
                <span className="text-sm sm:text-base font-black">{streak}</span>
              </motion.div>
            )}
            
            {/* Sound toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleSound}
              className="p-1.5 sm:p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors border border-white/10"
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Sleek XP Progress Line at absolute bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-black/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-green-400 to-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
          />
        </div>
    </motion.header>
  );
}
