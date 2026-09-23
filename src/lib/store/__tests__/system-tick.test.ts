import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGameStore } from "@/lib/store";
import { GAME_CONSTANTS } from "@/lib/constants";
import {
  BASE_TIME,
  store,
  resetStore,
  useFakeTime,
  mockRandom,
} from "./helpers";

const TICKS_PER_DAY = GAME_CONSTANTS.SYSTEM.SEASON_TICKS_PER_DAY;

describe("system: advanceSeasonTick", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
    mockRandom(0.99);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("increments the tick each call", () => {
    store().advanceSeasonTick();
    expect(useGameStore.getState().season.tick).toBe(1);
    expect(useGameStore.getState().season.day).toBe(1);
  });

  it("rolls over to a new day at ticksPerDay and refills energy", () => {
    useGameStore.setState({
      season: { current: "spring", day: 1, tick: TICKS_PER_DAY - 1 },
      energy: 30,
    });
    store().advanceSeasonTick();
    const state = useGameStore.getState();
    expect(state.season.tick).toBe(0);
    expect(state.season.day).toBe(2);
    expect(state.energy).toBe(state.maxEnergy);
  });

  it("does not refill energy mid-day", () => {
    useGameStore.setState({ energy: 30 });
    store().advanceSeasonTick();
    expect(useGameStore.getState().energy).toBe(30);
  });

  it("advances the season after day 7", () => {
    useGameStore.setState({
      season: { current: "spring", day: 7, tick: TICKS_PER_DAY - 1 },
    });
    store().advanceSeasonTick();
    const season = useGameStore.getState().season;
    expect(season.day).toBe(1);
    expect(season.current).toBe("summer");
  });

  it("rolls a random event on day rollover when chance hits", () => {
    mockRandom(0.1);
    useGameStore.setState({
      season: { current: "spring", day: 1, tick: TICKS_PER_DAY - 1 },
    });
    store().advanceSeasonTick();
    expect(useGameStore.getState().activeEvent?.id).toBe("panen");
  });

  it("clears the event when the roll misses", () => {
    useGameStore.setState({ activeEvent: { id: "kebun" } });
    mockRandom(0.99);
    useGameStore.setState({
      season: { current: "spring", day: 1, tick: TICKS_PER_DAY - 1 },
    });
    store().advanceSeasonTick();
    expect(useGameStore.getState().activeEvent).toBeNull();
  });
});

describe("system: changeWeather", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
    mockRandom(0.99);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("counts down the weather timer", () => {
    useGameStore.setState({
      weather: { current: "☀️ Cerah", nextChangeIn: 10, forecast: [] },
    });
    store().changeWeather();
    expect(useGameStore.getState().weather.nextChangeIn).toBe(9);
    expect(useGameStore.getState().weather.current).toBe("☀️ Cerah");
  });

  it("rolls a new weather at zero and waters plots on rain", () => {
    useGameStore.setState({
      weather: { current: "☀️ Cerah", nextChangeIn: 1, forecast: [] },
      plots: useGameStore.getState().plots.map((p, i) =>
        i === 0
          ? {
              ...p,
              status: "growing",
              crop: "wortel",
              plantedAt: BASE_TIME,
              growTime: 10000,
              watered: false,
            }
          : p,
      ),
    });
    mockRandom(0.35);
    store().changeWeather();
    const state = useGameStore.getState();
    expect(state.weather.current).toBe("🌧️ Hujan");
    expect(state.weather.nextChangeIn).toBe(300);
    expect(state.plots[0].watered).toBe(true);
    expect(state.weatherEffects.fishingRare).toBe(1.15);
    expect(
      state.notificationsQueue.some((n) =>
        String(n.message).includes("tersiram otomatis"),
      ),
    ).toBe(true);
  });

  it("snow kills growing crops in winter", () => {
    useGameStore.setState({
      season: { current: "winter", day: 1, tick: 0 },
      weather: { current: "☀️ Cerah", nextChangeIn: 1, forecast: [] },
      plots: useGameStore.getState().plots.map((p, i) =>
        i === 0
          ? {
              ...p,
              status: "growing",
              crop: "kubis",
              plantedAt: BASE_TIME,
              growTime: 10000,
            }
          : p,
      ),
    });
    mockRandom(0.5);
    store().changeWeather();
    const state = useGameStore.getState();
    expect(state.weather.current).toBe("☃️ Bersalju");
    expect(state.plots[0].status).toBe("dead");
  });
});

describe("system: processGameTick", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
    mockRandom(0.99);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("runs a full tick without throwing", () => {
    expect(() => store().processGameTick()).not.toThrow();
    expect(useGameStore.getState().season.tick).toBe(1);
  });

  it("expires the coin booster when its timer passes", () => {
    const s = store();
    s.invAdd("crops", "wortel", 1);
    s.activateCoinBooster();
    expect(useGameStore.getState().coinMultiplier).toBe(2);
    vi.setSystemTime(BASE_TIME + 31 * 60 * 1000);
    store().processGameTick();
    const state = useGameStore.getState();
    expect(state.coinMultiplier).toBe(1);
    expect(state.coinMultiplierExpireAt).toBeNull();
  });
});
