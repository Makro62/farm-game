'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import toast from 'react-hot-toast';

const SEASON_META = {
  spring: { emoji: '🌸', label: 'Semi', chip: 'bg-[#f7a8c4]/90 text-[#5a1f35]' },
  summer: { emoji: '☀️', label: 'Panas', chip: 'bg-[#ffe08a]/95 text-[#4a3208]' },
  autumn: { emoji: '🍂', label: 'Gugur', chip: 'bg-[#e8a05a]/95 text-[#4a2208]' },
  winter: { emoji: '❄️', label: 'Dingin', chip: 'bg-[#b8d4f0]/95 text-[#1e3a5f]' },
};

export function StatusHeader() {
  const season = useGameStore(state => state.season);
  const weather = useGameStore(state => state.weather);
  const activeEvent = useGameStore(state => state.activeEvent);
  const combo = useGameStore(state => state.combo);

  const checkStreak = useGameStore(state => state.checkStreak);
  const resetGame = useGameStore(state => state.resetGame);
  const openConfirm = useGameStore(state => state.openConfirm);
  const touchSaveTimestamp = useGameStore(state => state.touchSaveTimestamp);

  const seasonMeta = SEASON_META[season?.current] || SEASON_META.spring;

  const handleClaimDaily = () => {
    const result = checkStreak();
    if (result.claimed) toast.success(result.message);
    else toast(result.message, { icon: '📅' });
  };

  const handleSave = () => {
    touchSaveTimestamp?.();
    toast.success('Game tersimpan! 💾');
  };

  const handleReset = () => {
    openConfirm(
      'Reset Game',
      'Semua progress (koin, level, tanaman, hewan) akan hilang. Yakin?',
      () => {
        resetGame();
        toast.success('Game di-reset ke awal!');
      }
    );
  };

  return (
    <div className="mb-5 space-y-3">
      {activeEvent && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="event-banner rounded-2xl p-4 sm:p-5 text-white flex items-center gap-4"
        >
          <div className="text-4xl sm:text-5xl bg-black/20 p-3 rounded-2xl border border-white/25 animate-float">
            {activeEvent.name.split(' ')[0]}
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-black tracking-[0.18em] text-[#fff1b8] uppercase mb-1">
              Event Spesial
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-shadow">
              {activeEvent.name.split(' ').slice(1).join(' ')}
            </h2>
            <p className="opacity-95 font-bold text-xs sm:text-sm mt-1 text-[#f7f4e8]/95">
              {activeEvent.desc}
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-2 glass-card p-2.5 rounded-2xl">
        <div className="flex flex-wrap gap-2">
          <div className={`season-chip ${seasonMeta.chip}`}>
            <span>{seasonMeta.emoji}</span>
            <span>Musim {seasonMeta.label} · Hari {season.day}/7</span>
          </div>
          <div className="season-chip bg-white/20 text-white">
            <span>{weather.current}</span>
            <span className="opacity-70 font-mono text-[10px]">{weather.nextChangeIn}s</span>
          </div>
          {combo?.count > 1 && (
            <div className="season-chip bg-gradient-to-r from-[#ff9a5a] to-[#e85d4c] text-white animate-pulse">
              🔥 Combo ×{combo.count} ({combo.multiplier.toFixed(2)}x)
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleClaimDaily} className="btn-gold !px-3 !py-1.5 !text-xs sm:!text-sm !rounded-xl">
            🎁 Daily
          </button>
          <button onClick={handleSave} className="btn-secondary !px-3 !py-1.5 !text-xs sm:!text-sm !rounded-xl">
            💾 Save
          </button>
          <button onClick={handleReset} className="btn-danger !px-3 !py-1.5 !text-xs sm:!text-sm !rounded-xl opacity-90">
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
}
