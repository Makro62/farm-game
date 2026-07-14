'use client';

import { motion } from 'framer-motion';

/** Layout fullscreen: area main + panel sisi, tidak memanjang ke bawah */
export default function TabPage({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`game-stage ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function GameStage({ main, side }) {
  return (
    <div className="game-stage-grid">
      <section className="game-stage-main">{main}</section>
      {side != null && <aside className="game-stage-side">{side}</aside>}
    </div>
  );
}
