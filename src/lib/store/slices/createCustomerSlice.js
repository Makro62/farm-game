import { CUSTOMERS } from '@/lib/data/customers';
import { RECIPES } from '@/lib/data/recipes';
import { safePositiveNumber } from '../utils';

export const createCustomerSlice = (set, get) => ({
  upgradeTables: () => {
    const state = get();
    if (state.totalTables >= 9) return false;
    const cost = state.totalTables * 1000;
    if (state.coins < cost) {
      get().enqueueNotification('Koin tidak cukup untuk beli meja baru!', { type: 'error' });
      return false;
    }
    const tableLevel = state.totalTables;
    const besiReq = tableLevel * 2;
    const batuReq = tableLevel * 5;
    const haveBesi = state.inventoryByCategory?.minerals?.besi?.qty || 0;
    const haveBatu = state.inventoryByCategory?.minerals?.batu?.qty || 0;
    if (haveBesi < besiReq || haveBatu < batuReq) {
      get().enqueueNotification(`Butuh ${besiReq}x Besi + ${batuReq}x Batu dari Tambang untuk upgrade meja!`, { type: 'error' });
      return false;
    }

    set(draft => {
      if (draft.inventoryByCategory.minerals.besi) {
        draft.inventoryByCategory.minerals.besi.qty -= besiReq;
        if (draft.inventoryByCategory.minerals.besi.qty <= 0) delete draft.inventoryByCategory.minerals.besi;
      }
      if (draft.inventoryByCategory.minerals.batu) {
        draft.inventoryByCategory.minerals.batu.qty -= batuReq;
        if (draft.inventoryByCategory.minerals.batu.qty <= 0) delete draft.inventoryByCategory.minerals.batu;
      }
      draft.coins -= cost;
      draft.totalTables += 1;
    });
    get().enqueueNotification('Meja baru berhasil ditambahkan!', { type: 'success' });
    return true;
  },

  spawnCustomer: () => {
    const state = get();
    if (state.activeCustomers.length >= state.totalTables) return;

    const occupiedTables = state.activeCustomers.map(c => c.tableId);
    let emptyTable = -1;
    for (let i = 0; i < state.totalTables; i++) {
      if (!occupiedTables.includes(i)) { emptyTable = i; break; }
    }
    if (emptyTable === -1) return;

    const customerType = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const prefs = customerType.preferences || [];
    let recipeId = prefs.length > 0 ? prefs[Math.floor(Math.random() * prefs.length)] : 'sup_wortel';
    const recipe = RECIPES.find(r => r.id === recipeId) || RECIPES[0];

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
    };

    set(s => ({ activeCustomers: [...s.activeCustomers, newCustomer] }));
  },

  serveCustomer: (customerId) => {
    const state = get();
    const customerIndex = state.activeCustomers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) return false;

    const customer = state.activeCustomers[customerIndex];
    const recipe = RECIPES.find(r => r.id === customer.recipeId);
    const cat = recipe?.type === 'processing' ? 'processed' : 'cooked';
    const have = state.inventoryByCategory?.[cat]?.[customer.recipeId]?.qty || 0;

    if (have <= 0) {
      get().enqueueNotification(`Anda tidak memiliki ${recipe?.name}! Masak dulu di dapur.`, { icon: '🍽️', type: 'error' });
      return false;
    }

    const patienceRatio = Math.max(0, customer.patience / customer.maxPatience);
    let tipPercent = 0;
    if (patienceRatio > 0.7) tipPercent = 0.5 * customer.tipMultiplier;
    else if (patienceRatio > 0.3) tipPercent = 0.2 * customer.tipMultiplier;

    const basePrice = recipe?.price || 100;
    const finalTip = Math.floor(basePrice * tipPercent);
    const finalEarned = basePrice + finalTip;

    get().addCoins(finalEarned);
    get().addXP(recipe?.xp || 20);

    const newActiveCustomers = [...state.activeCustomers];
    newActiveCustomers.splice(customerIndex, 1);

    set(draft => {
      if (draft.inventoryByCategory[cat]?.[customer.recipeId]) {
        draft.inventoryByCategory[cat][customer.recipeId].qty -= 1;
        if (draft.inventoryByCategory[cat][customer.recipeId].qty <= 0) {
          delete draft.inventoryByCategory[cat][customer.recipeId];
        }
      }
      draft.activeCustomers = newActiveCustomers;
      draft.stats.totalServed = (draft.stats.totalServed || 0) + 1;
    });
    get().checkAchievements?.();
    get().enqueueNotification(`${customer.name} senang! +${finalEarned} 💰 (Tip: ${finalTip})`, { type: 'success' });
    return true;
  },

  tickCustomers: (deltaTime) => {
    const state = get();
    if (!state.activeCustomers || state.activeCustomers.length === 0) return;

    let changed = false;
    const updatedCustomers = [];
    let leftCount = 0;

    state.activeCustomers.forEach(customer => {
      const newPatience = customer.patience - deltaTime;
      if (newPatience <= 0) {
        changed = true;
        leftCount++;
      } else {
        updatedCustomers.push({ ...customer, patience: newPatience });
        if (newPatience !== customer.patience) changed = true;
      }
    });

    if (changed) {
      set({ activeCustomers: updatedCustomers });
      if (leftCount > 0) get().enqueueNotification(`${leftCount} pelanggan pergi karena kehabisan kesabaran!`, { icon: '😡', type: 'error' });
    }
  }
});
