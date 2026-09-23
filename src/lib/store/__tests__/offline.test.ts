import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGameStore } from "@/lib/store";
import { BASE_TIME, store, resetStore, useFakeTime } from "./helpers";

function hireFarmer() {
  useGameStore.setState({
    workers: {
      ...useGameStore.getState().workers,
      farmer: {
        name: "Kurcaci Budi",
        role: "farmer",
        level: 1,
        xp: 0,
        xpToNext: 200,
        stamina: 100,
        happiness: 80,
        wagePerDay: 50,
        daysEmployed: 0,
        totalWagesPaid: 0,
        loyalty: 60,
        skills: {},
        isWorking: true,
        isAutoMode: true,
        hired: true,
      },
    },
  });
}

describe("offline progress", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
    vi.spyOn(Math, "random").mockReturnValue(0.99);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("does nothing under the minimum offline window", () => {
    useGameStore.setState({ lastSavedAt: BASE_TIME - 30000 });
    store().calculateOfflineProgress();
    const state = useGameStore.getState();
    expect(state.offlineReport).toBeNull();
    expect(state.lastSavedAt).toBe(BASE_TIME - 30000);
  });

  it("harvests matured crops with an active farmer", () => {
    hireFarmer();
    useGameStore.setState({
      lastSavedAt: BASE_TIME - 120000,
      plots: useGameStore.getState().plots.map((p, i) =>
        i === 0
          ? {
              ...p,
              status: "growing" as const,
              crop: "wortel",
              plantedAt: BASE_TIME - 60000,
              growTime: 10000,
            }
          : p,
      ),
    });
    store().calculateOfflineProgress();
    const state = useGameStore.getState();
    expect(state.offlineReport).not.toBeNull();
    expect(state.offlineReport!.harvestedCrops).toBe(1);
    expect(state.offlineReport!.deltaSeconds).toBe(120);
    expect(state.offlineReport!.earnedCoins).toBe(25);
    expect(state.inventoryByCategory.crops.wortel?.qty).toBe(1);
    expect(state.plots[0].status).toBe("empty");
    expect(state.lastSavedAt).toBe(BASE_TIME);
  });

  it("only refreshes the save timestamp when no worker is active", () => {
    useGameStore.setState({
      lastSavedAt: BASE_TIME - 300000,
      plots: useGameStore.getState().plots.map((p, i) =>
        i === 0
          ? {
              ...p,
              status: "growing" as const,
              crop: "wortel",
              plantedAt: BASE_TIME - 60000,
              growTime: 10000,
            }
          : p,
      ),
    });
    store().calculateOfflineProgress();
    const state = useGameStore.getState();
    expect(state.offlineReport).toBeNull();
    expect(state.lastSavedAt).toBe(BASE_TIME);
    expect(state.plots[0].status).toBe("growing");
    expect(state.inventoryByCategory.crops.wortel).toBeUndefined();
  });

  it("clearOfflineReport drops the report", () => {
    hireFarmer();
    useGameStore.setState({
      lastSavedAt: BASE_TIME - 120000,
      plots: useGameStore.getState().plots.map((p, i) =>
        i === 0
          ? {
              ...p,
              status: "growing" as const,
              crop: "wortel",
              plantedAt: BASE_TIME - 60000,
              growTime: 10000,
            }
          : p,
      ),
    });
    store().calculateOfflineProgress();
    expect(useGameStore.getState().offlineReport).not.toBeNull();
    store().clearOfflineReport();
    expect(useGameStore.getState().offlineReport).toBeNull();
  });
});
