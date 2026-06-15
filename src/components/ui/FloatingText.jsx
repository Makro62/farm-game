'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function FloatingText({ 
  text, 
  type = 'coin',
  position = { x: 0, y: 0 },
  onComplete 
}) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  const variants = {
    coin: {
      initial: { y: 0, scale: 1, opacity: 1 },
      animate: { y: -80, scale: 1.2, opacity: 0 }
    },
    xp: {
      initial: { y: 0, x: 0, opacity: 1 },
      animate: { y: -50, x: 30, opacity: 0 }
    },
    levelup: {
      initial: { scale: 0, rotate: -180, opacity: 0 },
      animate: { 
        scale: [0, 1.3, 1], 
        rotate: [0, 10, 0],
        opacity: [0, 1, 1, 0]
      }
    },
    combo: {
      initial: { y: 0, scale: 0.5, opacity: 1 },
      animate: { y: -100, scale: 1.5, opacity: 0 }
    },
    damage: {
      initial: { y: 0, x: 0, opacity: 1 },
      animate: { y: -60, x: -20, opacity: 0 }
    }
  };
  
  const colors = {
    coin: 'text-yellow-500',
    xp: 'text-blue-500',
    levelup: 'text-purple-500',
    combo: 'text-pink-500',
    damage: 'text-red-500'
  };
  
  const sizes = {
    coin: 'text-2xl',
    xp: 'text-xl',
    levelup: 'text-4xl',
    combo: 'text-3xl',
    damage: 'text-2xl'
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="initial"
          animate="animate"
          variants={variants[type]}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={`fixed z-50 font-black pointer-events-none ${colors[type]} ${sizes[type]}`}
          style={{
            left: position.x,
            top: position.y,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook untuk manage multiple floating texts
export function useFloatingText() {
  const [texts, setTexts] = useState([]);
  
  const addText = (text, type, position) => {
    const id = Date.now() + Math.random();
    setTexts(prev => [...prev, { id, text, type, position }]);
  };
  
  const removeText = (id) => {
    setTexts(prev => prev.filter(t => t.id !== id));
  };
  
  const FloatingTextContainer = () => (
    <>
      {texts.map(({ id, text, type, position }) => (
        <FloatingText
          key={id}
          text={text}
          type={type}
          position={position}
          onComplete={() => removeText(id)}
        />
      ))}
    </>
  );
  
  return { addText, FloatingTextContainer };
}
