export type PlotStatus = 'locked' | 'grass' | 'empty' | 'growing' | 'ready';

export interface Plot {
  id: number;
  status: PlotStatus;
  cropId: string | null;
  plantedAt: number | null;
  growDuration: number;
  watered: boolean;
  fertilized: boolean;
  upgradeLevel: 0 | 1 | 2 | 3 | 4;
}

export interface Crop {
  id: string;
  name: string;
  emoji: string;
  baseGrowTime: number;   // ms
  basePrice: number;
  baseXP: number;
  minLevel: number;
}
