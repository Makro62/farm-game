import type { GameState, InventoryCategory } from '@/types/game'
import { SHOP_SEEDS } from '@/lib/data/crops'
import {
  SHOP_ANIMALS,
  SHOP_BAIT,
  SHOP_MINING,
  SPECIAL_ITEMS,
} from '@/lib/data/shop'
import { FISHES } from '@/lib/data/fishes'
import { MINERALS } from '@/lib/data/minerals'
import { RECIPES } from '@/lib/data/recipes'

export function getItemCategory(itemId: string): InventoryCategory | null {
  if (SHOP_SEEDS.some(s => s.id === itemId)) return 'seeds'
  if (SHOP_SEEDS.some(s => s.cropId === itemId)) return 'crops'
  if (FISHES.some(f => f.id === itemId)) return 'fish'
  if (MINERALS.some(m => m.id === itemId)) return 'minerals'
  if (SHOP_ANIMALS.some(a => a.product === itemId)) return 'animalProducts'
  if (SHOP_BAIT.some(b => b.id === itemId)) return 'bait'
  if (SHOP_MINING.some(m => m.id === itemId)) return 'tools'

  const recipe = RECIPES.find(r => r.id === itemId)
  if (recipe) return recipe.type === 'processing' ? 'processed' : 'cooked'

  if (SPECIAL_ITEMS[itemId]) return 'collectibles'
  if (itemId === 'pupuk_kandang') return 'collectibles'

  console.warn(`[getItemCategory] Unknown itemId: "${itemId}"`)
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
    draft.inventoryByCategory[category] = {} as Record<string, any>
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
    const [cat, itemId] = key.split('.')
    if (!cat || !itemId) return false
    if (
      (state.inventoryByCategory[cat as InventoryCategory]?.[itemId]?.qty ||
        0) < amount
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
    const [cat, itemId] = key.split('.')
    if (!cat || !itemId) return false
    invRemove(draft, cat as InventoryCategory, itemId, amount)
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
  const current = (draft.stats[statName] as number) || 0
  ;(draft.stats as any)[statName] = current + amount
}
