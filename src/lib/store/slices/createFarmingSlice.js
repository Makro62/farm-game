import { SHOP_SEEDS } from '@/lib/data/crops';

export const createFarmingSlice = (set, get) => ({
  setSelectedSeed: (seedId) => set({ selectedSeed: seedId }),

  plant: (plotId, crop, growTime) => {
    const state = get();
    const plot = state.plots.find((p) => p.id === plotId);

    if (!plot || plot.status !== 'empty') {
      return false;
    }

    set((state) => ({
      plots: state.plots.map((p) =>
        p.id === plotId
          ? {
              ...p,
              status: 'growing',
              crop,
              plantedAt: Date.now(),
              growTime,
              watered: false,
            }
          : p
      ),
    }));
    return true;
  },

  plantSeed: (plotId, seedId) => {
    const seedData = SHOP_SEEDS.find((s) => s.id === seedId);
    if (!seedData) return { ok: false, message: 'Item ini tidak bisa ditanam!' };

    const state = get();
    const season = state.season?.current;
    const hasGreenhouse = !!state.buildings?.greenhouse;
    if (!hasGreenhouse && seedData.season !== 'all' && seedData.season !== season) {
      return { ok: false, message: 'Bibit ini tidak cocok musim ini (butuh Greenhouse).' };
    }

    if (!get().removeItem?.(seedId, 1)) {
      return { ok: false, message: `Kehabisan ${seedData.name}!` };
    }

    if (!get().consumeEnergy(1)) {
      get().addItem?.(seedId, 1);
      return { ok: false, message: 'Energy tidak cukup!' };
    }

    const growthMultiplier = state.growthMultiplier > 0 ? state.growthMultiplier : 1;
    let baseGrowTime = (seedData.time * 1000) / growthMultiplier;

    // ===== Auto-pakai Pupuk Kandang jika ada (Ternak → Ladang) =====
    let usedFertilizer = false;
    if ((get().inventory.pupuk_kandang || 0) > 0) {
      get().removeItem?.('pupuk_kandang', 1);
      baseGrowTime = Math.floor(baseGrowTime * 0.85); // -15% grow time
      usedFertilizer = true;
    }

    const ok = get().plant(plotId, seedData.cropId, baseGrowTime);
    if (!ok) {
      get().addItem?.(seedId, 1);
      if (usedFertilizer) get().addItem?.('pupuk_kandang', 1); // refund
      return { ok: false, message: 'Petak tidak kosong.' };
    }
    return {
      ok: true,
      message: usedFertilizer
        ? `Menanam ${seedData.name} 🌿 (+Pupuk, tumbuh lebih cepat!)`
        : `Menanam ${seedData.name}`,
      seed: seedData,
      usedFertilizer,
    };
  },

  waterPlot: (plotId) => {
    const state = get();
    const plot = state.plots.find((p) => p.id === plotId);
    if (!plot || plot.status !== 'growing') {
      return { ok: false, message: 'Hanya tanaman yang sedang tumbuh yang bisa disiram.' };
    }
    if (plot.watered) {
      return { ok: false, message: 'Petak ini sudah disiram.' };
    }

    if (!get().consumeEnergy(1)) {
      return { ok: false, message: 'Energy tidak cukup!' };
    }

    const boost = Math.floor((plot.growTime || 0) * 0.18);
    set((s) => ({
      plots: s.plots.map((p) =>
        p.id === plotId
          ? {
              ...p,
              watered: true,
              plantedAt: (p.plantedAt || Date.now()) - boost,
            }
          : p
      ),
    }));
    return { ok: true, message: 'Disiram! Tumbuh lebih cepat.' };
  },

  harvest: (plotId) => {
    const state = get();
    const plot = state.plots.find((p) => p.id === plotId);

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

    if (!get().consumeEnergy(1)) {
      return null; // Silent fail or handle via UI
    }

    const crop = plot.crop;

    set((state) => ({
      plots: state.plots.map((p) =>
        p.id === plotId
          ? {
              id: p.id,
              status: 'empty',
              crop: null,
              plantedAt: null,
              growTime: null,
              watered: false,
            }
          : p
      ),
      inventory: {
        ...state.inventory,
        [crop]: (state.inventory[crop] || 0) + 1,
      },
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

    const plots = get().plots.map((p) => {
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
      plots: state.plots.map((p) => (p.id === plotId ? { ...p, status } : p)),
    }));
  },

  swapPlots: (id1, id2) => {
    set((state) => {
      const newPlots = [...state.plots];
      const idx1 = newPlots.findIndex((p) => p.id === id1);
      const idx2 = newPlots.findIndex((p) => p.id === id2);
      if (idx1 !== -1 && idx2 !== -1) {
        const temp = newPlots[idx1];
        newPlots[idx1] = newPlots[idx2];
        newPlots[idx2] = temp;
      }
      return { plots: newPlots };
    });
  },
});
