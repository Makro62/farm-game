import type { StoreSet, StoreGet, ActiveCustomer, GameState } from '@/types/game'
import { CUSTOMERS } from '@/lib/data/customers'
import { RECIPES } from '@/lib/data/recipes'
import { GAME_CONSTANTS } from '@/lib/constants'
import { safePositiveNumber, safeCoins } from '@/lib/store/utils'
import {
  invHas,
  invRemove,
  invHasRequirements,
  invConsumeRequirements,
  incrementStat,
} from '@/lib/utils/inventory'

const R = GAME_CONSTANTS.RESTAURANT

interface ServeFailure {
  ok: false
  message?: string
  missing?: boolean
  recipeName?: string
}

interface ServeSuccess {
  ok: true
  recipeId: string
  recipeName: string
  cat: 'processed' | 'cooked'
  earned: number
  tip: number
  repGain: number
  isSpecial: boolean
  isVip: boolean
  rushActive: boolean
  patienceRatio: number
}

type ServeCalc = ServeFailure | ServeSuccess

/** Pure calculation: can this customer be served right now, and for how much? */
function computeServe(state: GameState, customer: ActiveCustomer): ServeCalc {
  const recipe = RECIPES.find(r => r.id === customer.recipeId)
  if (!recipe) {
    return { ok: false, message: 'Resep pelanggan tidak ditemukan.' }
  }
  const cat = recipe.type === 'processing' ? 'processed' : 'cooked'
  if (!invHas(state, cat, customer.recipeId, 1)) {
    return {
      ok: false,
      missing: true,
      recipeName: recipe.name,
      message: `Tidak punya ${recipe.name}.`,
    }
  }

  const maxPatience = Math.max(1, customer.maxPatience || 1)
  const patienceRatio = Math.max(0, (customer.patience || 0) / maxPatience)
  const rep = state.restaurant?.reputation || 0
  const repTipBonus = Math.min(rep * R.REP_TIP_PER_POINT, R.REP_TIP_MAX)

  let tipPercent = repTipBonus
  if (patienceRatio > R.TIP_HIGH_THRESHOLD)
    tipPercent += R.TIP_HIGH_MULT * customer.tipMultiplier
  else if (patienceRatio > R.TIP_MED_THRESHOLD)
    tipPercent += R.TIP_MED_MULT * customer.tipMultiplier

  const now = Date.now()
  const rushActive = (state.restaurant?.rushUntil || 0) > now
  if (rushActive) tipPercent *= R.RUSH_TIP_MULT

  let basePrice = recipe.price || 100
  const isSpecial = state.restaurant?.dailySpecial === recipe.id
  if (isSpecial) basePrice = Math.floor(basePrice * R.SPECIAL_PRICE_MULT)
  const isVip = !!customer.isVip
  if (isVip) basePrice = Math.floor(basePrice * R.VIP_PRICE_MULT)

  const finalTip = Math.floor(basePrice * tipPercent)
  const earned = basePrice + finalTip
  const repGain =
    Math.round(R.REP_SERVE_BASE + patienceRatio * R.REP_SERVE_PATIENCE_BONUS) +
    (isVip ? 2 : 0)

  return {
    ok: true,
    recipeId: recipe.id,
    recipeName: recipe.name,
    cat,
    earned,
    tip: finalTip,
    repGain,
    isSpecial,
    isVip,
    rushActive,
    patienceRatio,
  }
}

