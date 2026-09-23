import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGameStore } from "@/lib/store";
import { partializeState, migrateState } from "@/lib/store/migrations";
import { BASE_TIME, resetStore, useFakeTime } from "./helpers";

describe("migrations: partializeState", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("persists core gameplay fields and nothing from actions", () => {
    const partial = partializeState(useGameStore.getState());
    const keys = [
      "coins",
      "level",
      "xp",
      "energy",
      "maxEnergy",
      "plots",
      "inventoryByCategory",
      "animals",
      "workers",
      "season",
      "weather",
      "mining",
      "achievements",
      "stats",
      "restaurant",
      "town",
      "buildings",
      "tutorialStep",
      "sessionActions",
      "weatherEffects",
      "prestigePoints",
      "prestigeCount",
      "collection",
    ] as const;
    for (const key of keys) {
      expect(partial).toHaveProperty(key);
    }
    expect(partial).not.toHaveProperty("dev");
    expect(partial).not.toHaveProperty("resetGame");
    expect(partial).not.toHaveProperty("modals");
    expect(partial).not.toHaveProperty("notificationsQueue");
    expect(() => JSON.stringify(partial)).not.toThrow();
  });
});

describe("migrations: migrateState", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function migrate(persisted: Record<string, unknown>) {
    return migrateState(persisted, useGameStore.getState());
  }

  it("repairs NaN coins to the starting amount", () => {
    const result = migrate({ coins: NaN });
    expect(result.coins).toBe(100);
  });

  it("keeps finite coins and floors them", () => {
    expect(migrate({ coins: 123.9 }).coins).toBe(123);
    expect(migrate({ coins: -50 }).coins).toBe(0);
  });

  it("migrates a legacy worker object into a full Worker", () => {
    const result = migrate({
      workers: {
        farmer: { type: "farmer", level: 3, xp: 50, happiness: 70 },
        rancher: null,
      },
    });
    const farmer = result.workers.farmer;
    expect(farmer).not.toBeNull();
    expect(farmer!.hired).toBe(true);
    expect(farmer!.name).toBe("Kurcaci Budi");
    expect(farmer!.level).toBe(3);
    expect(farmer!.happiness).toBe(70);
    expect(farmer!.isAutoMode).toBe(true);
    expect(result.workers.rancher).toBeNull();
    expect((result as Record<string, unknown>).autoFarmer).toBeUndefined();
  });

  it("passes through an already-modern worker untouched", () => {
    const modern = {
      hired: true,
      name: "Kustom",
      role: "farmer",
      level: 5,
      xp: 10,
      xpToNext: 200,
      stamina: 80,
      happiness: 55,
      wagePerDay: 50,
      daysEmployed: 2,
      totalWagesPaid: 100,
      loyalty: 60,
      skills: {},
      isWorking: true,
      isAutoMode: false,
    };
    const result = migrate({ workers: { farmer: modern } });
    expect(result.workers.farmer).toEqual(modern);
  });

  it("applies legacy auto* flags onto workers", () => {
    const result = migrate({
      autoMiner: true,
      workers: {
        miner: { hired: true, name: "Tarjo", role: "miner", level: 1 },
      },
    });
    expect(result.workers.miner!.isAutoMode).toBe(true);
    expect((result as Record<string, unknown>).autoMiner).toBeUndefined();
  });

  it("migrates a flat legacy inventory into categories", () => {
    const result = migrate({
      inventory: { wortel: 5, item_ngawur_dulu: 2 },
    });
    expect(result.inventoryByCategory.crops.wortel?.qty).toBe(5);
    expect(result.inventoryByCategory.collectibles.item_ngawur_dulu?.qty).toBe(2);
    expect((result as Record<string, unknown>).inventory).toBeUndefined();
  });

  it("normalizes plot arrays to full length", () => {
    const result = migrate({
      plots: [
        {
          id: 0,
          status: "growing",
          crop: "wortel",
          plantedAt: 1,
          growTime: 100,
          watered: true,
        },
      ],
      feedPlots: null,
      kitchenPlots: "bukan-array",
    });
    expect(result.plots).toHaveLength(30);
    expect(result.plots[0].status).toBe("growing");
    expect(result.plots[0].crop).toBe("wortel");
    expect(result.plots[1].status).toBe("empty");
    expect(result.feedPlots).toHaveLength(12);
    expect(result.feedPlots[0].id).toBe(100);
    expect(result.kitchenPlots).toHaveLength(12);
    expect(result.kitchenPlots[0].id).toBe(200);
  });

  it("fills missing restaurant defaults on old saves", () => {
    const result = migrate({ restaurant: { reputation: 5 } });
    expect(result.restaurant.reputation).toBe(5);
    expect(result.restaurant.dailySpecial).toBeNull();
    expect(result.restaurant.serviceOn).toBe(true);
    expect(result.restaurant.lastSpecialDay).toBe(-1);
  });

  it("merges default stats over partial legacy stats", () => {
    const result = migrate({ stats: { totalHarvested: 7 } });
    expect(result.stats.totalHarvested).toBe(7);
    expect(result.stats.totalMined).toBe(0);
    expect(result.stats.totalSushiEmasMade).toBe(0);
  });

  it("repairs invalid multipliers and energy", () => {
    const result = migrate({
      growthMultiplier: 0,
      coinMultiplier: -3,
      energy: null,
      maxEnergy: null,
    });
    expect(result.growthMultiplier).toBe(1);
    expect(result.coinMultiplier).toBe(1);
    expect(result.energy).toBe(100);
    expect(result.maxEnergy).toBe(100);
  });

  it("migrates legacy animal type names", () => {
    const result = migrate({
      animals: [
        {
          id: "a1",
          type: "chicken",
          status: "producing",
          lastCollected: 1,
          produceTime: 20000,
        },
      ],
    });
    expect(result.animals[0].type).toBe("ayam");
  });

  it("pads the mining node list to 30", () => {
    const result = migrate({
      mining: {
        pickaxeLevel: 2,
        nodes: [{ id: 0, status: "ready", regenAt: null, type: "batu", hazard: null }],
      },
    });
    expect(result.mining.nodes).toHaveLength(30);
    expect(result.mining.pickaxeLevel).toBe(2);
    expect(result.mining.nodes[0].hazard).toBeNull();
    expect(result.mining.smeltery.unlocked).toBe(false);
  });

  it("ensures inventoryByCategory exists when there is no save data", () => {
    const result = migrate({});
    expect(result.inventoryByCategory.crops).toEqual({});
    expect(result.inventoryByCategory.seeds).toEqual({});
    expect(result.npcs.maria.level).toBe(1);
  });
});
