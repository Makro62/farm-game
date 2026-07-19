import { CROP_DATA } from '@/lib/data/crops';
import { QUALITY_MULTIPLIERS } from '@/lib/data/item-helpers';
import { SEASON_META } from '@/lib/nav';

export function getCropGrowthSpeed(season, weather, buildings, workers) {
  let speed = 1.0;

  if (weather?.includes('Hujan') || weather?.includes('rainy')) {
    speed *= 1.2;
  } else if (weather?.includes('Berangin') || weather?.includes('windy')) {
    speed *= 1.1;
  } else if (weather?.includes('Kekeringan') || weather?.includes('drought')) {
    speed *= 0.5;
  }

  if (buildings?.greenhouse?.active) speed *= 1.2;
  if (buildings?.greenhouse?.unlocked) speed *= 1.1;

  if (workers?.farmer?.skills?.watering >= 3) speed *= 1.05;

  return speed;
}

export function getCropQuality(weather, fertilizer) {
  let qualityScore = Math.random();

  if (fertilizer === 'premium') qualityScore += 0.3;
  if (fertilizer === 'organic') qualityScore += 0.2;
  if (weather?.includes('Hujan') || weather?.includes('rainy')) qualityScore += 0.1;

  if (qualityScore > 0.95) return 'iridium';
  if (qualityScore > 0.85) return 'gold';
  if (qualityScore > 0.70) return 'silver';
  return 'normal';
}

export function getSeasonMultiplier(cropId, season) {
  const crop = CROP_DATA[cropId];
  if (!crop?.seasonBonus?.[season]) return 1.0;
  return crop.seasonBonus[season];
}

export function getWeatherMultiplier(cropId, weather) {
  const crop = CROP_DATA[cropId];
  if (!crop?.weatherEffects) return 1.0;
  const weatherKey = weather?.includes('Hujan') ? 'rainy'
    : weather?.includes('Berangin') ? 'windy'
    : weather?.includes('Kekeringan') ? 'drought'
    : weather?.includes('Salju') ? 'snowy'
    : 'sunny';
  return crop.weatherEffects[weatherKey] || 1.0;
}

export function getSeasonName(season) {
  return SEASON_META[season]?.label || season;
}

export function getSeasonEmoji(season) {
  return SEASON_META[season]?.emoji || '🌱';
}
