import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGameStore } from "@/lib/store";
import { partializeState } from "@/lib/store/migrations";
import { createDefaultWorker } from "@/lib/store/initialState";
import { GAME_CONSTANTS } from "@/lib/constants";
import { BASE_TIME, store, resetStore, useFakeTime } from "./helpers";

describe("prestige", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("blocks prestige below the minimum level", () => {
    const result = store().prestigeReset();
    expect(result.ok).toBe(false);
    expect(store().prestigeCount).toBe(0);
    expect(store().level).toBe(1);
  });

  it("returns multiplier 1 at zero prestiges and caps at 2.0", () => {
    expect(store().getPrestigeMultiplier()).toBe(1);
    useGameStore.setState({ prestigeCount: 1 });
    expect(store().getPrestigeMultiplier()).toBeCloseTo(1.1);
    useGameStore.setState({ prestigeCount: 15 });
    expect(store().getPrestigeMultiplier()).toBe(
      GAME_CONSTANTS.PRESTIGE.MAX_MULTIPLIER,
    );
  });

  it("applies the prestige multiplier to coin rewards", () => {
    useGameStore.setState({ coins: 0, prestigeCount: 5 });
    store().addCoins(100);
    expect(store().coins).toBe(150);
    expect(store().stats.totalRevenue).toBe(150);
  });

  it("resets progress but keeps achievements, stats, streak and prestige fields", () => {
    useGameStore.setState({
      level: 30,
      xp: 55,
      streak: 7,
      soundEnabled: false,
      tutorialStep: 3,
      coins: 99999,
      achievements: {
        first_harvest: { unlocked: true, unlockedAt: 1 },
        prestige_1: { unlocked: true, unlockedAt: 2 },
      },
      stats: {
        ...useGameStore.getState().stats,
        totalHarvested: 42,
        totalPrestiges: 0,
      },
      workers: {
        farmer: createDefaultWorker("farmer"),
        rancher: null,
        fisher: null,
        miner: null,
        chef: null,
      },
      animals: [
        {
          id: "ayam_1",
          type: "ayam",
          name: "Ayam",
          status: "idle",
          happiness: 90,
          produceTime: 60000,
          lastCollected: 0,
        },
      ],
      decorations: ["bunga_mawar"],
      dailyQuests: [
        {
          id: "q1",
          type: "harvest",
          action: "harvest",
          targetId: "wortel",
          count: 1,
          required: 5,
          rewardCoins: 100,
          rewardXp: 10,
          claimed: false,
        },
      ],
      orders: [
        {
          id: "o1",
          items: [],
          coins: 50,
          xp: 10,
          timer: 3600,
          createdAt: BASE_TIME,
        },
      ],
      activeEvent: { id: "panen", name: "Festival" },
      combo: { count: 5, multiplier: 2, lastAction: BASE_TIME },
      coinMultiplier: 2,
      growthMultiplier: 1.5,
      sessionActions: { harvested: true },
      weatherEffects: {
        cropGrowth: 2,
        miningRegen: 0.5,
        animalProduce: 1,
        fishingRare: 1,
        customerRate: 1,
      },
      season: { current: "winter", day: 7, tick: 100 },
    });

    const result = store().prestigeReset();

    expect(result.ok).toBe(true);
    const s = store();
    expect(s.level).toBe(1);
    expect(s.xp).toBe(0);
    expect(s.coins).toBe(100);
    expect(s.energy).toBe(100);
    expect(s.maxEnergy).toBe(100);
    expect(s.prestigeCount).toBe(1);
    expect(s.prestigePoints).toBe(6);
    expect(s.stats.totalPrestiges).toBe(1);
    expect(s.stats.totalHarvested).toBe(42);
    expect(s.achievements.first_harvest?.unlocked).toBe(true);
    expect(s.streak).toBe(7);
    expect(s.soundEnabled).toBe(false);
    expect(s.tutorialStep).toBe(3);
    expect(s.season).toEqual({ current: "spring", day: 1, tick: 0 });
    expect(s.workers.farmer).toBeNull();
    expect(s.animals).toEqual([]);
    expect(s.decorations).toEqual([]);
    expect(s.dailyQuests).toEqual([]);
    expect(s.orders).toEqual([]);
    expect(s.activeEvent).toBeNull();
    expect(s.combo).toEqual({ count: 0, multiplier: 1, lastAction: 0 });
    expect(s.coinMultiplier).toBe(1);
    expect(s.growthMultiplier).toBe(1);
    expect(s.weatherEffects.cropGrowth).toBe(1);
    expect(s.sessionActions).toEqual({});
    expect(s.plots.every((p) => p.status === "empty")).toBe(true);
  });

  it("persists prestige fields", () => {
    useGameStore.setState({ prestigePoints: 12, prestigeCount: 3 });
    const partial = partializeState(useGameStore.getState());
    expect(partial).toHaveProperty("prestigePoints", 12);
    expect(partial).toHaveProperty("prestigeCount", 3);
  });

  it("grants prestige points based on the level reached", () => {
    useGameStore.setState({ level: 30 });
    const result = store().prestigeReset();
    expect(result.points).toBe(6);
  });

  it("unlocks the first prestige achievement and tracks the stat", () => {
    useGameStore.setState({ level: 25 });
    store().prestigeReset();
    expect(store().stats.totalPrestiges).toBe(1);
    expect(store().achievements.prestige_1?.unlocked).toBe(true);
  });
});
