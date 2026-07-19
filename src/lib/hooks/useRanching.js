import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { getShopAnimal } from '@/lib/data/item-helpers';
import { getAnimalProduceTime } from '@/lib/store/utils';
import { GAME_CONSTANTS } from '@/lib/constants';

export function useRanching() {
  const animals = useGameStore((state) => state.animals);
  const feedAnimal = useGameStore((state) => state.feedAnimal);
  const collectAnimal = useGameStore((state) => state.collectAnimal);
  const workers = useGameStore((state) => state.workers);
  const hireWorker = useGameStore((state) => state.hireWorker);
  const autoFarm = useGameStore((state) => state.autoRancher);
  const toggleAutoFarm = useGameStore((state) => state.toggleAutoRancher);
  const openConfirm = useGameStore((state) => state.openConfirm);
  const buyMultipleAnimals = useGameStore((state) => state.buyMultipleAnimals);
  const weatherEffects = useGameStore((state) => state.weatherEffects);
  const enqueueNotification = useGameStore((state) => state.enqueueNotification);

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAuto = () => {
    if (!workers?.rancher) {
      enqueueNotification('Sewa Peternak Siti dulu di toko samping! 🔒', { icon: '👩‍🌾', type: 'error' });
      return;
    }
    const next = !autoFarm;
    toggleAutoFarm();
    enqueueNotification(
      next ? 'Kurcaci peternak aktif!' : 'Kurcaci peternak istirahat.',
      { id: 'auto-rancher-toggle', type: 'success' }
    );
  };

  const handleSellAnimal = (animal) => {
    const animalData = getShopAnimal(animal.type);
    if (!animalData) return;
    
    // Asumsikan harga jual hewan adalah setengah dari harga beli
    const sellPrice = Math.floor(animalData.price / 2);
    
    openConfirm(
      'Jual Hewan',
      `Apakah Anda yakin ingin menjual ${animalData.name} seharga ${sellPrice} 💰?`,
      () => {
        const price = useGameStore.getState().sellAnimal(animal.id);
        if (price > 0) {
          enqueueNotification(`${animalData.name} berhasil dijual! (+${price} 💰)`, { type: 'success' });
        }
      }
    );
  };

  const handleHireWorker = () => {
    if (workers.rancher) {
      enqueueNotification('Peternak Siti sudah dimiliki! Aktifkan Auto. 👩‍🌾', { icon: '✅', type: 'info' });
      return;
    }
    openConfirm(
      'Sewa Peternak Siti',
      `Sewa Peternak Siti (Auto-Collect Products) seharga ${GAME_CONSTANTS.COSTS.WORKER_RANCHER} 💰?`,
      () => {
        if (hireWorker('rancher', GAME_CONSTANTS.COSTS.WORKER_RANCHER)) {
          enqueueNotification('Peternak Siti berhasil disewa! Auto ternak aktif. 👩‍🌾', { type: 'success' });
        } else {
          enqueueNotification('Koin tidak cukup!', { type: 'error' });
        }
      }
    );
  };

  const handleShopBuy = (animal, amount) => {
    if (buyMultipleAnimals(animal.id, amount, animal.price, animal.time * 1000)) {
      enqueueNotification(`Berhasil membeli ${amount} ${animal.name}!`, { type: 'success' });
    } else {
      enqueueNotification('Koin tidak cukup!', { type: 'error' });
    }
  };

  const handleCollect = (animal) => {
    const animalData = getShopAnimal(animal.type);
    if (!animalData) return;
    const produceTime = getAnimalProduceTime(animal, weatherEffects);
    if (currentTime - animal.lastCollected >= produceTime) {
      if (collectAnimal(animal.id, animalData.product)) {
        enqueueNotification(`Berhasil memanen dari ternak!`, { icon: '✨', id: `harvest-${animal.id}`, type: 'success' });
      }
    }
  };

  const handleFeed = (e, animal) => {
    e.stopPropagation();
    const result = feedAnimal(animal.id);
    if (result.ok) {
      enqueueNotification(result.message, { icon: '🌽', type: 'success' });
    } else {
      enqueueNotification(result.message, { icon: '😢', type: 'error' });
    }
  };

  return {
    animals,
    autoFarm,
    currentTime,
    workers,
    weatherEffects,
    handleToggleAuto,
    handleSellAnimal,
    handleHireWorker,
    handleShopBuy,
    handleCollect,
    handleFeed
  };
}
