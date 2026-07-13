'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { SHOP_BAIT, SHOP_BUILDINGS, SHOP_DECORATIONS } from '@/lib/utils';
import { ShopItemCard, ShopSectionTitle } from '../ui/ShopItemCard';
import { GAME_CONSTANTS } from '@/lib/constants';
import toast from 'react-hot-toast';

export function TownShop() {
  const inventory = useGameStore((s) => s.inventory);
  const buyItem = useGameStore((s) => s.buyItem);
  const workers = useGameStore((s) => s.workers);
  const hireWorker = useGameStore((s) => s.hireWorker);
  const autoFisher = useGameStore((s) => s.autoFisher);
  const selectedBait = useGameStore((s) => s.selectedBait);
  const setSelectedBait = useGameStore((s) => s.setSelectedBait);
  const openConfirm = useGameStore((s) => s.openConfirm);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const activateCoinBooster = useGameStore((s) => s.activateCoinBooster);
  const buyGrowthBooster = useGameStore((s) => s.buyGrowthBooster);
  const coinMultiplier = useGameStore((s) => s.coinMultiplier);
  const growthMultiplier = useGameStore((s) => s.growthMultiplier);
  const buildings = useGameStore((s) => s.buildings);
  const decorations = useGameStore((s) => s.decorations);
  const buyBuilding = useGameStore((s) => s.buyBuilding);
  const buyDecoration = useGameStore((s) => s.buyDecoration);
  const addXP = useGameStore((s) => s.addXP);

  const [shopAmounts, setShopAmounts] = useState({});

  const handleShopBuy = (item, amount) => {
    if (buyItem(item.id, amount, item.price)) {
      toast.success(`Berhasil membeli ${amount} ${item.name}!`);
    } else {
      toast.error('Koin tidak cukup!');
    }
  };

  const handleHireFisher = () => {
    if (workers?.fisher) {
      toast('Pemancing Kota sudah disewa! Aktifkan Auto. 🎣', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Pemancing Kota',
      `Sewa Pemancing Kota (Auto-mancing) seharga ${GAME_CONSTANTS.COSTS.FISHER_WORKER} 💰?`,
      () => {
        if (hireWorker('fisher', GAME_CONSTANTS.COSTS.FISHER_WORKER)) {
          toast.success('Pemancing Kota disewa! Auto mancing aktif. 🎣');
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleBuyGrowthBooster = () => {
    if (growthMultiplier > 1) {
      toast('Booster Growth sudah aktif!', { icon: '⚡' });
      return;
    }
    openConfirm(
      'Beli Booster Growth',
      `Beli Booster Growth ×1.5 seharga ${GAME_CONSTANTS.COSTS.GROWTH_BOOSTER} 💰?`,
      () => {
        if (buyGrowthBooster(GAME_CONSTANTS.COSTS.GROWTH_BOOSTER)) {
          toast.success('Booster Growth ×1.5 Aktif!', { icon: '🌱' });
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleBuyCoinBooster = () => {
    if (coinMultiplier > 1) {
      toast('Booster Koin sudah aktif!', { icon: '⚡' });
      return;
    }
    openConfirm(
      'Beli Booster Koin',
      `Beli Booster Koin ×2 seharga ${GAME_CONSTANTS.COSTS.COIN_BOOSTER} 💰?`,
      () => {
        if (spendCoins(GAME_CONSTANTS.COSTS.COIN_BOOSTER)) {
          activateCoinBooster();
          toast.success('Booster Koin ×2 Aktif!', { icon: '💰' });
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
      <ShopSectionTitle icon="🎣">Shop Umpan</ShopSectionTitle>
      <p className="text-[10px] text-[#d7e4c8]/80 mb-2 font-medium">
        Pilih umpan sebelum mancing — seperti pilih bibit di ladang.
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
      <div className="glass-card p-3 mb-6">
        {SHOP_BAIT.filter((b) => (inventory[b.id] || 0) > 0).length === 0 ? (
          <div className="text-center text-sm text-[#d7e4c8]/70 font-bold py-2">
            Belum ada umpan. Beli di atas dulu.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {SHOP_BAIT.filter((b) => (inventory[b.id] || 0) > 0).map((bait) => (
              <button
                key={bait.id}
                type="button"
                onClick={() => setSelectedBait(selectedBait === bait.id ? null : bait.id)}
                className={`p-2 glass-card flex flex-col items-center gap-1 transition-all border-2
                  ${selectedBait === bait.id ? 'border-[var(--primary)] bg-[var(--primary)]/20 shadow-inner scale-105' : 'border-transparent hover:bg-black/20'}`}
              >
                <span className="text-2xl relative drop-shadow-sm">
                  {bait.emoji}
                  <span className="absolute -bottom-2 -right-2 bg-black text-[#f7f4e8] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm border border-white/20">
                    {inventory[bait.id]}
                  </span>
                </span>
                <span className="text-[9px] text-[#d7e4c8] text-center leading-tight">{bait.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <ShopSectionTitle icon="🏗️">Upgrade Kota</ShopSectionTitle>
      <div className="space-y-2 mb-6">
        {SHOP_BUILDINGS.map((item) => {
          const owned = !!buildings?.[item.id];
          return (
            <button
              key={item.id}
              type="button"
              disabled={owned}
              onClick={() => handleBuyBuilding(item)}
              className={`w-full glass-card p-2.5 flex justify-between items-center text-left transition-colors ${
                owned ? 'opacity-60 cursor-default' : 'hover:bg-white/10'
              }`}
            >
              <div>
                <div className="font-bold text-[#f7f4e8] text-sm">
                  {item.emoji} {item.name}
                </div>
                <div className="text-[10px] text-[#d7e4c8]/80">{item.desc}</div>
              </div>
              <span className="font-bold text-[#4a3208] bg-[#ffe08a] px-2 py-0.5 rounded text-xs whitespace-nowrap">
                {owned ? '✅' : `${item.price}💰`}
              </span>
            </button>
          );
        })}
        {SHOP_DECORATIONS.map((item) => {
          const owned = (decorations || []).includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              disabled={owned}
              onClick={() => handleBuyDecoration(item)}
              className={`w-full glass-card p-2.5 flex justify-between items-center text-left transition-colors ${
                owned ? 'opacity-60 cursor-default' : 'hover:bg-white/10'
              }`}
            >
              <div>
                <div className="font-bold text-[#f7f4e8] text-sm">
                  {item.emoji} {item.name}
                </div>
                <div className="text-[10px] text-[#d7e4c8]/80">{item.desc}</div>
              </div>
              <span className="font-bold text-[#4a3208] bg-[#ffe08a] px-2 py-0.5 rounded text-xs whitespace-nowrap">
                {owned ? '✅' : `${item.price}💰`}
              </span>
            </button>
          );
        })}
      </div>

      <ShopSectionTitle icon="⚡">Booster</ShopSectionTitle>
      <button
        type="button"
        onClick={handleBuyGrowthBooster}
        className={`w-full py-3 mb-2 flex justify-between items-center transition-transform ${
          growthMultiplier > 1 ? 'btn-secondary cursor-default' : 'btn-primary'
        }`}
      >
        <span className="font-bold">🌱 Growth ×1.5</span>
        <span className="bg-black/20 px-2 py-0.5 rounded text-xs">
          {growthMultiplier > 1 ? 'AKTIF' : `${GAME_CONSTANTS.COSTS.GROWTH_BOOSTER}💰`}
        </span>
      </button>
      <button
        type="button"
        onClick={handleBuyCoinBooster}
        className={`w-full py-3 mb-6 flex justify-between items-center transition-transform ${
          coinMultiplier > 1 ? 'btn-secondary cursor-default' : 'btn-gold'
        }`}
      >
        <span className="font-bold">💰 Coin ×2</span>
        <span className="bg-black/20 px-2 py-0.5 rounded text-xs">
          {coinMultiplier > 1 ? 'AKTIF' : `${GAME_CONSTANTS.COSTS.COIN_BOOSTER}💰`}
        </span>
      </button>

      <ShopSectionTitle icon="🧑‍🌾">Pekerja (Auto)</ShopSectionTitle>
      <button
        type="button"
        onClick={handleHireFisher}
        className={`w-full glass-card p-2 flex justify-between items-center transition-colors text-left mb-2 ${
          workers?.fisher ? 'border-[#6fbf55] bg-white/10' : ''
        }`}
      >
        <div>
          <div className="font-bold text-[#f7f4e8] text-sm">🎣 Pemancing Kota</div>
          <div className="text-[10px] text-[#d7e4c8]">Auto-mancing di danau</div>
        </div>
        <span className="font-bold text-[#4a3208] bg-[#ffe08a] px-2 py-0.5 rounded text-xs whitespace-nowrap">
          {workers?.fisher ? '✅ Dimiliki' : `${GAME_CONSTANTS.COSTS.FISHER_WORKER}💰`}
        </span>
      </button>
      {workers?.fisher && (
        <p className="text-[10px] text-[#d7e4c8]/70 mb-2 font-medium">
          {autoFisher
            ? '✅ Kurcaci aktif — mancing otomatis'
            : 'Nyalakan tombol Auto di danau untuk mulai'}
        </p>
      )}
    </>
  );
}
