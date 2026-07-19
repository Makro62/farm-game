'use client';

import { useState } from 'react';
import { useGameStore, useInventory } from '@/lib/store';
import { SHOP_BAIT, SHOP_BUILDINGS, SHOP_DECORATIONS } from '@/lib/data/shop';
import { ShopItemCard, ShopSectionTitle } from '../ui/ShopItemCard';
import { GameActionButton } from '../ui/GameAreaHeader';
import { GAME_CONSTANTS } from '@/lib/constants';
import toast from 'react-hot-toast';

export function TownShop() {
  const inventory = useInventory();
  const buyItem = useGameStore((s) => s.buyItem);
  const workers = useGameStore((s) => s.workers);
  const hireWorker = useGameStore((s) => s.hireWorker);
  const selectedBait = useGameStore((s) => s.selectedBait);
  const setSelectedBait = useGameStore((s) => s.setSelectedBait);
  const openConfirm = useGameStore((s) => s.openConfirm);
  const buildings = useGameStore((s) => s.buildings);
  const decorations = useGameStore((s) => s.decorations);
  const buyBuilding = useGameStore((s) => s.buyBuilding);
  const buyDecoration = useGameStore((s) => s.buyDecoration);
  const addXP = useGameStore((s) => s.addXP);

  const [shopAmounts, setShopAmounts] = useState({});
  const [shopTab, setShopTab] = useState('bangunan'); // bangunan | umpan

  const ownedBlueprints = [
    ...SHOP_BUILDINGS.filter((b) => buildings?.[b.id]),
    ...SHOP_DECORATIONS.filter((d) => (decorations || []).includes(d.id)),
  ];

  const handleShopBuy = (item, amount) => {
    if (buyItem(item.id, amount, item.price)) {
      toast.success(`Berhasil membeli ${amount} ${item.name}!`);
    } else {
      toast.error('Koin tidak cukup!');
    }
  };

  const handleHireFisher = () => {
    if (workers?.fisher) {
      toast('Pemancing Kota sudah disewa! Aktifkan Auto.', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Pemancing Kota',
      `Sewa Pemancing Kota (Auto-mancing) seharga ${GAME_CONSTANTS.COSTS.FISHER_WORKER} 💰?`,
      () => {
        if (hireWorker('fisher', GAME_CONSTANTS.COSTS.FISHER_WORKER)) {
          toast.success('Pemancing Kota disewa! Auto mancing aktif.');
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleBuyDecoration = (item) => {
    const result = buyDecoration(item.id);
    if (result.ok) {
      addXP(5);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleBuyBuilding = (item) => {
    const result = buyBuilding(item.id);
    if (result.ok) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <div className="flex gap-1.5 mb-4">
        <GameActionButton
          variant="toggle"
          active={shopTab === 'bangunan'}
          onClick={() => setShopTab('bangunan')}
          className="flex-1"
        >
          Bangunan
        </GameActionButton>
        <GameActionButton
          variant="toggle"
          active={shopTab === 'umpan'}
          onClick={() => setShopTab('umpan')}
          className="flex-1"
        >
          Umpan
        </GameActionButton>
      </div>

      {shopTab === 'bangunan' ? (
        <>
          <ShopSectionTitle icon="🏗️">Shop Bangunan</ShopSectionTitle>
          <div className="shop-grid mb-6">
            {[...SHOP_BUILDINGS, ...SHOP_DECORATIONS].map((item) => {
              const owned =
                !!buildings?.[item.id] || (decorations || []).includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={owned}
                  onClick={() =>
                    SHOP_BUILDINGS.some((b) => b.id === item.id)
                      ? handleBuyBuilding(item)
                      : handleBuyDecoration(item)
                  }
                  className={`shop-item-card text-left ${owned ? 'opacity-60 cursor-default' : 'hover:brightness-105'}`}
                >
                  <div className="shop-item-info">
                    <span className="shop-item-icon">{item.emoji}</span>
                    <span className="shop-item-name">{item.name}</span>
                    <span className="text-[9px] text-[var(--text-secondary)] line-clamp-2">{item.desc}</span>
                    <span className="shop-item-price mt-1">
                      {owned ? 'Dimiliki' : `${item.price} 💰`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <ShopSectionTitle icon="📜">Cetak Biru Saya</ShopSectionTitle>
          <div className="glass-card p-3 mb-4">
            {ownedBlueprints.length === 0 ? (
              <div className="text-center text-sm text-[var(--text-secondary)] italic font-bold py-2">
                Belum ada bangunan. Beli di atas dulu.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {ownedBlueprints.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl bg-[#E8F0FF] border-2 border-[#7EB8E8] flex flex-col items-center gap-1"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-[9px] font-bold text-[var(--text-primary)] text-center leading-tight">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <ShopSectionTitle icon="🎣">Shop Umpan</ShopSectionTitle>
          <p className="text-[10px] text-[var(--text-secondary)] mb-2 font-medium">
            Pilih umpan sebelum mancing di danau.
          </p>
          <div className="shop-grid mb-6">
            {SHOP_BAIT.map((bait) => {
              const amt = shopAmounts[bait.id] || 1;
              return (
                <ShopItemCard
                  key={bait.id}
                  icon={bait.emoji}
                  name={bait.name}
                  price={bait.price}
                  amount={amt}
                  onDecrease={() => setShopAmounts((p) => ({ ...p, [bait.id]: Math.max(1, amt - 1) }))}
                  onIncrease={() => setShopAmounts((p) => ({ ...p, [bait.id]: amt + 1 }))}
                  onBuy={() => handleShopBuy(bait, amt)}
                />
              );
            })}
          </div>

          <ShopSectionTitle icon="🪱">Umpan Siap Pakai</ShopSectionTitle>
          <div className="glass-card p-3 mb-4">
            {SHOP_BAIT.filter((b) => (inventory[b.id] || 0) > 0).length === 0 ? (
              <div className="text-center text-sm text-[var(--text-secondary)] font-bold py-2">
                Belum ada umpan.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {SHOP_BAIT.filter((b) => (inventory[b.id] || 0) > 0).map((bait) => (
                  <button
                    key={bait.id}
                    type="button"
                    onClick={() => setSelectedBait(selectedBait === bait.id ? null : bait.id)}
                    className={`p-2 glass-card flex flex-col items-center gap-1 transition-all border-2
                      ${
                        selectedBait === bait.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/15 scale-105'
                          : 'border-transparent'
                      }`}
                  >
                    <span className="text-2xl relative">
                      {bait.emoji}
                      <span className="absolute -bottom-2 -right-2 bg-[var(--gold)] text-[var(--text-primary)] text-[9px] font-black px-1.5 py-0.5 rounded-full border border-[#FFF1B8]">
                        {inventory[bait.id]}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ShopSectionTitle icon="🧑‍🌾">Pekerja (Auto)</ShopSectionTitle>
      <button
        type="button"
        onClick={handleHireFisher}
        className={`w-full glass-card p-2 flex justify-between items-center transition-colors text-left mb-2 ${
          workers?.fisher ? 'border-[var(--primary)] bg-[var(--primary)]/10' : ''
        }`}
      >
        <div>
          <div className="font-bold text-[var(--text-primary)] text-sm">Pemancing Kota</div>
          <div className="text-[10px] text-[var(--text-secondary)]">Auto-mancing di danau</div>
        </div>
        <span className="font-bold text-[var(--text-primary)] bg-[var(--gold)] px-2 py-0.5 rounded-full text-xs whitespace-nowrap border border-[#FFF1B8]">
          {workers?.fisher ? 'Disewa' : `${GAME_CONSTANTS.COSTS.FISHER_WORKER}💰`}
        </span>
      </button>
      {workers?.fisher && (
        <p className="text-[10px] text-[var(--text-secondary)] font-medium">
          {workers?.fisher?.isAutoMode ? 'Kurcaci aktif — mancing otomatis' : 'Nyalakan Auto di Pusat Kota'}
        </p>
      )}
    </>
  );
}
