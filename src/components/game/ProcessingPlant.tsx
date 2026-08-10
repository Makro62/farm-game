"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useGameStore } from "@/lib/store";
import { RECIPES } from "@/lib/data/recipes";
import { getCropEmoji } from "@/lib/data/item-helpers";
import { GAME_CONSTANTS } from "@/lib/constants";

export function ProcessingPlant() {
  const invByCat = useGameStore((s) => s.inventoryByCategory);
  const startCrafting = useGameStore((s) => s.startCrafting);
  const craftingQueue = useGameStore((s) => s.craftingQueue || []);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => setCurrentTime(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  const processingRecipes = useMemo(() => RECIPES.filter((r) => r.type === "processing"), []);

  const processingQueue = useMemo(() =>
    craftingQueue.filter((q) => {
      const r = RECIPES.find((recipe) => recipe.id === q.recipeId);
      return r && r.type === "processing";
    }), [craftingQueue]);

  const slots = useMemo(() =>
    Array.from(
      { length: GAME_CONSTANTS.CRAFTING.MAX_QUEUE_PER_TYPE },
      (_, i) => processingQueue[i] || null,
    ), [processingQueue]);

  const handleProcess = useCallback((recipe: typeof RECIPES[0]) => {
    startCrafting(recipe.id);
  }, [startCrafting]);

  return (
    <div
      className="p-4 sm:p-5 field-frame relative min-h-[420px] overflow-hidden flex flex-col items-center bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(140, 110, 80, 0.8), rgba(90, 60, 40, 0.9)), url('/img/backgrounds/farm_bg.png')",
      }}
    >
      <div className="absolute inset-0 pointer-events-none rounded-[22px]" />

      <div className="relative z-10 w-full max-w-md flex flex-col gap-5">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-display font-black text-[#FFE08A] drop-shadow-md flex items-center justify-center gap-2">
            <span>⚙️</span> Pabrik Pengolahan
          </h2>
          <p className="text-white/80 text-xs mt-1 font-medium">
            Ubah bahan mentah menjadi bahan baku restoran di sini!
          </p>
        </div>

        {/* Mesin / Slots */}
        <div className="glass-card bg-black/30 border-2 border-[#FFE08A]/30 p-4 rounded-2xl shadow-xl">
          <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2">
            <span>🏭</span> Mesin Pengolah
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {slots.map((item, i) => {
              const recipe = item
                ? RECIPES.find((r) => r.id === item.recipeId)
                : null;
              return (
                <div
                  key={i}
                  className="aspect-square rounded-xl border-2 border-[var(--wood)] bg-[#4a3219] flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                >
                  {recipe ? (
                    <>
                      <span className="text-3xl drop-shadow-md animate-pulse">
                        {recipe.emoji}
                      </span>
                      <span className="text-[10px] font-bold text-[#FFE08A] z-10">
                        {Math.max(
                          0,
                          Math.ceil(
                            (item.duration - (currentTime - item.startTime)) /
                              1000,
                          ),
                        )}
                        s
                      </span>
                      <div className="absolute bottom-1 left-1.5 right-1.5 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10 z-10">
                        <div
                          className="h-full bg-gradient-to-r from-[#6fbf55] to-[#9fd67f]"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                ((currentTime - item.startTime) /
                                  item.duration) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 animate-pulse pointer-events-none" />
                    </>
                  ) : (
                    <span className="text-3xl opacity-20">⚙️</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resep Pengolahan */}
        <div className="glass-card bg-black/30 border-2 border-[var(--wood)]/50 p-4 rounded-2xl shadow-xl flex-1 overflow-y-auto">
          <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2">
            <span>📝</span> Daftar Resep
          </h3>
          <div className="flex flex-col gap-3">
            {processingRecipes.map((recipe) => {
              const canProcess = Object.entries(recipe.req).every(
                ([key, qty]) => {
                  const [cat, itemId] = key.split(".");
                  return (invByCat?.[cat]?.[itemId]?.qty || 0) >= (qty as number);
                },
              );
              return (
                <button
                  key={recipe.id}
                  onClick={() => handleProcess(recipe)}
                  disabled={!canProcess}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${canProcess ? "bg-[#5c4033] border-[#a06a4b] hover:border-[#FFE08A] cursor-pointer" : "bg-black/40 border-black/50 grayscale cursor-not-allowed opacity-70"}`}
                >
                  <div className="text-4xl drop-shadow-md bg-black/20 p-2 rounded-lg border border-white/10">
                    {recipe.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm leading-tight">
                      {recipe.name}
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {Object.entries(recipe.req).map(([key, reqQty]) => {
                        const [cat, reqId] = key.split(".");
                        const hasQty = invByCat?.[cat]?.[reqId]?.qty || 0;
                        const enough = hasQty >= (reqQty as number);
                        return (
                          <span
                            key={key}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-black border ${enough ? "bg-green-900/50 text-green-300 border-green-500/30" : "bg-red-900/50 text-red-300 border-red-500/30"}`}
                          >
                            {getCropEmoji(reqId)} {hasQty}/{reqQty}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-xs font-black text-white/50 bg-black/30 px-2 py-1 rounded-lg">
                    {recipe.time / 60}m
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
