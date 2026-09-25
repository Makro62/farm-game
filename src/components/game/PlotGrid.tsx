"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { CropIcon } from "@/components/ui/CropIcon";
import { cn } from "@/lib/utils";
import { useFarming } from "@/lib/hooks/useFarming";
import { effectiveGrowTime, isPlotReady } from "@/lib/store/slices/createFarmingSlice";

export function PlotGrid({ isEditMode, farmTool = "tanam", plotListKey = "plots" }) {
  const plots = useGameStore(useShallow((state) => state[plotListKey] || state.plots));
  const swapPlots = useGameStore((state) => state.swapPlots);
  const { handlePlotClick } = useFarming();
  const [floatingTexts, setFloatingTexts] = useState<{id: number, plotId: number, text: string, color: string}[]>([]);
  const [now, setNow] = useState(0);
  // Tap-to-swap untuk touchscreen (drag HTML5 tidak jalan di mobile)
  const [editSelected, setEditSelected] = useState<number | null>(null);
  const [exitingIds, setExitingIds] = useState<number[]>([]);
  const prevCropsRef = useRef<Record<number, string | null>>({});

  useEffect(() => {
    if (!isEditMode) setEditSelected(null);
  }, [isEditMode]);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const removed: number[] = [];
    const next: Record<number, string | null> = {};
    for (const p of plots) {
      next[p.id] = p.crop ?? null;
      if (prevCropsRef.current[p.id] && !p.crop) removed.push(p.id);
    }
    prevCropsRef.current = next;
    if (removed.length === 0) return;
    setExitingIds(prev => [...prev, ...removed]);
    setTimeout(() => {
      setExitingIds(prev => prev.filter(id => !removed.includes(id)));
    }, 800);
  }, [plots]);

  const handlePlotAction = (e: React.MouseEvent, plot: any) => {
    if (isEditMode) {
      e.preventDefault();
      // Touch fallback: tap pilih → tap kedua untuk tukar posisi
      if (editSelected == null) {
        setEditSelected(plot.id);
      } else if (editSelected === plot.id) {
        setEditSelected(null);
      } else {
        swapPlots(editSelected, plot.id);
        setEditSelected(null);
      }
      return;
    }
    
    if (farmTool === "panen" && isPlotReady(plot, now)) {
       
      const id = now + Math.random();
      setFloatingTexts(prev => [...prev, {id, plotId: plot.id, text: "+XP", color: "text-green-300"}]);
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(t => t.id !== id));
      }, 1000);
    }
    
    handlePlotClick(plot, farmTool);
  };

  return (
    <div
      className={cn(
        "p-3 sm:p-4 field-frame relative transition-all",
        isEditMode && "ring-4 ring-yellow-400 border-dashed",
      )}
      style={{ backgroundColor: "rgba(255, 252, 245, 0.92)" }}
    >
      <div className="relative z-10 mb-1.5 flex items-center justify-between gap-2 min-h-[1.75rem]">
        {isEditMode ? (
          <p className="flex-1 text-[11px] font-bold text-yellow-100 bg-black/45 rounded-lg px-2 py-1">
            Mode edit: ketuk 2 petak untuk menukar posisi
            {editSelected != null ? " · 1 terpilih, ketuk target…" : ""}
          </p>
        ) : (
          <span />
        )}
        <span className="text-2xl leading-none drop-shadow-lg select-none pointer-events-none">
          👨‍🌾
        </span>
      </div>

      <div className="game-plot-grid relative z-10">
        {plots.map((plot) => {
          const isGrowing = plot.status === "growing";
          const isReady = plot.status === "ready";
          const effGrow = effectiveGrowTime(plot);
          const timeElapsed = plot.plantedAt
            ? Math.max(0, now - plot.plantedAt)
            : 0;

          return (
            <motion.button
              key={plot.id}
              draggable={isEditMode}
              onDragStart={(e: any) => {
                e.dataTransfer.setData("plotId", plot.id);
                e.currentTarget.style.opacity = "0.5";
              }}
              onDragEnd={(e: any) => {
                e.currentTarget.style.opacity = "1";
              }}
              onDragOver={(e: any) => {
                if (isEditMode) e.preventDefault();
              }}
              onDrop={(e: any) => {
                e.preventDefault();
                if (isEditMode) {
                  const draggedId = e.dataTransfer.getData("plotId");
                  if (draggedId && draggedId !== plot.id.toString()) {
                    swapPlots(parseInt(draggedId, 10), plot.id);
                  }
                }
              }}
              whileHover={!isEditMode ? { scale: 1.05, filter: "brightness(1.1)" } : {}}
              whileTap={!isEditMode ? { scale: 0.95 } : {}}
              animate={{ scale: editSelected === plot.id ? 1.05 : 1 }}
              onClick={(e) => handlePlotAction(e, plot)}
              data-tutorial={
                plot.status === "empty"
                  ? "farm-plot"
                  : plot.status === "ready"
                    ? "farm-plot-ready"
                    : undefined
              }
              className={cn(
                "game-plot-cell",
                exitingIds.includes(plot.id) && "z-30",
                isEditMode && "cursor-pointer hover:ring-4 ring-yellow-400",
                isEditMode &&
                  editSelected === plot.id &&
                  "ring-4 ring-sky-300 z-10",
                plot.status === "empty" &&
                  "bg-[#a06a38] border-b-4 border-[#7a4e28] hover:bg-[#b07843]",
                plot.status === "dead" &&
                  "bg-[#4a4a3d] border-b-4 border-[#33332a] opacity-80",
                isGrowing &&
                  !isReady &&
                  "bg-[#5c4033] border-b-4 border-[#3e2b22]",
                isReady &&
                  "bg-[#7c5836] border-b-4 border-[#5a4027] animate-glow ring-2 ring-yellow-400 z-10",
                plot.watered && isGrowing && "ring-2 ring-sky-400/70",
              )}
            >
              {plot.crop && (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={plot.crop}
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: isReady ? 1.5 : 0.8, y: 0 }}
                    exit={{
                      scale: 2.5,
                      y: -80,
                      opacity: 0,
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                      transition: { duration: 0.6, ease: "easeOut" },
                    }}
                    className="z-10"
                  >
                    <div className={cn(isReady && "animate-breathe")}>
                      <CropIcon cropId={plot.crop} />
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
              {plot.watered && isGrowing && !isReady && (
                <span className="absolute top-0.5 right-0.5 text-[11px] z-20">
                  💧
                </span>
              )}
              {plot.pestInfestation && isGrowing && (
                <span className="absolute top-0.5 left-0.5 text-[11px] z-20 animate-pulse">
                  🐛
                </span>
              )}
              {plot.level > 1 && (
                <span className="absolute bottom-1 right-1 z-20 px-1 rounded-md bg-black/50 text-[11px] font-bold text-yellow-300 leading-tight">
                  ⭐{plot.level}
                </span>
              )}
              {plot.status === "dead" && (
                <span className="absolute inset-0 flex items-center justify-center text-lg opacity-70 select-none">
                  🥀
                </span>
              )}
              {isGrowing && !isReady && (
                <div className="absolute bottom-1.5 left-1.5 right-1.5 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-[#6fbf55] to-[#9fd67f] origin-left"
                    style={{
                      animationName: "grow-progress",
                      animationDuration: `${effGrow ?? plot.growTime ?? 0}ms`,
                      animationTimingFunction: "linear",
                      animationFillMode: "forwards",
                      animationDelay: `-${timeElapsed}ms`,
                    }}
                  />
                </div>
              )}
              {floatingTexts.filter(ft => ft.plotId === plot.id).map(ft => (
                <motion.div
                  key={ft.id}
                  initial={{ opacity: 1, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, y: -30, scale: 1.2 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn("absolute inset-x-0 bottom-4 z-50 flex justify-center pointer-events-none text-sm font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]", ft.color)}
                >
                  {ft.text}
                </motion.div>
              ))}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
