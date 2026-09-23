import type { GameState, InventoryCategory, InventoryStack } from '@/types/game'
import { SHOP_SEEDS, CROP_VARIANTS } from '@/lib/data/crops'
import {
  SHOP_ANIMALS,
  SHOP_BAIT,
  SHOP_MINING,
  SHOP_CONSUMABLES,
  SHOP_DECORATIONS,
  SPECIAL_ITEMS,
} from '@/lib/data/shop'
import { FISHES } from '@/lib/data/fishes'
import { MINERALS } from '@/lib/data/minerals'
import { RECIPES } from '@/lib/data/recipes'

const KNOWN_CATEGORIES: ReadonlySet<string> = new Set([
  'crops',
  'animalProducts',
  'minerals',
  'fish',
  'processed',
  'cooked',
  'seeds',
  'tools',
  'bait',
  'collectibles',
  'consumables',
]);

/**
 * Parse a requirement key like "crops.wortel" into a typed
 * `{ cat, itemId }` pair. Returns null for malformed/unknown keys
 * instead of letting callers cast `as any`.
 */
export function parseRequirementKey(
  key: string,
): { cat: InventoryCategory; itemId: string } | null {
  const dot = key.indexOf('.');
  if (dot <= 0 || dot === key.length - 1) return null;
  const cat = key.slice(0, dot);
  const itemId = key.slice(dot + 1);
  if (!KNOWN_CATEGORIES.has(cat)) return null;
  return { cat: cat as InventoryCategory, itemId };
}

/**
 * Canonical item -> inventory category resolver.
 * Single source of truth — other modules (`item-helpers`, `recipes`)
 * must re-export this instead of maintaining their own maps.
 */
export function getItemCategory(itemId: string): InventoryCategory | null {
  if (!itemId) return null
  if (SHOP_SEEDS.some(s => s.id === itemId)) return 'seeds'
  if (SHOP_SEEDS.some(s => s.cropId === itemId)) return 'crops'
  if (CROP_VARIANTS[itemId]) return 'crops'
  if (FISHES.some(f => f.id === itemId)) return 'fish'
  if (MINERALS.some(m => m.id === itemId)) return 'minerals'
  if (SHOP_ANIMALS.some(a => a.product === itemId)) return 'animalProducts'
  if (SHOP_BAIT.some(b => b.id === itemId)) return 'bait'
  if (SHOP_MINING.some(m => m.id === itemId)) return 'tools'
  if (SHOP_CONSUMABLES.some(c => c.id === itemId)) return 'consumables'
  if (SHOP_DECORATIONS.some(d => d.id === itemId)) return 'collectibles'

  const recipe = RECIPES.find(r => r.id === itemId)
  if (recipe) return recipe.type === 'processing' ? 'processed' : 'cooked'

  if (SPECIAL_ITEMS[itemId]) return 'collectibles'
  if (itemId === 'pupuk_kandang') return 'collectibles'

  return null
}

export function invAdd(
  draft: GameState,
  category: InventoryCategory,
  itemId: string,
  qty: number = 1,
  quality: string = 'normal'
): void {
  if (qty <= 0) return
  if (!draft.inventoryByCategory[category]) {
    draft.inventoryByCategory[category] = {} as Record<string, InventoryStack>
  }

  const existing = draft.inventoryByCategory[category][itemId]
  if (existing) {
    existing.qty += qty
  } else {
    draft.inventoryByCategory[category][itemId] = {
      qty,
      quality,
      acquiredAt: Date.now(),
    }
  }
}

export function invRemove(
  draft: GameState,
  category: InventoryCategory,
  itemId: string,
  qty: number = 1
): boolean {
  if (qty <= 0) return true
  const existing = draft.inventoryByCategory[category]?.[itemId]
  if (!existing || existing.qty < qty) return false

  existing.qty -= qty
  if (existing.qty <= 0) {
    delete draft.inventoryByCategory[category][itemId]
  }
  return true
}

export function invHas(
  state: GameState,
  category: InventoryCategory,
  itemId: string,
  qty: number = 1
): boolean {
  return (state.inventoryByCategory[category]?.[itemId]?.qty || 0) >= qty
}

export function invHasRequirements(
  state: GameState,
  requirements: Record<string, number>
): boolean {
  for (const [key, amount] of Object.entries(requirements)) {
    const parsed = parseRequirementKey(key)
    if (!parsed) return false
    if (
      (state.inventoryByCategory[parsed.cat]?.[parsed.itemId]?.qty || 0) <
      amount
    )
      return false
  }
  return true
}

export function invConsumeRequirements(
  draft: GameState,
  requirements: Record<string, number>
): boolean {
  if (!invHasRequirements(draft, requirements)) return false
  for (const [key, amount] of Object.entries(requirements)) {
    const parsed = parseRequirementKey(key)
    if (!parsed) return false
    invRemove(draft, parsed.cat, parsed.itemId, amount)
  }
  return true
}

export function markSessionAction(draft: GameState, action: string): void {
  if (!draft.sessionActions)
    draft.sessionActions = {} as GameState['sessionActions']
  draft.sessionActions[action] = true
}

export function incrementStat(
  draft: GameState,
  statName: keyof GameState['stats'],
  amount: number = 1
): void {
  if (!draft.stats) draft.stats = {} as GameState['stats']
  const current = draft.stats[statName] ?? 0
  draft.stats[statName] = current + amount
}
