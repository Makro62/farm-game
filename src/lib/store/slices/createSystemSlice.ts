import type { StoreSet, StoreGet } from '@/types/game'
import {
  getMiningRegenMs,
  isWorkerActive,
  getGrowthMultiplier,
  normalizePlot,
  normalizePlots,
  normalizeAnimal,
  pickAutoSeed,
  safeCoins,
  safePositiveNumber,
  getAnimalProduceTime,
  rollMineralType,
} from '@/lib/store/utils'
import { SHOP_SEEDS } from '@/lib/data/crops'
import { SHOP_ANIMALS, ANIMAL_FEED } from '@/lib/data/shop'
import { FISHES } from '@/lib/data/fishes'
import { RECIPES } from '@/lib/data/recipes'
import { getItemSellPrice, getItemCategory } from '@/lib/data/item-helpers'
import { GAME_CONSTANTS } from '@/lib/constants'
import { logger } from '@/lib/logger'
import { PLOT_LEVEL_MULT } from '@/lib/store/slices/createFarmingSlice'

function invGet(state, cat, itemId) {
  return state.inventoryByCategory?.[cat]?.[itemId]?.qty || 0
}

function invSet(draft, cat, itemId, qty = 1, quality = 'normal') {
  if (!draft.inventoryByCategory[cat][itemId]) {
    draft.inventoryByCategory[cat][itemId] = {
      qty: 0,
      quality,
      acquiredAt: Date.now(),
    }
  }
  draft.inventoryByCategory[cat][itemId].qty += qty
}

function invRemove(draft, cat, itemId, qty = 1) {
  const item = draft.inventoryByCategory[cat]?.[itemId]
  if (!item || item.qty < qty) return false
  item.qty -= qty
  if (item.qty <= 0) delete draft.inventoryByCategory[cat][itemId]
  return true
}

function catFor(itemId) {
  return getItemCategory(itemId) || 'collectibles'
}

