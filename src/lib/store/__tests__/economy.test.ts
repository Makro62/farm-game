import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGameStore } from "@/lib/store";
import { BASE_TIME, store, resetStore, useFakeTime, setNow } from "./helpers";

describe("economy: coins", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("addCoins adds a positive finite amount", () => {
    store().addCoins(50);
    expect(useGameStore.getState().coins).toBe(150);
    expect(useGameStore.getState().stats.totalRevenue).toBe(50);
  });

  it("addCoins ignores invalid amounts", () => {
    store().addCoins(-10);
    store().addCoins(NaN);
    store().addCoins(0);
    expect(useGameStore.getState().coins).toBe(100);
  });

  it("spendCoins deducts and fails on insufficient funds", () => {
    expect(store().spendCoins(40)).toBe(true);
    expect(useGameStore.getState().coins).toBe(60);
    expect(store().spendCoins(1000)).toBe(false);
    expect(useGameStore.getState().coins).toBe(60);
    expect(store().spendCoins(-5)).toBe(false);
  });

  it("buyItem spends coins and grants the item", () => {
    const ok = store().buyItem("bibit_wortel", 2, 10);
    expect(ok).toBe(true);
    const state = useGameStore.getState();
    expect(state.coins).toBe(80);
    expect(state.inventoryByCategory.seeds.bibit_wortel?.qty).toBe(2);
  });

  it("buyItem rejects when unaffordable", () => {
    expect(store().buyItem("bibit_jamur", 1, 500)).toBe(false);
    expect(useGameStore.getState().coins).toBe(100);
  });
});

describe("economy: selling", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("sellItem sells available quantity at base price", () => {
    const s = store();
    s.invAdd("crops", "wortel", 10);
    const earned = s.sellItem("wortel", 3);
    expect(earned).toBe(75);
    const state = useGameStore.getState();
    expect(state.inventoryByCategory.crops.wortel?.qty).toBe(7);
    expect(state.coins).toBe(175);
    expect(state.stats.totalRevenue).toBe(75);
  });

  it("sellItem returns 0 for unknown or empty items", () => {
    expect(store().sellItem("item_ngawur", 1)).toBe(0);
    expect(store().sellItem("wortel", 1)).toBe(0);
    expect(store().sellItem("wortel", 0)).toBe(0);
  });

  it("sellItem respects market todayPrices", () => {
    const s = store();
    s.invAdd("crops", "wortel", 5);
    useGameStore.setState({ todayPrices: { wortel: 40 } });
    expect(store().sellItem("wortel", 1)).toBe(40);
  });

  it("sellItem doubles crop price during the panen event", () => {
    const s = store();
    s.invAdd("crops", "wortel", 5);
    useGameStore.setState({ activeEvent: { id: "panen" } });
    expect(store().sellItem("wortel", 1)).toBe(50);
  });

  it("sellItem applies the coin booster", () => {
    const s = store();
    s.invAdd("crops", "wortel", 5);
    s.activateCoinBooster();
    expect(useGameStore.getState().coinMultiplier).toBe(2);
    expect(store().sellItem("wortel", 1)).toBe(50);
  });

  it("sellAllInventory skips seeds and bait", () => {
    const s = store();
    s.invAdd("crops", "wortel", 4);
    s.invAdd("seeds", "bibit_wortel", 9);
    s.invAdd("bait", "umpan_cacing", 3);
    const earned = store().sellAllInventory();
    expect(earned).toBe(100);
    const state = useGameStore.getState();
    expect(state.inventoryByCategory.crops.wortel).toBeUndefined();
    expect(state.inventoryByCategory.seeds.bibit_wortel?.qty).toBe(9);
    expect(state.coins).toBe(200);
  });

  it("sellAllInventory returns 0 when nothing is sellable", () => {
    expect(store().sellAllInventory()).toBe(0);
    expect(useGameStore.getState().coins).toBe(100);
  });
});

describe("economy: XP and energy", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("addXP accumulates within a level", () => {
    expect(store().addXP(40)).toBe(false);
    const state = useGameStore.getState();
    expect(state.level).toBe(1);
    expect(state.xp).toBe(40);
  });

  it("addXP levels up at level*100 XP and raises max energy", () => {
    expect(store().addXP(100)).toBe(true);
    const state = useGameStore.getState();
    expect(state.level).toBe(2);
    expect(state.xp).toBe(0);
    expect(state.maxEnergy).toBe(110);
    expect(state.energy).toBe(110);
  });

  it("addXP can cross multiple levels in one call", () => {
    store().addXP(250);
    const state = useGameStore.getState();
    expect(state.level).toBe(2);
    expect(state.xp).toBe(150);
    expect(state.maxEnergy).toBe(110);
  });

  it("addXP ignores non-positive amounts", () => {
    expect(store().addXP(0)).toBe(false);
    expect(store().addXP(-5)).toBe(false);
    expect(useGameStore.getState().xp).toBe(0);
  });

  it("consumeEnergy deducts or fails", () => {
    expect(store().consumeEnergy(50)).toBe(true);
    expect(useGameStore.getState().energy).toBe(50);
    expect(store().consumeEnergy(1000)).toBe(false);
    expect(useGameStore.getState().energy).toBe(50);
  });

  it("checkStreak claims once per day and continues from yesterday", () => {
    const first = store().checkStreak();
    expect(first.claimed).toBe(true);
    expect(first.streak).toBe(1);
    expect(first.reward).toBe(100);
    expect(useGameStore.getState().coins).toBe(200);

    const again = store().checkStreak();
    expect(again.claimed).toBe(false);

    setNow(BASE_TIME + 86400000);
    const next = store().checkStreak();
    expect(next.claimed).toBe(true);
    expect(next.streak).toBe(2);
    expect(next.reward).toBe(200);
    expect(useGameStore.getState().coins).toBe(400);
  });

  it("buyGrowthBooster activates once and guards funds", () => {
    expect(store().buyGrowthBooster()).toBe(true);
    const state = useGameStore.getState();
    expect(state.growthMultiplier).toBe(1.5);
    expect(state.coins).toBe(50);
    expect(store().buyGrowthBooster()).toBe(false);

    resetStore();
    useGameStore.setState({ coins: 10 });
    expect(store().buyGrowthBooster()).toBe(false);
  });
});
