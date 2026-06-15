'use client';

import { motion } from 'framer-motion';
import { Coins, Star, Flame, Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { AnimatedCounter } from './ui/AnimatedCounter';

export default function Topbar() {
  const { coins, level, xp, streak, soundEnabled, toggleSound } = useGameStore();
  
  const xpNeeded = level * 100;
  const xpProgress = (xp / xpNeeded) * 100;
  
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-md safe-top"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <motion.img
              src="/img/logo.png"
              alt="Farm Tycoon Logo"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <h1 className="text-xl sm:text-2xl font-black text-white hidden xs:block tracking-tight drop-shadow-md">
              Farm Tycoon
            </h1>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Coins */}
            <motion.div
              key={coins}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="stat-chip bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
            >
              <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
              <AnimatedCounter value={coins} className="text-sm sm:text-base" />
            </motion.div>
            
            {/* Level */}
            <div className="stat-chip bg-green-500 text-white">
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Lv {level}</span>
            </div>
            
            {/* Streak */}
            {streak > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="stat-chip bg-gradient-to-r from-orange-400 to-red-500 text-white"
              >
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-wiggle" />
                <span className="text-sm sm:text-base">{streak}</span>
              </motion.div>
            )}
            
            {/* Sound toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleSound}
              className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
              ) : (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
              )}
            </motion.button>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="progress-fill"
            />
          </div>
          <span className="text-xs text-green-600 font-semibold whitespace-nowrap">
            {xp}/{xpNeeded}
          </span>
        </div>
      </div>
    </motion.header>
  );
}
