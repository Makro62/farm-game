'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHarvestSound, usePlantSound } from '@/lib/hooks/useSound';
import { useHarvestConfetti } from '@/lib/hooks/useConfetti';
import { toastHarvest, toastCropReady } from '@/lib/toast';
import { useFloatingText } from '@/components/ui/FloatingText';

export function Plot({ plot, onHarvest, onPlant }) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const { play: playHarvest } = useHarvestSound();
  const { play: playPlant } = usePlantSound();
  const triggerConfetti = useHarvestConfetti();
  const { addText, FloatingTextContainer } = useFloatingText();
  
  // Update progress
  useEffect(() => {
    if (plot.status !== 'growing' || !plot.plantedAt) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - plot.plantedAt;
      const growTime = plot.growTime || 30000;
      const pct = Math.min((elapsed / growTime) * 100, 100);
      
      setProgress(pct);
      
      if (pct >= 100 && !isReady) {
        setIsReady(true);
        toastCropReady(plot.crop?.name || 'Tanaman');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [plot, isReady]);
  
  const handleClick = (e) => {
    if (plot.status === 'empty') {
      onPlant?.(plot.id);
      playPlant();
    } else if (plot.status === 'ready' || isReady) {
      // Get position for floating text
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top
      };
      
      // Play sound
      playHarvest();
      
      // Trigger confetti
      triggerConfetti(1);
      
      // Show floating text
      const coins = plot.crop?.coins || 50;
      addText(`+${coins} 💰`, 'coin', position);
      
      // Show toast
      toastHarvest(plot.crop?.name || 'Tanaman', 1, coins);
      
      // Harvest
      onHarvest?.(plot.id);
      
      // Reset state
      setIsReady(false);
      setProgress(0);
    }
  };
  
  return (
    <>
      <motion.div
        layout
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isReady ? {
          boxShadow: [
            '0 0 0px rgba(251, 191, 36, 0)',
            '0 0 20px rgba(251, 191, 36, 0.8)',
            '0 0 0px rgba(251, 191, 36, 0)'
          ]
        } : {}}
        transition={isReady ? { duration: 1, repeat: Infinity } : {}}
        className={`
          relative aspect-square rounded-xl cursor-pointer overflow-hidden
          ${plot.status === 'empty' ? 'bg-gradient-to-br from-amber-700 to-amber-800 border-2 border-dashed border-amber-600' : ''}
          ${plot.status === 'growing' && !isReady ? 'bg-gradient-to-br from-green-400 to-green-500 border-2 border-green-300' : ''}
          ${isReady ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-2 border-yellow-600' : ''}
        `}
      >
        {/* Empty State */}
        {plot.status === 'empty' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl text-white/60"
            >
              +
            </motion.span>
          </div>
        )}
        
        {/* Growing State */}
        {plot.status === 'growing' && !isReady && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.span
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl"
              >
                {plot.crop?.emoji || '🌱'}
              </motion.span>
            </motion.div>
            
            {/* Progress Bar */}
            <div className="absolute bottom-1 left-1 right-1 h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-green-400 to-lime-400"
              />
            </div>
          </>
        )}
        
        {/* Ready State */}
        {isReady && (
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [-5, 5, -5]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-6xl drop-shadow-lg">
              {plot.crop?.emoji || '🥕'}
            </span>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute top-1 right-1 text-2xl"
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </motion.div>
      
      <FloatingTextContainer />
    </>
  );
}
