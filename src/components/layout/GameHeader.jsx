"use client";

import { useState, useEffect } from "react";
import { Coins, Flame, Star, Zap, Menu } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { SEASON_META } from "@/lib/nav";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/utils";

function useHeaderState() {
  const coins = useGameStore((s) => s?.coins ?? 0);
  const level = useGameStore((s) => s?.level ?? 1);
  const xp = useGameStore((s) => s?.xp ?? 0);
  const energy = useGameStore((s) => s?.energy ?? 0);
  const maxEnergy = useGameStore((s) => s?.maxEnergy ?? 100);
  const streak = useGameStore((s) => s?.streak ?? 0);
  const season = useGameStore((s) => s?.season ?? { current: "spring" });
  const weather = useGameStore((s) => s?.weather ?? { current: "☀️ Cerah" });
  const activeEvent = useGameStore((s) => s?.activeEvent ?? null);
  const combo = useGameStore((s) => s?.combo ?? { count: 0 });
  const plots = useGameStore((s) => s?.plots ?? []);
  const animals = useGameStore((s) => s?.animals ?? []);
  const mining = useGameStore((s) => s?.mining ?? null);
  const crafting = useGameStore((s) => s?.craftingQueue ?? []);
  const orders = useGameStore((s) => s?.orders ?? []);

  const xpProgress = Math.min(100, (xp / Math.max(level * 100, 1)) * 100);
  const energyProgress = Math.min(100, Math.max(0, (energy / maxEnergy) * 100));
  const seasonMeta = SEASON_META[season?.current] || SEASON_META.spring;

  // Build summary ticker
  const summary = [];
  const readyPlots = plots?.filter((p) => p.status === "ready").length || 0;
  if (readyPlots > 0) summary.push(`🌾 ${readyPlots} siap panen`);
  const readyAnimals = animals?.filter((a) => a.status === "producing" && Date.now() - a.lastCollected >= (a.produceTime || 60000)).length || 0;
  if (readyAnimals > 0) summary.push(`🐄 ${readyAnimals} siap diambil`);
  const readyNodes = mining?.nodes?.filter((n) => n.status === "ready").length || 0;
  if (readyNodes > 0) summary.push(`⛏️ ${readyNodes} node siap`);
  const doneCrafting = crafting?.filter((c) => Date.now() - c.startTime >= c.duration).length || 0;
  if (doneCrafting > 0) summary.push(`🍳 ${doneCrafting} masakan siap`);
  if (orders?.length > 0) summary.push(`📦 ${orders.length} pesanan aktif`);

  return {
    coins, level, xp, energy, maxEnergy, streak, season, weather, activeEvent, combo,
    xpProgress, energyProgress, seasonMeta, summary
  };
}

export default function GameHeader({ onMobileMenu }) {
  const state = useHeaderState();
  
  return (
    <header className="shell-header flex flex-col w-full z-30 shrink-0 text-[var(--text-on-dark)]" style={{
      background: "linear-gradient(180deg, rgba(255,248,236,0.12) 0%, transparent 40%), linear-gradient(180deg, #c49563 0%, var(--wood) 40%, #4a2c18 100%)",
      borderBottom: "4px solid #2e1a0c"
    }}>
      <div className="shell-header-top flex items-center justify-between w-full lg:hidden p-3 border-b-2 border-black/20 bg-black/10">
        <div className="flex items-center gap-3">
          <button type="button" className="inline-flex w-9 h-9 items-center justify-center bg-black/20 rounded-xl border border-white/10 shadow-sm" onClick={onMobileMenu}>
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/img/logo.png" alt="Farm Tycoon" className="w-8 h-8 object-contain drop-shadow" />
            <span className="font-display font-bold text-lg text-white drop-shadow-sm">Farm Tycoon</span>
          </div>
        </div>
      </div>

      <div className="shell-header-content flex items-center flex-wrap gap-5 w-full px-4 py-2 lg:px-6 lg:py-3">

        <div className="flex items-center gap-3 bg-[var(--card)] px-4 py-1.5 rounded-full border-[3px] border-[#c49563] shadow-md">
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
            <Coins className="w-4 h-4 text-amber-500" />
            <AnimatedCounter value={state.coins} className="tabular-nums" />
          </div>
          {state.streak > 0 && (
            <div className="flex items-center gap-1 text-orange-500 text-xs font-black bg-orange-100 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" /> {state.streak}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 w-[130px]">
          <div className="flex items-center justify-between text-xs font-black text-[#fff8ec]">
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-[var(--gold)] text-[var(--gold-deep)]" /> Lv {state.level}</span>
          </div>
          <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/5">
            <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--gold)]" style={{ width: `${state.xpProgress}%` }} />
          </div>
        </div>

        <div className="flex flex-col gap-1 w-[130px]">
          <div className="flex items-center justify-between text-xs font-black text-[#86efac]">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 fill-[#10b981] text-[#059669]" /> {Math.floor(state.energy)}/{state.maxEnergy}</span>
          </div>
          <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/5">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300" style={{ width: `${state.energyProgress}%` }} />
          </div>
        </div>

        <div className="flex flex-col justify-center border-l-2 pl-5 border-black/20 ml-2">
          <div className="text-sm font-black text-white flex items-center gap-2">
            {state.seasonMeta.emoji} {state.seasonMeta.label} <span className="opacity-40 font-normal">|</span> Hari {state.season?.day || 1}/7
          </div>
          <div className="text-xs font-bold text-white opacity-80">
            {state.weather?.current || "☀️ Cerah"}
          </div>
        </div>

        {(state.activeEvent || state.combo?.count > 1) && (
          <div className="flex items-center gap-2 ml-auto">
            {state.activeEvent && (
              <span className="bg-amber-100 text-amber-800 border-2 border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                {state.activeEvent.name}
              </span>
            )}
            {state.combo?.count > 1 && (
              <span className="bg-orange-100 text-orange-800 border-2 border-orange-300 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                Combo ×{state.combo.count}
              </span>
            )}
          </div>
        )}
      </div>

      {state.summary.length > 0 && (
        <div className="w-full bg-black/20 border-t-2 border-black/30 px-4 py-1.5">
          <div className="text-[11px] text-[#fff8ec] font-bold flex items-center gap-3 overflow-x-auto scrollbar-hide whitespace-nowrap opacity-90">
            {state.summary.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                {item} {i < state.summary.length - 1 && <span className="opacity-40 px-1">·</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
