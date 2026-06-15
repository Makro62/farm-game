export interface GameState {
  coins: number;
  level: number;
  xp: number;
  day: number;
  season: Season;
  streak: number;
  lastLogin: string | null;
  totalHarvest: number;
  totalEarned: number;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'windy';
