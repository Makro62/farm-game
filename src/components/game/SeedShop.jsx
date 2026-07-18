import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { CropIcon } from '../ui/CropIcon';
import { SHOP_SEEDS } from '../../lib/data/crops';
import { ShopItemCard, ShopSectionTitle } from '../ui/ShopItemCard';
import { GAME_CONSTANTS } from '@/lib/constants';
import toast from 'react-hot-toast';

export function SeedShop() {
  const inventory = useGameStore(state => state.inventory);
  const buyItem = useGameStore(state => state.buyItem);
  const workers = useGameStore(state => state.workers);
  const hireWorker = useGameStore(state => state.hireWorker);
  const autoFarm = useGameStore(state => state.autoFarmer);
  const selectedInventoryItem = useGameStore(state => state.selectedSeed);
  const setSelectedInventoryItem = useGameStore(state => state.setSelectedSeed);
  const openConfirm = useGameStore(state => state.openConfirm);
  const currentSeason = useGameStore(state => state.season.current);
  const buildings = useGameStore(state => state.buildings);

  const [shopAmounts, setShopAmounts] = useState({});

  const availableSeeds = SHOP_SEEDS.filter((s) => {
    if (buildings?.greenhouse) return true;
    return s.season === 'all' || s.season === currentSeason;
  });

  const seasonLabel = {
    spring: '🌸 Spring',
    summer: '☀️ Summer',
    autumn: '🍂 Autumn',
    winter: '❄️ Winter',
  }[currentSeason] || currentSeason;

  const handleHireFarmer = () => {
    if (workers?.farmer) {
      toast('Petani Budi sudah dimiliki! Aktifkan Auto. 👨‍🌾', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Petani Budi',
      `Sewa Petani Budi (Auto-Farm & Harvest) seharga ${GAME_CONSTANTS.COSTS.WORKER_FARMER} 💰?`,
      () => {
        if (hireWorker('farmer', GAME_CONSTANTS.COSTS.WORKER_FARMER)) {
          toast.success('Petani Budi disewa! Auto farm sudah aktif. 👨‍🌾');
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleShopBuy = (item, amount) => {
    if (buyItem(item.id, amount, item.price)) {
      toast.success(`Berhasil membeli ${amount} ${item.name}!`);
    } else {
      toast.error('Koin tidak cukup!');
    }
  };

  return (
    <>
      <ShopSectionTitle icon="🛒">Bibit Toko ({seasonLabel})</ShopSectionTitle>
      {buildings?.greenhouse && (
        <p className="text-[10px] text-[var(--primary-dark)] mb-2 font-bold">Greenhouse aktif — semua musim tersedia</p>
      )}
      <div className="shop-grid mb-6">
        {availableSeeds.length === 0 ? (
          <div className="col-span-full text-center text-sm text-[var(--text-secondary)] italic py-2">
            Tidak ada bibit untuk musim ini.
          </div>
        ) : availableSeeds.map((seed) => {
          const amt = shopAmounts[seed.id] || 1;
          return (
            <ShopItemCard
              key={`shop-${seed.id}`}
              icon={<CropIcon itemId={seed.id} className="shop-item-icon" />}
              name={`${seed.name}${seed.season !== 'all' ? ` · ${seed.season}` : ''}`}
              price={seed.price}
              amount={amt}
              onDecrease={() => setShopAmounts(p => ({ ...p, [seed.id]: Math.max(1, amt - 1) }))}
              onIncrease={() => setShopAmounts(p => ({ ...p, [seed.id]: amt + 1 }))}
              onBuy={() => handleShopBuy(seed, amt)}
              dataTutorial={seed.id === 'crop_carrot' ? 'shop-seed' : undefined}
            />
          );
        })}
      </div>

      <ShopSectionTitle icon="🌱">Bibit Tanaman</ShopSectionTitle>
      <div className="glass-card p-3 mb-6">
        {SHOP_SEEDS.filter(s => inventory[s.id] > 0).length === 0 ? (
          <div className="text-center text-sm text-[var(--text-secondary)] font-bold py-2">Belum ada bibit di Inventory.</div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {SHOP_SEEDS.filter(s => inventory[s.id] > 0).map(seed => (
              <button
                key={`inv-${seed.id}`}
                onClick={() => setSelectedInventoryItem(seed.id)}
                className={`p-2 glass-card flex flex-col items-center gap-1 transition-all border-2
                  ${selectedInventoryItem === seed.id ? 'border-[var(--primary)] bg-[var(--primary)]/20 shadow-inner scale-105' : 'border-transparent hover:bg-black/5'}`}
              >
                <span className="text-2xl relative drop-shadow-sm">
                  <CropIcon itemId={seed.id} />
                  <span className="absolute -bottom-2 -right-2 bg-[var(--gold)] text-[var(--text-primary)] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm border border-[#FFF1B8]">
                    {inventory[seed.id]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <ShopSectionTitle icon="🧑‍🌾">Pekerja (Auto)</ShopSectionTitle>
      <button
        onClick={handleHireFarmer}
        className={`w-full glass-card p-2 flex justify-between items-center transition-colors text-left mb-2 ${
          workers?.farmer ? 'border-[var(--primary)] bg-[var(--primary)]/10' : ''
        }`}
      >
        <div>
          <div className="font-bold text-[var(--text-primary)] text-sm">Petani Budi</div>
          <div className="text-[10px] text-[var(--text-secondary)]">Auto-Farm & Harvest</div>
        </div>
        <span className="font-bold text-[var(--text-primary)] bg-[var(--gold)] px-2 py-0.5 rounded-xl text-xs whitespace-nowrap border border-[#FFF1B8]">
          {workers?.farmer ? 'Dimiliki' : `${GAME_CONSTANTS.COSTS.WORKER_FARMER} 💰`}
        </span>
      </button>
      {workers?.farmer && (
        <p className="text-[10px] text-[var(--text-secondary)] mb-2 font-medium">
          {autoFarm
            ? SHOP_SEEDS.some((s) => (inventory[s.id] || 0) > 0)
              ? 'Kurcaci aktif — panen & tanam otomatis'
              : 'Auto ON — beli bibit agar bisa menanam'
            : 'Nyalakan tombol Auto di atas untuk mulai'}
        </p>
      )}
    </>
  );
}
