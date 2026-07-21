"use client";

import { Coins, Flame, Star, Zap, Menu } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { SEASON_META } from "@/lib/nav";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

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

  const summary: string[] = [];
  const readyPlots = plots?.filter((p) => p.status === "ready").length || 0;
  if (readyPlots > 0) summary.push(`🌾 ${readyPlots} siap panen`);
  const readyAnimals =
    animals?.filter(
      (a) =>
        a.status === "producing" &&
        Date.now() - a.lastCollected >= (a.produceTime || 60000),
    ).length || 0;
  if (readyAnimals > 0) summary.push(`🐄 ${readyAnimals} siap diambil`);
  const readyNodes =
    mining?.nodes?.filter((n) => n.status === "ready").length || 0;
  if (readyNodes > 0) summary.push(`⛏️ ${readyNodes} node siap`);
  const doneCrafting =
    crafting?.filter((c) => Date.now() - c.startTime >= c.duration).length || 0;
  if (doneCrafting > 0) summary.push(`🍳 ${doneCrafting} masakan siap`);
  if (orders?.length > 0) summary.push(`📦 ${orders.length} pesanan aktif`);

  return {
    coins,
    level,
    energy,
    maxEnergy,
    streak,
    season,
    weather,
    activeEvent,
    combo,
    xpProgress,
    energyProgress,
    seasonMeta,
    summary,
  };
}

export default function GameHeader({
  onMobileMenu,
}: {
  onMobileMenu: () => void;
}) {
  const state = useHeaderState();

  return (
    <header className="shell-header">
      <div className="shell-header-bar">
        <button
          type="button"
          className="shell-header-menu"
          onClick={onMobileMenu}
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="shell-header-brand">
          <img src="/img/logo.png" alt="" className="shell-header-logo" />
          <span>Farm Tycoon</span>
        </div>

        <div className="shell-header-stats">
          <div className="shell-stat-pill">
            <div className="shell-stat-coins">
              <Coins className="w-4 h-4 text-[var(--gold-deep)]" />
              <AnimatedCounter value={state.coins} className="tabular-nums" />
            </div>
            {state.streak > 0 && (
              <div className="shell-stat-streak">
                <Flame className="w-3 h-3" /> {state.streak}
              </div>
            )}
          </div>

          <div className="shell-stat-meter">
            <div className="shell-stat-meter-label">
              <Star className="w-3.5 h-3.5 fill-[var(--gold)] text-[var(--gold-deep)]" />
              Lv {state.level}
            </div>
            <div className="shell-stat-track">
              <div
                className="shell-stat-fill shell-stat-fill--xp"
                style={{ width: `${state.xpProgress}%` }}
              />
            </div>
          </div>

          <div className="shell-stat-meter">
            <div className="shell-stat-meter-label shell-stat-meter-label--energy">
              <Zap className="w-3.5 h-3.5 fill-[var(--primary-light)] text-[var(--primary)]" />
              {Math.floor(state.energy)}/{state.maxEnergy}
            </div>
            <div className="shell-stat-track">
              <div
                className="shell-stat-fill shell-stat-fill--energy"
                style={{ width: `${state.energyProgress}%` }}
              />
            </div>
          </div>

          <div className="shell-stat-season">
            <div className="shell-stat-season-title">
              {state.seasonMeta.emoji} {state.seasonMeta.label}
              <span className="shell-stat-season-sep">|</span>
              Hari {state.season?.day || 1}/7
            </div>
            <div className="shell-stat-season-weather">
              {state.weather?.current || "☀️ Cerah"}
            </div>
          </div>

          {(state.activeEvent || state.combo?.count > 1) && (
            <div className="shell-stat-chips">
              {state.activeEvent && (
                <span className="shell-stat-chip shell-stat-chip--event">
                  {state.activeEvent.name}
                </span>
              )}
              {state.combo?.count > 1 && (
                <span className="shell-stat-chip shell-stat-chip--combo">
                  Combo ×{state.combo.count}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {state.summary.length > 0 && (
        <div className="shell-summary">
          {state.summary.map((item, i) => (
            <span key={item} className="shell-summary-item">
              {item}
              {i < state.summary.length - 1 && (
                <span className="shell-summary-dot">·</span>
              )}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
