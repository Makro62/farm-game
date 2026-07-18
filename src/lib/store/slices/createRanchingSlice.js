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
          produceTime
        }
      ]
    }));
  },
  
  collectAnimal: (animalId, productType) => {
    const state = get();
    const animal = state.animals.find(a => a.id === animalId);
    if (!animal) return false;
    
    if (!get().consumeEnergy(1)) {
      return false; // UI handles toast
    }
    
    set((state) => ({
      animals: state.animals.map(a => 
        a.id === animalId 
          ? { ...a, lastCollected: Date.now() } 
          : a
      ),
      inventory: {
        ...state.inventory,
        [productType]: (state.inventory[productType] || 0) + 1
      }
    }));

    get().addXP(8);
    get().progressQuest('collect', productType, 1);
    const combo = get().registerCombo?.();
    if (combo?.count >= 3) {
      get().addCoins?.(Math.floor(4 * combo.multiplier));
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
