import { normalizePlots } from '../utils';

export const createFarmingSlice = (set, get) => ({
  plots: Array.from({ length: 30 }, (_, i) => ({
    id: i,
    status: 'empty',
    crop: null,
    plantedAt: null,
    growTime: null
  })),
  selectedSeed: null,

  setSelectedSeed: (seedId) => set({ selectedSeed: seedId }),

  plant: (plotId, crop, growTime) => {
    const state = get();
    const plot = state.plots.find(p => p.id === plotId);
    
    if (!plot || plot.status !== 'empty') {
      return false;
    }
    
    set((state) => ({
      plots: state.plots.map(p =>
        p.id === plotId
          ? {
              ...p,
              status: 'growing',
              crop,
              plantedAt: Date.now(),
              growTime
            }
          : p
      )
    }));
    
    return true;
  },
  
  harvest: (plotId) => {
    const state = get();
    const plot = state.plots.find(p => p.id === plotId);

    if (!plot || !plot.crop) {
      return null;
    }

    const isReady =
      plot.status === 'ready' ||
      (plot.status === 'growing' &&
        plot.plantedAt &&
        Date.now() - plot.plantedAt >= plot.growTime);

    if (!isReady) {
      return null;
    }

    const crop = plot.crop;

    set((state) => ({
      plots: state.plots.map(p =>
        p.id === plotId
          ? {
              id: p.id,
              status: 'empty',
              crop: null,
              plantedAt: null,
              growTime: null
            }
          : p
      ),
      inventory: {
        ...state.inventory,
        [crop]: (state.inventory[crop] || 0) + 1
      }
    }));

    get().addXP(10);
    get().progressQuest('harvest', crop, 1);
    const combo = get().registerCombo?.();
    if (combo?.count >= 3) {
      get().addCoins?.(Math.floor(3 * combo.multiplier));
    }

    return crop;
  },

  syncPlots: () => {
    const now = Date.now();
    let changed = false;

    // Use normalizePlots from utils to ensure valid plots
    const currentPlots = get().plots;
    // Note: since normalizePlots and normalizePlot are in utils, we can use them here
    // But since plots are usually already normalized on load, we can just map over them
    const plots = currentPlots.map((p, index) => {
      const growTime = p.growTime > 0 ? p.growTime : null;

      if (
        p.status === 'growing' &&
        p.plantedAt &&
        growTime != null &&
        now - p.plantedAt >= growTime
      ) {
        changed = true;
        return { ...p, status: 'ready' };
      }

      return p;
    });

    if (changed) {
      set({ plots });
    }
  },

  updatePlotStatus: (plotId, status) => {
    set((state) => ({
      plots: state.plots.map(p =>
        p.id === plotId ? { ...p, status } : p
      )
    }));
  },
  
  swapPlots: (id1, id2) => {
    set((state) => {
      const newPlots = [...state.plots];
      const idx1 = newPlots.findIndex(p => p.id === id1);
      const idx2 = newPlots.findIndex(p => p.id === id2);
      if (idx1 !== -1 && idx2 !== -1) {
        const temp = newPlots[idx1];
        newPlots[idx1] = newPlots[idx2];
        newPlots[idx2] = temp;
      }
      return { plots: newPlots };
    });
  },
});
