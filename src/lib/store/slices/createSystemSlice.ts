import type { StoreSet, StoreGet, NotificationOptions } from '@/types/game'
import { safeCoins, safePositiveNumber } from '@/lib/store/utils'
import { GAME_CONSTANTS } from '@/lib/constants'
import { logger } from '@/lib/logger'

export const createSystemSlice = (set: StoreSet, get: StoreGet) => ({
  enqueueNotification: (message: string, options: NotificationOptions = {}) => {
    const id = options.id || Date.now() + Math.random().toString()
    set(state => {
      const exists = state.notificationsQueue.some(n => n.id === id)
      if (exists) {
        return {
          notificationsQueue: state.notificationsQueue.map(n =>
            n.id === id ? { ...n, message, options } : n
          ),
        }
      }
      return {
        notificationsQueue: [
          ...state.notificationsQueue,
          { id, message, options },
        ],
      }
    })
  },

  dequeueNotification: id => {
    set(state => ({
      notificationsQueue: state.notificationsQueue.filter(n => n.id !== id),
    }))
  },

  openPrompt: (title, msg, onConfirm) => {
    set(state => ({
      modals: {
        ...state.modals,
        prompt: { isOpen: true, title, msg, onConfirm },
      },
    }))
  },

  openConfirm: (title, msg, onConfirm) => {
    set(state => ({
      modals: {
        ...state.modals,
        confirm: { isOpen: true, title, msg, onConfirm },
      },
    }))
  },

  openNpcGift: npcId => {
    set(state => ({
      modals: { ...state.modals, npcGift: { isOpen: true, npcId } },
    }))
  },

  closeModals: () => {
    set(() => ({
      modals: {
        prompt: { isOpen: false, title: '', msg: '', onConfirm: null },
        confirm: { isOpen: false, title: '', msg: '', onConfirm: null },
        npcGift: { isOpen: false, npcId: null },
      },
    }))
  },

  toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set(s => ({ musicEnabled: !s.musicEnabled })),
  toggleNotifications: () =>
    set(s => ({ notificationsEnabled: !s.notificationsEnabled })),

  // Worker toggles (migrated from auto* flags)
  toggleAutoMode: type =>
    set(state => {
      const w = state.workers[type]
      if (!w?.hired) return state
      return {
        workers: {
          ...state.workers,
          [type]: { ...w, isAutoMode: !w.isAutoMode },
        },
      }
    }),

  giveKopiWorker: type => {
    const state = get()
    const w = state.workers[type]
    if (!w?.hired) return { ok: false, message: 'Pekerja belum disewa.' }
    if (w.happiness >= 100)
      return { ok: false, message: 'Pekerja sudah sangat bahagia!' }

    const kopiCount = state.inventoryByCategory?.consumables?.kopi?.qty || 0
    if (kopiCount <= 0)
      return { ok: false, message: 'Tidak punya Kopi Kurcaci.' }

    set(draft => {
      draft.inventoryByCategory.consumables.kopi.qty -= 1
      if (draft.inventoryByCategory.consumables.kopi.qty <= 0) {
        delete draft.inventoryByCategory.consumables.kopi
      }
      draft.workers[type].happiness = Math.min(
        100,
        draft.workers[type].happiness + 50
      )
      if (!draft.workers[type].isWorking) {
        draft.workers[type].isWorking = true
      }
    })

    return {
      ok: true,
      message: `${w.name} meminum kopi dan kembali bersemangat! ☕`,
    }
  },

  setSelectedRecipe: recipeId => set({ selectedRecipe: recipeId }),

  hireWorker: (type, cost) => {
    const state = get()
    if (state.workers[type]?.hired) return false
    const price = safePositiveNumber(cost, 0)
    if (price <= 0) return false
    const currentCoins = safeCoins(state.coins)
    if (currentCoins < price) return false

    const nameMap = {
      farmer: 'Kurcaci Budi',
      rancher: 'Kurcaci Siti',
      fisher: 'Kurcaci Mamat',
      miner: 'Kurcaci Tarjo',
      chef: 'Kurcaci Juna',
    }
    const skillMap = {
      farmer: { farming: 1, harvesting: 1, watering: 1 },
      rancher: { ranching: 1, collecting: 1, feeding: 1 },
      fisher: { fishing: 1, baiting: 1 },
      miner: { mining: 1, blasting: 1 },
      chef: { cooking: 1, baking: 1, prep: 1 },
    }

    set({
      coins: currentCoins - price,
      workers: {
        ...state.workers,
        [type]: {
          hired: true,
          name: nameMap[type] || type,
          role: type,
          level: 1,
          xp: 0,
          xpToNext: 200,
          stamina: 100,
          happiness: 80,
          wagePerDay: 50,
          daysEmployed: 0,
          totalWagesPaid: 0,
          loyalty: 60,
          skills: skillMap[type] || {},
          isWorking: true,
          isAutoMode: true,
        },
      },
    })
    return true
  },

  fireWorker: type => {
    const state = get()
    if (!state.workers[type]?.hired) return false
    set({ workers: { ...state.workers, [type]: null } })
    return true
  },

  spinWheel: () => {
    const today = new Date().toDateString()
    const state = get()
    if (state.lastWheelSpin === today) {
      return { success: false, message: 'Sudah spin hari ini' }
    }
    const roll = Math.random() * 100
    let reward: number
    if (roll < 60) reward = 100 + Math.floor(Math.random() * 200)
    else if (roll < 85) reward = 500
    else if (roll < 95) reward = 2000
    else reward = 5000
    set({ lastWheelSpin: today, coins: safeCoins(state.coins) + reward })
    return { success: true, reward, message: `🎡 Dapat ${reward} 💰!` }
  },

  touchSaveTimestamp: () => {
    set({ lastSavedAt: Date.now() })
  },

  processGameTick: () => {
    const actions = [
      () => get().advanceSeasonTick(),
      () => get().changeWeather(),
      () => get().syncPlots(),
      () => get().syncMiningNodes(),
      () => get().syncSmeltery(),
      () => get().runAutoWorkers(),
      () => get().processCraftingQueue(),
      () => get().checkOrders(),
      () => {
        get().rollDailySpecial?.()
        // Closed restaurant: customers wait patiently, nobody new comes
        if (get().restaurant && get().restaurant.serviceOn === false) return
        get().tickCustomers(1000)
        const rep = get().restaurant?.reputation || 0
        const spawnBoost =
          1 +
          Math.min(
            rep * GAME_CONSTANTS.RESTAURANT.REP_SPAWN_PER_POINT,
            GAME_CONSTANTS.RESTAURANT.REP_SPAWN_MAX_BONUS
          )
        if (
          Math.random() <
          0.1 * (get().weatherEffects?.customerRate || 1) * spawnBoost
        )
          get().spawnCustomer()
      },
      () => {
        const state = get()
        const now = Date.now()
        let changed = false
        let newCoinMult = state.coinMultiplier
        if (
          state.coinMultiplierExpireAt &&
          now > state.coinMultiplierExpireAt
        ) {
          newCoinMult = 1
          changed = true
          if (state.coinMultiplier > 1)
            get().enqueueNotification('Booster Koin telah habis.', {
              icon: '⏳',
              type: 'info',
            })
        }
        let newGrowthMult = state.growthMultiplier
        if (
          state.growthMultiplierExpireAt &&
          now > state.growthMultiplierExpireAt
        ) {
          newGrowthMult = 1
          changed = true
          if (state.growthMultiplier > 1)
            get().enqueueNotification('Booster Pertumbuhan telah habis.', {
              icon: '⏳',
              type: 'info',
            })
        }
        if (changed) {
          set({
            coinMultiplier: newCoinMult,
            growthMultiplier: newGrowthMult,
            ...(newCoinMult === 1 && { coinMultiplierExpireAt: null }),
            ...(newGrowthMult === 1 && { growthMultiplierExpireAt: null }),
          })
        }
      },
    ]
    for (const action of actions) {
      try {
        action()
      } catch (error) {
        logger.error('Game tick error:', error)
      }
    }
  },
})
