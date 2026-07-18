import toast from 'react-hot-toast';
import { ANIMAL_FEED } from '@/lib/data/shop';

export const createRanchingSlice = (set, get) => ({
  buyAnimal: (animalType, produceTime) => {
    set((state) => ({
      animals: [
        ...state.animals,
        {
          id: Date.now() + Math.random().toString(36).substr(2, 5),
          type: animalType,
          status: 'producing',
          lastCollected: Date.now(),
          produceTime,
          fed: false, // track feeding status
        }
      ],
      stats: { ...state.stats, totalAnimalsOwned: (state.stats?.totalAnimalsOwned || 0) + 1 },
    }));
  },

  // ===== Fase B: Sistem Pakan Hewan (Pertanian → Ternak) =====
  feedAnimal: (animalId) => {
    const state = get();
    const animal = state.animals.find(a => a.id === animalId);
    if (!animal) return { ok: false, message: 'Hewan tidak ditemukan.' };
    if (animal.fed) return { ok: false, message: 'Hewan ini sudah kenyang!' };

    const feedData = ANIMAL_FEED[animal.type];
    if (!feedData) return { ok: false, message: 'Tidak ada data pakan untuk hewan ini.' };

    const { feedItem, feedQty } = feedData;
    const have = state.inventory[feedItem] || 0;
    if (have < feedQty) {
      return {
        ok: false,
        message: `Butuh ${feedQty}x ${feedItem} untuk memberi makan ${animal.type}. Kamu hanya punya ${have}.`,
      };
    }

    // Deduct feed from inventory and mark animal as fed
    get().removeItem?.(feedItem, feedQty);
    set(s => ({
      animals: s.animals.map(a =>
        a.id === animalId ? { ...a, fed: true } : a
      ),
      stats: { ...s.stats, totalAnimalsFed: (s.stats?.totalAnimalsFed || 0) + 1 },
    }));
    get().checkAchievements?.();

    return { ok: true, message: `${animal.type} kenyang! +25% chance bonus produksi saat panen.` };
  },


  collectAnimal: (animalId, productType) => {
    const state = get();
    const animal = state.animals.find(a => a.id === animalId);
    if (!animal) return false;
    
    if (!get().consumeEnergy(1)) {
      return false; // UI handles toast
    }

    // ===== Drop Pupuk Kandang 15% chance (Ternak → Ladang) =====
    const dropsFertilizer = Math.random() < 0.15;

    // ===== Fase B: Bonus produksi jika hewan sudah diberi makan =====
    const wasFed = animal.fed === true;
    const bonusDrop = wasFed && Math.random() < 0.25; // 25% bonus drop jika kenyang

    set((state) => ({
      animals: state.animals.map(a => 
        a.id === animalId 
          ? { ...a, lastCollected: Date.now(), fed: false } // reset fed status
          : a
      ),
      inventory: {
        ...state.inventory,
        [productType]: (state.inventory[productType] || 0) + 1 + (bonusDrop ? 1 : 0),
        ...(dropsFertilizer ? { pupuk_kandang: (state.inventory.pupuk_kandang || 0) + 1 } : {}),
      }
    }));

    get().addXP(8 + (wasFed ? 3 : 0)); // Bonus XP jika hewan kenyang
    get().progressQuest('collect', productType, 1 + (bonusDrop ? 1 : 0));
    const combo = get().registerCombo?.();
    if (combo?.count >= 3) {
      get().addCoins?.(Math.floor(4 * combo.multiplier));
    }

    // ===== Stats & Achievement tracking =====
    set(s => ({
      stats: {
        ...s.stats,
        totalCollected: (s.stats?.totalCollected || 0) + 1,
        ...(dropsFertilizer ? { totalFertilizerDropped: (s.stats?.totalFertilizerDropped || 0) + 1 } : {}),
      }
    }));
    get().markSessionAction?.('collected');
    get().checkAchievements?.();

    if (dropsFertilizer) {
      toast('🌿 Dapat Pupuk Kandang! Otomatis dipakai saat tanam.', { duration: 2500 });
    }
    if (bonusDrop) {
      toast(`🌟 Bonus produksi! ${animal.type} yang kenyang menghasilkan ekstra!`, { duration: 2500 });
    }

    return true;
  },

  
  swapAnimals: (id1, id2) => {
    set((state) => {
      const newAnimals = [...state.animals];
      const idx1 = newAnimals.findIndex(a => a.id === id1);
      const idx2 = newAnimals.findIndex(a => a.id === id2);
      if (idx1 !== -1 && idx2 !== -1) {
        const temp = newAnimals[idx1];
        newAnimals[idx1] = newAnimals[idx2];
        newAnimals[idx2] = temp;
      }
      return { animals: newAnimals };
    });
  },
});

