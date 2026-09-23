import { describe, it, expect } from "vitest";
import { CROP_DATA, SHOP_SEEDS } from "@/lib/data/crops";
import { RECIPES } from "@/lib/data/recipes";
import { FISHES } from "@/lib/data/fishes";
import { MINERALS } from "@/lib/data/minerals";
import { ACHIEVEMENTS, ACHIEVEMENT_MAP } from "@/lib/data/achievements";
import {
  getItemCategory,
  getItemSellPrice,
} from "@/lib/data/item-helpers";
import { parseRequirementKey } from "@/lib/utils/inventory";

function uniqueIds(items: Array<{ id: string }>) {
  const ids = items.map((i) => i.id);
  expect(ids.every((id) => typeof id === "string" && id.length > 0)).toBe(true);
  expect(new Set(ids).size).toBe(ids.length);
}

describe("data sanity: crops & seeds", () => {
  it("has unique crop and seed ids", () => {
    uniqueIds(Object.values(CROP_DATA));
    uniqueIds(SHOP_SEEDS);
  });

  it("has a seed for every crop and the counts match", () => {
    expect(SHOP_SEEDS).toHaveLength(Object.keys(CROP_DATA).length);
    const cropIds = new Set(Object.keys(CROP_DATA));
    for (const seed of SHOP_SEEDS) {
      expect(cropIds.has(seed.cropId)).toBe(true);
      expect(seed.id).toBe(`bibit_${seed.cropId}`);
      expect(seed.price).toBeGreaterThan(0);
      expect(seed.unlockLevel).toBeGreaterThanOrEqual(1);
    }
  });

  it("every crop has positive growth and sell price", () => {
    for (const crop of Object.values(CROP_DATA)) {
      expect(crop.growthTime).toBeGreaterThan(0);
      expect(crop.baseSellPrice).toBeGreaterThan(0);
      expect(crop.emoji.length).toBeGreaterThan(0);
      expect(["all", "spring", "summer", "autumn", "winter"]).toContain(
        crop.preferredSeason,
      );
    }
  });

  it("resolves categories through the canonical helper", () => {
    for (const crop of Object.values(CROP_DATA)) {
      expect(getItemCategory(crop.id)).toBe("crops");
      expect(getItemCategory(crop.seed!.id)).toBe("seeds");
    }
    expect(getItemCategory("pupuk_kandang")).toBe("collectibles");
    expect(getItemCategory("cacing")).toBe("collectibles");
    expect(getItemCategory("item_ngawur_123")).toBeNull();
    expect(getItemCategory("")).toBeNull();
  });

  it("prices crops and seeds through getItemSellPrice", () => {
    expect(getItemSellPrice("wortel")).toBe(25);
    expect(getItemSellPrice("bibit_wortel")).toBe(5);
    expect(getItemSellPrice("wortel", { quality: "gold" })).toBe(
      Math.floor(25 * 1.5),
    );
    for (const crop of Object.values(CROP_DATA)) {
      const price = getItemSellPrice(crop.id);
      expect(price).not.toBeNull();
      expect(price!).toBeGreaterThan(0);
    }
    expect(getItemSellPrice("item_ngawur_123")).toBeNull();
  });
});

describe("data sanity: recipes", () => {
  it("has unique recipe ids", () => {
    uniqueIds(RECIPES);
  });

  it("every recipe has a positive price and time", () => {
    for (const recipe of RECIPES) {
      expect(recipe.price).toBeGreaterThan(0);
      expect(recipe.time).toBeGreaterThan(0);
      expect(["processing", "restaurant", "kitchen", "fish_kitchen"]).toContain(
        recipe.type,
      );
      expect(recipe.emoji.length).toBeGreaterThan(0);
    }
  });

  it("maps recipe ids to the right inventory category", () => {
    for (const recipe of RECIPES) {
      expect(getItemCategory(recipe.id)).toBe(
        recipe.type === "processing" ? "processed" : "cooked",
      );
    }
  });

  it("parses dotted requirement keys used by recipes", () => {
    for (const recipe of RECIPES) {
      for (const key of Object.keys(recipe.req || {})) {
        if (key.includes(".")) {
          expect(parseRequirementKey(key)).not.toBeNull();
        }
      }
    }
  });
});

describe("data sanity: fish & minerals", () => {
  it("has unique fish and mineral ids", () => {
    uniqueIds(FISHES);
    uniqueIds(MINERALS);
  });

  it("every fish resolves to the fish category with a finite price", () => {
    for (const fish of FISHES) {
      expect(getItemCategory(fish.id)).toBe("fish");
      const price = getItemSellPrice(fish.id);
      expect(price).not.toBeNull();
      expect(Number.isFinite(price!)).toBe(true);
    }
  });

  it("every mineral resolves to minerals with a positive price", () => {
    for (const mineral of MINERALS) {
      expect(getItemCategory(mineral.id)).toBe("minerals");
      expect(mineral.price).toBeGreaterThan(0);
      expect(getItemSellPrice(mineral.id)).toBe(mineral.price);
    }
  });
});

describe("data sanity: achievements", () => {
  it("has unique achievement ids and a lookup map", () => {
    uniqueIds(ACHIEVEMENTS);
    expect(Object.keys(ACHIEVEMENT_MAP)).toHaveLength(ACHIEVEMENTS.length);
  });

  it("every achievement has a condition and non-negative rewards", () => {
    for (const achievement of ACHIEVEMENTS) {
      expect(achievement.condition).toBeTruthy();
      expect(achievement.rewardXp).toBeGreaterThanOrEqual(0);
      expect(achievement.rewardCoins ?? 0).toBeGreaterThanOrEqual(0);
      expect(achievement.emoji.length).toBeGreaterThan(0);
      expect(achievement.name.length).toBeGreaterThan(0);
      expect(achievement.desc.length).toBeGreaterThan(0);
    }
  });

  it("stat conditions reference stats that exist on a zeroed stats object", () => {
    const zeroed: Record<string, number> = {
      totalHarvested: 0,
      totalMined: 0,
      totalFished: 0,
      totalCooked: 0,
      totalServed: 0,
      totalCollected: 0,
      totalOrdersFulfilled: 0,
      totalGiftsGiven: 0,
      totalFertilizerUsed: 0,
      totalFertilizerDropped: 0,
      totalAnimalsFed: 0,
      totalAnimalsOwned: 0,
      totalWormsFound: 0,
      totalWormBaitUsed: 0,
      totalDiamondsMined: 0,
      totalSushiEmasMade: 0,
      totalPrestiges: 0,
    };
    for (const achievement of ACHIEVEMENTS) {
      const condition = achievement.condition as
        | { stat?: string }
        | { type?: string };
      if ("stat" in condition && condition.stat) {
        expect(Object.keys(zeroed)).toContain(condition.stat);
      }
    }
  });
});
