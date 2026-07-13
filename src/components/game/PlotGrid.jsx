import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { CropIcon } from '../ui/CropIcon';
import { getCropEmoji, SHOP_SEEDS } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function PlotGrid({ isEditMode }) {
  const plots = useGameStore(state => state.plots);
  const plant = useGameStore(state => state.plant);
  const harvest = useGameStore(state => state.harvest);
  const swapPlots = useGameStore(state => state.swapPlots);
  const removeItem = useGameStore(state => state.removeItem);
  const growthMultiplier = useGameStore(state => state.growthMultiplier);
  const selectedInventoryItem = useGameStore(state => state.selectedSeed);
  const setSelectedInventoryItem = useGameStore(state => state.setSelectedSeed);
  
  const handlePlotClick = (plot) => {
    if (plot.status === 'empty') {
      if (!selectedInventoryItem) {
        toast('Pilih bibit dari Inventory dulu!', { icon: '👆' });
        return;
      }
      
      const seedData = SHOP_SEEDS.find(s => s.id === selectedInventoryItem);
      if (!seedData) {
        toast.error('Item ini tidak bisa ditanam!', { icon: '❌' });
        return;
      }
      
      if (removeItem(selectedInventoryItem, 1)) {
        plant(plot.id, seedData.cropId, (seedData.time * 1000) / growthMultiplier);
      } else {
        toast.error(`Anda kehabisan ${seedData.name}! Beli lagi di Shop.`);
        setSelectedInventoryItem(null);
      }
    } else if (plot.status === 'ready') {
      const crop = harvest(plot.id);
      if (crop) {
        toast.success(`Panen ${getCropEmoji(crop)}!`);
      }
    } else if (plot.status === 'growing') {
      // Just in case they click right as the background timer triggers
      // We can check Date.now manually here to allow harvest
      if (plot.plantedAt && Date.now() - plot.plantedAt >= plot.growTime) {
        const crop = harvest(plot.id);
        if (crop) {
          toast.success(`Panen ${getCropEmoji(crop)}!`);
        }
      }
    }
  };

  return (
    <div 
      className={cn("p-4 sm:p-6 field-frame relative overflow-hidden mb-6 transition-all bg-cover bg-center", 
        isEditMode && "ring-4 ring-yellow-400 border-dashed"
      )}
      style={{ backgroundImage: "url('/img/backgrounds/farm_bg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/35 pointer-events-none rounded-[22px]"></div>
      <div className="game-plot-grid relative z-10">
        {plots.map((plot) => {
          const isGrowing = plot.status === 'growing';
          const isReady = plot.status === 'ready';

          // Ensure animation doesn't start in the future if there is a tiny desync
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
              className={cn("game-plot-cell overflow-hidden",
                isEditMode && "cursor-grab hover:ring-4 ring-yellow-400",
                plot.status === 'empty' && "bg-[#a06a38] border-b-4 border-[#7a4e28] hover:bg-[#b07843]",
                isGrowing && !isReady && "bg-[#5c4033] border-b-4 border-[#3e2b22]",
                isReady && "bg-[#7c5836] border-b-4 border-[#5a4027] animate-glow ring-2 ring-yellow-400 z-10"
              )}
            >
              {plot.crop && (
                <AnimatePresence>
                  <motion.div
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: isReady ? 1.5 : 0.8, y: 0 }}
                    className="z-10"
                  >
                    <CropIcon cropId={plot.crop} />
                  </motion.div>
                </AnimatePresence>
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
                      animationDelay: `-${timeElapsed}ms`
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
