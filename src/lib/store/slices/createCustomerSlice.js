import { CUSTOMERS } from '@/lib/data/customers';
import { RECIPES } from '@/lib/data/recipes';
import { safePositiveNumber } from '../utils';
import toast from 'react-hot-toast';

export const createCustomerSlice = (set, get) => ({
  // Total tables available in the restaurant (can be upgraded later)
  // Initialized in initialState.js and persisted via partialize

  upgradeTables: () => {
    const state = get();
    if (state.totalTables >= 9) return false;
    
    const cost = state.totalTables * 1000;
    if (state.coins < cost) {
      toast.error('Koin tidak cukup untuk beli meja baru!');
      return false;
    }
    
    set({ coins: state.coins - cost, totalTables: state.totalTables + 1 });
    toast.success('Meja baru berhasil ditambahkan!');
    return true;
  },

  spawnCustomer: () => {
    const state = get();
    // Jika jumlah pelanggan sudah mencapai jumlah meja, batal spawn
    if (state.activeCustomers.length >= state.totalTables) return;

    // Cari meja yang kosong (0-indexed)
    const occupiedTables = state.activeCustomers.map(c => c.tableId);
    let emptyTable = -1;
    for (let i = 0; i < state.totalTables; i++) {
      if (!occupiedTables.includes(i)) {
        emptyTable = i;
        break;
      }
    }
    if (emptyTable === -1) return;

    // Pilih tipe pelanggan random
    const customerType = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    
    // Pilih resep random dari preferensi mereka (atau fallback)
    const prefs = customerType.preferences || [];
    let recipeId = prefs.length > 0 ? prefs[Math.floor(Math.random() * prefs.length)] : 'sup_wortel';
    
    // Pastikan resep valid
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

    set(s => ({
      activeCustomers: [...s.activeCustomers, newCustomer]
    }));
  },

  serveCustomer: (customerId) => {
    const state = get();
    const customerIndex = state.activeCustomers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) return false;

    const customer = state.activeCustomers[customerIndex];
    const recipe = RECIPES.find(r => r.id === customer.recipeId);
    
    // Cek apakah pemain memiliki makanan tersebut
    if (!state.inventory[customer.recipeId] || state.inventory[customer.recipeId] <= 0) {
      toast.error(`Anda tidak memiliki ${recipe?.name}! Masak dulu di dapur.`, { icon: '🍽️' });
      return false;
    }

    // Kurangi makanan dari inventory
    const newInventory = { ...state.inventory };
    newInventory[customer.recipeId] -= 1;
    if (newInventory[customer.recipeId] <= 0) {
      delete newInventory[customer.recipeId];
    }

    // Hitung tip berdasarkan sisa kesabaran
    const patienceRatio = Math.max(0, customer.patience / customer.maxPatience);
    let tipPercent = 0;
    if (patienceRatio > 0.7) tipPercent = 0.5 * customer.tipMultiplier;
    else if (patienceRatio > 0.3) tipPercent = 0.2 * customer.tipMultiplier;

    const basePrice = recipe?.price || 100;
    const finalTip = Math.floor(basePrice * tipPercent);
    const finalEarned = basePrice + finalTip;
    
    // Beri hadiah
    get().addCoins(finalEarned);
    get().addXP(recipe?.xp || 20);

    // Hapus pelanggan
    const newActiveCustomers = [...state.activeCustomers];
    newActiveCustomers.splice(customerIndex, 1);

    set({ 
      inventory: newInventory, 
      activeCustomers: newActiveCustomers 
    });

    toast.success(`${customer.name} senang! +${finalEarned} 💰 (Tip: ${finalTip})`);
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
      if (leftCount > 0) {
        toast.error(`${leftCount} pelanggan pergi karena kehabisan kesabaran!`, { icon: '😡' });
      }
    }
  }
});
