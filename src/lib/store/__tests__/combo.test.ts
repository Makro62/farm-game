import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGameStore } from "@/lib/store";
import { GAME_CONSTANTS } from "@/lib/constants";
import { BASE_TIME, store, resetStore, useFakeTime } from "./helpers";

describe("combo system", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts a combo at count 1 / multiplier 1", () => {
    const combo = store().registerCombo();
    expect(combo).toEqual({ count: 1, multiplier: 1 });
  });

  it("builds combo within the window", () => {
    store().registerCombo();
    const c2 = store().registerCombo();
    expect(c2.count).toBe(2);
    expect(c2.multiplier).toBeCloseTo(1.25);
    const c3 = store().registerCombo();
    expect(c3.count).toBe(3);
    expect(c3.multiplier).toBeCloseTo(1.5);
  });

  it("resets when the window expires", () => {
    store().registerCombo();
    store().registerCombo();
    vi.setSystemTime(BASE_TIME + GAME_CONSTANTS.COMBO.WINDOW_MS + 1);
    const combo = store().registerCombo();
    expect(combo.count).toBe(1);
    expect(combo.multiplier).toBe(1);
  });

  it("caps the multiplier at 4.0", () => {
    let last = { count: 0, multiplier: 1 };
    for (let i = 0; i < 20; i++) last = store().registerCombo();
    expect(last.multiplier).toBe(GAME_CONSTANTS.COMBO.MAX_MULTIPLIER);
    expect(last.count).toBe(20);
    expect(useGameStore.getState().stats.maxCombo).toBe(20);
  });

  it("resetCombo clears count and multiplier", () => {
    store().registerCombo();
    store().registerCombo();
    store().resetCombo();
    const combo = useGameStore.getState().combo;
    expect(combo.count).toBe(0);
    expect(combo.multiplier).toBe(1);
    expect(combo.lastAction).toBe(0);
  });

  it("applies combo multiplier to sales at the threshold, then resets", () => {
    const s = store();
    s.invAdd("crops", "wortel", 10);
    s.registerCombo();
    s.registerCombo();
    s.registerCombo();
    expect(useGameStore.getState().combo.count).toBe(3);
    const coinsBefore = useGameStore.getState().coins;
    const earned = store().sellItem("wortel", 1);
    expect(earned).toBe(Math.round(25 * 1.5));
    expect(useGameStore.getState().coins).toBe(coinsBefore + earned);
    expect(useGameStore.getState().combo.count).toBe(0);
  });

  it("does not apply combo below the threshold", () => {
    const s = store();
    s.invAdd("crops", "wortel", 10);
    s.registerCombo();
    s.registerCombo();
    const coinsBefore = useGameStore.getState().coins;
    const earned = store().sellItem("wortel", 1);
    expect(earned).toBe(25);
    expect(useGameStore.getState().coins).toBe(coinsBefore + 25);
    expect(useGameStore.getState().combo.count).toBe(2);
  });
});
