import type { StoreSet, StoreGet } from "@/types/game";
import { SHOP_BUILDINGS, SHOP_DECORATIONS } from "@/lib/data/shop";
import { getItemSellPrice } from "@/lib/data/item-helpers";

export const createTownSlice = (set: StoreSet, get: StoreGet) => ({
  setSelectedBait: (baitId) => set({ selectedBait: baitId }),

  updateMarket: () => {
    const newPrices = {};
    const newTrend = {};
    const crops = [
      "wortel", "jagung", "tomat", "stroberi", "semangka",
      "jamur", "nanas", "labu", "kentang", "gandum",
      "tebu", "tulip", "apel",
    ];
    
    // Pick one crop to boom and one to crash (randomly)
    const boomIndex = Math.floor(Math.random() * crops.length);
    let crashIndex = Math.floor(Math.random() * crops.length);
    while (crashIndex === boomIndex) {
      crashIndex = Math.floor(Math.random() * crops.length);
    }
    
    crops.forEach((cropId, index) => {
      const base = getItemSellPrice(cropId) || 20;
      let fluctuation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      
      if (index === boomIndex) {
        fluctuation = 2.0 + Math.random(); // 2.0 to 3.0 (Boom!)
      } else if (index === crashIndex) {
        fluctuation = 0.3 + Math.random() * 0.2; // 0.3 to 0.5 (Crash!)
      }

      newPrices[cropId] = Math.round(base * fluctuation);
      
      if (index === boomIndex) newTrend[cropId] = "boom";
      else if (index === crashIndex) newTrend[cropId] = "crash";
      else newTrend[cropId] = newPrices[cropId] > base ? "up" : "down";
    });
    set({ todayPrices: newPrices, marketTrend: newTrend });
  },

  buyBuilding: (buildingId) => {
    const building = SHOP_BUILDINGS.find((b) => b.id === buildingId);
    if (!building) return { ok: false, message: "Bangunan tidak dikenal." };

    const state = get();
    if (state.buildings?.[buildingId])
      return { ok: false, message: `${building.name} sudah dimiliki.` };
    if (!get().spendCoins(building.price))
      return { ok: false, message: "Koin tidak cukup!" };

    const mineralReq = {
      silo: { batu: 20, besi: 10 },
      greenhouse: { batu: 30, tembaga: 15, emas: 5 },
    }[buildingId];
    if (mineralReq) {
      for (const [mineral, qty] of Object.entries(mineralReq)) {
        if ((state.inventoryByCategory?.minerals?.[mineral]?.qty || 0) < (qty as number)) {
          get().addCoins(building.price);
          return {
            ok: false,
            message: `Butuh ${qty}x ${mineral} dari Tambang untuk membangun ${building.name}!`,
          };
        }
      }
      set((draft) => {
        for (const [mineral, qty] of Object.entries(mineralReq)) {
          if (draft.inventoryByCategory.minerals[mineral]) {
            draft.inventoryByCategory.minerals[mineral].qty -= qty as number;
            if (draft.inventoryByCategory.minerals[mineral].qty <= 0) {
              delete draft.inventoryByCategory.minerals[mineral];
            }
          }
        }
      });
    }

    set((s) => ({ buildings: { ...(s.buildings || {}), [buildingId]: true } }));
    return { ok: true, message: `${building.name} berhasil dibangun!` };
  },

  buyDecoration: (decorId) => {
    const decor = SHOP_DECORATIONS.find((d) => d.id === decorId);
    if (!decor) return { ok: false, message: "Dekorasi tidak dikenal." };

    const state = get();
    const owned = state.decorations || [];
    if (owned.includes(decorId))
      return { ok: false, message: `${decor.name} sudah dimiliki.` };
    if (!get().spendCoins(decor.price))
      return { ok: false, message: "Koin tidak cukup!" };

    set((s) => ({ decorations: [...(s.decorations || []), decorId] }));
    get().addXP?.(5);
    return { ok: true, message: `${decor.emoji} ${decor.name} dipasang!` };
  },

  giveGift: (npcId, itemId, isLiked) => {
    const state = get();
    const itemCategory = getItemCategory(itemId);
    if (
      !itemCategory ||
      (state.inventoryByCategory?.[itemCategory]?.[itemId]?.qty || 0) <= 0
    )
      return null;

    set((draft) => {
      if (draft.inventoryByCategory[itemCategory]?.[itemId]) {
        draft.inventoryByCategory[itemCategory][itemId].qty -= 1;
        if (draft.inventoryByCategory[itemCategory][itemId].qty <= 0) {
          delete draft.inventoryByCategory[itemCategory][itemId];
        }
      }
    });

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
      npcs: { ...state.npcs, [npcId]: { level: newLevel, points: newPoints } },
    });

    set((s) => ({
      stats: {
        ...s.stats,
        totalGiftsGiven: (s.stats?.totalGiftsGiven || 0) + 1,
      },
    }));
    get().checkAchievements?.();
    return { leveledUp, newLevel, pointsGained };
  },
});

function getItemCategory(itemId) {
  const catMap = {
    wortel: "crops",
    jagung: "crops",
    tomat: "crops",
    stroberi: "crops",
    semangka: "crops",
    jamur: "crops",
    nanas: "crops",
    labu: "crops",
    kentang: "crops",
    gandum: "crops",
    tebu: "crops",
    tulip: "crops",
    apel: "crops",
    telur: "animalProducts",
    susu: "animalProducts",
    bulu: "animalProducts",
    truffle: "animalProducts",
    tapal: "animalProducts",
    telur_bebek: "animalProducts",
    batu: "minerals",
    tembaga: "minerals",
    besi: "minerals",
    emas: "minerals",
    berlian: "minerals",
    ikan_mas: "fish",
    lele: "fish",
    ikan_badut: "fish",
    cumi: "fish",
    gurita: "fish",
    tepung_jagung: "processed",
    gula: "processed",
    saus_tomat: "processed",
    keju: "processed",
    sup_wortel: "cooked",
    nasi_goreng: "cooked",
    roti_gandum: "cooked",
    es_teh: "cooked",
    kue_wortel: "cooked",
    sushi_mas: "cooked",
    kue_manis: "cooked",
    pancake: "cooked",
    takoyaki: "cooked",
    nasi_jamur: "cooked",
    kue_apel: "cooked",
    kue_stroberi: "cooked",
    sushi_emas: "cooked",
    lele_bakar: "cooked",
  };
  return catMap[itemId] || null;
}
