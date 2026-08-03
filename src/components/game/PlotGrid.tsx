"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { CropIcon } from "@/components/ui/CropIcon";
import { cn } from "@/lib/utils";
import { useFarming } from "@/lib/hooks/useFarming";

export function PlotGrid({ isEditMode, farmTool = "tanam" }) {
  const plots = useGameStore((state) => state.plots);
  const swapPlots = useGameStore((state) => state.swapPlots);
  const { handlePlotClick } = useFarming();

  return (
    <div
      className={cn(
        "p-3 sm:p-4 field-frame relative overflow-hidden transition-all bg-cover bg-center",
        isEditMode && "ring-4 ring-yellow-400 border-dashed",
      )}
      style={{ backgroundImage: "url('/img/backgrounds/farm_bg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 pointer-events-none rounded-[22px]" />

      <div className="absolute bottom-3 left-3 z-20 text-4xl sm:text-5xl drop-shadow-lg pointer-events-none select-none">
        👨‍🌾
      </div>

      <div className="game-plot-grid relative z-10">
        {plots.map((plot) => {
          const isGrowing = plot.status === "growing";
          const isReady = plot.status === "ready";
          const timeElapsed = plot.plantedAt
            ? Math.max(0, Date.now() - plot.plantedAt)
            : 0;

          return (
            <motion.button
              key={plot.id}
              layout
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
              whileHover={!isEditMode ? { scale: 1.05 } : {}}
              whileTap={!isEditMode ? { scale: 0.95 } : {}}
              onClick={(e) => {
                if (isEditMode) {
                  e.preventDefault();
                  return;
                }
                handlePlotClick(plot, farmTool);
              }}
              data-tutorial={
                plot.status === "empty"
                  ? "farm-plot"
                  : plot.status === "ready"
                    ? "farm-plot-ready"
                    : undefined
              }
              className={cn(
                "game-plot-cell overflow-hidden",
                isEditMode && "cursor-grab hover:ring-4 ring-yellow-400",
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
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: isReady ? 1.5 : 0.8, y: 0 }}
                    exit={{
                      scale: 2.5,
                      y: -80,
                      opacity: 0,
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                      transition: { duration: 0.6, ease: "easeOut" },
                    }}
                    className={cn("z-10", isReady && "animate-breathe")}
                  >
                    <CropIcon cropId={plot.crop} />
                  </motion.div>
                </AnimatePresence>
              )}
              {plot.watered && isGrowing && !isReady && (
                <span className="absolute top-0.5 right-0.5 text-[10px] z-20">
                  💧
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
                      animationDuration: `${plot.growTime}ms`,
                      animationTimingFunction: "linear",
                      animationFillMode: "forwards",
                      animationDelay: `-${timeElapsed}ms`,
                    }}
                  />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
