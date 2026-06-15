'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';

export function AchievementPopup({ 
  show, 
  title, 
  description, 
  icon = '🏆',
  onClose 
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);
  
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Confetti */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
              <ConfettiExplosion
                force={0.8}
                duration={3000}
                particleCount={250}
                width={1600}
                colors={['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa']}
              />
            </div>
          )}
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ type: 'spring', damping: 15 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 shadow-2xl max-w-md">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="text-8xl text-center mb-4"
              >
                {icon}
              </motion.div>
              
              <h2 className="text-3xl font-black text-white text-center mb-2">
                {title}
              </h2>
              
              <p className="text-white/90 text-center text-lg mb-6">
                {description}
              </p>
              
              <button
                onClick={onClose}
                className="w-full bg-white text-orange-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Keren! 🎉
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook untuk achievement
export function useAchievement() {
  const [achievement, setAchievement] = useState(null);
  
  const showAchievement = (title, description, icon = '🏆') => {
    setAchievement({ title, description, icon });
  };
  
  const hideAchievement = () => {
    setAchievement(null);
  };
  
  const AchievementContainer = () => (
    <AchievementPopup
      show={!!achievement}
      title={achievement?.title}
      description={achievement?.description}
      icon={achievement?.icon}
      onClose={hideAchievement}
    />
  );
  
  return { showAchievement, hideAchievement, AchievementContainer };
}
