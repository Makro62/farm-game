"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import Button from "@/components/ui/Button";
import { NAV_TABS } from "@/lib/nav";
import { RECIPES } from "@/lib/data/recipes";
import { BUILDING_CONFIG } from "@/lib/data/buildings";
import { CROP_DATA } from "@/lib/data/crops";

export default function LevelUpModal() {
  const level = useGameStore((s) => s.level ?? 1);
  const prevLevelRef = useRef<number | null>(null);
  const [shownLevel, setShownLevel] = useState<number | null>(null);

  useEffect(() => {
    if (prevLevelRef.current === null) {
      prevLevelRef.current = level;
      return;
    }
    if (level > prevLevelRef.current) {
      setShownLevel(level);
    }
    prevLevelRef.current = level;
  }, [level]);

  const maxEnergy =
    shownLevel != null ? Math.min(200, 100 + (shownLevel - 1) * 10) : 0;

  const unlocks = useMemo(() => {
    if (shownLevel == null) return [];
    const list: { emoji: string; label: string }[] = [];
    NAV_TABS.filter((t) => t.unlockLevel === shownLevel).forEach((t) =>
      list.push({ emoji: t.emoji, label: `Tab ${t.label}` }),
    );
    Object.values(CROP_DATA)
      .filter((c) => c.seed.unlockLevel === shownLevel)
      .forEach((c) => list.push({ emoji: c.emoji, label: c.name }));
    RECIPES.filter((r) => r.unlockLevel === shownLevel).forEach((r) =>
      list.push({ emoji: r.emoji, label: r.name }),
    );
    Object.values(BUILDING_CONFIG)
      .filter((b) => b.unlockLevel === shownLevel)
      .forEach((b) => list.push({ emoji: b.emoji, label: b.name }));
    return list;
  }, [shownLevel]);

  return (
    <AnimatePresence>
      {shownLevel != null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="glass-panel max-w-sm w-full"
          >
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🎉</div>
              <p className="text-sm font-black tracking-widest text-yellow-500">
                LEVEL UP!
              </p>
              <h2 className="text-4xl font-display font-black text-[var(--text-primary)]">
                Level {shownLevel}
              </h2>
              <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                ⚡ Energi maksimal → {maxEnergy}
              </p>
            </div>

            <div className="max-h-[200px] overflow-y-auto mb-5">
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">
                Konten terbuka
              </p>
              {unlocks.length > 0 ? (
                <ul className="space-y-1.5">
                  {unlocks.map((u, i) => (
                    <li
                      key={`${u.label}-${i}`}
                      className="flex items-center gap-2 rounded-lg bg-black/5 border border-white/10 px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)]"
                    >
                      <span>{u.emoji}</span>
                      <span>{u.label}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  Tidak ada konten baru di level ini — terus bermain!
                </p>
              )}
            </div>

            <Button
              variant="gold"
              size="lg"
              className="w-full"
              onClick={() => setShownLevel(null)}
            >
              Keren! 🌟
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
