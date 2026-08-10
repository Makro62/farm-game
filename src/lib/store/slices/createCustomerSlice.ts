import type { StoreSet, StoreGet } from '@/types/game'
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

export const createCustomerSlice = (set: StoreSet, get: StoreGet) => ({
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

    const newCustomer = {
      id: Math.random().toString(36).substring(2, 9),
      typeId: customerType.id,
      name: customerType.name,
      emoji: customerType.emoji,
      recipeId: recipe.id,
      tableId: emptyTable,
      patience: customerType.basePatience,
      maxPatience: customerType.basePatience,
      spawnTime: Date.now(),
      tipMultiplier: customerType.tipMultiplier || 1,
    }

    set(s => ({ activeCustomers: [...s.activeCustomers, newCustomer] }))
  },

  serveCustomer: customerId => {
    const state = get()
    const customerIndex = state.activeCustomers.findIndex(
      c => c.id === customerId
    )
    if (customerIndex === -1) {
      return { ok: false, message: 'Pelanggan tidak ditemukan.' }
    }

    const customer = state.activeCustomers[customerIndex]
    const recipe = RECIPES.find(r => r.id === customer.recipeId)
    const cat = recipe?.type === 'processing' ? 'processed' : 'cooked'

    if (!recipe) {
      return { ok: false, message: 'Resep pelanggan tidak ditemukan.' }
    }

    if (!invHas(state, cat, customer.recipeId, 1)) {
      get().enqueueNotification(
        `Anda tidak memiliki ${recipe.name}! Masak dulu di dapur.`,
        { icon: '🍽️', type: 'error' }
      )
      return { ok: false, message: `Tidak punya ${recipe.name}.` }
    }

    const patienceRatio = Math.max(0, customer.patience / customer.maxPatience)
    let tipPercent = 0
    if (patienceRatio > 0.7) tipPercent = 0.5 * customer.tipMultiplier
    else if (patienceRatio > 0.3) tipPercent = 0.2 * customer.tipMultiplier

    const basePrice = recipe.price || 100
    const finalTip = Math.floor(basePrice * tipPercent)
    const finalEarned = basePrice + finalTip

    const newActiveCustomers = [...state.activeCustomers]
    newActiveCustomers.splice(customerIndex, 1)

    set(draft => {
      invRemove(draft, cat as any, customer.recipeId, 1)
      draft.activeCustomers = newActiveCustomers
      incrementStat(draft, 'totalServed', 1)
    })

    get().addCoins(finalEarned)
    get().addXP(recipe.xp || 20)
    get().checkAchievements?.()
    get().enqueueNotification(
      `${customer.name} senang! +${finalEarned} 💰 (Tip: ${finalTip})`,
      { type: 'success' }
    )
    return { ok: true, earned: finalEarned, tip: finalTip }
  },

  tickCustomers: deltaTime => {
    const state = get()
    if (!state.activeCustomers || state.activeCustomers.length === 0) return

    let changed = false
    const updatedCustomers: any[] = []
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
      set({ activeCustomers: updatedCustomers })
      if (leftCount > 0)
        get().enqueueNotification(
          `${leftCount} pelanggan pergi karena kehabisan kesabaran!`,
          { icon: '😡', type: 'error' }
        )
    }
  },
})
