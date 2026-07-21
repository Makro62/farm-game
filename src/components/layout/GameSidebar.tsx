"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useGameStore } from "@/lib/store";
import { GAME_CONSTANTS } from "@/lib/constants";
import { NAV_TABS } from "@/lib/nav";
import audioManager from "@/lib/audio";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "farm-shell-collapsed-v2";

function useSidebarChrome(
  mobileOpen: boolean,
  setMobileOpen: (open: boolean) => void,
) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);

  const soundEnabled = useGameStore((s) => s?.soundEnabled ?? true);
  const coinMultiplier = useGameStore((s) => s?.coinMultiplier ?? 1);
  const growthMultiplier = useGameStore((s) => s?.growthMultiplier ?? 1);

  useEffect(() => {
    setMobileOpen(false);
    setBoostOpen(false);
  }, [pathname, setMobileOpen]);

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

  const boostActive = coinMultiplier > 1 || growthMultiplier > 1;

  return {
    pathname,
    collapsed,
    mobileOpen,
    setMobileOpen,
    boostOpen,
    setBoostOpen,
    toggleCollapsed,
    soundEnabled,
    coinMultiplier,
    growthMultiplier,
    boostActive,
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

function ShellNav({
  pathname,
  narrow,
}: {
  pathname: string | null;
  narrow: boolean;
}) {
  const badges: Record<string, boolean | undefined> = useAreaBadges();
  const level = useGameStore((s) => s?.level ?? 1);

  return (
    <nav className="shell-nav" aria-label="Area game">
      {!narrow && <p className="shell-section-label">Area</p>}
      {NAV_TABS.map((tab) => {
        const isLocked = level < (tab.unlockLevel || 1);
        const active = pathname?.startsWith(`/${tab.id}`);

        if (isLocked) {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                toast.error(`Buka di Level ${tab.unlockLevel}!`, { icon: "🔒" })
              }
              className={cn("shell-nav-link", "opacity-50 grayscale")}
              title={`Terkunci (Butuh Lv ${tab.unlockLevel})`}
            >
              <span className="shell-nav-emoji" aria-hidden>
                {tab.emoji}
              </span>
              {!narrow && <span className="shell-nav-text">{tab.label}</span>}
              {!narrow && (
                <span className="shell-nav-lock">Lv{tab.unlockLevel}</span>
              )}
            </button>
          );
        }

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
            {badges[tab.id] && <span className="shell-nav-badge" />}
          </Link>
        );
      })}
    </nav>
  );
}

function ShellPanel({
  collapsed,
  onCollapse,
  chrome,
  forceExpanded = false,
}: {
  collapsed: boolean;
  onCollapse?: () => void;
  chrome: any;
  forceExpanded?: boolean;
}) {
  const narrow = collapsed && !forceExpanded;
  const {
    pathname,
    soundEnabled,
    boostOpen,
    setBoostOpen,
    boostActive,
    coinMultiplier,
    growthMultiplier,
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
    <div className="shell-panel">
      <header className="shell-brand">
        {narrow ? (
          <button
            type="button"
            className="shell-icon-btn"
            onClick={onCollapse}
            title="Perlebar menu"
            aria-label="Perlebar menu"
          >
            <img src="/img/logo.png" alt="" className="shell-brand-logo" />
          </button>
        ) : (
          <>
            <img src="/img/logo.png" alt="" className="shell-brand-logo" />
            <div className="shell-brand-copy">
              <strong>Farm Tycoon</strong>
              <span>Tanam · Panen · Jual</span>
            </div>
            {onCollapse && (
              <button
                type="button"
                className="shell-icon-btn hidden lg:flex"
                onClick={onCollapse}
                title="Ciutkan menu"
                aria-label="Ciutkan menu"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </header>

      <ShellNav pathname={pathname} narrow={narrow} />

      <footer className="shell-tools">
        {!narrow && <p className="shell-section-label">Aksi</p>}
        <div className="shell-tool-grid">
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

export default function GameSidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  const chrome = useSidebarChrome(mobileOpen, setMobileOpen);

  return (
    <>
      <aside
        className={cn(
          "shell-rail",
          chrome.collapsed && "shell-rail--narrow",
        )}
      >
        <ShellPanel
          collapsed={chrome.collapsed}
          onCollapse={chrome.toggleCollapsed}
          chrome={chrome}
        />
      </aside>

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
