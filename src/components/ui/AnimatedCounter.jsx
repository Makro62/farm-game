'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export function AnimatedCounter({ 
  value, 
  duration = 0.5, 
  className = '',
  format = (val) => val.toLocaleString('id-ID')
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => format(Math.round(latest)));
  const prevValue = useRef(value);
  
  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: 'easeOut'
    });
    
    prevValue.current = value;
    
    return controls.stop;
  }, [value, duration, count]);
  
  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  );
}

// Variant dengan prefix/suffix
export function AnimatedCoinCounter({ value, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-2xl">💰</span>
      <AnimatedCounter 
        value={value} 
        className="font-bold text-xl"
      />
    </div>
  );
}

// Variant untuk XP
export function AnimatedXPCounter({ value, max, className = '' }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold">⭐ XP</span>
        <span className="text-sm font-bold">
          <AnimatedCounter value={value} /> / {max}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
        />
      </div>
    </div>
  );
}
