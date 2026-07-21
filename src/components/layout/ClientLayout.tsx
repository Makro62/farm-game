"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useGameStore } from "@/lib/store";
import { NAV_TABS } from "@/lib/nav";
import GameSidebar from "@/components/layout/GameSidebar";
import GameHeader from "@/components/layout/GameHeader";
import Modals from "@/components/layout/Modals";
import TutorialOverlay from "@/components/ui/TutorialOverlay";
import NotificationManager from "@/components/layout/NotificationManager";
import { cn } from "@/lib/utils";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const level = useGameStore((s) => s?.level ?? 1);

  useEffect(() => {
    useGameStore.getState().calculateOfflineProgress();
  }, []);

  useEffect(() => {
    const touch = () => useGameStore.getState().touchSaveTimestamp?.();
    const id = setInterval(touch, 30000);
    const onHide = () => {
      if (document.hidden) touch();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", touch);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", touch);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey && e.shiftKey)) return;
      if (e.key === "c") {
        e.preventDefault();
        useGameStore.getState().dev.addCoins(1000);
      }
      if (e.key === "l") {
        e.preventDefault();
        const s = useGameStore.getState();
        s.dev.setLevel(s.level + 1);
      }
      if (e.key === "r") {
        e.preventDefault();
        useGameStore.getState().dev.resetPlots();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div id="app" className="shell-app">
      <GameSidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="shell-main">
        <GameHeader onMobileMenu={() => setMobileMenuOpen(true)} />
        <main id="main" className="shell-content">
          <div className="game-container">{children}</div>
        </main>
      </div>

      <nav className="shell-bottom lg:hidden" aria-label="Navigasi mobile">
        {NAV_TABS.map((tab) => {
          const active = pathname?.startsWith(`/${tab.id}`);
          const isLocked = level < (tab.unlockLevel || 1);

          if (isLocked) {
            return (
              <button
                key={tab.id}
                type="button"
                className={cn("shell-bottom-link", "opacity-45 grayscale")}
                onClick={() =>
                  toast.error(`Buka di Level ${tab.unlockLevel}!`, {
                    icon: "🔒",
                  })
                }
              >
                <span className="shell-bottom-emoji">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "shell-bottom-link",
                active && "shell-bottom-link--active",
              )}
            >
              <span className="shell-bottom-emoji">{tab.emoji}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <Modals />
      <NotificationManager />
      <TutorialOverlay />
    </div>
  );
}
