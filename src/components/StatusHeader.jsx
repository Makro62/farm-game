import { useGameStore } from '@/lib/store';
import toast from 'react-hot-toast';

export function StatusHeader({ setAutoFarm, setSelectedInventoryItem }) {
  const season = useGameStore(state => state.season);
  const weather = useGameStore(state => state.weather);
  const activeEvent = useGameStore(state => state.activeEvent);
  
  const checkStreak = useGameStore(state => state.checkStreak);
  const resetGame = useGameStore(state => state.resetGame);
  const openConfirm = useGameStore(state => state.openConfirm);

  const handleClaimDaily = () => {
    const result = checkStreak();
    if (result.claimed) {
      toast.success(result.message);
    } else {
      toast(result.message, { icon: '📅' });
    }
  };

  const handleSave = () => {
    // Zustand persist menyimpan otomatis pada setiap perubahan; ini hanya feedback.
    toast.success('Game tersimpan! 💾');
  };

  const handleReset = () => {
    openConfirm(
      'Reset Game',
      'Semua progress (koin, level, tanaman, hewan) akan hilang. Yakin?',
      () => {
        resetGame();
        if (setSelectedInventoryItem) setSelectedInventoryItem(null);
        if (setAutoFarm) setAutoFarm(false);
        toast.success('Game di-reset ke awal!');
      }
    );
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Event Banner */}
      {activeEvent && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 shadow-lg text-white flex items-center gap-4 animate-in slide-in-from-top-4">
          <div className="text-4xl sm:text-5xl bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30">
            {activeEvent.name.split(' ')[0]}
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold tracking-widest text-pink-200 uppercase mb-1">Event Spesial Hari Ini</div>
            <h2 className="font-black text-xl sm:text-2xl">{activeEvent.name.split(' ').slice(1).join(' ')}</h2>
            <p className="opacity-90 font-medium text-xs sm:text-sm mt-1">{activeEvent.desc}</p>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex flex-wrap justify-between items-center gap-2 glass-card p-2 rounded-xl">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg shadow-sm border border-white/10">
            <span className="font-bold text-xs sm:text-sm text-white capitalize">
              {season.current === 'spring' ? '🌸' : season.current === 'summer' ? '☀️' : season.current === 'autumn' ? '🍂' : '❄️'} Musim {season.current} (Hari {season.day})
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg shadow-sm border border-white/10">
            <span className="font-bold text-xs sm:text-sm text-white">
              {weather.current}
            </span>
            <span className="text-[10px] sm:text-xs text-white/70 ml-2 font-mono">{weather.nextChangeIn}s</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleClaimDaily} className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm shadow-sm hover:scale-105 transition-transform">🎁 Daily</button>
          <button onClick={handleSave} className="bg-white/20 text-white px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm shadow-sm hover:bg-white/30 border border-white/10">💾 Save</button>
          <button onClick={handleReset} className="bg-red-500/20 text-red-100 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm shadow-sm border border-red-500/30 hover:bg-red-500/40">🔄 Reset</button>
        </div>
      </div>
    </div>
  );
}
