import type {
  StoreSet,
  StoreGet,
  GameState,
  InventoryCategory,
  QuestProgressEntry,
} from '@/types/game'
import type { ShopSeed } from '@/types/items'
import {
  getMiningRegenMs,
  isWorkerActive,
  getGrowthMultiplier,
  normalizePlot,
  normalizePlots,
  normalizeAnimal,
  pickAutoSeed,
  safeCoins,
  getAnimalProduceTime,
  rollMineralType,
} from '@/lib/store/utils'
import {
  getItemCategory as canonicalGetItemCategory,
  parseRequirementKey,
} from '@/lib/utils/inventory'
import { SHOP_SEEDS } from '@/lib/data/crops'
import { SHOP_ANIMALS, ANIMAL_FEED } from '@/lib/data/shop'
import { FISHES } from '@/lib/data/fishes'
import { RECIPES } from '@/lib/data/recipes'
import { getItemSellPrice } from '@/lib/data/item-helpers'
import { GAME_CONSTANTS } from '@/lib/constants'
import { PLOT_LEVEL_MULT } from '@/lib/store/slices/createFarmingSlice'

function invGet(
  state: Pick<GameState, 'inventoryByCategory'>,
  cat: InventoryCategory | string,
  itemId: string,
): number {
  return (
    state.inventoryByCategory?.[cat as InventoryCategory]?.[itemId]?.qty || 0
  )
}

function catFor(itemId: string): InventoryCategory {
  return canonicalGetItemCategory(itemId) || 'collectibles'
}

export const createWorkerSlice = (set: StoreSet, get: StoreGet) => ({
  runAutoWorkers: () => {
    const state = get()
    const now = Date.now()
    const growthMult = getGrowthMultiplier(state)
    const plots = normalizePlots(state.plots, 30, 0)
    const feedPlots = normalizePlots(state.feedPlots, 12, 100)
    const kitchenPlots = normalizePlots(state.kitchenPlots, 12, 200)
    let animals = Array.isArray(state.animals)
      ? state.animals.map(normalizeAnimal)
      : []
    const craftingQueue = [...(state.craftingQueue || [])]
    let xpGain = 0
    let harvested = 0
    let planted = 0
    let collected = 0
    let coinsSpent = 0
    let anyPlotsChanged = false
    let animalsChanged = false
    let queueChanged = false
    const questEntries: QuestProgressEntry[] = []
    const catUpdates: Record<string, Record<string, number>> = {}
    const harvestedCropIds = new Set<string>()

    function addToCat(cat: string, itemId: string, qty = 1) {
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
          const baseGrow = (p.growTime ?? 0) > 0 ? p.growTime : null
          const growTime =
            p.pestInfestation && baseGrow ? baseGrow * 2 : baseGrow
          const isReady =
            p.crop &&
            (p.status === 'ready' ||
              (p.status === 'growing' &&
                p.plantedAt &&
                growTime != null &&
                now - p.plantedAt >= growTime))

          if (isReady && p.crop) {
            const crop = p.crop as string
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
            harvestedCropIds.add(crop)
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
            const hasGreenhouse = !!state.buildings?.greenhouse?.unlocked
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

              let preferredSeed: ShopSeed | null = null
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
        for (const [cat, items] of Object.entries(catUpdates)) {
          for (const [itemId, delta] of Object.entries(items)) {
            const parsed = parseRequirementKey(`${cat}.${itemId}`)
            const invCat =
              draft.inventoryByCategory[
                (parsed?.cat ?? cat) as InventoryCategory
              ]
            if (!invCat) continue
            if (!invCat[itemId]) {
              invCat[itemId] = {
                qty: 0,
                quality: 'normal',
                acquiredAt: Date.now(),
              }
            }
            invCat[itemId].qty += delta
            if (invCat[itemId].qty <= 0) {
              delete invCat[itemId]
            }
          }
        }
      })
      if (xpGain > 0) get().addXP(xpGain)
      if (questEntries.length > 0) get().batchProgressQuest(questEntries)
      harvestedCropIds.forEach(id => get().addToCollection?.('crops', id))
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
          cumulative += fish.baseChance ?? fish.chance ?? 0.1
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
        get().addToCollection?.('fish', caughtFish.id)
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
            const parsed = parseRequirementKey(key)
            if (!parsed) return false
            return (inv[parsed.cat]?.[parsed.itemId]?.qty || 0) >= amt
          })
          if (canCraft) {
            set(draft => {
              for (const [key, amt] of Object.entries(recipe.req)) {
                const parsed = parseRequirementKey(key)
                if (!parsed) continue
                if (draft.inventoryByCategory[parsed.cat]?.[parsed.itemId]) {
                  draft.inventoryByCategory[parsed.cat][parsed.itemId].qty -=
                    amt
                  if (draft.inventoryByCategory[parsed.cat][parsed.itemId].qty <= 0) {
                    delete draft.inventoryByCategory[parsed.cat][parsed.itemId]
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
    const newPlots = [...state.plots]
    const newFeedPlots = [...(state.feedPlots || [])]
    const newKitchenPlots = [...(state.kitchenPlots || [])]
    const newAnimals = Array.isArray(state.animals) ? [...state.animals] : []
    const offlineItems: Array<{ cat: string; id: string; qty: number }> = []

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
            if (
              p.plantedAt != null &&
              p.plantedAt + p.growTime <= now
            ) {
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
            cumulative += fish.baseChance ?? fish.chance ?? 0.1
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
        const lanternActive = Boolean(
          state.mining.lanternUntil && state.mining.lanternUntil > now,
        )
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
