import type { StoreSet, StoreGet } from "@/types/game";
import { SHOP_SEEDS, CROP_DATA } from "@/lib/data/crops";
import { rollCropQuality } from "@/lib/data/item-helpers";
import { GAME_CONSTANTS } from "@/lib/constants";

export const createFarmingSlice = (set: StoreSet, get: StoreGet) => ({
  setSelectedSeed: (seedId) => set({ selectedSeed: seedId }),

  plant: (plotId, crop, growTime) => {
    const state = get();
    const plot = state.plots.find((p) => p.id === plotId);
    if (
      !plot ||
      (plot.status !== "empty" && plot.status !== "dead")
    )
      return false;

    set((state) => ({
      plots: state.plots.map((p) =>
        p.id === plotId
          ? {
              ...p,
              status: "growing",
              crop,
              plantedAt: Date.now(),
              growTime,
              watered: false,
              fertilizer: null,
              quality: null,
              pestInfestation: false,
            }
          : p,
      ),
    }));
    return true;
  },

  plantSeed: (plotId, seedId) => {
    const seedData = SHOP_SEEDS.find((s) => s.id === seedId);
    if (!seedData)
      return { ok: false, message: "Item ini tidak bisa ditanam!" };

    const state = get();
    const season = state.season?.current;
    const hasGreenhouse = !!state.buildings?.greenhouse;
    if (
      !hasGreenhouse &&
      seedData.season !== "all" &&
      seedData.season !== season
    ) {
      return {
        ok: false,
        message: "Bibit ini tidak cocok musim ini (butuh Greenhouse).",
      };
    }

    const have = state.inventoryByCategory?.seeds?.[seedId]?.qty || 0;
    if (have <= 0) {
      return { ok: false, message: `Kehabisan ${seedData.name}!` };
    }

    if (!get().consumeEnergy(1)) {
      return { ok: false, message: "Energy tidak cukup!" };
    }

    set((draft) => {
      if (draft.inventoryByCategory.seeds[seedId]) {
        draft.inventoryByCategory.seeds[seedId].qty -= 1;
        if (draft.inventoryByCategory.seeds[seedId].qty <= 0) {
          delete draft.inventoryByCategory.seeds[seedId];
        }
      }
    });

    const growthMultiplier =
      state.growthMultiplier > 0 ? state.growthMultiplier : 1;
    let baseGrowTime = (seedData.time * 1000) / growthMultiplier;

    let usedFertilizer = false;
    const pupukQty =
      state.inventoryByCategory?.collectibles?.pupuk_kandang?.qty || 0;
    if (pupukQty > 0) {
      set((draft) => {
        if (draft.inventoryByCategory.collectibles.pupuk_kandang) {
          draft.inventoryByCategory.collectibles.pupuk_kandang.qty -= 1;
          if (draft.inventoryByCategory.collectibles.pupuk_kandang.qty <= 0) {
            delete draft.inventoryByCategory.collectibles.pupuk_kandang;
          }
        }
      });
      baseGrowTime = Math.floor(baseGrowTime * 0.85);
      usedFertilizer = true;
      set((s) => ({
        stats: {
          ...s.stats,
          totalFertilizerUsed: (s.stats?.totalFertilizerUsed || 0) + 1,
        },
      }));
    }

    const ok = get().plant(plotId, seedData.cropId, baseGrowTime);
    if (!ok) {
      // Refund energy
      set((draft) => {
        draft.energy = Math.min(draft.maxEnergy || 100, draft.energy + 1);
      });
      // Refund seed
      set((draft) => {
        if (!draft.inventoryByCategory.seeds[seedId]) {
          draft.inventoryByCategory.seeds[seedId] = {
            qty: 0,
            quality: "normal",
            acquiredAt: Date.now(),
          };
        }
        draft.inventoryByCategory.seeds[seedId].qty += 1;
      });
      if (usedFertilizer) {
        set((draft) => {
          if (!draft.inventoryByCategory.collectibles.pupuk_kandang) {
            draft.inventoryByCategory.collectibles.pupuk_kandang = {
              qty: 0,
              quality: "normal",
              acquiredAt: Date.now(),
            };
          }
          draft.inventoryByCategory.collectibles.pupuk_kandang.qty += 1;
        });
      }
      return { ok: false, message: "Petak tidak kosong." };
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
    if (!plot || plot.status !== "growing")
      return {
        ok: false,
        message: "Hanya tanaman yang sedang tumbuh yang bisa disiram.",
      };
    if (plot.watered) return { ok: false, message: "Petak ini sudah disiram." };
    if (!get().consumeEnergy(1))
      return { ok: false, message: "Energy tidak cukup!" };

    const boost = Math.floor(
      (plot.growTime || 0) * GAME_CONSTANTS.CHANCES.WATER_BOOST,
    );
    set((s) => ({
      plots: s.plots.map((p) =>
        p.id === plotId
          ? {
              ...p,
              watered: true,
              plantedAt: (p.plantedAt || Date.now()) - boost,
            }
          : p,
      ),
    }));
    return { ok: true, message: "Disiram! Tumbuh lebih cepat." };
  },

  harvest: (plotId) => {
    const state = get();
    const plot = state.plots.find((p) => p.id === plotId);
    if (!plot || !plot.crop) return null;

    const isReady =
      plot.status === "ready" ||
      (plot.status === "growing" &&
        plot.plantedAt &&
        Date.now() - plot.plantedAt! >= (plot.growTime ?? 0));
    if (!isReady) return null;
    if (!get().consumeEnergy(1)) return null;

    const crop = plot.crop;
    const weather =
      state.weather?.current?.replace(/[^a-zA-Z]/g, "").toLowerCase() ||
      "sunny";
    const quality = rollCropQuality(weather, plot.fertilizer);

    set((state) => {
      const cat = { ...(state.inventoryByCategory?.crops || {}) };
      const existing = cat[crop] || {
        qty: 0,
        quality: null,
        acquiredAt: Date.now(),
      };
      cat[crop] = { qty: existing.qty + 1, quality, acquiredAt: Date.now() };

      return {
        inventoryByCategory: { ...state.inventoryByCategory, crops: cat },
        plots: state.plots.map((p) =>
          p.id === plotId
            ? {
                id: p.id,
                status: "empty",
                crop: null,
                plantedAt: null,
                growTime: null,
                watered: false,
                fertilizer: null,
                quality: null,
                pestInfestation: false,
              }
            : p,
        ),
      };
    });

    get().addXP(GAME_CONSTANTS.XP.HARVEST);
    get().progressQuest("harvest", crop, 1);
    set((s) => ({
      stats: { ...s.stats, totalHarvested: (s.stats?.totalHarvested || 0) + 1 },
    }));
    get().markSessionAction?.("harvested");
    get().checkAchievements?.();
    const combo = get().registerCombo?.();
    if (combo?.count >= 3) get().addCoins?.(Math.floor(3 * combo.multiplier));

    return crop;
  },

  syncPlots: () => {
    const now = Date.now();
    let changed = false;
    const plots = get().plots.map((p) => {
      const growTime = (p.growTime ?? 0) > 0 ? p.growTime : null;
      if (
        p.status === "growing" &&
        p.plantedAt &&
        growTime != null &&
        now - p.plantedAt >= growTime
      ) {
        changed = true;
        return { ...p, status: "ready" };
      }
      return p;
    });
    if (changed) set({ plots });
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
      if (idx1 !== -1 && idx2 !== -1)
        [newPlots[idx1], newPlots[idx2]] = [newPlots[idx2], newPlots[idx1]];
      return { plots: newPlots };
    });
  },
});