export const createCustomerSlice = (set: StoreSet, get: StoreGet) => ({
  setServiceOn: (on: boolean) => {
    set(draft => {
      if (!draft.restaurant) return
      draft.restaurant.serviceOn = !!on
    })
    get().enqueueNotification(
      on
        ? '🍽️ Restoran BUKA — pelanggan mulai berdatangan!'
        : '🪑 Restoran TUTUP — mode atur meja.',
      { id: 'service-toggle', type: 'info' }
    )
  },

  upgradeTables: () => {
    const state = get()
    const maxTables = GAME_CONSTANTS.RESTAURANT.MAX_TABLES
    if (state.totalTables >= maxTables) {
      get().enqueueNotification('Jumlah meja sudah maksimal!', {
        type: 'error',
      })
      return { ok: false, message: 'Jumlah meja sudah maksimal.' }
    }

    const cost =
      state.totalTables * GAME_CONSTANTS.RESTAURANT.TABLE_UPGRADE_BASE_COST
    if (safeCoins(state.coins) < cost) {
      get().enqueueNotification('Koin tidak cukup untuk beli meja baru!', {
        type: 'error',
      })
      return { ok: false, message: 'Koin tidak cukup.' }
    }

    const requirements = {
      'minerals.besi':
        state.totalTables * GAME_CONSTANTS.RESTAURANT.TABLE_UPGRADE_BESI_MULT,
      'minerals.batu':
        state.totalTables * GAME_CONSTANTS.RESTAURANT.TABLE_UPGRADE_BATU_MULT,
    }

    if (!invHasRequirements(state, requirements)) {
      get().enqueueNotification(
        `Butuh ${requirements['minerals.besi']}x Besi + ${requirements['minerals.batu']}x Batu dari Tambang untuk upgrade meja!`,
        { type: 'error' }
      )
      return { ok: false, message: 'Bahan mineral tidak cukup.' }
    }

    set(draft => {
      invConsumeRequirements(draft, requirements)
      draft.coins -= cost
      draft.totalTables += 1
    })

    get().enqueueNotification('Meja baru berhasil ditambahkan!', {
      type: 'success',
    })
    return { ok: true, message: 'Meja restoran berhasil di-upgrade.' }
  },

  spawnCustomer: () => {
    const state = get()
    if (state.restaurant && state.restaurant.serviceOn === false) return
    if (state.activeCustomers.length >= state.totalTables) return

    const occupiedTables = state.activeCustomers.map(c => c.tableId)
    let emptyTable = -1
    for (let i = 0; i < state.totalTables; i++) {
      if (!occupiedTables.includes(i)) {
        emptyTable = i
        break
      }
    }
    if (emptyTable === -1) return

    const customerType = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)]
    const prefs = customerType.preferences || []
    let recipeId =
      prefs.length > 0
        ? prefs[Math.floor(Math.random() * prefs.length)]
        : 'sup_wortel'
    const recipe = RECIPES.find(r => r.id === recipeId) || RECIPES[0]

    const isVip = Math.random() < R.VIP_CHANCE
    const basePatience = Math.floor(
      customerType.basePatience * (isVip ? R.VIP_PATIENCE_MULT : 1)
    )

    const newCustomer = {
      id: Math.random().toString(36).substring(2, 9),
      typeId: customerType.id,
      name: customerType.name,
      emoji: customerType.emoji,
      recipeId: recipe.id,
      tableId: emptyTable,
      patience: basePatience,
      maxPatience: basePatience,
      spawnTime: Date.now(),
      tipMultiplier: (customerType.tipMultiplier || 1) + (isVip ? 1 : 0),
      isVip,
    }

    set(s => ({ activeCustomers: [...s.activeCustomers, newCustomer] }))
    if (isVip) {
      get().enqueueNotification(
        `👑 Pelanggan VIP ${customerType.name} datang! Layani cepat untuk bonus besar!`,
        { id: `vip-${newCustomer.id}`, type: 'success' }
      )
    }
  },

  rollDailySpecial: () => {
    const state = get()
    const day = state.day || 0
    if ((state.restaurant?.lastSpecialDay ?? -1) >= day) return
    const pool = RECIPES.filter(r => r.type === 'restaurant')
    const fallback = RECIPES.filter(r => r.type !== 'processing')
    const list = pool.length > 0 ? pool : fallback
    if (list.length === 0) return
    const pick = list[Math.floor(Math.random() * list.length)]
    set(draft => {
      if (!draft.restaurant) return
      draft.restaurant.dailySpecial = pick.id
      draft.restaurant.lastSpecialDay = day
    })
    get().enqueueNotification(
      `⭐ Menu Spesial hari ini: ${pick.emoji} ${pick.name} — harga +${Math.round((R.SPECIAL_PRICE_MULT - 1) * 100)}%!`,
      { id: 'daily-special', type: 'success' }
    )
  },

  serveCustomer: (customerId, opts) => {
    const quiet = !!(opts && opts.quiet)
    const state = get()
    const customerIndex = state.activeCustomers.findIndex(
      c => c.id === customerId
    )
    if (customerIndex === -1) {
      return { ok: false, message: 'Pelanggan tidak ditemukan.' }
    }

    const customer = state.activeCustomers[customerIndex]
    const calc = computeServe(state, customer)
    if (!calc.ok) {
      if (calc.missing && !quiet) {
        get().enqueueNotification(
          `Anda tidak memiliki ${calc.recipeName}! Masak dulu di dapur.`,
          { icon: '🍽️', type: 'error' }
        )
      }
      return { ok: false, message: calc.message }
    }

    const now = Date.now()
    const lastServedAt = state.restaurant?.lastServedAt || 0
    const prevStreak = state.restaurant?.serveStreak || 0
    const newStreak =
      now - lastServedAt <= R.RUSH_STREAK_WINDOW_MS ? prevStreak + 1 : 1
    const wasRushing = (state.restaurant?.rushUntil || 0) > now
    const rushTriggered = newStreak >= R.RUSH_STREAK && !wasRushing

    const newActiveCustomers = [...state.activeCustomers]
    newActiveCustomers.splice(customerIndex, 1)

    set(draft => {
      invRemove(draft, calc.cat, customer.recipeId, 1)
      draft.activeCustomers = newActiveCustomers
      incrementStat(draft, 'totalServed', 1)
      if (draft.restaurant) {
        draft.restaurant.reputation =
          (draft.restaurant.reputation || 0) + (calc.repGain || 0)
        draft.restaurant.serveStreak = newStreak
        draft.restaurant.lastServedAt = now
        if (rushTriggered) {
          draft.restaurant.rushUntil = now + R.RUSH_DURATION_MS
        }
      }
    })

    get().addCoins(calc.earned)
    const servedRecipe = RECIPES.find(r => r.id === customer.recipeId)
    get().addXP(servedRecipe?.xp || 20)
    get().checkAchievements?.()

    if (rushTriggered) {
      get().enqueueNotification(
        `🔥 JAM RAMAI! Tip x${R.RUSH_TIP_MULT} selama ${R.RUSH_DURATION_MS / 1000} detik!`,
        { id: 'rush-hour', type: 'success' }
      )
    }
    if (!quiet) {
      const tags = [
        calc.isVip ? '👑 VIP' : '',
        calc.isSpecial ? '⭐ Spesial' : '',
        calc.rushActive ? '🔥 Rush' : '',
      ]
        .filter(Boolean)
        .join(' ')
      get().enqueueNotification(
        `${customer.name} senang! +${calc.earned} 💰 (Tip: ${calc.tip})${tags ? ` ${tags}` : ''}`,
        { type: 'success' }
      )
    }
    return { ok: true, earned: calc.earned, tip: calc.tip }
  },

  serveAllCustomers: () => {
    const snapshot = [...(get().activeCustomers || [])]
    let served = 0
    let earned = 0
    let tips = 0
    let skipped = 0
    for (const c of snapshot) {
      const r = get().serveCustomer(c.id, { quiet: true })
      if (r && r.ok) {
        served++
        earned += r.earned || 0
        tips += r.tip || 0
      } else {
        skipped++
      }
    }
    if (served > 0) {
      get().enqueueNotification(
        `🍽️ Melayani ${served} pelanggan! +${earned} 💰 (Tip: ${tips})${skipped > 0 ? ` — ${skipped} butuh dimasak dulu` : ''}`,
        { icon: '🎉', type: 'success' }
      )
    } else if (skipped > 0) {
      get().enqueueNotification(
        'Tidak ada hidangan siap saji. Masak dulu di dapur! 👨‍🍳',
        { icon: '🍳', type: 'error' }
      )
    }
    return { served, earned, tips, skipped }
  },

  tickCustomers: deltaTime => {
    const state = get()
    if (!state.activeCustomers || state.activeCustomers.length === 0) return

    let changed = false
    const updatedCustomers: ActiveCustomer[] = []
    let leftCount = 0

    state.activeCustomers.forEach(customer => {
      const newPatience = customer.patience - deltaTime
      if (newPatience <= 0) {
        changed = true
        leftCount++
      } else {
        updatedCustomers.push({ ...customer, patience: newPatience })
        if (newPatience !== customer.patience) changed = true
      }
    })

    if (changed) {
      set(draft => {
        draft.activeCustomers = updatedCustomers
        if (leftCount > 0 && draft.restaurant) {
          draft.restaurant.reputation = Math.max(
            0,
            (draft.restaurant.reputation || 0) - R.REP_LEAVE_PENALTY * leftCount
          )
          // leaving customers break the rush combo
          draft.restaurant.serveStreak = 0
        }
      })
      if (leftCount > 0)
        get().enqueueNotification(
          `${leftCount} pelanggan pergi karena kehabisan kesabaran! Reputasi -${R.REP_LEAVE_PENALTY * leftCount} 😡`,
          { icon: '😡', type: 'error' }
        )
    }
  },
})
