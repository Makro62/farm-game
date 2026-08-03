"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { partializeState, migrateState } from "./store/migrations";
import { logger } from "./logger";

import { createFarmingSlice } from "./store/slices/createFarmingSlice";
import { createMiningSlice } from "./store/slices/createMiningSlice";
import { createRanchingSlice } from "./store/slices/createRanchingSlice";
import { createPlayerSlice } from "./store/slices/createPlayerSlice";
import { createTownSlice } from "./store/slices/createTownSlice";
import { createSystemSlice } from "./store/slices/createSystemSlice";
import { createCustomerSlice } from "./store/slices/createCustomerSlice";
import { createAchievementSlice } from "./store/slices/createAchievementSlice";

import { initialState } from "./store/initialState";
import type { GameStore, StoreGet, StoreSet } from "@/types/game";

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => {
      const s = set as unknown as StoreSet;
      const g = get as unknown as StoreGet;
      return {
        ...initialState,

        ...createFarmingSlice(s, g),
        ...createMiningSlice(s, g),
        ...createRanchingSlice(s, g),
        ...createPlayerSlice(s, g),
        ...createTownSlice(s, g),
        ...createSystemSlice(s, g),
        ...createCustomerSlice(s, g),
        ...createAchievementSlice(s, g),

        resetGame: () => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("farm-game-storage");
          }
          s({
            ...initialState,
            plots: initialState.plots.map((p) => ({ ...p })),
            mining: {
              ...initialState.mining,
              nodes: initialState.mining.nodes.map((n) => ({ ...n })),
            },
            lastSavedAt: Date.now(),
            offlineReport: null,
          } as Partial<GameStore>);
          return true;
        },

        dev: {
          addCoins: (amount: number) => {
            s((state) => {
              state.coins += amount;
            });
          },
          addEnergy: (amount: number) => {
            s((state) => {
              state.energy = Math.min(state.energy + amount, state.maxEnergy);
            });
          },
          setLevel: (level: number) => {
            s({ level, xp: 0 });
          },
          resetPlots: () => {
            s({ plots: initialState.plots.map((p) => ({ ...p })) });
          },
          instantGrow: () => {
            s((state) => {
              state.plots.forEach((p) => {
                if (p.status === "growing") p.plantedAt = 0;
              });
            });
          },
          unlockAll: () => {
            s({
              workers: {
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
                  maxStamina: 100,
                },
                rancher: {
                  name: "Kurcaci Siti",
                  role: "rancher",
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
                  maxStamina: 100,
                },
                fisher: {
                  name: "Kurcaci Mamat",
                  role: "fisher",
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
                  maxStamina: 100,
                },
                miner: {
                  name: "Kurcaci Tarjo",
                  role: "miner",
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
                  maxStamina: 100,
                },
                chef: {
                  name: "Kurcaci Juna",
                  role: "chef",
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
                  maxStamina: 100,
                },
              },
              buildings: {
                ...initialState.buildings,
                silo: { ...initialState.buildings.silo, unlocked: true },
                greenhouse: {
                  ...initialState.buildings.greenhouse,
                  unlocked: true,
                },
              },
            });
          },
        },
      } as GameStore;
    }),
    {
      name: "farm-game-storage",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: partializeState as (state: GameStore) => Partial<GameStore>,
      merge: migrateState as (
        persisted: unknown,
        current: GameStore,
      ) => GameStore,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          logger.error("Failed to rehydrate store:", error);
          return;
        }
        if (state && !Number.isFinite(state.coins)) {
          useGameStore.setState({ coins: 100 });
        }
      },
    },
  ),
);

export const useCoins = () => useGameStore((s) => s.coins);
export const useLevel = () => useGameStore((s) => s.level);
export const useXP = () => useGameStore((s) => s.xp);
export const useDay = () => useGameStore((s) => s.day);
export const useStreak = () => useGameStore((s) => s.streak);
export const usePlots = () => useGameStore((s) => s.plots);
export const useInventory = (): Record<string, number> => {
  const invCat = useGameStore((s) => s.inventoryByCategory);
  if (!invCat) return {};
  const flat: Record<string, number> = {};
  for (const items of Object.values(invCat)) {
    for (const [id, data] of Object.entries(items)) {
      flat[id] = (flat[id] || 0) + (data.qty || 0);
    }
  }
  return flat;
};
export const useInventoryByCategory = () =>
  useGameStore((s) => s.inventoryByCategory);
export const useCropsInventory = () =>
  useGameStore((s) => s.inventoryByCategory?.crops || {});
export const useAnimalProductsInventory = () =>
  useGameStore((s) => s.inventoryByCategory?.animalProducts || {});
export const useMineralsInventory = () =>
  useGameStore((s) => s.inventoryByCategory?.minerals || {});
export const useFishInventory = () =>
  useGameStore((s) => s.inventoryByCategory?.fish || {});
export const useSettings = () =>
  useGameStore((s) => ({
    soundEnabled: s.soundEnabled,
    musicEnabled: s.musicEnabled,
    notificationsEnabled: s.notificationsEnabled,
  }));
export const useSeason = () => useGameStore((s) => s.season);
export const useWeather = () => useGameStore((s) => s.weather);
export const useMining = () => useGameStore((s) => s.mining);
export const useNpcs = () => useGameStore((s) => s.npcs);
export const useActiveEvent = () => useGameStore((s) => s.activeEvent);
