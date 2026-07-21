"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/lib/store";
import { RECIPES } from "@/lib/data/recipes";
import { getCropEmoji } from "@/lib/data/item-helpers";
import { motion, AnimatePresence } from "framer-motion";
import { GameActionButton } from "./GameAreaHeader";

const TYPE_TABS = [
  { id: "kitchen", label: "Dasar", icon: "🥣" },
  { id: "fish_kitchen", label: "Ikan", icon: "🍣" },
  { id: "restaurant", label: "Kue", icon: "🍰" },
];

export function CraftingWidget({
  type = "kitchen",
  title = "Dapur Produksi",
  icon = "🍳",
  hub = false,
}) {
  const craftingQueue = useGameStore((state) => state.craftingQueue);
  const startCrafting = useGameStore((state) => state.startCrafting);
  const removeCraftingQueue = useGameStore(
    (state) => state.removeCraftingQueue,
  );
  const invByCat = useGameStore((state) => state.inventoryByCategory);
  const canCook = (recipe) =>
    Object.entries(recipe.req).every(([key, qty]) => {
      const [cat, itemId] = key.split(".");
      return (invByCat?.[cat]?.[itemId]?.qty || 0) >= (qty as number);
    });

  const [activeType, setActiveType] = useState(type);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!hub) setActiveType(type);
  }, [type, hub]);

  const recipes = RECIPES.filter((r) => r.type === activeType);
  const activeQueues = craftingQueue.filter(
    (q) => RECIPES.find((r) => r.id === q.recipeId)?.type === activeType,
  );
  const slotsLeft = Math.max(0, 3 - activeQueues.length);

  const readyCount = recipes.filter(canCook).length;

  return (
    <div className="mb-6">
      <div className="shop-section-title">
        <span>{icon}</span> {title}
      </div>

      {hub && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {TYPE_TABS.map((tab) => (
            <GameActionButton
              key={tab.id}
              variant="toggle"
              active={activeType === tab.id}
              onClick={() => setActiveType(tab.id)}
            >
              {tab.icon} {tab.label}
            </GameActionButton>
          ))}
        </div>
      )}

      <p className="text-[10px] font-bold text-[var(--text-secondary)] mb-2">
        Antrean {slotsLeft}/3 ·{" "}
        {readyCount > 0
          ? `${readyCount} resep siap masak`
          : "Siapkan bahan dulu"}
      </p>

      <AnimatePresence>
        {activeQueues.map((queue) => {
          const recipe = RECIPES.find((r) => r.id === queue.recipeId);
          if (!recipe) return null;

          const rawProgress =
            ((currentTime - queue.startTime) / queue.duration) * 100;
          const progress = Math.min(100, Math.max(0, rawProgress));
          const isAlmostDone = progress > 90;

          return (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={queue.id}
              className="glass-card rounded-2xl p-3 mb-3 relative overflow-hidden"
            >
              {isAlmostDone && (
                <motion.div
                  className="absolute inset-0 bg-[var(--gold)]/25"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}

              <div className="flex justify-between items-center mb-1 relative z-10">
                <span className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                  <motion.span
                    className="text-xl"
                    animate={{
                      rotate: isAlmostDone ? [0, -10, 10, 0] : [0, -5, 5, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: isAlmostDone ? 0.5 : 2,
                    }}
                  >
                    {recipe.emoji}
                  </motion.span>
                  Membuat {recipe.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeCraftingQueue(queue.id)}
                  className="btn-danger !px-2 !py-0.5 !text-xs"
                >
                  Batal
                </button>
              </div>
              <div className="w-full progress-bar mt-2 relative z-10">
                <motion.div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                  initial={false}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-2 mb-4">
        {recipes.map((recipe) => {
          const ready = canCook(recipe);
          return (
            <motion.div
              whileHover={{ scale: 1.01 }}
              key={recipe.id}
              className={`glass-card p-3 rounded-2xl flex flex-col transition-shadow ${
                ready
                  ? "ring-2 ring-[var(--primary)] border-[var(--primary)]"
                  : ""
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                  <span className="text-2xl">{recipe.emoji}</span>
                  <span>
                    {recipe.name}
                    {ready && (
                      <span className="ml-1.5 text-[10px] font-black uppercase text-[var(--primary-dark)] bg-[var(--primary-light)]/50 px-1.5 py-0.5 rounded-full">
                        Siap
                      </span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => startCrafting(recipe.id)}
                  disabled={!ready || slotsLeft <= 0}
                  className="btn-gold !px-3 !py-1.5 !text-xs"
                >
                  Masak
                </button>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-1.5 flex-wrap">
                  {Object.entries(recipe.req).map(([key, qty]) => {
                    const [cat, itemId] = key.split(".");
                    const has = invByCat?.[cat]?.[itemId]?.qty || 0;
                    const isEnough = has >= (qty as number);
                    return (
                      <span
                        key={key}
                        className={`px-1.5 py-0.5 rounded-lg flex items-center gap-1 border text-[10px] font-bold ${
                          isEnough
                            ? "bg-[var(--primary-light)]/40 text-[var(--primary-dark)] border-[var(--primary)]/40"
                            : "bg-[#FFCDD2]/60 text-[#C62828] border-[#EF9A9A]"
                        }`}
                      >
                        {getCropEmoji(itemId)} {has}/{qty}
                      </span>
                    );
                  })}
                </div>
                <div className="text-[var(--gold-deep)] font-bold whitespace-nowrap bg-[var(--shop-bg)] px-2 py-0.5 rounded-full border border-[var(--wood)]/40">
                  {recipe.time}s · {recipe.price}💰
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
