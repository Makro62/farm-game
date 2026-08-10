import type { StoreSet, StoreGet } from '@/types/game'
import { SHOP_BUILDINGS, SHOP_DECORATIONS } from '@/lib/data/shop'
import { getItemSellPrice, getItemCategory } from '@/lib/data/item-helpers'
import { MINERALS } from '@/lib/data/minerals'
import { FISHES } from '@/lib/data/fishes'

export const createTownSlice = (set: StoreSet, get: StoreGet) => ({
  setSelectedBait: baitId => set({ selectedBait: baitId }),

  updateMarket: () => {
    const newPrices = {}
    const newTrend = {}
    const crops = [
      'wortel',
      'jagung',
      'tomat',
      'stroberi',
      'semangka',
      'jamur',
      'nanas',
      'labu',
      'kentang',
      'gandum',
      'tebu',
      'tulip',
      'apel',
    ]

    // Pick one crop to boom and one to crash (randomly)
    const boomIndex = Math.floor(Math.random() * crops.length)
    let crashIndex = Math.floor(Math.random() * crops.length)
    while (crashIndex === boomIndex) {
      crashIndex = Math.floor(Math.random() * crops.length)
    }

    crops.forEach((cropId, index) => {
      const base = getItemSellPrice(cropId) || 20
      let fluctuation = 0.7 + Math.random() * 0.6 // 0.7 to 1.3

      if (index === boomIndex) {
        fluctuation = 2.0 + Math.random() // 2.0 to 3.0 (Boom!)
      } else if (index === crashIndex) {
        fluctuation = 0.3 + Math.random() * 0.2 // 0.3 to 0.5 (Crash!)
      }

      newPrices[cropId] = Math.round(base * fluctuation)

      if (index === boomIndex) newTrend[cropId] = 'boom'
      else if (index === crashIndex) newTrend[cropId] = 'crash'
      else newTrend[cropId] = newPrices[cropId] > base ? 'up' : 'down'
    })
    set({ todayPrices: newPrices, marketTrend: newTrend })
  },

  buyBuilding: buildingId => {
    const building = SHOP_BUILDINGS.find(b => b.id === buildingId)
    if (!building) return { ok: false, message: 'Bangunan tidak dikenal.' }

    const state = get()
    if (state.buildings?.[buildingId])
      return { ok: false, message: `${building.name} sudah dimiliki.` }

    if (state.coins < building.price)
      return { ok: false, message: 'Koin tidak cukup!' }

    const mineralReq = {
      silo: { batu: 20, besi: 10 },
      greenhouse: { batu: 30, tembaga: 15, emas: 5 },
      scarecrow: { batu: 35, besi: 5 },
      sprinkler: { besi: 15, tembaga: 10 },
    }[buildingId]

    if (mineralReq) {
      for (const [mineral, qty] of Object.entries(mineralReq)) {
        if (
          (state.inventoryByCategory?.minerals?.[mineral]?.qty || 0) <
          (qty as number)
        ) {
          return {
            ok: false,
            message: `Butuh ${qty}x ${mineral} dari Tambang untuk membangun ${building.name}!`,
          }
        }
      }
    }

    const shape = {
      silo: { unlocked: true, level: 1, maxLevel: 3 },
      greenhouse: { unlocked: true, level: 1, maxLevel: 1 },
      scarecrow: { unlocked: true, level: 1, maxLevel: 1 },
      sprinkler: { unlocked: true, level: 1, maxLevel: 1 },
      mill: { unlocked: true, level: 1, queue: [] },
      well: { unlocked: true, level: 1, maxLevel: 3 },
      workshop: { unlocked: true, level: 1, maxLevel: 3 },
      coop: { unlocked: true, level: 1, maxLevel: 3, capacity: 6 },
      barn: { unlocked: true, level: 1, maxLevel: 3, capacity: 6 },
    }

    set(draft => {
      draft.coins -= building.price
      if (mineralReq) {
        for (const [mineral, qty] of Object.entries(mineralReq)) {
          if (draft.inventoryByCategory.minerals[mineral]) {
            draft.inventoryByCategory.minerals[mineral].qty -= qty as number
            if (draft.inventoryByCategory.minerals[mineral].qty <= 0) {
              delete draft.inventoryByCategory.minerals[mineral]
            }
          }
        }
      }
      draft.buildings = {
        ...(draft.buildings || {}),
        [buildingId]: shape[buildingId] || { unlocked: true, level: 1 },
      }
    })

    return { ok: true, message: `${building.name} berhasil dibangun!` }
  },

  buyDecoration: decorId => {
    const decor = SHOP_DECORATIONS.find(d => d.id === decorId)
    if (!decor) return { ok: false, message: 'Dekorasi tidak dikenal.' }

    const state = get()
    const owned = state.decorations || []
    if (owned.includes(decorId))
      return { ok: false, message: `${decor.name} sudah dimiliki.` }
    if (!get().spendCoins(decor.price))
      return { ok: false, message: 'Koin tidak cukup!' }

    set(s => ({ decorations: [...(s.decorations || []), decorId] }))
    get().addXP?.(5)
    return { ok: true, message: `${decor.emoji} ${decor.name} dipasang!` }
  },

  giveGift: (npcId, itemId, isLiked) => {
    const state = get()
    const itemCategory = getItemCategory(itemId)
    if (
      !itemCategory ||
      (state.inventoryByCategory?.[itemCategory]?.[itemId]?.qty || 0) <= 0
    )
      return null

    set(draft => {
      if (draft.inventoryByCategory[itemCategory]?.[itemId]) {
        draft.inventoryByCategory[itemCategory][itemId].qty -= 1
        if (draft.inventoryByCategory[itemCategory][itemId].qty <= 0) {
          delete draft.inventoryByCategory[itemCategory][itemId]
        }
      }
    })

    const currentNpc = state.npcs[npcId] || { level: 1, points: 0 }
    const pointsGained = isLiked ? 50 : 10
    let newPoints = currentNpc.points + pointsGained
    let newLevel = currentNpc.level
    let leveledUp = false

    const maxPoints = currentNpc.level * 100
    if (newPoints >= maxPoints && newLevel < 5) {
      newPoints -= maxPoints
      newLevel += 1
      leveledUp = true
      get().addXP(100 * newLevel)
    }

    set({
      npcs: {
        ...state.npcs,
        [npcId]: {
          ...currentNpc,
          level: newLevel,
          points: newPoints,
          hearts: Math.max(currentNpc.hearts || 1, newLevel),
          dailyGiftGiven: true,
        },
      },
    })

    set(s => ({
      stats: {
        ...s.stats,
        totalGiftsGiven: (s.stats?.totalGiftsGiven || 0) + 1,
      },
    }))
    get().checkAchievements?.()
    return { leveledUp, newLevel, pointsGained }
  },

  bankDeposit: amount => {
    const amt = Math.floor(Number(amount) || 0)
    if (amt <= 0) return { ok: false, message: 'Nominal tidak valid.' }
    const state = get()
    if (state.coins < amt)
      return { ok: false, message: 'Koin di kantong tidak cukup!' }
    set(draft => {
      draft.coins -= amt
      draft.town.bankSavings += amt
    })
    return { ok: true, message: `💰 ${amt} koin disimpan di Bank!` }
  },

  bankWithdraw: amount => {
    const amt = Math.floor(Number(amount) || 0)
    if (amt <= 0) return { ok: false, message: 'Nominal tidak valid.' }
    const state = get()
    if ((state.town?.bankSavings || 0) < amt)
      return { ok: false, message: 'Saldo Bank tidak cukup!' }
    set(draft => {
      draft.town.bankSavings -= amt
      draft.coins += amt
    })
    return { ok: true, message: `💵 ${amt} koin ditarik dari Bank!` }
  },

  donateToMuseum: itemId => {
    const state = get()
    const points = getMuseumPoints(itemId)
    if (!points)
      return { ok: false, message: 'Item ini tidak bisa didonasikan.' }
    const cat = getItemCategory(itemId)
    if (!cat || (state.inventoryByCategory?.[cat]?.[itemId]?.qty || 0) <= 0)
      return { ok: false, message: 'Item tidak ada di inventori.' }

    set(draft => {
      if (cat && draft.inventoryByCategory[cat]?.[itemId]) {
        draft.inventoryByCategory[cat][itemId].qty -= 1
        if (draft.inventoryByCategory[cat][itemId].qty <= 0) {
          delete draft.inventoryByCategory[cat][itemId]
        }
      }
      draft.town.museumDonations.push({
        itemId,
        points,
        donatedAt: Date.now(),
      })
    })

    get().addXP(points / 5)
    const totalPoints = (get().town?.museumDonations || []).reduce(
      (sum, d) => sum + (d.points || 0),
      0
    )
    const milestones = [100, 300, 600, 1000]
    const reached = milestones.filter(m => {
      const prev = totalPoints - points
      return prev < m && totalPoints >= m
    })
    if (reached.length > 0) {
      const reward = reached.reduce((sum, m) => sum + m, 0)
      set(draft => {
        draft.coins += reward
      })
      get().enqueueNotification(
        `🏛️ Milestone museum tercapai! Bonus ${reward} 💰`,
        { type: 'success' }
      )
    }
    return {
      ok: true,
      points,
      message: `🏛️ Didonasikan! +${points} poin museum`,
    }
  },
})

function getMuseumPoints(itemId: string): number {
  const mineral = MINERALS.find(m => m.id === itemId)
  if (mineral?.museumPoints) return mineral.museumPoints
  const fish = FISHES.find(f => f.id === itemId)
  return fish?.museumPoints || 0
}
