'use client';

import { useGameStore } from '@/lib/store';
import { CROP_DATA, getCropEmoji } from '@/lib/utils';
import toast from 'react-hot-toast';

export function MarketBoard() {
  const todayPrices = useGameStore((s) => s.todayPrices);
  const marketTrend = useGameStore((s) => s.marketTrend);
  const updateMarket = useGameStore((s) => s.updateMarket);
  const buildings = useGameStore((s) => s.buildings);

  const entries = Object.entries(todayPrices || {});

  const handleRefresh = () => {
    updateMarket();
    toast.success('Harga pasar diperbarui!', { icon: '📈' });
  };

  return (
    <div className="mb-6">
      <div className="font-bold text-lg mb-3 flex items-center justify-between gap-2 border-b-2 border-white/20 pb-2 text-white">
        <span className="flex items-center gap-2">
          <span>📈</span> Harga Pasar Hari Ini
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-[10px] bg-white/15 hover:bg-white/25 px-2 py-1 rounded-lg"
        >
          Refresh
        </button>
      </div>
      {buildings?.silo && (
        <p className="text-[10px] text-amber-200 mb-2">🏚️ Silo aktif — jual tanaman +15%</p>
      )}
      {entries.length === 0 ? (
        <div className="glass-card p-3 text-sm text-gray-300 italic text-center">
          Pasar belum buka. Klik Refresh.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {entries.map(([cropId, price]) => (
            <div key={cropId} className="glass-card p-2 flex items-center justify-between gap-1">
              <span className="text-sm font-bold text-white truncate">
                {getCropEmoji(cropId)} {CROP_DATA[cropId]?.name || cropId}
              </span>
              <span className={`text-xs font-black tabular-nums ${marketTrend[cropId] === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}>
                {price}💰 {marketTrend[cropId] === 'up' ? '↑' : '↓'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
