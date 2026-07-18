import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { CropIcon } from '../ui/CropIcon';
import { getItemEmoji } from '@/lib/data/item-helpers';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function PlotGrid({ isEditMode, farmTool = 'tanam' }) {
  const plots = useGameStore((state) => state.plots);
  const plantSeed = useGameStore((state) => state.plantSeed);
  const harvest = useGameStore((state) => state.harvest);
  const waterPlot = useGameStore((state) => state.waterPlot);
  const sellAllInventory = useGameStore((state) => state.sellAllInventory);
  const swapPlots = useGameStore((state) => state.swapPlots);
  const selectedInventoryItem = useGameStore((state) => state.selectedSeed);
  const setSelectedInventoryItem = useGameStore((state) => state.setSelectedSeed);

  const handlePlotClick = (plot) => {
    if (farmTool === 'jual') {
      const earned = sellAllInventory();
      if (earned > 0) toast.success(`Hasil terjual +${earned} 💰`);
      else toast.error('Tidak ada hasil untuk dijual.');
      return;
    }

    if (farmTool === 'siram') {
      const result = waterPlot(plot.id);
      if (result.ok) toast.success(result.message, { icon: '💧' });
      else toast(result.message, { icon: '💧' });
      return;
    }

    if (farmTool === 'panen') {
      if (plot.status === 'ready' || (plot.status === 'growing' && plot.plantedAt && Date.now() - plot.plantedAt >= plot.growTime)) {
        const crop = harvest(plot.id);
        if (crop) toast.success(`Panen ${getItemEmoji(crop)}!`);
      } else {
        toast('Petak belum siap panen', { icon: '🌾' });
      }
      return;
    }

    if (plot.status === 'empty') {
      if (!selectedInventoryItem) {
        toast('Pilih bibit dari toko samping dulu!', { icon: '👆' });
        return;
      }

      const result = plantSeed(plot.id, selectedInventoryItem);
      if (result.ok) {
        toast.success(result.message, { icon: '🌱', id: 'plant' });
      } else {
        toast.error(result.message);
        if (result.message?.includes('Kehabisan')) setSelectedInventoryItem(null);
      }
    } else if (plot.status === 'ready') {
      toast('Ganti ke mode Panen untuk memanen', { icon: '✋' });
    } else if (plot.status === 'growing') {
      toast('Masih tumbuh — pakai Siram untuk mempercepat', { icon: '🌱' });
    }
  };

  return (
    <div
      className={cn(
        'p-3 sm:p-4 field-frame relative overflow-hidden transition-all bg-cover bg-center',
        isEditMode && 'ring-4 ring-yellow-400 border-dashed'
      )}
      style={{ backgroundImage: "url('/img/backgrounds/farm_bg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 pointer-events-none rounded-[22px]" />

      <div className="absolute bottom-3 left-3 z-20 text-4xl sm:text-5xl drop-shadow-lg pointer-events-none select-none">
        👨‍🌾
      </div>

      <div className="game-plot-grid relative z-10">
        {plots.map((plot) => {
          const isGrowing = plot.status === 'growing';
          const isReady = plot.status === 'ready';
          const timeElapsed = plot.plantedAt ? Math.max(0, Date.now() - plot.plantedAt) : 0;

          return (
            <motion.button
              key={plot.id}
              layout
              draggable={isEditMode}
              onDragStart={(e) => {
                e.dataTransfer.setData('plotId', plot.id);
                e.currentTarget.style.opacity = '0.5';
              }}
              onDragEnd={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onDragOver={(e) => {
                if (isEditMode) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (isEditMode) {
                  const draggedId = e.dataTransfer.getData('plotId');
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
                handlePlotClick(plot);
              }}
              className={cn(
                'game-plot-cell overflow-hidden',
                isEditMode && 'cursor-grab hover:ring-4 ring-yellow-400',
                plot.status === 'empty' && 'bg-[#a06a38] border-b-4 border-[#7a4e28] hover:bg-[#b07843]',
                isGrowing && !isReady && 'bg-[#5c4033] border-b-4 border-[#3e2b22]',
                isReady && 'bg-[#7c5836] border-b-4 border-[#5a4027] animate-glow ring-2 ring-yellow-400 z-10',
                plot.watered && isGrowing && 'ring-2 ring-sky-400/70'
              )}
            >
              {plot.crop && (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: isReady ? 1.5 : 0.8, y: 0 }}
                    exit={{ scale: 2.5, y: -80, opacity: 0, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))', transition: { duration: 0.6, ease: "easeOut" } }}
                    className={cn("z-10", isReady && "animate-breathe")}
                  >
                    <CropIcon cropId={plot.crop} />
                  </motion.div>
                </AnimatePresence>
              )}
              {plot.watered && isGrowing && !isReady && (
                <span className="absolute top-0.5 right-0.5 text-[10px] z-20">💧</span>
              )}
              {isGrowing && !isReady && (
                <div className="absolute bottom-1.5 left-1.5 right-1.5 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-[#6fbf55] to-[#9fd67f] origin-left"
                    style={{
                      animationName: 'grow-progress',
                      animationDuration: `${plot.growTime}ms`,
                      animationTimingFunction: 'linear',
                      animationFillMode: 'forwards',
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
