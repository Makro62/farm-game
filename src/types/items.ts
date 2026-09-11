/** Domain item types — single source of truth for all game data shapes.
 *  Data files should use these instead of `any[]` / `Record<string, any>`.
 */
import type { InventoryCategory } from './game';

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
export type QualityId = 'normal' | 'silver' | 'gold' | 'iridium';

export interface SeedInfo {
  id: string;
  buyPrice: number;
  unlockLevel: number;
}

export interface CropDef {
  id: string;
  name: string;
  emoji: string;
  growthTime: number; // seconds (or game ticks, see usage)
  baseSellPrice: number;
  preferredSeason: SeasonId | string;
  seasonBonus?: Partial<Record<string, number>>;
  weatherEffects?: Partial<Record<string, number>>;
  usedInRecipes?: string[];
  usedAsFeed?: string[];
  seed: SeedInfo;
}

export interface ShopSeed {
  id: string;
  cropId: string;
  name: string;
  emoji: string;
  price: number;
  time: number;
  season: SeasonId | string;
  unlockLevel: number;
}

export interface FishSizeTier {
  weight: [number, number];
  priceMult: number;
  chance: number;
}

export interface FishDef {
  id: string;
  name: string;
  emoji: string;
  tier: string;
  priceNormal: number;
  priceBig?: number;
  basePrice?: number;
  locations?: string[];
  timeOfDay?: string[];
  season?: string[];
  baseChance?: number;
  /** Legacy alias used by auto-fisher tick code — prefer baseChance. */
  chance?: number;
  baitBonus?: Record<string, number>;
  catchDifficulty?: number;
  sizeTiers?: Record<string, FishSizeTier>;
  usedInRecipes?: string[];
  npcGiftValue?: Record<string, number>;
  museumPoints?: number;
  achievementUnlock?: string;
  questItem?: string;
}

export interface MineralDropRange {
  min: number;
  max: number;
}

export interface MineralDef {
  id: string;
  name: string;
  emoji: string;
  price: number;
  basePrice?: number;
  tier: string;
  floorRange?: [number, number];
  minPickaxeLevel?: number;
  chance?: number;
  dropsPerMine?: MineralDropRange;
  usedInCrafting?: string[];
  usedInBuilding?: string[];
  bonusDrop?: { item: string; chance: number; quantity: MineralDropRange };
  smeltable?: boolean;
  smeltRecipe?: {
    input: Record<string, number>;
    output: string;
    time: number;
    fuel: string;
  };
  npcGiftValue?: number;
  museumPoints?: number;
  spawnEvent?: string;
  achievementUnlock?: string;
}

export type RecipeType =
  | 'kitchen'
  | 'processing'
  | 'fish_kitchen'
  | 'restaurant';

export interface RecipeDef {
  id: string;
  name: string;
  emoji: string;
  type: RecipeType | string;
  time: number;
  price: number;
  xp: number;
  /** keys like "crops.wortel" -> amount */
  req: Record<string, number>;
  unlockLevel: number;
}

export interface ShopAnimalDef {
  id: string;
  name: string;
  emoji: string;
  price: number;
  time: number;
  product: string;
  productEmoji: string;
  image?: string;
}

export interface ShopBaitDef {
  id: string;
  name: string;
  emoji: string;
  price: number;
  waitMult: number;
  rareBonus: number;
  desc?: string;
  craftable?: boolean;
  mineralReq?: Record<string, number>;
}

export interface ShopMiningToolDef {
  id: string;
  name: string;
  emoji: string;
  price: number;
  desc?: string;
  mineralReq?: Record<string, number>;
}

export interface SpecialItemDef {
  id: string;
  name: string;
  emoji: string;
  desc?: string;
}

export interface CustomerDef {
  id: string;
  name: string;
  emoji: string;
  basePatience: number;
  tipMultiplier: number;
  preferences: string[];
}

export interface AchievementCondition {
  stat?: string;
  value?: number;
  type?: string;
  key?: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  category: string;
  condition: AchievementCondition;
  rewardXp: number;
  rewardCoins?: number;
  secret?: boolean;
}

export interface NpcQuestDef {
  id: string;
  title: string;
  description: string;
  required: Record<string, number>;
  reward: Record<string, number | string>;
  unlockHeart?: number;
}

export interface NpcDef {
  id: string;
  name: string;
  role?: string;
  emoji: string;
  description?: string;
  likes?: string[];
  maxLevel?: number;
  giftTiers?: Record<string, { items: string[]; points: number }>;
  hearts?: Record<number | string, { points: number; reward: string }>;
  schedule?: Record<string, string>;
  quests?: NpcQuestDef[];
  dialogues?: Record<string, string[]>;
}

/** Canonical category resolver lives in `@/lib/utils/inventory`.
 *  Re-export the type here for data-layer convenience.
 */
export type { InventoryCategory };
