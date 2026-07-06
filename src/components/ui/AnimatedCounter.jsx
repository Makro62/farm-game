'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function AnimatedCounter({ 
  value, 
  duration = 0.5, 
  className = '',
  format = (val) => (val ?? 0).toLocaleString('id-ID')
}) {
  const [displayValue, setDisplayValue] = useState(value ?? 0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = displayValue ?? 0;
    const endValue = value ?? 0;
    const durationMs = duration * 1000;

    if (startValue === endValue) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      
      // easeOut cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * ease);
      
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);
  
  return (
    <motion.span className={className}>
      {format(displayValue)}
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
