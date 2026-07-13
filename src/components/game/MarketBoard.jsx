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
    <div className="market-board p-3 mb-5">
      <div className="font-display font-bold text-base mb-3 flex items-center justify-between gap-2 border-b-2 border-[#e8d296]/30 pb-2 text-[#fff1b8]">
        <span className="flex items-center gap-2">
          <span className="text-xl">📈</span> Papan Harga
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-[10px] font-black uppercase tracking-wide bg-[#f0b429] text-[#4a3208] hover:brightness-110 px-2.5 py-1 rounded-lg border border-[#fff1b8]"
        >
          Refresh
        </button>
      </div>

      {buildings?.silo && (
        <p className="text-[10px] font-bold text-[#ffe08a] mb-2 bg-black/20 rounded-lg px-2 py-1">
          🏚️ Silo aktif — jual tanaman +15%
        </p>
      )}

      {entries.length === 0 ? (
        <div className="text-sm text-[#e8d296]/80 italic text-center py-4 font-bold">
          Pasar belum buka. Klik Refresh.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {entries.map(([cropId, price]) => {
            const up = marketTrend[cropId] === 'up';
            return (
              <div
                key={cropId}
                className={`market-row ${up ? 'market-row--up' : 'market-row--down'} px-2.5 py-2 flex items-center justify-between gap-2`}
              >
                <span className="text-sm font-extrabold text-[#f7f4e8] truncate">
                  {getCropEmoji(cropId)} {CROP_DATA[cropId]?.name || cropId}
                </span>
                <span className={`text-xs font-black tabular-nums ${up ? 'text-[#9fd67f]' : 'text-[#ffb3aa]'}`}>
                  {price}💰 {up ? '▲' : '▼'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