export const createSystemSlice = (set: StoreSet, get: StoreGet) => ({
  enqueueNotification: (message, options: any = {}) => {
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
    set(state => ({
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
    if ((state.lastWheelSpin as any) === today) {
      return { success: false, message: 'Sudah spin hari ini' }
    }
    const roll = Math.random() * 100
    let reward = 100
    if (roll < 60) reward = 100 + Math.floor(Math.random() * 200)
    else if (roll < 85) reward = 500
    else if (roll < 95) reward = 2000
    else reward = 5000
    set({ lastWheelSpin: today, coins: safeCoins(state.coins) + reward })
    return { success: true, reward, message: `🎡 Dapat ${reward} 💰!` }
  },

  advanceSeasonTick: () => {
    const ticksPerDay = GAME_CONSTANTS.SYSTEM.SEASON_TICKS_PER_DAY
    const eventChanceThreshold = GAME_CONSTANTS.SYSTEM.RANDOM_EVENT_CHANCE
    set(state => {
      if (!state.season) return state
      let { tick, day, current } = state.season
      let activeEvent = state.activeEvent
      tick += 1
      if (tick >= ticksPerDay) {
        tick = 0
        day += 1
        const eventChance = Math.random()
        if (eventChance < eventChanceThreshold) {
          const events = [
            {
              id: 'panen',
              name: '🎊 Festival Panen',
              desc: 'Harga jual semua tanaman x2 hari ini!',
            },
            {
              id: 'bahari',
              name: '🎣 Hari Bahari',
              desc: 'Ikan terjual dengan harga x2!',
            },
            {
              id: 'tambang',
              name: '💎 Demam Emas',
              desc: 'Peluang mendapat Emas & Berlian meningkat!',
            },
            {
              id: 'kebun',
              name: '🌻 Hari Berkebun',
              desc: 'Semua tanaman tumbuh 2x lebih cepat!',
            },
            {
              id: 'rakyat',
              name: '🎉 Pasar Rakyat',
              desc: 'Semua penjualan +50% hari ini!',
            },
          ]
          activeEvent = events[Math.floor(Math.random() * events.length)]
        } else {
          activeEvent = null
        }
        if (day > 7) {
          day = 1
          const seasons = ['spring', 'summer', 'autumn', 'winter']
          const idx = seasons.indexOf(current)
          current = seasons[(idx + 1) % 4]
        }
        setTimeout(() => get().updateMarket?.(), 0)

        // --- WORKER WAGES & MORALE ---
        let currentCoins = state.coins
        const newWorkers = { ...state.workers }
        let wageNotifications: string[] = []

        Object.keys(newWorkers).forEach(type => {
          if (newWorkers[type]) {
            newWorkers[type] = { ...newWorkers[type] }
          }
          const worker = newWorkers[type]
          if (worker?.hired) {
            if (currentCoins >= worker.wagePerDay) {
              currentCoins -= worker.wagePerDay
              worker.daysEmployed += 1
              worker.totalWagesPaid += worker.wagePerDay
              // Random event: worker morale drops if they work too many days without bonus
              if (Math.random() < 0.2) {
                worker.happiness = Math.max(0, worker.happiness - 5)
              }
              if (worker.happiness < 30) {
                wageNotifications.push(
                  `⚠️ ${worker.name} tidak bahagia! Performanya menurun.`
                )
              }
              // Worker strike recovery: gaji terbayar lagi → kembali bekerja
              if (!worker.isWorking) {
                worker.isWorking = true
                worker.happiness = Math.min(100, worker.happiness + 10)
                wageNotifications.push(`✅ ${worker.name} kembali bekerja!`)
              }
            } else {
              // Not enough money to pay wage
              worker.isWorking = false
              worker.happiness = Math.max(0, worker.happiness - 30)
              worker.loyalty = Math.max(0, worker.loyalty - 20)
              wageNotifications.push(
                `🚨 ${worker.name} mogok kerja! Gaji harian (${worker.wagePerDay}💰) tidak terbayar.`
              )
            }
          }
        })

        setTimeout(() => {
          wageNotifications.forEach(msg =>
            get().enqueueNotification(msg, { type: 'error' })
          )
        }, 100)

        // --- BANK INTEREST (Fase 3) ---
        const bankBalance = state.town?.bankSavings || 0
        let newBankSavings = bankBalance
        if (bankBalance > 0) {
          const interest = Math.floor(
            bankBalance * (state.town?.bankInterestRate || 0.02)
          )
          if (interest > 0) {
            newBankSavings = bankBalance + interest
            setTimeout(() => {
              get().enqueueNotification(
                `🏦 Bunga bank +${interest} 💰 (saldo ${newBankSavings})`,
                { type: 'success' }
              )
            }, 150)
          }
        }

        // --- PEST & SPRINKLER (Fase 2) ---
        const newPlots = state.plots.map(p => ({ ...p }))
        const hasScarecrow = !!state.buildings?.scarecrow?.unlocked
        const hasSprinkler = !!state.buildings?.sprinkler?.unlocked
        const pestNotifications: string[] = []

        if (hasSprinkler) {
          newPlots.forEach(p => {
            if (p.status === 'growing') p.watered = true
          })
        }

        if (!hasScarecrow && Math.random() < 0.2) {
          const growing = newPlots.filter(
            p => p.status === 'growing' && !p.pestInfestation
          )
          if (growing.length > 0) {
            const target = growing[Math.floor(Math.random() * growing.length)]
            target.pestInfestation = true
            pestNotifications.push(
              '🐛 Hama menyerang ladang! Tanaman kena hama tumbuh lebih lambat.'
            )
          }
        }

        setTimeout(() => {
          pestNotifications.forEach(msg =>
            get().enqueueNotification(msg, { type: 'error' })
          )
        }, 200)

        return {
          season: { current, day, tick },
          activeEvent,
          energy: state.maxEnergy || 100,
          coins: currentCoins,
          workers: newWorkers,
          plots: newPlots,
          ...(newBankSavings !== bankBalance
            ? { town: { ...state.town, bankSavings: newBankSavings } }
            : {}),
          ...(activeEvent?.id === 'kebun'
            ? {
                growthMultiplier: 2,
                growthMultiplierExpireAt: Date.now() + ticksPerDay * 1000,
              }
            : {}),
        }
      }
      return { season: { current, day, tick }, activeEvent }
    })
  },

  changeWeather: () => {
    const state = get()
    if (!state.weather) return
    let { nextChangeIn } = state.weather
    nextChangeIn -= 1
    if (nextChangeIn <= 0) {
      const season = state.season?.current || 'spring'
      let weathers = [
        '☀️ Cerah',
        '⛅ Berawan',
        '🌧️ Hujan',
        '⛈️ Badai',
        '🌫️ Berkabut',
        '🌬️ Berangin',
      ]
      if (season === 'winter') {
        weathers = [
          '☀️ Cerah',
          '⛅ Berawan',
          '☃️ Bersalju',
          '🌬️ Berangin',
          '🌫️ Berkabut',
        ]
      }
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)]
      const effects = {
        cropGrowth: newWeather === '🌬️ Berangin' ? 1.1 : 1.0,
        miningRegen: newWeather === '⛈️ Badai' ? 0.5 : 1.0,
        animalProduce: newWeather === '⛈️ Badai' ? 0.8 : 1.0,
        fishingRare:
          newWeather === '🌧️ Hujan'
            ? 1.15
            : newWeather === '🌫️ Berkabut'
              ? 0.7
              : 1.0,
        customerRate: newWeather === '🌫️ Berkabut' ? 1.2 : 1.0,
      }
      if (newWeather === '🌧️ Hujan' || newWeather === '⛈️ Badai') {
        const plots = state.plots || []
        set({ plots: plots.map(p => ({ ...p, watered: true })) })
        get().enqueueNotification(
          'Cuaca memburuk! Semua tanaman tersiram otomatis 🌧️',
          { icon: '☔', type: 'info' }
        )
      }
      if (newWeather === '☃️ Bersalju') {
        const plots = state.plots || []
        set({
          plots: plots.map(p => {
            if (p.crop && p.status === 'growing')
              return { ...p, status: 'dead', growTime: null }
            return p
          }),
        })
        get().enqueueNotification(
          'Salju turun! Tanaman yang tumbuh menjadi layu ❄️',
          { icon: '⛄', type: 'info' }
        )
      }
      set({
        weather: { current: newWeather, nextChangeIn: 300 },
        weatherEffects: effects,
      })
    } else {
      set({ weather: { ...state.weather, nextChangeIn } })
    }
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
        get().tickCustomers(1000)
        if (Math.random() < 0.1 * (get().weatherEffects?.customerRate || 1))
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

  runAutoWorkers: () => {
    const state = get()
    const now = Date.now()
    const growthMult = getGrowthMultiplier(state)
    let plots = normalizePlots(state.plots, 30, 0)
    let feedPlots = normalizePlots(state.feedPlots, 12, 100)
    let kitchenPlots = normalizePlots(state.kitchenPlots, 12, 200)
    let animals = Array.isArray(state.animals)
      ? state.animals.map(normalizeAnimal)
      : []
    let craftingQueue = [...(state.craftingQueue || [])]
    let xpGain = 0
    let harvested = 0
    let planted = 0
    let collected = 0
    let coinsSpent = 0
    let anyPlotsChanged = false
    let animalsChanged = false
    let queueChanged = false
    const questEntries: any[] = []
    const catUpdates = {}

    function addToCat(cat, itemId, qty = 1) {
      if (!catUpdates[cat]) catUpdates[cat] = {}
      catUpdates[cat][itemId] = (catUpdates[cat][itemId] || 0) + qty
    }

    const allPlotsArrays = [
      { key: 'plots', arr: [...plots] },
      { key: 'feedPlots', arr: [...feedPlots] },
      { key: 'kitchenPlots', arr: [...kitchenPlots] },
    ]

    // --- 1. KURCACI PERTANIAN ---
    if (isWorkerActive(state, 'farmer')) {
      for (const plotData of allPlotsArrays) {
        const pArr = plotData.arr
        for (let i = 0; i < pArr.length; i++) {
          const p = normalizePlot(pArr[i], pArr[i].id)
          const baseGrow = p.growTime > 0 ? p.growTime : null
          const growTime =
            p.pestInfestation && baseGrow ? baseGrow * 2 : baseGrow
          const isReady =
            p.crop &&
            (p.status === 'ready' ||
              (p.status === 'growing' &&
                p.plantedAt &&
                growTime != null &&
                now - p.plantedAt >= growTime))

          if (isReady) {
            const crop = p.crop
            pArr[i] = {
              ...p,
              status: 'empty',
              crop: null,
              plantedAt: null,
              growTime: null,
              watered: false,
              pestInfestation: false,
            }
            addToCat('crops', crop)
            harvested++
            anyPlotsChanged = true
            xpGain += GAME_CONSTANTS.XP.HARVEST
            questEntries.push({ type: 'harvest', targetId: crop, amount: 1 })
          }

          if (pArr[i].status === 'dead') {
            pArr[i] = {
              ...pArr[i],
              status: 'empty',
              crop: null,
              plantedAt: null,
              growTime: null,
              watered: false,
              pestInfestation: false,
            }
            anyPlotsChanged = true
          }

          // Auto-water: kurcaci petani menyiram tanaman yang belum disiram
          if (
            pArr[i].status === 'growing' &&
            !pArr[i].watered &&
            (pArr[i].growTime ?? 0) > 0
          ) {
            const boost = Math.floor(
              (pArr[i].growTime || 0) * GAME_CONSTANTS.CHANCES.WATER_BOOST
            )
            pArr[i] = {
              ...pArr[i],
              watered: true,
              plantedAt: (pArr[i].plantedAt || now) - boost,
            }
            anyPlotsChanged = true
          }

          if (pArr[i].status === 'empty') {
            const hasGreenhouse = !!state.buildings?.greenhouse
            let seedData = pickAutoSeed(
              state.inventoryByCategory?.seeds || {},
              state.selectedSeed,
              state.season?.current,
              hasGreenhouse
            )
            let autoBought = false
            if (!seedData) {
              const coinsAfterBuy = state.coins - coinsSpent
              const reserveFloor = Math.floor(state.coins * 0.3)

              let preferredSeed: any = null
              if (state.selectedSeed) {
                const s = SHOP_SEEDS.find(x => x.id === state.selectedSeed)
                if (
                  s &&
                  coinsAfterBuy - s.price >= reserveFloor &&
                  (hasGreenhouse ||
                    s.season === 'all' ||
                    s.season === state.season?.current)
                ) {
                  preferredSeed = s
                }
              }

              if (preferredSeed) {
                seedData = preferredSeed
                autoBought = true
              } else {
                const buyable = SHOP_SEEDS.filter(
                  s =>
                    coinsAfterBuy - s.price >= reserveFloor &&
                    (hasGreenhouse ||
                      s.season === 'all' ||
                      s.season === state.season?.current)
                )
                if (buyable.length > 0) {
                  seedData = buyable[Math.floor(Math.random() * buyable.length)]
                  autoBought = true
                }
              }
            }
            if (seedData) {
              let canPlant = false
              if (autoBought) {
                coinsSpent += seedData.price
                canPlant = true
              } else if (invGet(state, 'seeds', seedData.id) > 0) {
                if (!catUpdates['seeds']) catUpdates['seeds'] = {}
                catUpdates['seeds'][seedData.id] =
                  (catUpdates['seeds'][seedData.id] || 0) - 1
                canPlant = true
              }
              if (canPlant) {
                pArr[i] = {
                  ...pArr[i],
                  status: 'growing',
                  crop: seedData.cropId,
                  plantedAt: now,
                  growTime: Math.floor(
                    ((seedData.time * 1000) / growthMult) *
                      PLOT_LEVEL_MULT[pArr[i].level || 1]
                  ),
                  watered: false,
                  pestInfestation: false,
                }
                planted++
                anyPlotsChanged = true
              }
            }
          }
        }
      }
    }

    // --- 2. KURCACI PETERNAKAN ---
    if (isWorkerActive(state, 'rancher')) {
      animals = [...animals]
      for (let i = 0; i < animals.length; i++) {
        const a = normalizeAnimal(animals[i])
        const data = SHOP_ANIMALS.find(s => s.id === a.type)
        const produceTime = getAnimalProduceTime(a, state.weatherEffects)
        if (
          data &&
          a.status === 'producing' &&
          now - a.lastCollected >= produceTime
        ) {
          if (!a.fed) {
            const feedData = ANIMAL_FEED[a.type]
            if (feedData) {
              const have = invGet(
                state,
                catFor(feedData.feedItem),
                feedData.feedItem
              )
              if (have >= feedData.feedQty) {
                if (!catUpdates[catFor(feedData.feedItem)])
                  catUpdates[catFor(feedData.feedItem)] = {}
                catUpdates[catFor(feedData.feedItem)][feedData.feedItem] =
                  (catUpdates[catFor(feedData.feedItem)][feedData.feedItem] ||
                    0) - feedData.feedQty
                animals[i] = { ...a, fed: true }
                animalsChanged = true
              } else {
                animals[i] = a
                continue
              }
            } else {
              animals[i] = a
              continue
            }
          }
          animals[i] = { ...animals[i], lastCollected: now, fed: false }
          addToCat(catFor(data.product), data.product)
          collected++
          animalsChanged = true
          xpGain += GAME_CONSTANTS.XP.COLLECT
          questEntries.push({
            type: 'collect',
            targetId: data.product,
            amount: 1,
          })
        } else {
          animals[i] = a
        }
      }
    }

    if (anyPlotsChanged || animalsChanged || queueChanged || coinsSpent > 0) {
      set(draft => {
        if (coinsSpent > 0) {
          draft.coins = Math.max(0, safeCoins(draft.coins) - coinsSpent)
        }
        if (anyPlotsChanged) {
          draft.plots = allPlotsArrays[0].arr
          draft.feedPlots = allPlotsArrays[1].arr
          draft.kitchenPlots = allPlotsArrays[2].arr
        }
        if (animalsChanged) draft.animals = animals
        if (queueChanged) draft.craftingQueue = craftingQueue
        for (const [cat, items] of Object.entries(catUpdates) as [
          string,
          any,
        ][]) {
          for (const [itemId, delta] of Object.entries(items)) {
            const invCat = draft.inventoryByCategory[cat as any]
            if (!invCat[itemId]) {
              invCat[itemId] = {
                qty: 0,
                quality: 'normal',
                acquiredAt: Date.now(),
              }
            }
            invCat[itemId].qty += delta as number
            if (invCat[itemId].qty <= 0) {
              delete invCat[itemId]
            }
          }
        }
      })
      if (xpGain > 0) get().addXP(xpGain)
      if (questEntries.length > 0) get().batchProgressQuest(questEntries)
      if (harvested > 0 || planted > 0) {
        get().enqueueNotification(
          `👨‍🌾 Kurcaci Budi panen ${harvested} & tanam ${planted}!`,
          { id: 'auto-farm', type: 'success' }
        )
      }
      if (collected > 0) {
        get().enqueueNotification(
          `👩‍🌾 Kurcaci Siti ambil ${collected} hasil ternak!`,
          { id: 'auto-rancher', type: 'success' }
        )
      }
    }

    // --- 3. KURCACI PEMANCING ---
    if (isWorkerActive(state, 'fisher')) {
      if (Math.random() < GAME_CONSTANTS.CHANCES.FISHER_TICK) {
        const rand = Math.random()
        let cumulative = 0
        let caughtFish = FISHES[0]
        for (const fish of FISHES) {
          cumulative += fish.chance
          if (rand <= cumulative) {
            caughtFish = fish
            break
          }
        }
        set(draft => {
          if (!draft.inventoryByCategory.fish[caughtFish.id]) {
            draft.inventoryByCategory.fish[caughtFish.id] = {
              qty: 0,
              quality: 'normal',
              acquiredAt: Date.now(),
            }
          }
          draft.inventoryByCategory.fish[caughtFish.id].qty += 1
          draft.stats.totalFished = (draft.stats.totalFished || 0) + 1
        })
        get().addXP(GAME_CONSTANTS.XP.FISH)
        get().progressQuest('fish', caughtFish.id, 1)
        get().markSessionAction?.('fished')
        get().checkAchievements?.()
        get().enqueueNotification(
          `🎣 Kurcaci Mamat mendapat ${caughtFish.emoji} ${caughtFish.name}!`,
          { id: 'auto-fisher', type: 'success' }
        )
      }
    }

    // --- 4. KOKI ---
    if (isWorkerActive(state, 'chef') && state.selectedRecipe) {
      const recipe = RECIPES.find(r => r.id === state.selectedRecipe)
      if (recipe) {
        const typeQueue = craftingQueue.filter(
          q => RECIPES.find(r => r.id === q.recipeId)?.type === recipe.type
        )
        if (typeQueue.length < 3) {
          const inv = get().inventoryByCategory
          const canCraft = Object.entries(recipe.req).every(([key, amt]) => {
            const [cat, itemId] = key.split('.')
            return (inv[cat as any]?.[itemId]?.qty || 0) >= (amt as number)
          })
          if (canCraft) {
            set(draft => {
              for (const [key, amt] of Object.entries(recipe.req)) {
                const [cat, itemId] = key.split('.')
                if (draft.inventoryByCategory[cat as any]?.[itemId]) {
                  draft.inventoryByCategory[cat as any][itemId].qty -=
                    amt as number
                  if (draft.inventoryByCategory[cat][itemId].qty <= 0) {
                    delete draft.inventoryByCategory[cat][itemId]
                  }
                }
              }
            })
            const id = Math.random().toString(36).substring(2, 9)
            const startTime = Date.now()
            const duration = recipe.time * 1000
            craftingQueue.push({
              id,
              recipeId: recipe.id,
              startTime,
              duration,
            })
            queueChanged = true
            set({ craftingQueue })
            get().enqueueNotification(
              `👨‍🍳 Kurcaci Juna memasak ${recipe.name}!`,
              { id: 'auto-chef', type: 'success' }
            )
          }
        }
      }
    }
  },

  clearOfflineReport: () => {
    set({ offlineReport: null })
  },

  calculateOfflineProgress: () => {
    const state = get()
    if (!state.lastSavedAt) return
    const now = Date.now()
    const deltaSeconds = Math.floor((now - state.lastSavedAt) / 1000)
    if (deltaSeconds < GAME_CONSTANTS.OFFLINE.MIN_SECONDS) return

    let earnedCoins = 0
    let harvestedCrops = 0
    let collectedProducts = 0
    let newPlots = [...state.plots]
    let newFeedPlots = [...(state.feedPlots || [])]
    let newKitchenPlots = [...(state.kitchenPlots || [])]
    let newAnimals = Array.isArray(state.animals) ? [...state.animals] : []
    const offlineItems: any[] = []

    const allNewPlotsArrays = [
      { key: 'plots', arr: newPlots },
      { key: 'feedPlots', arr: newFeedPlots },
      { key: 'kitchenPlots', arr: newKitchenPlots },
    ]

    if (isWorkerActive(state, 'farmer')) {
      for (const plotData of allNewPlotsArrays) {
        const pArr = plotData.arr
        for (let i = 0; i < pArr.length; i++) {
          const p = pArr[i]
          if (p.crop && p.status === 'growing' && p.growTime) {
            if ((p.plantedAt as number) + p.growTime <= now) {
              offlineItems.push({ cat: 'crops', id: p.crop, qty: 1 })
              harvestedCrops++
              pArr[i] = {
                ...p,
                status: 'empty',
                crop: null,
                plantedAt: null,
                growTime: null,
              }
            }
          } else if (p.crop && p.status === 'ready') {
            offlineItems.push({ cat: 'crops', id: p.crop, qty: 1 })
            harvestedCrops++
            pArr[i] = {
              ...p,
              status: 'empty',
              crop: null,
              plantedAt: null,
              growTime: null,
            }
          }
        }
      }
    }

    if (isWorkerActive(state, 'rancher')) {
      for (let i = 0; i < newAnimals.length; i++) {
        const a = newAnimals[i]
        const data = SHOP_ANIMALS.find(s => s.id === a.type)
        if (data && a.status === 'producing') {
          const produceTimeSecs =
            getAnimalProduceTime(a, state.weatherEffects) / 1000
          const cycles = Math.floor(deltaSeconds / produceTimeSecs)
          if (cycles > 0) {
            offlineItems.push({
              cat: catFor(data.product),
              id: data.product,
              qty: cycles,
            })
            collectedProducts += cycles
            newAnimals[i] = { ...a, lastCollected: now }
          }
        }
      }
    }

    let caughtFishes = 0
    if (isWorkerActive(state, 'fisher')) {
      const attempts = Math.floor(
        deltaSeconds / GAME_CONSTANTS.OFFLINE.FISHER_CATCH_EVERY_SECS
      )
      const expectedCatches = Math.floor(
        attempts * GAME_CONSTANTS.CHANCES.AUTO_FISHER_CATCH
      )
      if (expectedCatches > 0) {
        caughtFishes = expectedCatches
        for (let f = 0; f < expectedCatches; f++) {
          const rand = Math.random()
          let cumulative = 0
          for (const fish of FISHES) {
            cumulative += fish.chance
            if (rand <= cumulative) {
              offlineItems.push({ cat: 'fish', id: fish.id, qty: 1 })
              break
            }
          }
        }
      }
    }

    let minedGems = 0
    const mineInterval =
      getMiningRegenMs(state.mining, state.weatherEffects) / 1000
    const mineAttempts = Math.floor(deltaSeconds / mineInterval)

    if (isWorkerActive(state, 'miner')) {
      if (mineAttempts > 0) {
        minedGems = Math.floor(mineAttempts * 0.5)
        const lanternActive =
          state.mining.lanternUntil && state.mining.lanternUntil > now
        const eventId = state.activeEvent?.id || null
        for (let m = 0; m < minedGems; m++) {
          const mineralType = rollMineralType(
            state.mining.pickaxeLevel,
            lanternActive,
            eventId
          )
          offlineItems.push({ cat: 'minerals', id: mineralType, qty: 1 })
        }
      }
    }

    for (const item of offlineItems) {
      const price = getItemSellPrice(item.id)
      if (price != null) earnedCoins += price * item.qty
    }

    if (
      harvestedCrops > 0 ||
      collectedProducts > 0 ||
      caughtFishes > 0 ||
      minedGems > 0
    ) {
      set(draft => {
        draft.plots = newPlots
        draft.feedPlots = newFeedPlots
        draft.kitchenPlots = newKitchenPlots
        draft.animals = newAnimals
        draft.lastSavedAt = now
        for (const item of offlineItems) {
          if (!draft.inventoryByCategory[item.cat][item.id]) {
            draft.inventoryByCategory[item.cat][item.id] = {
              qty: 0,
              quality: 'normal',
              acquiredAt: now,
            }
          }
          draft.inventoryByCategory[item.cat][item.id].qty += item.qty
        }
        draft.offlineReport = {
          deltaSeconds,
          harvestedCrops,
          collectedProducts,
          caughtFishes,
          minedGems,
          maturedCrops: 0,
          maturedNodes: 0,
          earnedCoins,
        }
      })
    } else {
      set({ lastSavedAt: now })
    }
  },
})
