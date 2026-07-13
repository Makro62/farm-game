export const createTownSlice = (set, get) => ({
  // Market
  todayPrices: {},
  marketTrend: {},
  
  // NPCs & Events
  npcs: {
    maria: { level: 1, points: 0 },
    botan: { level: 1, points: 0 },
    hadi:  { level: 1, points: 0 }
  },
  activeEvent: null,

  // Fishing gear
  selectedBait: null,
  setSelectedBait: (baitId) => set({ selectedBait: baitId }),

  // Kota upgrades
  buildings: {
    silo: false,
    greenhouse: false,
  },
  decorations: [],

  updateMarket: () => {
    const crops = ['wortel', 'jagung', 'tomat', 'stroberi', 'gandum', 'semangka', 'jamur', 'tulip', 'apel', 'labu'];
    const basePrices = {
      wortel: 15,
      jagung: 20,
      tomat: 35,
      stroberi: 75,
      gandum: 90,
      semangka: 120,
      jamur: 400,
      tulip: 100,
      apel: 110,
      labu: 110,
    };
    
    const newPrices = {};
    const newTrend = {};
    
    crops.forEach(crop => {
      const base = basePrices[crop];
      const fluctuation = 0.7 + Math.random() * 0.6;
      newPrices[crop] = Math.round(base * fluctuation);
      newTrend[crop] = newPrices[crop] > base ? 'up' : 'down';
    });
    
    // Jangan naikkan day di sini — hanya refresh harga pasar
    set({
      todayPrices: newPrices,
      marketTrend: newTrend,
    });
  },

  buyBuilding: (buildingId) => {
    const BUILDINGS = {
      silo: { cost: 2000, name: 'Silo' },
      greenhouse: { cost: 5000, name: 'Greenhouse' },
    };
    const building = BUILDINGS[buildingId];
    if (!building) return { ok: false, message: 'Bangunan tidak dikenal.' };

    const state = get();
    if (state.buildings?.[buildingId]) {
      return { ok: false, message: `${building.name} sudah dimiliki.` };
    }
    if (!get().spendCoins(building.cost)) {
      return { ok: false, message: 'Koin tidak cukup!' };
    }
    set((s) => ({
      buildings: { ...(s.buildings || {}), [buildingId]: true },
    }));
    return { ok: true, message: `${building.name} berhasil dibangun!` };
  },

  buyDecoration: (decorId) => {
    const DECORS = {
      bunga: { cost: 300, name: 'Pot Bunga', emoji: '🪴' },
      air_mancur: { cost: 800, name: 'Air Mancur', emoji: '⛲' },
      patung: { cost: 1500, name: 'Patung Koin', emoji: '🗿' },
    };
    const decor = DECORS[decorId];
    if (!decor) return { ok: false, message: 'Dekorasi tidak dikenal.' };

    const state = get();
    const owned = state.decorations || [];
    if (owned.includes(decorId)) {
      return { ok: false, message: `${decor.name} sudah dimiliki.` };
    }
    if (!get().spendCoins(decor.cost)) {
      return { ok: false, message: 'Koin tidak cukup!' };
    }
    set((s) => ({
      decorations: [...(s.decorations || []), decorId],
    }));
    return { ok: true, message: `${decor.emoji} ${decor.name} dipasang!` };
  },

  giveGift: (npcId, itemId, isLiked) => {
    const state = get();
    if (!state.inventory[itemId] || state.inventory[itemId] <= 0) return null;

    // Decrease item
    const newInventory = { ...state.inventory, [itemId]: state.inventory[itemId] - 1 };
    
    // Add points
    const currentNpc = state.npcs[npcId] || { level: 1, points: 0 };
    const pointsGained = isLiked ? 50 : 10;
    let newPoints = currentNpc.points + pointsGained;
    let newLevel = currentNpc.level;
    let leveledUp = false;

    const maxPoints = currentNpc.level * 100;
    if (newPoints >= maxPoints && newLevel < 5) { // max level 5
      newPoints -= maxPoints;
      newLevel += 1;
      leveledUp = true;
      // Reward user
      get().addXP(100 * newLevel);
    }

    set({
      inventory: newInventory,
      npcs: {
        ...state.npcs,
        [npcId]: { level: newLevel, points: newPoints }
      }
    });

    return { leveledUp, newLevel, pointsGained };
  },
});
