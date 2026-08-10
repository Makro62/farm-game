import type { StoreSet, StoreGet } from '@/types/game'
import { SHOP_SEEDS, CROP_DATA } from '@/lib/data/crops'
import { rollCropQuality } from '@/lib/data/item-helpers'
import { GAME_CONSTANTS } from '@/lib/constants'

export const PLOT_LEVEL_MULT: Record<number, number> = {
  1: 1.0,
  2: 0.85,
  3: 0.7,
}

const PLOT_UPGRADE_COST: Record<
  number,
  { coins: number; minerals: Record<string, number> }
> = {
  1: { coins: 300, minerals: { batu: 10, besi: 5 } },
  2: { coins: 800, minerals: { besi: 10, emas: 5 } },
}

function getPlotArrayKey(
  plotId: number
): 'plots' | 'feedPlots' | 'kitchenPlots' {
  if (plotId >= 200) return 'kitchenPlots'
  if (plotId >= 100) return 'feedPlots'
  return 'plots'
}

export const createFarmingSlice = (set: StoreSet, get: StoreGet) => ({
  setSelectedSeed: seedId => set({ selectedSeed: seedId }),

  plant: (plotId, crop, growTime) => {
    const state = get()
    const listKey = getPlotArrayKey(plotId)
    const plot = state[listKey].find(p => p.id === plotId)
    if (!plot || (plot.status !== 'empty' && plot.status !== 'dead'))
      return false

    set(state => ({
      [listKey]: state[listKey].map(p =>
        p.id === plotId
          ? {
              ...p,
              status: 'growing',
              crop,
              plantedAt: Date.now(),
              growTime,
              watered: false,
              fertilizer: null,
              quality: null,
              pestInfestation: false,
            }
          : p
      ),
    }))
    return true
  },

  plantSeed: (plotId, seedId) => {
    const seedData = SHOP_SEEDS.find(s => s.id === seedId)
    if (!seedData) return { ok: false, message: 'Item ini tidak bisa ditanam!' }

    const state = get()
    const season = state.season?.current
    const hasGreenhouse = !!state.buildings?.greenhouse
    if (
      !hasGreenhouse &&
      seedData.season !== 'all' &&
      seedData.season !== season
    ) {
      return {
        ok: false,
        message: 'Bibit ini tidak cocok musim ini (butuh Greenhouse).',
      }
    }

    const have = state.inventoryByCategory?.seeds?.[seedId]?.qty || 0
    if (have <= 0) {
      return { ok: false, message: `Kehabisan ${seedData.name}!` }
    }

    // Max 5 active plants — harvest dulu sebelum tanam baru
    const activePlots = (state.plots || []).filter(
      (p: any) => p.status === 'growing' || p.status === 'ready'
    ).length
    if (activePlots >= 5) {
      return {
        ok: false,
        message: 'Max 5 tanaman! Panen dulu sebelum tanam baru.',
      }
    }

    if (!get().consumeEnergy(1)) {
      return { ok: false, message: 'Energy tidak cukup!' }
    }

    set(draft => {
      if (draft.inventoryByCategory.seeds[seedId]) {
        draft.inventoryByCategory.seeds[seedId].qty -= 1
        if (draft.inventoryByCategory.seeds[seedId].qty <= 0) {
          delete draft.inventoryByCategory.seeds[seedId]
        }
      }
    })

    const growthMultiplier =
      state.growthMultiplier > 0 ? state.growthMultiplier : 1
    let baseGrowTime = (seedData.time * 1000) / growthMultiplier
    const listKey = getPlotArrayKey(plotId)
    const plotLevel = state[listKey].find(p => p.id === plotId)?.level || 1
    baseGrowTime = Math.floor(baseGrowTime * PLOT_LEVEL_MULT[plotLevel])

    let usedFertilizer = false
    const pupukQty =
      state.inventoryByCategory?.collectibles?.pupuk_kandang?.qty || 0
    if (pupukQty > 0) {
      set(draft => {
        if (draft.inventoryByCategory.collectibles.pupuk_kandang) {
          draft.inventoryByCategory.collectibles.pupuk_kandang.qty -= 1
          if (draft.inventoryByCategory.collectibles.pupuk_kandang.qty <= 0) {
            delete draft.inventoryByCategory.collectibles.pupuk_kandang
          }
        }
      })
      baseGrowTime = Math.floor(baseGrowTime * 0.85)
      usedFertilizer = true
      set(s => ({
        stats: {
          ...s.stats,
          totalFertilizerUsed: (s.stats?.totalFertilizerUsed || 0) + 1,
        },
      }))
    }

    const ok = get().plant(plotId, seedData.cropId, baseGrowTime)
    if (!ok) {
      // Refund energy
      set(draft => {
        draft.energy = Math.min(draft.maxEnergy || 100, draft.energy + 1)
      })
      // Refund seed
      set(draft => {
        if (!draft.inventoryByCategory.seeds[seedId]) {
          draft.inventoryByCategory.seeds[seedId] = {
            qty: 0,
            quality: 'normal',
            acquiredAt: Date.now(),
          }
        }
        draft.inventoryByCategory.seeds[seedId].qty += 1
      })
      if (usedFertilizer) {
        set(draft => {
          if (!draft.inventoryByCategory.collectibles.pupuk_kandang) {
            draft.inventoryByCategory.collectibles.pupuk_kandang = {
              qty: 0,
              quality: 'normal',
              acquiredAt: Date.now(),
            }
          }
          draft.inventoryByCategory.collectibles.pupuk_kandang.qty += 1
        })
      }
      return { ok: false, message: 'Petak tidak kosong.' }
    }
    return {
      ok: true,
      message: usedFertilizer
        ? `Menanam ${seedData.name} 🌿 (+Pupuk, tumbuh lebih cepat!)`
        : `Menanam ${seedData.name}`,
      seed: seedData,
      usedFertilizer,
    }
  },

  waterPlot: plotId => {
    const state = get()
    const listKey = getPlotArrayKey(plotId)
    const plot = state[listKey].find(p => p.id === plotId)
    if (!plot || plot.status !== 'growing')
      return {
        ok: false,
        message: 'Hanya tanaman yang sedang tumbuh yang bisa disiram.',
      }
    if (plot.watered) return { ok: false, message: 'Petak ini sudah disiram.' }
    if (!get().consumeEnergy(1))
      return { ok: false, message: 'Energy tidak cukup!' }

    const boost = Math.floor(
      (plot.growTime || 0) * GAME_CONSTANTS.CHANCES.WATER_BOOST
    )
    set(s => ({
      [listKey]: s[listKey].map(p =>
        p.id === plotId
          ? {
              ...p,
              watered: true,
              plantedAt: (p.plantedAt || Date.now()) - boost,
            }
          : p
      ),
    }))
    return { ok: true, message: 'Disiram! Tumbuh lebih cepat.' }
  },

  harvest: plotId => {
    const state = get()
    const listKey = getPlotArrayKey(plotId)
    const plot = state[listKey].find(p => p.id === plotId)
    if (!plot || !plot.crop) return null

    const isReady =
      plot.status === 'ready' ||
      (plot.status === 'growing' &&
        plot.plantedAt &&
        Date.now() - plot.plantedAt! >= (plot.growTime ?? 0))
    if (!isReady) return null
    if (!get().consumeEnergy(1)) return null

    const crop = plot.crop
    const weather =
      state.weather?.current?.replace(/[^a-zA-Z]/g, '').toLowerCase() || 'sunny'
    const quality = rollCropQuality(weather, plot.fertilizer)

    set(state => {
      const cat = { ...(state.inventoryByCategory?.crops || {}) }
      const existing = cat[crop] || {
        qty: 0,
        quality: null,
        acquiredAt: Date.now(),
      }
      cat[crop] = { qty: existing.qty + 1, quality, acquiredAt: Date.now() }

      return {
        inventoryByCategory: { ...state.inventoryByCategory, crops: cat },
        [listKey]: state[listKey].map(p =>
          p.id === plotId
            ? {
                id: p.id,
                status: 'empty',
                crop: null,
                plantedAt: null,
                growTime: null,
                watered: false,
                fertilizer: null,
                quality: null,
                pestInfestation: false,
                level: p.level || 1,
              }
            : p
        ),
      }
    })

    get().addXP(GAME_CONSTANTS.XP.HARVEST)
    get().progressQuest('harvest', crop, 1)
    set(s => ({
      stats: { ...s.stats, totalHarvested: (s.stats?.totalHarvested || 0) + 1 },
    }))
    get().markSessionAction?.('harvested')
    get().checkAchievements?.()
    const combo = get().registerCombo?.()
    if (combo?.count >= 3) get().addCoins?.(Math.floor(3 * combo.multiplier))

    return crop
  },

  harvestAll: plotListKey => {
    const state = get()
    const plots = state[plotListKey] || []
    let harvestedCount = 0
    const now = Date.now()
    const weather =
      state.weather?.current?.replace(/[^a-zA-Z]/g, '').toLowerCase() || 'sunny'

    const newPlots = [...plots]
    const cat = { ...(state.inventoryByCategory?.crops || {}) }

    for (let i = 0; i < newPlots.length; i++) {
      const plot = newPlots[i]
      const isReady =
        plot.status === 'ready' ||
        (plot.status === 'growing' &&
          plot.plantedAt &&
          now - plot.plantedAt >= (plot.growTime ?? 0))

      if (isReady && plot.crop) {
        if (!get().consumeEnergy(1)) break // Stop if no energy

        const crop = plot.crop
        const quality = rollCropQuality(weather, plot.fertilizer)

        const existing = cat[crop] || { qty: 0, quality: null, acquiredAt: now }
        cat[crop] = { qty: existing.qty + 1, quality, acquiredAt: now }

        newPlots[i] = {
          ...plot,
          status: 'empty',
          crop: null,
          plantedAt: null,
          growTime: null,
          watered: false,
          fertilizer: null,
          quality: null,
          pestInfestation: false,
        }

        harvestedCount++
        get().progressQuest('harvest', crop, 1)
      }
    }

    if (harvestedCount > 0) {
      set(s => ({
        inventoryByCategory: { ...s.inventoryByCategory, crops: cat },
        [plotListKey]: newPlots,
        stats: {
          ...s.stats,
          totalHarvested: (s.stats?.totalHarvested || 0) + harvestedCount,
        },
      }))
      get().addXP(GAME_CONSTANTS.XP.HARVEST * harvestedCount)
      get().markSessionAction?.('harvested')
      get().checkAchievements?.()
      return {
        ok: true,
        message: `Berhasil memanen ${harvestedCount} tanaman sekaligus!`,
      }
    }
    return {
      ok: false,
      message: 'Tidak ada tanaman siap panen atau energy habis.',
    }
  },

  plantAll: (plotListKey, seedId) => {
    const state = get()
    const plots = state[plotListKey] || []
    const seedData = SHOP_SEEDS.find(s => s.id === seedId)
    if (!seedData) return { ok: false, message: 'Pilih bibit terlebih dahulu!' }

    // Max 5 active plants
    const activePlots = (state.plots || []).filter(
      (p: any) => p.status === 'growing' || p.status === 'ready'
    ).length
    if (activePlots >= 5) {
      return {
        ok: false,
        message: 'Max 5 tanaman! Panen dulu sebelum tanam baru.',
      }
    }

    const season = state.season?.current
    const hasGreenhouse = !!state.buildings?.greenhouse
    if (
      !hasGreenhouse &&
      seedData.season !== 'all' &&
      seedData.season !== season
    ) {
      return {
        ok: false,
        message: 'Bibit ini tidak cocok musim ini (butuh Greenhouse).',
      }
    }

    let availableSeeds = state.inventoryByCategory?.seeds?.[seedId]?.qty || 0
    if (availableSeeds <= 0)
      return { ok: false, message: `Kehabisan ${seedData.name}!` }

    let plantedCount = 0
    const newPlots = [...plots]
    const now = Date.now()
    const growthMultiplier =
      state.growthMultiplier > 0 ? state.growthMultiplier : 1

    // Pupuk logic
    let availablePupuk =
      state.inventoryByCategory?.collectibles?.pupuk_kandang?.qty || 0
    let pupukUsed = 0

    for (let i = 0; i < newPlots.length; i++) {
      const plot = newPlots[i]
      if (
        (plot.status === 'empty' || plot.status === 'dead') &&
        availableSeeds > 0
      ) {
        if (!get().consumeEnergy(1)) break

        let baseGrowTime = (seedData.time * 1000) / growthMultiplier
        baseGrowTime = Math.floor(
          baseGrowTime * PLOT_LEVEL_MULT[plot.level || 1]
        )

        let fertilizer: string | null = null
        if (availablePupuk > 0) {
          baseGrowTime = Math.floor(baseGrowTime * 0.85)
          fertilizer = 'pupuk_kandang'
          availablePupuk--
          pupukUsed++
        }

        newPlots[i] = {
          ...plot,
          status: 'growing',
          crop: seedData.cropId,
          plantedAt: now,
          growTime: baseGrowTime,
          watered: false,
          fertilizer,
          quality: null,
          pestInfestation: false,
        }

        availableSeeds--
        plantedCount++
      }
    }

    if (plantedCount > 0) {
      set(draft => {
        draft[plotListKey] = newPlots
        draft.inventoryByCategory.seeds[seedId].qty -= plantedCount
        if (draft.inventoryByCategory.seeds[seedId].qty <= 0) {
          delete draft.inventoryByCategory.seeds[seedId]
        }

        if (
          pupukUsed > 0 &&
          draft.inventoryByCategory.collectibles?.pupuk_kandang
        ) {
          draft.inventoryByCategory.collectibles.pupuk_kandang.qty -= pupukUsed
          if (draft.inventoryByCategory.collectibles.pupuk_kandang.qty <= 0) {
            delete draft.inventoryByCategory.collectibles.pupuk_kandang
          }
          draft.stats = {
            ...draft.stats,
            totalFertilizerUsed:
              (draft.stats?.totalFertilizerUsed || 0) + pupukUsed,
          }
        }
      })
      return {
        ok: true,
        message: `Menanam ${plantedCount} ${seedData.name} sekaligus!`,
      }
    }

    return { ok: false, message: 'Tidak ada lahan kosong atau energy habis.' }
  },

  syncPlots: () => {
    const now = Date.now()
    const syncList = (listKey: 'plots' | 'feedPlots' | 'kitchenPlots') => {
      let changedList = false
      const newPlots = get()[listKey].map(p => {
        const baseGrow = (p.growTime ?? 0) > 0 ? p.growTime : null
        if (baseGrow == null) return p
        const growTime = p.pestInfestation ? baseGrow * 2 : baseGrow
        if (
          p.status === 'growing' &&
          p.plantedAt &&
          now - p.plantedAt >= growTime
        ) {
          changedList = true
          return { ...p, status: 'ready' }
        }
        return p
      })
      if (changedList) set({ [listKey]: newPlots })
    }
    syncList('plots')
    syncList('feedPlots')
    syncList('kitchenPlots')
  },

  upgradePlot: plotId => {
    const state = get()
    const listKey = getPlotArrayKey(plotId)
    const plot = state[listKey].find(p => p.id === plotId)
    if (!plot) return { ok: false, message: 'Petak tidak ditemukan.' }
    if (plot.level >= 3)
      return { ok: false, message: 'Petak sudah level maksimum.' }
    const cost = PLOT_UPGRADE_COST[plot.level]
    if (!cost) return { ok: false, message: 'Upgrade tidak tersedia.' }
    if (state.coins < cost.coins) {
      return {
        ok: false,
        message: `Butuh ${cost.coins} koin untuk upgrade petak.`,
      }
    }
    for (const [mineral, qty] of Object.entries(cost.minerals)) {
      if ((state.inventoryByCategory?.minerals?.[mineral]?.qty || 0) < qty) {
        return {
          ok: false,
          message: `Butuh ${qty}x ${mineral} untuk upgrade petak.`,
        }
      }
    }
    set(draft => {
      draft.coins -= cost.coins
      for (const [mineral, qty] of Object.entries(cost.minerals)) {
        if (draft.inventoryByCategory.minerals[mineral]) {
          draft.inventoryByCategory.minerals[mineral].qty -= qty
          if (draft.inventoryByCategory.minerals[mineral].qty <= 0) {
            delete draft.inventoryByCategory.minerals[mineral]
          }
        }
      }
    })
    set(s => ({
      [listKey]: s[listKey].map(p =>
        p.id === plotId ? { ...p, level: p.level + 1 } : p
      ),
    }))
    return {
      ok: true,
      message: `Petak naik ke level ${plot.level + 1}! Tumbuh lebih cepat.`,
    }
  },

  updatePlotStatus: (plotId, status) => {
    const listKey = getPlotArrayKey(plotId)
    set(state => ({
      [listKey]: state[listKey].map(p =>
        p.id === plotId ? { ...p, status } : p
      ),
    }))
  },

  swapPlots: (id1, id2) => {
    const listKey1 = getPlotArrayKey(id1)
    const listKey2 = getPlotArrayKey(id2)
    if (listKey1 !== listKey2) return
    set(state => {
      const newPlots = [...state[listKey1]]
      const idx1 = newPlots.findIndex(p => p.id === id1)
      const idx2 = newPlots.findIndex(p => p.id === id2)
      if (idx1 !== -1 && idx2 !== -1)
        [newPlots[idx1], newPlots[idx2]] = [newPlots[idx2], newPlots[idx1]]
      return { [listKey1]: newPlots }
    })
  },
})
