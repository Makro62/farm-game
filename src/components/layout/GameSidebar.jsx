"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  Coins,
  Flame,
  Menu,
  RotateCcw,
  Save,
  Star,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useGameStore } from "@/lib/store";
import { GAME_CONSTANTS } from "@/lib/constants";
import { NAV_TABS, SEASON_META } from "@/lib/nav";
import audioManager from "@/lib/audio";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "farm-shell-collapsed";

function useSidebarChrome() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);

  const coins = useGameStore((s) => s?.coins ?? 0);
  const level = useGameStore((s) => s?.level ?? 1);
  const xp = useGameStore((s) => s?.xp ?? 0);
  const energy = useGameStore((s) => s?.energy ?? 0);
  const maxEnergy = useGameStore((s) => s?.maxEnergy ?? 100);
  const streak = useGameStore((s) => s?.streak ?? 0);
  const soundEnabled = useGameStore((s) => s?.soundEnabled ?? true);
  const season = useGameStore((s) => s?.season ?? { current: "spring" });
  const weather = useGameStore((s) => s?.weather ?? { current: "☀️ Cerah" });
  const activeEvent = useGameStore((s) => s?.activeEvent ?? null);
  const combo = useGameStore((s) => s?.combo ?? { count: 0 });
  const coinMultiplier = useGameStore((s) => s?.coinMultiplier ?? 1);
  const growthMultiplier = useGameStore((s) => s?.growthMultiplier ?? 1);

  useEffect(() => {
    setMobileOpen(false);
    setBoostOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const xpProgress = Math.min(100, (xp / Math.max(level * 100, 1)) * 100);
  const energyProgress = Math.min(100, Math.max(0, (energy / maxEnergy) * 100));
  const seasonMeta = SEASON_META[season?.current] || SEASON_META.spring;
  const boostActive = coinMultiplier > 1 || growthMultiplier > 1;

  return {
    pathname,
    collapsed,
    mobileOpen,
    setMobileOpen,
    boostOpen,
    setBoostOpen,
    toggleCollapsed,
    coins,
    level,
    streak,
    soundEnabled,
    season,
    weather,
    activeEvent,
    combo,
    coinMultiplier,
    growthMultiplier,
    boostActive,
    xpProgress,
    energyProgress,
    energy,
    maxEnergy,
    seasonMeta,
  };
}

function useAreaBadges() {
  const plots = useGameStore((s) => s?.plots ?? []);
  const animals = useGameStore((s) => s?.animals ?? []);
  const mining = useGameStore((s) => s?.mining ?? null);
  const orders = useGameStore((s) => s?.orders ?? []);
  const crafting = useGameStore((s) => s?.craftingQueue ?? []);
  return {
    pertanian: plots?.some((p) => p.status === "ready"),
    peternakan: animals?.some(
      (a) =>
        a.status === "producing" &&
        Date.now() - a.lastCollected >= (a.produceTime || 60000),
    ),
    tambang: mining?.nodes?.some((n) => n.status === "ready"),
    restoran: crafting?.some((c) => Date.now() - c.startTime >= c.duration),
    kota: orders?.length > 0,
  };
}

function ShellNav({ pathname, narrow }) {
  const badges = useAreaBadges();
  return (
    <nav className="shell-nav" aria-label="Area game">
      {!narrow && <p className="shell-section-label">Area</p>}
      {NAV_TABS.map((tab) => {
        const active = pathname?.startsWith(`/${tab.id}`);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn("shell-nav-link", active && "shell-nav-link--active")}
            title={tab.label}
          >
            <span className="shell-nav-emoji" aria-hidden>
              {tab.emoji}
            </span>
            {!narrow && <span className="shell-nav-text">{tab.label}</span>}
            {badges[tab.id] && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SummaryTicker({ narrow }) {
  const plots = useGameStore((s) => s?.plots ?? []);
  const animals = useGameStore((s) => s?.animals ?? []);
  const mining = useGameStore((s) => s?.mining ?? null);
  const crafting = useGameStore((s) => s?.craftingQueue ?? []);
  const orders = useGameStore((s) => s?.orders ?? []);

  const summary = [];
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

  if (summary.length === 0 || narrow) return null;
  return (
    <div className="mx-2 mb-1 text-[10px] text-amber-200 font-bold px-2 py-1 bg-amber-900/30 rounded leading-tight">
      {summary.join(" · ")}
    </div>
  );
}

function ShellPanel({ collapsed, onCollapse, chrome, forceExpanded = false }) {
  const narrow = collapsed && !forceExpanded;
  const {
    pathname,
    coins,
    level,
    streak,
    soundEnabled,
    season,
    weather,
    activeEvent,
    combo,
    boostOpen,
    setBoostOpen,
    boostActive,
    coinMultiplier,
    growthMultiplier,
    xp,
    xpProgress,
    energyProgress,
    energy,
    maxEnergy,
    seasonMeta,
  } = chrome;

  const claimDaily = () => {
    const result = useGameStore.getState().checkStreak();
    if (result.claimed) toast.success(result.message);
    else toast(result.message, { icon: "📅" });
  };

  const saveGame = () => {
    useGameStore.getState().touchSaveTimestamp?.();
    toast.success("Game tersimpan!");
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    useGameStore.getState().toggleSound();
    useGameStore.getState().toggleMusic();
    audioManager.syncFromStore({ soundEnabled: next, musicEnabled: next });
  };

  const resetGame = () => {
    useGameStore
      .getState()
      .openConfirm("Reset Game", "Semua progress akan hilang. Yakin?", () => {
        useGameStore.getState().resetGame();
        toast.success("Game di-reset!");
      });
  };

  const buyGrowth = () => {
    if (growthMultiplier > 1) {
      toast("Booster Growth sudah aktif!", { icon: "⚡" });
      return;
    }
    const cost = GAME_CONSTANTS.COSTS.GROWTH_BOOSTER;
    useGameStore
      .getState()
      .openConfirm("Beli Booster Growth", `Growth ×1.5 · ${cost} 💰?`, () => {
        if (useGameStore.getState().buyGrowthBooster(cost)) {
          toast.success("Booster Growth aktif!", { icon: "🌱" });
          setBoostOpen(false);
        } else toast.error("Koin tidak cukup!");
      });
  };

  const buyCoin = () => {
    if (coinMultiplier > 1) {
      toast("Booster Koin sudah aktif!", { icon: "⚡" });
      return;
    }
    const cost = GAME_CONSTANTS.COSTS.COIN_BOOSTER;
    useGameStore
      .getState()
      .openConfirm("Beli Booster Koin", `Coin ×2 · ${cost} 💰?`, () => {
        if (useGameStore.getState().spendCoins(cost)) {
          useGameStore.getState().activateCoinBooster();
          toast.success("Booster Koin aktif!", { icon: "💰" });
          setBoostOpen(false);
        } else toast.error("Koin tidak cukup!");
      });
  };

  return (
    <div className={cn("shell-panel", narrow && "shell-panel--narrow")}>
      <header className="shell-brand">
        <img src="/img/logo.png" alt="" className="shell-brand-logo" />
        {!narrow && (
          <div className="shell-brand-copy">
            <strong>Farm Tycoon</strong>
            <span>Tanam · Panen · Jual</span>
          </div>
        )}
        {onCollapse && (
          <button
            type="button"
            className="shell-icon-btn hidden lg:flex"
            onClick={onCollapse}
            title={narrow ? "Perlebar menu" : "Ciutkan menu"}
            aria-label={narrow ? "Perlebar menu" : "Ciutkan menu"}
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform",
                narrow && "rotate-180",
              )}
            />
          </button>
        )}
      </header>

      {!narrow ? (
        <div className="shell-player">
          <div className="shell-player-card">
            <div className="shell-player-row">
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <AnimatedCounter
                value={coins}
                className="font-black text-sm tabular-nums"
              />
              {streak > 0 && (
                <span className="shell-streak">
                  <Flame className="w-3 h-3" />
                  {streak}
                </span>
              )}
            </div>
            <div className="shell-player-row">
              <Star className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="font-black text-sm">Level {level}</span>
            </div>
            <div
              className="shell-xp"
              title={`XP: ${xp} / ${level * 100}`}
              aria-hidden
            >
              <div
                className="shell-xp-fill"
                style={{ width: `${xpProgress}%` }}
              />
            </div>

            <div className="shell-player-row mt-1" style={{ color: "#86efac" }}>
              <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="font-black text-sm">
                Energy {Math.floor(energy)}/{maxEnergy}
              </span>
            </div>
            <div
              className="shell-energy"
              title={`Energy: ${Math.floor(energy)} / ${maxEnergy}`}
              aria-hidden
            >
              <div
                className="shell-energy-fill"
                style={{ width: `${energyProgress}%` }}
              />
            </div>
          </div>
          <div className="shell-meta">
            <span>
              {seasonMeta.emoji} {seasonMeta.label} · Hari {season?.day || 1}/7
            </span>
            <span>{weather?.current || "☀️ Cerah"}</span>
          </div>
          {(activeEvent || combo?.count > 1) && (
            <div className="shell-meta-extra">
              {activeEvent && (
                <span className="shell-chip shell-chip--event">
                  {activeEvent.name}
                </span>
              )}
              {combo?.count > 1 && (
                <span className="shell-chip shell-chip--combo">
                  Combo ×{combo.count}
                </span>
              )}
            </div>
          )}
        </div>
      ) : null}

      <SummaryTicker narrow={narrow} />

      <ShellNav pathname={pathname} narrow={narrow} />

      <footer className="shell-tools">
        {!narrow && <p className="shell-section-label">Aksi</p>}
        <div
          className={cn("shell-tool-grid", narrow && "shell-tool-grid--narrow")}
        >
          <button
            type="button"
            className="shell-tool"
            onClick={claimDaily}
            title="Daily reward"
          >
            <Calendar className="w-3.5 h-3.5" />
            {!narrow && "Daily"}
          </button>
          <button
            type="button"
            className="shell-tool"
            onClick={saveGame}
            title="Simpan"
          >
            <Save className="w-3.5 h-3.5" />
            {!narrow && "Save"}
          </button>
          <button
            type="button"
            className="shell-tool"
            onClick={toggleSound}
            title="Suara"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            {!narrow && (soundEnabled ? "Sound" : "Muted")}
          </button>
          <div className="relative">
            <button
              type="button"
              className={cn("shell-tool", boostActive && "shell-tool--lit")}
              onClick={() => setBoostOpen((v) => !v)}
              title="Booster"
            >
              <Zap className="w-3.5 h-3.5" />
              {!narrow && "Boost"}
            </button>
            <AnimatePresence>
              {boostOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="shell-boost-pop"
                >
                  <p>Booster global</p>
                  <button
                    type="button"
                    className="btn-primary btn-size-sm w-full mb-2"
                    onClick={buyGrowth}
                  >
                    Growth ×1.5{" "}
                    {growthMultiplier > 1
                      ? "· ON"
                      : `· ${GAME_CONSTANTS.COSTS.GROWTH_BOOSTER}💰`}
                  </button>
                  <button
                    type="button"
                    className="btn-gold btn-size-sm w-full"
                    onClick={buyCoin}
                  >
                    Coin ×2{" "}
                    {coinMultiplier > 1
                      ? "· ON"
                      : `· ${GAME_CONSTANTS.COSTS.COIN_BOOSTER}💰`}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            className="shell-tool shell-tool--danger"
            onClick={resetGame}
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {!narrow && "Reset"}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function GameSidebar() {
  const chrome = useSidebarChrome();

  return (
    <>
      <aside className="shell-rail hidden lg:flex">
        <ShellPanel
          collapsed={chrome.collapsed}
          onCollapse={chrome.toggleCollapsed}
          chrome={chrome}
        />
      </aside>

      <header className="shell-topbar lg:hidden">
        <button
          type="button"
          className="shell-topbar-menu"
          onClick={() => chrome.setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
        <img
          src="/img/logo.png"
          alt="Farm Tycoon"
          className="w-8 h-8 object-contain"
        />
        <span className="font-display font-bold text-lg text-[var(--text-primary)]">
          Farm Tycoon
        </span>
        <div className="shell-topbar-stats">
          <span>
            <Coins className="w-3.5 h-3.5" />
            <AnimatedCounter
              value={chrome.coins}
              className="text-xs font-black tabular-nums"
            />
          </span>
          <span>
            <Star className="w-3.5 h-3.5 fill-current" />
            Lv {chrome.level}
          </span>
        </div>
      </header>

      <AnimatePresence>
        {chrome.mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Tutup menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="shell-scrim lg:hidden"
              onClick={() => chrome.setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="shell-drawer lg:hidden"
            >
              <button
                type="button"
                className="shell-icon-btn shell-drawer-close"
                onClick={() => chrome.setMobileOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
              <ShellPanel collapsed={false} forceExpanded chrome={chrome} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
