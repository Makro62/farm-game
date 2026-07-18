import { SHOP_SEEDS } from '@/lib/data/crops';
import { SHOP_BUILDINGS, SHOP_DECORATIONS } from '@/lib/data/shop';
import { getItemSellPrice } from '@/lib/data/item-helpers';

export const createTownSlice = (set, get) => ({
  setSelectedBait: (baitId) => set({ selectedBait: baitId }),

  updateMarket: () => {
    const newPrices = {};
    const newTrend = {};

    SHOP_SEEDS.forEach((seed) => {
      const cropId = seed.cropId;
      const base = getItemSellPrice(cropId) || Math.floor(seed.price * 1.5);
      const fluctuation = 0.7 + Math.random() * 0.6;
      newPrices[cropId] = Math.round(base * fluctuation);
      newTrend[cropId] = newPrices[cropId] > base ? 'up' : 'down';
    });

    set({
      todayPrices: newPrices,
      marketTrend: newTrend,
    });
  },

  buyBuilding: (buildingId) => {
    const building = SHOP_BUILDINGS.find((b) => b.id === buildingId);
    if (!building) return { ok: false, message: 'Bangunan tidak dikenal.' };

    const state = get();
    if (state.buildings?.[buildingId]) {
      return { ok: false, message: `${building.name} sudah dimiliki.` };
    }
    if (!get().spendCoins(building.price)) {
      return { ok: false, message: 'Koin tidak cukup!' };
    }
    set((s) => ({
      buildings: { ...(s.buildings || {}), [buildingId]: true },
    }));
    return { ok: true, message: `${building.name} berhasil dibangun!` };
  },

  buyDecoration: (decorId) => {
    const decor = SHOP_DECORATIONS.find((d) => d.id === decorId);
    if (!decor) return { ok: false, message: 'Dekorasi tidak dikenal.' };

    const state = get();
    const owned = state.decorations || [];
    if (owned.includes(decorId)) {
      return { ok: false, message: `${decor.name} sudah dimiliki.` };
    }
    if (!get().spendCoins(decor.price)) {
      return { ok: false, message: 'Koin tidak cukup!' };
    }
    set((s) => ({
      decorations: [...(s.decorations || []), decorId],
    }));
    get().addXP?.(5);
    return { ok: true, message: `${decor.emoji} ${decor.name} dipasang!` };
  },

  giveGift: (npcId, itemId, isLiked) => {
    const state = get();
    if (!state.inventory[itemId] || state.inventory[itemId] <= 0) return null;

    const newInventory = { ...state.inventory, [itemId]: state.inventory[itemId] - 1 };

    const currentNpc = state.npcs[npcId] || { level: 1, points: 0 };
    const pointsGained = isLiked ? 50 : 10;
    let newPoints = currentNpc.points + pointsGained;
    let newLevel = currentNpc.level;
    let leveledUp = false;

    const maxPoints = currentNpc.level * 100;
    if (newPoints >= maxPoints && newLevel < 5) {
      newPoints -= maxPoints;
      newLevel += 1;
      leveledUp = true;
      get().addXP(100 * newLevel);
    }

    set({
      inventory: newInventory,
      npcs: {
        ...state.npcs,
        [npcId]: { level: newLevel, points: newPoints },
      },
    });

    // ===== Stats & Achievement tracking =====
    set(s => ({ stats: { ...s.stats, totalGiftsGiven: (s.stats?.totalGiftsGiven || 0) + 1 } }));
    get().checkAchievements?.();

    return { leveledUp, newLevel, pointsGained };
  },
});
