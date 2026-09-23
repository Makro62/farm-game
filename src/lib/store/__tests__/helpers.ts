import { vi } from "vitest";
import { useGameStore } from "@/lib/store";

export const BASE_TIME = new Date("2026-01-05T10:00:00Z").getTime();

export function store() {
  return useGameStore.getState();
}

export function resetStore() {
  useGameStore.getState().resetGame();
  useGameStore.setState({
    coinMultiplierExpireAt: null,
    growthMultiplierExpireAt: null,
    offlineReport: null,
    activeEvent: null,
    notificationsQueue: [],
  });
}

export function useFakeTime(startMs: number = BASE_TIME) {
  vi.useFakeTimers({
    toFake: ["Date", "setTimeout", "clearTimeout", "setInterval", "clearInterval"],
  });
  vi.setSystemTime(startMs);
}

export function setNow(ms: number) {
  vi.setSystemTime(ms);
}

export function mockRandom(value: number) {
  vi.spyOn(Math, "random").mockReturnValue(value);
}
