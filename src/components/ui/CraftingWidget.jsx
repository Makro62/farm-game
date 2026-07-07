'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { RECIPES, getCropEmoji } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function CraftingWidget({ type = 'kitchen', title = 'Dapur Produksi', icon = '🍳' }) {
  const craftingQueue = useGameStore(state => state.craftingQueue);
  const startCrafting = useGameStore(state => state.startCrafting);
  const removeCraftingQueue = useGameStore(state => state.removeCraftingQueue);
  const inventory = useGameStore(state => state.inventory);

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  const recipes = RECIPES.filter(r => r.type === type);
  const activeQueues = craftingQueue.filter(q => RECIPES.find(r => r.id === q.recipeId)?.type === type);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white mt-6">
        <span>{icon}</span> {title}
      </div>

      {/* Crafting Queue */}
      <AnimatePresence>
        {activeQueues.map(queue => {
          const recipe = RECIPES.find(r => r.id === queue.recipeId);
          if (!recipe) return null;
          
          const rawProgress = ((currentTime - queue.startTime) / queue.duration) * 100;
          const progress = Math.min(100, Math.max(0, rawProgress));
          const isAlmostDone = progress > 90;

          return (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={queue.id} 
              className="glass-card border border-white/20 rounded-xl p-3 mb-3 relative overflow-hidden"
            >
              {/* Background glow when almost done */}
              {isAlmostDone && (
                <motion.div 
                  className="absolute inset-0 bg-amber-400/20"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}

              <div className="flex justify-between items-center mb-1 relative z-10">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <motion.span 
                    className="text-xl"
                    animate={{ rotate: isAlmostDone ? [0, -10, 10, 0] : [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: isAlmostDone ? 0.5 : 2 }}
                  >
                    {recipe.emoji}
                  </motion.span> 
                  Membuat {recipe.name}
                </span>
                <button 
                  onClick={() => removeCraftingQueue(queue.id)}
                  className="text-red-400 hover:text-red-300 text-xs font-bold bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full transition-colors active:scale-95"
                >
                  Batal
                </button>
              </div>
              <div className="w-full bg-black/40 rounded-full h-1.5 mt-2 relative z-10 overflow-hidden shadow-inner">
                <motion.div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-1.5 rounded-full" 
                  style={{ width: `${progress}%` }} 
                  initial={false}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Recipes List */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        {recipes.map(recipe => (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            key={recipe.id} 
            className="glass-card border border-white/10 p-3 rounded-xl flex flex-col transition-shadow hover:shadow-lg hover:border-white/20"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span className="text-2xl">{recipe.emoji}</span> {recipe.name}
              </div>
              <button 
                onClick={() => startCrafting(recipe.id)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-transform active:scale-95 flex items-center gap-1"
              >
                <span>Masak</span>
              </button>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(recipe.req).map(([item, qty]) => {
                  const has = inventory[item] || 0;
                  const isEnough = has >= qty;
                  return (
                    <span key={item} className={`px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-white/5 ${isEnough ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                      {getCropEmoji(item)} {has}/{qty}
                    </span>
                  );
                })}
              </div>
              <div className="text-amber-300 font-bold whitespace-nowrap bg-black/30 px-2 py-0.5 rounded-full">
                ⏱️ {recipe.time}s
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
