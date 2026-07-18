import { getItemSellPrice, isSellableProduce } from '../../data/item-helpers';
import { SHOP_SEEDS } from '../../data/crops';
import { FISHES } from '../../data/fishes';
import { safeCoins, safePositiveNumber } from '../utils';

export const createEconomySlice = (set, get) => ({
  // ===== COIN MANAGEMENT =====
  buyItem: (itemId, amount, unitPrice) => {
    const state = get();
    const qty = safePositiveNumber(amount, 0);
    const price = safePositiveNumber(unitPrice, 0);
    const totalCost = price * qty;

    if (qty <= 0 || totalCost <= 0) return false;

    const currentCoins = safeCoins(state.coins);
    if (currentCoins < totalCost) return false;

    set((state) => ({
      coins: currentCoins - totalCost,
      inventory: {
        ...state.inventory,
        [itemId]: (state.inventory[itemId] || 0) + qty,
      },
    }));
    return true;
  },

  addCoins: (amount) => {
    const delta = Number(amount);
    if (!Number.isFinite(delta) || delta <= 0) return;
    set((state) => ({ coins: safeCoins(state.coins) + Math.floor(delta) }));
  },
  
  spendCoins: (amount) => {
    const cost = Number(amount);
    if (!Number.isFinite(cost) || cost <= 0) return false;

    const currentCoins = safeCoins(get().coins);
    if (currentCoins < cost) return false;

    set({ coins: currentCoins - Math.floor(cost) });
    return true;
  },

  sellItem: (itemId, quantity) => {
    const state = get();
    const have = Number(state.inventory[itemId] || 0);
    const qty = Math.min(have, Math.max(0, Number(quantity) || 0));
    if (qty <= 0) return 0;

    let sellPrice = getItemSellPrice(itemId);
    if (sellPrice == null || !Number.isFinite(sellPrice)) return 0;

    const todayPrices = state.todayPrices || {};
    const activeEvent = state.activeEvent;

    if (todayPrices[itemId]) sellPrice = todayPrices[itemId];
    if (activeEvent?.id === 'panen' && SHOP_SEEDS.some((s) => s.cropId === itemId)) sellPrice *= 2;
    if (activeEvent?.id === 'bahari' && FISHES.some((f) => f.id === itemId)) sellPrice *= 2;
    if (state.buildings?.silo && SHOP_SEEDS.some((s) => s.cropId === itemId)) sellPrice *= 1.15;

    const multiplier = safePositiveNumber(state.coinMultiplier, 1) || 1;
    const finalEarned = Math.round(sellPrice * qty * multiplier);

    const newInventory = { ...state.inventory };
    const next = have - qty;
    if (next <= 0) delete newInventory[itemId];
    else newInventory[itemId] = next;

    set({
      inventory: newInventory,
      coins: safeCoins(state.coins) + finalEarned,
    });
    return finalEarned;
  },

  sellAllInventory: () => {
    const state = get();
    let totalEarned = 0;
    const newInventory = { ...state.inventory };
    const todayPrices = state.todayPrices || {};
    const activeEvent = state.activeEvent;

    Object.entries(newInventory).forEach(([itemId, amount]) => {
      const qty = Number(amount);
      if (!Number.isFinite(qty) || qty <= 0) return;
      if (!isSellableProduce(itemId)) return;

      let sellPrice = getItemSellPrice(itemId);

      if (sellPrice != null && Number.isFinite(sellPrice)) {
        if (todayPrices[itemId]) {
          sellPrice = todayPrices[itemId];
        }

        if (activeEvent?.id === 'panen' && SHOP_SEEDS.some((s) => s.cropId === itemId)) {
          sellPrice *= 2;
        } else if (activeEvent?.id === 'bahari' && FISHES.some((f) => f.id === itemId)) {
          sellPrice *= 2;
        }

        if (state.buildings?.silo && SHOP_SEEDS.some((s) => s.cropId === itemId)) {
          sellPrice *= 1.15;
        }

        totalEarned += sellPrice * qty;
        delete newInventory[itemId];
      }
    });

    if (totalEarned <= 0) return 0;

    const multiplier = safePositiveNumber(state.coinMultiplier, 1) || 1;
    const finalEarned = Math.round(totalEarned * multiplier);
    set({
      inventory: newInventory,
      coins: safeCoins(state.coins) + finalEarned,
    });
    return finalEarned;
  },
});
