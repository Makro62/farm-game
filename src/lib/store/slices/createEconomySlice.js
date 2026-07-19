import { getItemSellPrice, isSellableProduce } from "../../data/item-helpers";
import { SHOP_SEEDS } from "../../data/crops";
import { FISHES } from "../../data/fishes";
import { safeCoins, safePositiveNumber } from "../utils";

export const createEconomySlice = (set, get) => ({
  buyItem: (itemId, amount, unitPrice) => {
    const state = get();
    const qty = safePositiveNumber(amount, 0);
    const price = safePositiveNumber(unitPrice, 0);
    const totalCost = price * qty;
    if (qty <= 0 || totalCost <= 0) return false;
    const currentCoins = safeCoins(state.coins);
    if (currentCoins < totalCost) return false;

    const cat = getItemCategory(itemId) || "collectibles";
    set((draft) => {
      draft.coins = currentCoins - totalCost;
      if (!draft.inventoryByCategory[cat][itemId]) {
        draft.inventoryByCategory[cat][itemId] = {
          qty: 0,
          quality: "normal",
          acquiredAt: Date.now(),
        };
      }
      draft.inventoryByCategory[cat][itemId].qty += qty;
    });
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
    const cat = getItemCategory(itemId);
    if (!cat) return 0;
    const have = state.inventoryByCategory[cat]?.[itemId]?.qty || 0;
    const qty = Math.min(have, Math.max(0, Number(quantity) || 0));
    if (qty <= 0) return 0;

    let sellPrice = getItemSellPrice(itemId);
    if (sellPrice == null || !Number.isFinite(sellPrice)) return 0;

    const todayPrices = state.todayPrices || {};
    const activeEvent = state.activeEvent;
    if (todayPrices[itemId]) sellPrice = todayPrices[itemId];
    if (
      activeEvent?.id === "panen" &&
      SHOP_SEEDS.some((s) => s.cropId === itemId)
    )
      sellPrice *= 2;
    if (activeEvent?.id === "bahari" && FISHES.some((f) => f.id === itemId))
      sellPrice *= 2;
    if (state.buildings?.silo && SHOP_SEEDS.some((s) => s.cropId === itemId))
      sellPrice *= 1.15;

    const multiplier = safePositiveNumber(state.coinMultiplier, 1) || 1;
    const finalEarned = Math.round(sellPrice * qty * multiplier);

    set((draft) => {
      if (draft.inventoryByCategory[cat]?.[itemId]) {
        draft.inventoryByCategory[cat][itemId].qty -= qty;
        if (draft.inventoryByCategory[cat][itemId].qty <= 0) {
          delete draft.inventoryByCategory[cat][itemId];
        }
      }
      draft.coins = safeCoins(draft.coins) + finalEarned;
    });
    return finalEarned;
  },

  sellAllInventory: () => {
    const state = get();
    let totalEarned = 0;
    const todayPrices = state.todayPrices || {};
    const activeEvent = state.activeEvent;
    const toSell = {};

    for (const [cat, items] of Object.entries(state.inventoryByCategory)) {
      for (const [itemId, data] of Object.entries(items)) {
        if (!isSellableProduce(itemId)) continue;
        let sellPrice = getItemSellPrice(itemId);
        if (sellPrice == null) continue;
        if (todayPrices[itemId]) sellPrice = todayPrices[itemId];
        if (
          activeEvent?.id === "panen" &&
          SHOP_SEEDS.some((s) => s.cropId === itemId)
        )
          sellPrice *= 2;
        else if (
          activeEvent?.id === "bahari" &&
          FISHES.some((f) => f.id === itemId)
        )
          sellPrice *= 2;
        if (
          state.buildings?.silo &&
          SHOP_SEEDS.some((s) => s.cropId === itemId)
        )
          sellPrice *= 1.15;
        totalEarned += sellPrice * data.qty;
        toSell[`${cat}.${itemId}`] = true;
      }
    }

    if (totalEarned <= 0) return 0;
    const multiplier = safePositiveNumber(state.coinMultiplier, 1) || 1;
    const finalEarned = Math.round(totalEarned * multiplier);

    set((draft) => {
      for (const key of Object.keys(toSell)) {
        const [cat, itemId] = key.split(".");
        delete draft.inventoryByCategory[cat]?.[itemId];
      }
      draft.coins = safeCoins(draft.coins) + finalEarned;
    });
    return finalEarned;
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
