import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGameStore } from "@/lib/store";
import { BASE_TIME, store, resetStore, useFakeTime, setNow, mockRandom } from "./helpers";

describe("farming slice", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("plant sets a plot to growing with the crop", () => {
    const ok = store().plant(0, "wortel", 15000);
    expect(ok).toBe(true);
    const plot = useGameStore.getState().plots[0];
    expect(plot.status).toBe("growing");
    expect(plot.crop).toBe("wortel");
    expect(plot.growTime).toBe(15000);
    expect(plot.plantedAt).toBe(BASE_TIME);
  });

  it("plant fails on an occupied plot", () => {
    store().plant(0, "wortel", 15000);
    expect(store().plant(0, "jagung", 30000)).toBe(false);
    expect(useGameStore.getState().plots[0].crop).toBe("wortel");
  });

  it("plantSeed consumes a seed and energy, then plants", () => {
    const s = store();
    s.invAdd("seeds", "bibit_wortel", 3);
    const res = s.plantSeed(0, "bibit_wortel");
    expect(res.ok).toBe(true);
    const state = useGameStore.getState();
    expect(state.plots[0].status).toBe("growing");
    expect(state.plots[0].crop).toBe("wortel");
    expect(state.plots[0].growTime).toBe(15000);
    expect(state.inventoryByCategory.seeds.bibit_wortel?.qty).toBe(2);
    expect(state.energy).toBe(99);
  });

  it("plantSeed fails when out of seeds", () => {
    const res = store().plantSeed(0, "bibit_wortel");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("Kehabisan");
  });

  it("plantSeed fails on season mismatch without greenhouse", () => {
    const s = store();
    s.invAdd("seeds", "bibit_jagung", 1);
    const res = s.plantSeed(0, "bibit_jagung");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("musim");
  });

  it("plantSeed fails at the 5-plant cap", () => {
    const s = store();
    for (let i = 0; i < 5; i++) s.plant(i, "wortel", 15000);
    s.invAdd("seeds", "bibit_wortel", 1);
    const res = s.plantSeed(5, "bibit_wortel");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("Max 5");
  });

  it("plantSeed fails without energy", () => {
    const s = store();
    s.invAdd("seeds", "bibit_wortel", 1);
    useGameStore.setState({ energy: 0 });
    const res = store().plantSeed(0, "bibit_wortel");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("Energy");
    expect(useGameStore.getState().inventoryByCategory.seeds.bibit_wortel?.qty).toBe(1);
  });

  it("plantSeed with fertilizer speeds growth and flags the plot", () => {
    const s = store();
    s.invAdd("seeds", "bibit_wortel", 1);
    s.invAdd("collectibles", "pupuk_kandang", 1);
    const res = s.plantSeed(0, "bibit_wortel");
    expect(res.ok).toBe(true);
    expect(res.usedFertilizer).toBe(true);
    const state = useGameStore.getState();
    expect(state.plots[0].growTime).toBe(Math.floor(15000 * 0.85));
    expect(state.plots[0].fertilizer).toBe("pupuk_kandang");
    expect(
      state.inventoryByCategory.collectibles.pupuk_kandang,
    ).toBeUndefined();
    expect(state.stats.totalFertilizerUsed).toBe(1);
  });

  it("plantSeed refunds seed and energy when the plot is occupied", () => {
    const s = store();
    s.plant(0, "wortel", 15000);
    s.invAdd("seeds", "bibit_wortel", 1);
    const res = s.plantSeed(0, "bibit_wortel");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("Petak");
    const state = useGameStore.getState();
    expect(state.inventoryByCategory.seeds.bibit_wortel?.qty).toBe(1);
    expect(state.energy).toBe(100);
  });

  it("waterPlot boosts growth for a growing plant", () => {
    const s = store();
    s.plant(0, "wortel", 10000);
    const before = useGameStore.getState().plots[0].plantedAt!;
    const res = store().waterPlot(0);
    expect(res.ok).toBe(true);
    const plot = useGameStore.getState().plots[0];
    expect(plot.watered).toBe(true);
    expect(plot.plantedAt).toBe(before - Math.floor(10000 * 0.18));
    expect(useGameStore.getState().energy).toBe(99);
  });

  it("waterPlot rejects empty and already-watered plots", () => {
    expect(store().waterPlot(0).ok).toBe(false);
    store().plant(0, "wortel", 10000);
    expect(store().waterPlot(0).ok).toBe(true);
    expect(store().waterPlot(0).ok).toBe(false);
  });

  it("harvest returns null when the crop is not ready", () => {
    store().plant(0, "wortel", 10000);
    expect(store().harvest(0)).toBeNull();
    expect(store().harvest(99)).toBeNull();
  });

  it("harvest a mature crop yields inventory, XP, and stats", () => {
    store().plant(0, "wortel", 10000);
    setNow(BASE_TIME + 10001);
    mockRandom(0.5); // deterministic: no rare variant roll
    const crop = store().harvest(0);
    expect(crop).toBe("wortel");
    const state = useGameStore.getState();
    expect(state.inventoryByCategory.crops.wortel?.qty).toBe(1);
    expect(state.plots[0].status).toBe("empty");
    expect(state.plots[0].crop).toBeNull();
    expect(state.xp).toBe(60);
    expect(state.stats.totalHarvested).toBe(1);
    expect(state.energy).toBe(99);
  });

  it("harvestAll collects every mature crop in one pass", () => {
    const s = store();
    s.plant(0, "wortel", 10000);
    s.plant(1, "wortel", 10000);
    s.plant(2, "wortel", 100000);
    setNow(BASE_TIME + 10001);
    mockRandom(0.5); // deterministic: no rare variant rolls
    const res = store().harvestAll("plots");
    expect(res.ok).toBe(true);
    const state = useGameStore.getState();
    expect(state.inventoryByCategory.crops.wortel?.qty).toBe(2);
    expect(state.plots[0].status).toBe("empty");
    expect(state.plots[1].status).toBe("empty");
    expect(state.plots[2].status).toBe("growing");
    expect(state.stats.totalHarvested).toBe(2);
    expect(state.energy).toBe(98);
  });

  it("syncPlots flips mature crops to ready", () => {
    store().plant(0, "wortel", 10000);
    setNow(BASE_TIME + 10001);
    store().syncPlots();
    expect(useGameStore.getState().plots[0].status).toBe("ready");
  });
});
