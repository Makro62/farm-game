import type { StoreSet, StoreGet } from '@/types/game'
import { GAME_CONSTANTS } from '@/lib/constants'
import { initialState } from '@/lib/store/initialState'

export const createPrestigeSlice = (set: StoreSet, get: StoreGet) => ({
  getPrestigeMultiplier: () => {
    const count = Number(get().prestigeCount) || 0
    return Math.min(
      1 + count * GAME_CONSTANTS.PRESTIGE.MULTIPLIER_PER_COUNT,
      GAME_CONSTANTS.PRESTIGE.MAX_MULTIPLIER,
    )
  },

  canPrestige: () =>
    (Number(get().level) || 0) >= GAME_CONSTANTS.PRESTIGE.MIN_LEVEL,

  prestigeReset: () => {
    const state = get()
    if ((Number(state.level) || 0) < GAME_CONSTANTS.PRESTIGE.MIN_LEVEL) {
      const message = `Butuh Level ${GAME_CONSTANTS.PRESTIGE.MIN_LEVEL} untuk Prestige!`
      get().enqueueNotification(message, { icon: '🔒', type: 'error' })
      return { ok: false, message }
    }

    const gainedPoints = Math.max(1, Math.floor(state.level / 5))
    set((draft) => {
      draft.prestigeCount = (draft.prestigeCount || 0) + 1
      draft.prestigePoints = (draft.prestigePoints || 0) + gainedPoints
      draft.stats = {
        ...(draft.stats || {}),
        totalPrestiges: (draft.stats?.totalPrestiges || 0) + 1,
      }

      draft.coins = GAME_CONSTANTS.STARTING.COINS
      draft.level = 1
      draft.xp = 0
      draft.energy = GAME_CONSTANTS.STARTING.ENERGY
      draft.maxEnergy = 100
      draft.plots = initialState.plots.map((p) => ({ ...p }))
      draft.feedPlots = initialState.feedPlots.map((p) => ({ ...p }))
      draft.kitchenPlots = initialState.kitchenPlots.map((p) => ({ ...p }))
      draft.inventoryByCategory = structuredClone(
        initialState.inventoryByCategory,
      )
      draft.animals = []
      draft.workers = {
        farmer: null,
        rancher: null,
        fisher: null,
        miner: null,
        chef: null,
      }
      draft.buildings = structuredClone(initialState.buildings)
      draft.decorations = []
      draft.mining = {
        ...initialState.mining,
        nodes: initialState.mining.nodes.map((n) => ({ ...n })),
      }
      draft.npcs = structuredClone(initialState.npcs)
      draft.dailyQuests = []
      draft.lastQuestDate = null
      draft.orders = []
      draft.craftingQueue = []
      draft.restaurant = { ...initialState.restaurant }
      draft.town = { ...initialState.town }
      draft.totalTables = initialState.totalTables
      draft.activeCustomers = []
      draft.activeEvent = null
      draft.combo = { count: 0, multiplier: 1, lastAction: 0 }
      draft.coinMultiplier = 1
      draft.growthMultiplier = 1
      draft.coinMultiplierExpireAt = null
      draft.growthMultiplierExpireAt = null
      draft.weatherEffects = { ...initialState.weatherEffects }
      draft.season = { current: 'spring', day: 1, tick: 0 }
      draft.sessionActions = {}
    })

    get().checkAchievements?.()
    const newMult = get().getPrestigeMultiplier()
    const message = `✨ Prestige! Pengali pendapatan permanen ×${newMult.toFixed(1)} · +${gainedPoints} ⭐ Poin Prestige`
    get().enqueueNotification(message, {
      icon: '🌟',
      type: 'success',
      duration: 6000,
      tier: 'legendary',
      sfx: 'fanfare',
    })
    return { ok: true, message, points: gainedPoints }
  },
})
