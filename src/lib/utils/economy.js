import { CROP_DATA } from "@/lib/data/crops";
import { MINERALS } from "@/lib/data/minerals";
import { FISHES } from "@/lib/data/fishes";
import { RECIPES } from "@/lib/data/recipes";
import { QUALITY_MULTIPLIERS } from "@/lib/data/item-helpers";

const SEASON_PRICE_MODIFIERS = {
  wortel: { spring: 1.1, summer: 1.0, autumn: 0.9, winter: 0.8 },
  jagung: { spring: 0.8, summer: 1.3, autumn: 1.0, winter: 0.3 },
  tomat: { spring: 0.9, summer: 1.2, autumn: 1.0, winter: 0.2 },
  stroberi: { spring: 1.3, summer: 0.9, autumn: 0.5, winter: 0.3 },
  semangka: { summer: 1.3, winter: 0.1 },
  jamur: { winter: 1.4, summer: 0.1 },
  labu: { autumn: 1.3, spring: 0.5 },
  kentang: { autumn: 1.2, spring: 0.8 },
  gandum: { autumn: 1.2, summer: 0.7 },
  tebu: { summer: 1.2, spring: 0.9 },
  tulip: { spring: 1.3, summer: 0.8 },
  apel: { autumn: 1.2, spring: 0.6 },
};

export function getCropGrowthSpeed(season, weather, buildings, workers) {
  let speed = 1.0;

  if (weather?.includes("Hujan") || weather?.includes("rainy")) {
    speed *= 1.2;
  } else if (weather?.includes("Berangin") || weather?.includes("windy")) {
    speed *= 1.1;
  } else if (weather?.includes("Kekeringan") || weather?.includes("drought")) {
    speed *= 0.5;
  }

  if (buildings?.greenhouse?.active) speed *= 1.2;
  if (buildings?.greenhouse?.unlocked) speed *= 1.1;

  if (workers?.farmer?.skills?.watering >= 3) speed *= 1.05;

  return speed;
}

export function calculateSellPrice(itemId, gameState) {
  if (!gameState) return null;
  const { season, buildings, activeEvent, market, inventoryByCategory } =
    gameState;
  const currentSeason = season?.current;
  const event = activeEvent;
  const supply = market?.supply?.[itemId] || 0;
  const demand = market?.demand?.[itemId] || 100;
  const saturationMult = Math.max(0.5, Math.min(2.0, demand / (supply + 1)));

  // Try crops first
  const cropData = CROP_DATA[itemId];
  if (cropData) {
    let price = cropData.baseSellPrice;

    if (currentSeason && SEASON_PRICE_MODIFIERS[itemId]?.[currentSeason]) {
      price *= SEASON_PRICE_MODIFIERS[itemId][currentSeason];
    }

    if (buildings?.silo?.unlocked) {
      price *= 1.15 + (buildings.silo.level || 0) * 0.05;
    }

    if (event?.id === "panen") price *= 2;

    price *= saturationMult;

    return Math.floor(price);
  }

  // Try minerals
  const mineral = MINERALS.find((m) => m.id === itemId);
  if (mineral) {
    let price = mineral.basePrice || mineral.price;
    if (event?.id === "tambang") price *= 1.5;
    return Math.floor(price);
  }

  // Try fish
  const fish = FISHES.find((f) => f.id === itemId);
  if (fish) {
    let price = fish.basePrice || fish.priceNormal;
    if (event?.id === "bahari") price *= 2;
    return Math.floor(price);
  }

  // Try recipes
  const recipe = RECIPES.find((r) => r.id === itemId);
  if (recipe) {
    let price = recipe.price;
    if (buildings?.silo?.unlocked) price *= 1.1;
    return Math.floor(price);
  }

  return null;
}

export function calculateSellPriceWithQuality(itemId, quality, gameState) {
  const base = calculateSellPrice(itemId, gameState);
  if (base === null) return null;
  const mult = QUALITY_MULTIPLIERS[quality] || 1.0;
  return Math.floor(base * mult);
}

export function getDynamicPrice(itemId, category, gameState) {
  const item = gameState?.shop?.[category]?.items?.[itemId];
  if (!item) return null;
  const basePrice = item.price;

  let finalPrice = basePrice;

  if (gameState?.season?.current) {
    const seasonMult =
      SEASON_PRICE_MODIFIERS[itemId]?.[gameState.season.current] || 1.0;
    finalPrice *= seasonMult;
  }

  const repDiscount = Math.min((gameState?.town?.reputation || 0) / 10000, 0.2);
  finalPrice *= 1 - repDiscount;

  if (gameState?.activeEvent?.priceModifiers?.[itemId]) {
    finalPrice *= gameState.activeEvent.priceModifiers[itemId];
  }

  return Math.floor(finalPrice);
}
