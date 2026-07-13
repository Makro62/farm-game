'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';

const SEASON_META = {
  spring: { emoji: '🌸', label: 'Semi', chip: 'bg-[#f7a8c4]/90 text-[#5a1f35]' },
  summer: { emoji: '☀️', label: 'Panas', chip: 'bg-[#FFE08A]/95 text-[var(--text-primary)]' },
  autumn: { emoji: '🍂', label: 'Gugur', chip: 'bg-[#e8a05a]/95 text-[#4a2208]' },
  winter: { emoji: '❄️', label: 'Dingin', chip: 'bg-[#b8d4f0]/95 text-[#1e3a5f]' },
};

export function StatusHeader() {
  const season = useGameStore((state) => state.season);
  const weather = useGameStore((state) => state.weather);
  const activeEvent = useGameStore((state) => state.activeEvent);
  const combo = useGameStore((state) => state.combo);

  const seasonMeta = SEASON_META[season?.current] || SEASON_META.spring;

  return (
    <div className="mb-4 space-y-3">
      {activeEvent && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="event-banner rounded-2xl p-4 sm:p-5 text-[var(--text-primary)] flex items-center gap-4"
        >
          <div className="text-4xl sm:text-5xl bg-white/35 p-3 rounded-2xl border border-white/50 animate-float">
            {activeEvent.name.split(' ')[0]}
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-black tracking-[0.18em] text-[var(--text-primary)]/70 uppercase mb-1">
              Event Spesial
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-shadow">
              {activeEvent.name.split(' ').slice(1).join(' ')}
            </h2>
            <p className="opacity-95 font-bold text-xs sm:text-sm mt-1 text-[var(--text-primary)]">
              {activeEvent.desc}
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap items-center gap-2 glass-card p-2.5 rounded-2xl">
        <div className={`season-chip ${seasonMeta.chip}`}>
          <span>{seasonMeta.emoji}</span>
          <span>
            Musim {seasonMeta.label} · Hari {season?.day || 1}/7
          </span>
        </div>
        <div className="season-chip bg-white/60 text-[var(--text-primary)] border-[var(--wood)]">
          <span>{weather?.current}</span>
          <span className="opacity-70 font-mono text-[10px]">{weather?.nextChangeIn}s</span>
        </div>
        {combo?.count > 1 && (
          <div className="season-chip bg-gradient-to-r from-[#ff9a5a] to-[#e85d4c] text-white animate-pulse">
            Combo ×{combo.count} ({combo.multiplier.toFixed(2)}x)
          </div>
        )}
      </div>
    </div>
  );
}
