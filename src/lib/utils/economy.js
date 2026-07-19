import { CROP_DATA } from '@/lib/data/crops';
import { MINERALS } from '@/lib/data/minerals';
import { FISHES } from '@/lib/data/fishes';
import { RECIPES } from '@/lib/data/recipes';
import { QUALITY_MULTIPLIERS } from '@/lib/data/item-helpers';
import { GAME_CONSTANTS } from '@/lib/constants';

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

  if (season && CROP_DATA) {
    speed *= 1.0;
  }

  if (weather?.includes('Hujan') || weather?.includes('rainy')) {
    speed *= 1.2;
  } else if (weather?.includes('Berangin') || weather?.includes('windy')) {
    speed *= 1.1;
  } else if (weather?.includes('Kekeringan') || weather?.includes('drought')) {
    speed *= 0.5;
  }

  if (buildings?.greenhouse?.active) speed *= 1.2;

  if (workers?.farmer?.skills?.watering >= 3) speed *= 1.05;

  return speed;
}

export function calculateSellPrice(itemId, gameState) {
  const state = gameState || {};
  const season = state.season?.current;
  const buildings = state.buildings || {};
  const event = state.activeEvent;
  const market = state.market || {};

  const cropData = CROP_DATA[itemId];
  if (cropData) {
    let price = cropData.baseSellPrice;

    if (season && SEASON_PRICE_MODIFIERS[itemId]?.[season]) {
      price *= SEASON_PRICE_MODIFIERS[itemId][season];
    }

    if (buildings.silo) price *= 1.15;

    if (event?.id === 'panen') price *= 2;

    const supply = market.supply?.[itemId] || 0;
    const demand = market.demand?.[itemId] || 100;
    const saturationMult = Math.max(0.5, Math.min(2.0, demand / (supply + 1)));
    price *= saturationMult;

    return Math.floor(price);
  }

  const mineral = MINERALS.find(m => m.id === itemId);
  if (mineral) {
    let price = mineral.price;
    if (event?.id === 'tambang') price *= 1.5;
    return Math.floor(price);
  }

  const fish = FISHES.find(f => f.id === itemId);
  if (fish) {
    let price = fish.priceNormal;
    if (event?.id === 'bahari') price *= 2;
    return Math.floor(price);
  }

  const recipe = RECIPES.find(r => r.id === itemId);
  if (recipe) {
    let price = recipe.price;
    if (buildings.silo) price *= 1.1;
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
