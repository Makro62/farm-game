import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGameStore } from "@/lib/store";
import { CROP_DATA } from "@/lib/data/crops";
import { getItemCategory } from "@/lib/utils/inventory";
import {
  getItemSellPrice,
  getItemDisplayName,
} from "@/lib/data/item-helpers";
import {
  COLLECTION_LISTS,
} from "@/lib/store/slices/createCollectionSlice";
import { partializeState, migrateState } from "@/lib/store/migrations";
import { GAME_CONSTANTS } from "@/lib/constants";
import { BASE_TIME, store, resetStore, useFakeTime, mockRandom } from "./helpers";

function readyPlot(cropId: string, plotId = 0) {
  useGameStore.setState({
    plots: store().plots.map((p, i) =>
      i === plotId
        ? {
            ...p,
            status: "ready" as const,
            crop: cropId,
            plantedAt: BASE_TIME - 10_000,
            growTime: 1_000,
            watered: true,
            fertilizer: null,
            pestInfestation: false,
          }
        : p,
    ),
  });
}

describe("crop variants", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("maps variant ids to the crops category", () => {
    expect(getItemCategory("wortel_emas")).toBe("crops");
    expect(getItemCategory("tomat_mentari")).toBe("crops");
    expect(getItemCategory("stroberi_permata")).toBe("crops");
    expect(getItemCategory("semangka_bintang")).toBe("crops");
  });

  it("sells variants at 2x the base crop price", () => {
    const base = CROP_DATA.wortel.baseSellPrice;
    expect(getItemSellPrice("wortel_emas")).toBe(base * 2);
    expect(getItemDisplayName("wortel_emas")).toBe("Wortel Emas");
  });

  it("grants the variant item on a rare harvest roll", () => {
    readyPlot("wortel");
    mockRandom(0.01); // quality roll + variant roll both pass
    const granted = store().harvest(0);
    expect(granted).toBe("wortel");
    expect(store().inventoryByCategory.crops.wortel_emas?.qty).toBe(1);
    expect(store().inventoryByCategory.crops.wortel?.qty).toBeUndefined();
    expect(store().collection.crops).toContain("wortel_emas");
    expect(store().notificationsQueue.length).toBeGreaterThan(0);
  });

  it("grants the base crop when the variant roll fails", () => {
    readyPlot("wortel");
    mockRandom(0.99);
    store().harvest(0);
    expect(store().inventoryByCategory.crops.wortel?.qty).toBe(1);
    expect(store().inventoryByCategory.crops.wortel_emas).toBeUndefined();
    expect(store().collection.crops).toContain("wortel");
    expect(store().collection.crops).not.toContain("wortel_emas");
  });
});

describe("collection", () => {
  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("tracks known items and ignores unknown ones", () => {
    expect(store().addToCollection("minerals", "berlian")).toBe(true);
    expect(store().collection.minerals).toContain("berlian");
    expect(store().addToCollection("minerals", "berlian")).toBe(false);
    expect(store().addToCollection("minerals", "barang_ngawur")).toBe(false);
    expect(store().collection.minerals).not.toContain("barang_ngawur");
  });

  it("blocks claiming before the set is complete", () => {
    store().addToCollection("fish", "ikan_mas");
    const result = store().claimCollectionReward("fish");
    expect(result.ok).toBe(false);
    expect(store().collection.claimed).not.toContain("fish");
  });

  it("pays the reward once when a set is completed and claimed", () => {
    useGameStore.setState({
      coins: 0,
      collection: {
        crops: [],
        fish: [],
        minerals: [...COLLECTION_LISTS.minerals],
        recipes: [],
        claimed: [],
      },
    });
    const result = store().claimCollectionReward("minerals");
    expect(result.ok).toBe(true);
    expect(store().coins).toBe(GAME_CONSTANTS.COLLECTION.REWARD_COINS);
    expect(store().collection.claimed).toContain("minerals");

    const again = store().claimCollectionReward("minerals");
    expect(again.ok).toBe(false);
    expect(store().coins).toBe(GAME_CONSTANTS.COLLECTION.REWARD_COINS);
  });

  it("persists the collection and migrates missing saves", () => {
    const partial = partializeState(useGameStore.getState());
    expect(partial).toHaveProperty("collection");
    const migrated = migrateState({}, useGameStore.getState());
    expect(migrated.collection.crops).toEqual([]);
    expect(migrated.collection.claimed).toEqual([]);
    const broken = migrateState(
      { collection: { crops: null, claimed: "x" } },
      useGameStore.getState(),
    );
    expect(broken.collection.crops).toEqual([]);
    expect(broken.collection.claimed).toEqual([]);
  });
});

describe("breeding", () => {
  const twoAyam = [
    {
      id: "a1",
      type: "ayam",
      status: "producing",
      lastCollected: BASE_TIME,
      produceTime: 20_000,
      fed: false,
    },
    {
      id: "a2",
      type: "ayam",
      status: "producing",
      lastCollected: BASE_TIME,
      produceTime: 20_000,
      fed: false,
    },
  ];

  beforeEach(() => {
    useFakeTime(BASE_TIME);
    resetStore();
    useGameStore.setState({
      coins: 1000,
      animals: twoAyam.map(a => ({ ...a })),
      achievements: { first_animal: { unlocked: true, unlockedAt: 1 } },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("breeds two same-type animals into a gen-1 offspring", () => {
    const result = store().breedAnimal("a1", "a2");
    expect(result.ok).toBe(true);
    const animals = store().animals;
    expect(animals).toHaveLength(3);
    expect(animals[2].gen).toBe(1);
    expect(animals[2].type).toBe("ayam");
    expect(store().coins).toBe(500);
    expect(animals[0].lastBredAt).toBe(BASE_TIME);
    expect(animals[1].lastBredAt).toBe(BASE_TIME);
    expect(store().stats.totalAnimalsOwned).toBe(1);
    const shopTime = 20 * 1000;
    expect(animals[2].produceTime).toBe(
      Math.max(1000, Math.round(shopTime * 0.95)),
    );
  });

  it("rejects mismatched types and repeated cooldowns", () => {
    useGameStore.setState({
      animals: [
        ...twoAyam.map(a => ({ ...a })),
        {
          id: "b1",
          type: "sapi",
          status: "producing",
          lastCollected: BASE_TIME,
          produceTime: 60_000,
          fed: false,
        },
      ],
    });
    const mismatch = store().breedAnimal("a1", "b1");
    expect(mismatch.ok).toBe(false);
    expect(mismatch.message).toContain("satu jenis");

    expect(store().breedAnimal("a1", "a2").ok).toBe(true);
    const cooldown = store().breedAnimal("a1", "a2");
    expect(cooldown.ok).toBe(false);
    expect(cooldown.message).toContain("istirahat");
    expect(store().animals).toHaveLength(4);
  });

  it("rejects breeding without enough coins", () => {
    useGameStore.setState({ coins: 100 });
    const result = store().breedAnimal("a1", "a2");
    expect(result.ok).toBe(false);
    expect(store().animals).toHaveLength(2);
    expect(store().coins).toBe(100);
  });
});
