'use client';

import { motion } from 'framer-motion';
import { Coins, Star, Flame } from 'lucide-react';
import { AnimatedCounter, AnimatedXPCounter } from '@/components/ui/AnimatedCounter';
import { useClickSound } from '@/lib/hooks/useSound';

export function TopBar({ coins, level, xp, xpNeeded, streak }) {
  const { play: playClick } = useClickSound();
  
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-green-200 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => playClick()}
          >
            <span className="text-3xl">🌾</span>
            <h1 className="text-xl font-bold text-green-700 hidden sm:block">
              Farm Tycoon
            </h1>
          </motion.div>
          
          {/* Stats */}
          <div className="flex items-center gap-3">
            {/* Coins */}
            <motion.div
              key={coins}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-2 rounded-full shadow-md"
            >
              <Coins className="w-5 h-5" />
              <AnimatedCounter 
                value={coins} 
                className="font-bold text-lg"
              />
            </motion.div>
            
            {/* Level */}
            <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-full shadow-md">
              <Star className="w-5 h-5" />
              <span className="font-bold">Lv {level}</span>
            </div>
            
            {/* Streak */}
            {streak > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-2 rounded-full shadow-md"
              >
                <Flame className="w-5 h-5" />
                <span className="font-bold">{streak}</span>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* XP Progress */}
        <div className="mt-3">
          <AnimatedXPCounter value={xp} max={xpNeeded} />
        </div>
      </div>
    </motion.header>
  );
}
