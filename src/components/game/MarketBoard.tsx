"use client";

import { useGameStore } from "@/lib/store";
import { CROP_DATA } from "@/lib/data/crops";
import { getCropEmoji } from "@/lib/data/item-helpers";
import toast from "react-hot-toast";

export function MarketBoard() {
  const todayPrices = useGameStore((s) => s.todayPrices);
  const marketTrend = useGameStore((s) => s.marketTrend);
  const updateMarket = useGameStore((s) => s.updateMarket);
  const buildings = useGameStore((s) => s.buildings);

  const entries = Object.entries(todayPrices || {});

  const handleRefresh = () => {
    updateMarket();
    toast.success("Harga pasar diperbarui!", { icon: "📈" });
  };

  return (
    <div className="market-board p-3 mb-5">
      <div className="font-display font-bold text-base mb-3 flex items-center justify-between gap-2 border-b-2 border-white/20 pb-2 text-[#F4F7E8]">
        <span className="flex items-center gap-2">
          <span className="text-xl">📈</span> Papan Harga
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          className="btn-gold !px-2.5 !py-1 !text-[10px] uppercase tracking-wide"
        >
          Refresh
        </button>
      </div>

      {buildings?.silo && (
        <p className="text-[10px] font-bold text-[#FFE08A] mb-2 bg-black/20 rounded-lg px-2 py-1">
          Silo aktif — jual tanaman +15%
        </p>
      )}

      <p className="text-[10px] text-[#D7E8C8] mb-2 font-medium">
        Jual hasil lewat Tas · olahan di Restoran
      </p>

      {entries.length === 0 ? (
        <div className="text-sm text-[#D7E8C8]/90 italic text-center py-4 font-bold">
          Pasar belum buka. Klik Refresh.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {entries.map(([cropId, price]) => {
            const up = marketTrend[cropId] === "up";
            return (
              <div
                key={cropId}
                className={`market-row ${up ? "market-row--up" : "market-row--down"} px-2.5 py-2 flex items-center justify-between gap-2`}
              >
                <span className="text-sm font-extrabold text-[#F4F7E8] truncate">
                  {getCropEmoji(cropId)} {CROP_DATA[cropId]?.name || cropId}
                </span>
                <span
                  className={`text-xs font-black tabular-nums ${up ? "text-[#9FE870]" : "text-[#FFB3AA]"}`}
                >
                  {price}💰 {up ? "▲" : "▼"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
