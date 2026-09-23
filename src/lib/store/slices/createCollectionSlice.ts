import type { StoreSet, StoreGet, CollectionCategory } from '@/types/game'
import { CROP_DATA, CROP_VARIANTS } from '@/lib/data/crops'
import { FISHES } from '@/lib/data/fishes'
import { MINERALS } from '@/lib/data/minerals'
import { RECIPES } from '@/lib/data/recipes'
import { GAME_CONSTANTS } from '@/lib/constants'

export const COLLECTION_LISTS: Record<CollectionCategory, string[]> = {
  crops: [...Object.keys(CROP_DATA), ...Object.keys(CROP_VARIANTS)],
  fish: FISHES.map(f => f.id),
  minerals: MINERALS.map(m => m.id),
  recipes: RECIPES.map(r => r.id),
}

export const COLLECTION_META: Record<
  CollectionCategory,
  { label: string; emoji: string }
> = {
  crops: { label: 'Tanaman', emoji: '🌱' },
  fish: { label: 'Ikan', emoji: '🎣' },
  minerals: { label: 'Mineral', emoji: '⛏️' },
  recipes: { label: 'Resep', emoji: '🍳' },
}

export const createCollectionSlice = (set: StoreSet, get: StoreGet) => ({
  addToCollection: (category: CollectionCategory, itemId: string) => {
    const list = COLLECTION_LISTS[category]
    if (!list || !list.includes(itemId)) return false
    const current = get().collection?.[category] || []
    if (current.includes(itemId)) return false

    set(draft => {
      if (!draft.collection) return
      const arr = draft.collection[category]
      if (Array.isArray(arr) && !arr.includes(itemId)) arr.push(itemId)
    })

    if (current.length + 1 === list.length) {
      const meta = COLLECTION_META[category]
      get().enqueueNotification(
        `📖 Koleksi ${meta.label} lengkap (${list.length}/${list.length})! Hadiah bisa diambil di Profil.`,
        { icon: meta.emoji, type: 'success', sfx: 'fanfare' }
      )
    }
    return true
  },

  claimCollectionReward: (category: CollectionCategory) => {
    const list = COLLECTION_LISTS[category]
    if (!list) return { ok: false, message: 'Koleksi tidak dikenal.' }
    const col = get().collection
    const owned = col?.[category]?.length || 0
    if (owned < list.length) {
      return {
        ok: false,
        message: `Koleksi belum lengkap (${owned}/${list.length}).`,
      }
    }
    if (col?.claimed?.includes(category)) {
      return { ok: false, message: 'Hadiah koleksi ini sudah diambil.' }
    }

    const reward = GAME_CONSTANTS.COLLECTION.REWARD_COINS
    set(draft => {
      if (!draft.collection.claimed.includes(category))
        draft.collection.claimed.push(category)
    })
    get().addCoins(reward)
    const meta = COLLECTION_META[category]
    const message = `🏆 Koleksi ${meta.label} lengkap! +${reward} 💰`
    get().enqueueNotification(message, {
      icon: meta.emoji,
      type: 'success',
      rewardCoins: reward,
      tier: 'legendary',
      sfx: 'fanfare',
    })
    return { ok: true, message }
  },
})
