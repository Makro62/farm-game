import type { StoreSet, StoreGet } from "@/types/game";
import { ANIMAL_FEED } from "@/lib/data/shop";
import { GAME_CONSTANTS } from "@/lib/constants";
import { getShopAnimal } from "@/lib/data/item-helpers";
import { safeCoins } from "@/lib/store/utils";

export const createRanchingSlice = (set: StoreSet, get: StoreGet) => ({
  buyAnimal: (animalType, price, produceTime) => {
    const state = get();
    if (safeCoins(state.coins) < price) return false;
    set((state) => ({
      coins: safeCoins(state.coins) - price,
      animals: [
        ...state.animals,
        {
          id: Date.now() + Math.random().toString(36).substr(2, 5),
          type: animalType,
          status: "producing",
          lastCollected: Date.now(),
          produceTime,
          fed: false,
        },
      ],
      stats: {
        ...state.stats,
        totalAnimalsOwned: (state.stats?.totalAnimalsOwned || 0) + 1,
      },
    }));
    return true;
  },

  feedAnimal: (animalId) => {
    const state = get();
    const animal = state.animals.find((a) => a.id === animalId);
    if (!animal) return { ok: false, message: "Hewan tidak ditemukan." };
    if (animal.fed) return { ok: false, message: "Hewan ini sudah kenyang!" };

    const feedData = ANIMAL_FEED[animal.type];
    if (!feedData)
      return { ok: false, message: "Tidak ada data pakan untuk hewan ini." };

    const { feedItem, feedQty } = feedData;
    const catForFeed = (() => {
      if (["gandum", "jagung", "wortel", "kentang", "tebu"].includes(feedItem))
        return "crops";
      if (["apel"].includes(feedItem)) return "crops";
      return "crops";
    })();
    const have = state.inventoryByCategory?.[catForFeed]?.[feedItem]?.qty || 0;
    if (have < feedQty) {
      return {
        ok: false,
        message: `Butuh ${feedQty}x ${feedItem} untuk memberi makan ${animal.type}. Kamu hanya punya ${have}.`,
      };
    }

    set((draft) => {
      if (draft.inventoryByCategory[catForFeed]?.[feedItem]) {
        draft.inventoryByCategory[catForFeed][feedItem].qty -= feedQty;
        if (draft.inventoryByCategory[catForFeed][feedItem].qty <= 0) {
          delete draft.inventoryByCategory[catForFeed][feedItem];
        }
      }
      draft.animals = draft.animals.map((a) =>
        a.id === animalId ? { ...a, fed: true } : a,
      );
      draft.stats.totalAnimalsFed = (draft.stats.totalAnimalsFed || 0) + 1;
    });
    get().checkAchievements?.();
    return {
      ok: true,
      message: `${animal.type} kenyang! +25% chance bonus produksi saat panen.`,
    };
  },

  collectAnimal: (animalId, productType) => {
    const state = get();
    const animal = state.animals.find((a) => a.id === animalId);
    if (!animal) return false;
    if (!get().consumeEnergy(1)) return false;

    if (!animal.fed) {
      const feedData = ANIMAL_FEED[animal.type];
      const feedName = feedData?.feedItem || "pakan";
      get().enqueueNotification(
        `${animal.type} lapar! Beri ${feedName} dulu sebelum kolek.`,
        { icon: "🍽️", type: "error" },
      );
      return false;
    }

    const dropsFertilizer =
      Math.random() < GAME_CONSTANTS.CHANCES.FERTILIZER_DROP;
    const wasFed = animal.fed === true;
    const bonusDrop =
      wasFed && Math.random() < GAME_CONSTANTS.CHANCES.FEED_BONUS;
    const totalDrop = 1 + (bonusDrop ? 1 : 0);
    const productCat = [
      "telur",
      "susu",
      "bulu",
      "truffle",
      "tapal",
      "telur_bebek",
    ].includes(productType)
      ? "animalProducts"
      : "collectibles";

    set((state) => ({
      animals: state.animals.map((a) =>
        a.id === animalId ? { ...a, lastCollected: Date.now(), fed: false } : a,
      ),
      inventoryByCategory: (() => {
        const cat = { ...(state.inventoryByCategory?.[productCat] || {}) };
        const existing = cat[productType] || {
          qty: 0,
          quality: "normal",
          acquiredAt: Date.now(),
        };
        cat[productType] = { ...existing, qty: existing.qty + totalDrop };
        const updates = { ...state.inventoryByCategory, [productCat]: cat };
        if (dropsFertilizer) {
          const col = { ...(updates.collectibles || {}) };
          const f = col.pupuk_kandang || {
            qty: 0,
            quality: "normal",
            acquiredAt: Date.now(),
          };
          col.pupuk_kandang = { ...f, qty: f.qty + 1 };
          updates.collectibles = col;
        }
        return updates;
      })(),
    }));

    get().addXP(
      GAME_CONSTANTS.XP.COLLECT + (wasFed ? GAME_CONSTANTS.XP.FEED_BONUS : 0),
    );
    get().progressQuest("collect", productType, totalDrop);
    const combo = get().registerCombo?.();
    if (combo?.count >= 3) get().addCoins?.(Math.floor(4 * combo.multiplier));

    set((s) => ({
      stats: {
        ...s.stats,
        totalCollected: (s.stats?.totalCollected || 0) + 1,
        ...(dropsFertilizer
          ? {
              totalFertilizerDropped:
                (s.stats?.totalFertilizerDropped || 0) + 1,
            }
          : {}),
      },
    }));
    get().markSessionAction?.("collected");
    get().checkAchievements?.();

    if (dropsFertilizer)
      get().enqueueNotification(
        "🌿 Dapat Pupuk Kandang! Otomatis dipakai saat tanam.",
        { duration: 2500 },
      );
    if (bonusDrop)
      get().enqueueNotification(
        `🌟 Bonus produksi! ${animal.type} yang kenyang menghasilkan ekstra!`,
        { duration: 2500 },
      );
    return true;
  },

  sellAnimal: (animalId) => {
    const state = get();
    const animal = state.animals.find((a) => a.id === animalId);
    if (!animal) return 0;
    const animalData = getShopAnimal(animal.type);
    const sellPrice = animalData ? Math.floor(animalData.price / 2) : 0;
    set((s) => ({
      animals: s.animals.filter((a) => a.id !== animalId),
      coins: safeCoins(s.coins) + sellPrice,
    }));
    return sellPrice;
  },

  swapAnimals: (id1, id2) => {
    set((state) => {
      const newAnimals = [...state.animals];
      const idx1 = newAnimals.findIndex((a) => a.id === id1);
      const idx2 = newAnimals.findIndex((a) => a.id === id2);
      if (idx1 !== -1 && idx2 !== -1)
        [newAnimals[idx1], newAnimals[idx2]] = [
          newAnimals[idx2],
          newAnimals[idx1],
        ];
      return { animals: newAnimals };
    });
  },
});
