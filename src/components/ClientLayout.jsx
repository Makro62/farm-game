"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { NAV_TABS } from "@/lib/nav";
import GameSidebar from "@/components/GameSidebar";
import Modals from "@/components/Modals";
import TutorialOverlay from "@/components/ui/TutorialOverlay";
import NotificationManager from "@/components/NotificationManager";
import { cn } from "@/lib/utils";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

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
    const onKey = (e) => {
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
      <GameSidebar />

      <div className="shell-main">
        <main id="main" className="shell-content">
          <div className="game-container">{children}</div>
        </main>
      </div>

      <nav className="shell-bottom lg:hidden" aria-label="Navigasi mobile">
        {NAV_TABS.map((tab) => {
          const active = pathname?.startsWith(`/${tab.id}`);
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
