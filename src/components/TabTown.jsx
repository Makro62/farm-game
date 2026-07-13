'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { getCropEmoji, FISHES, RECIPES, NPC_LIST, SHOP_DECORATIONS, SHOP_BUILDINGS } from '@/lib/utils';
import { motion } from 'framer-motion';
import { InventoryWidget } from './InventoryWidget';
import { CraftingWidget } from './ui/CraftingWidget';
import { StatusHeader } from './StatusHeader';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import toast from 'react-hot-toast';
import { useFishingMinigame } from '@/lib/hooks/useFishingMinigame';
import { GAME_CONSTANTS } from '@/lib/constants';

function FishInventoryList({ inventory }) {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        {FISHES.map(fish => {
          const count = inventory[fish.id] || 0;
          if (count === 0) return null;
          return (
            <div key={`inv-${fish.id}`} className="glass-card border border-cyan-100/30 p-2 rounded-xl flex flex-col items-center justify-center bg-white/5 relative overflow-hidden w-[72px] sm:w-[84px] flex-shrink-0">
              <motion.div 
                className="text-3xl mb-1 origin-center"
                animate={{ 
                  rotate: [-15, 15, -15],
                  x: [-5, 5, -5],
                  y: [0, -8, 0] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2, 
                  ease: "easeInOut" 
                }}
              >
                {fish.emoji}
              </motion.div>
              <span className="text-cyan-100 font-bold text-[10px] sm:text-xs truncate w-full text-center">{fish.name}</span>
              <span className="text-yellow-400 font-black text-xs">x{count}</span>
            </div>
          );
        })}
        {FISHES.every(f => !inventory[f.id]) && (
          <div className="col-span-full glass-card p-3 rounded-xl border border-cyan-100/30 text-sm text-cyan-100 text-center italic opacity-70 w-full">
            Belum ada ikan yang ditangkap.
          </div>
        )}
      </div>
    </>
  );
}

export default function TabTown() {
  const spinWheel = useGameStore(state => state.spinWheel);
  const spendCoins = useGameStore(state => state.spendCoins);
  const addCoins = useGameStore(state => state.addCoins);
  const addItem = useGameStore(state => state.addItem);
  const activateCoinBooster = useGameStore(state => state.activateCoinBooster);
  const coinMultiplier = useGameStore(state => state.coinMultiplier);
  const buyGrowthBooster = useGameStore(state => state.buyGrowthBooster);
  const growthMultiplier = useGameStore(state => state.growthMultiplier);
  const dev = useGameStore(state => state.dev);
  const openConfirm = useGameStore(state => state.openConfirm);
  const workers = useGameStore(state => state.workers);
  const hireWorker = useGameStore(state => state.hireWorker);
  const inventory = useGameStore(state => state.inventory);
  const level = useGameStore(state => state.level);
  const buyItem = useGameStore(state => state.buyItem);
  const activeEvent = useGameStore(state => state.activeEvent);
  const npcs = useGameStore(state => state.npcs);
  const openNpcGift = useGameStore(state => state.openNpcGift);
  const autoFisher = useGameStore(state => state.autoFisher);
  const toggleAutoFisher = useGameStore(state => state.toggleAutoFisher);
  const buildings = useGameStore(state => state.buildings);
  const decorations = useGameStore(state => state.decorations);
  const buyBuilding = useGameStore(state => state.buyBuilding);
  const buyDecoration = useGameStore(state => state.buyDecoration);
  const addXP = useGameStore(state => state.addXP);

  const { fishState, indicatorPos, score, isHolding, setIsHolding, startFishing, startMinigame } = useFishingMinigame();

  const handleSpinWheel = () => {
    const result = spinWheel();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleBuyBooster = () => {
    if (coinMultiplier > 1) {
      toast('Booster sudah aktif!', { icon: '⚡' });
      return;
    }
    openConfirm(
      'Beli Booster Koin',
      `Apakah Anda yakin ingin membeli Booster Koin x2 seharga ${GAME_CONSTANTS.COSTS.COIN_BOOSTER} 💰?`,
      () => {
        if (spendCoins(GAME_CONSTANTS.COSTS.COIN_BOOSTER)) {
          activateCoinBooster();
          toast.success('Booster Koin x2 Aktif!', { icon: '💰' });
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
      `Beli Booster Growth x1.5 (Tumbuh lebih cepat) seharga ${GAME_CONSTANTS.COSTS.GROWTH_BOOSTER} 💰?`,
      () => {
        if (buyGrowthBooster(GAME_CONSTANTS.COSTS.GROWTH_BOOSTER)) {
          toast.success('Booster Growth x1.5 Aktif!', { icon: '🌱' });
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleBuyMerchant = () => {
    if (workers.fisher) {
      toast('Pemancing Kota sudah disewa! 🎣', { icon: '✅' });
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

  const handleShopBuy = (item, amount) => {
    if (buyItem(item.id, amount, item.price)) {
      toast.success(`Berhasil membeli ${amount} ${item.name}!`);
    } else {
      toast.error('Koin tidak cukup!');
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="game-tab-grid">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
            
            {/* 1. Pasar Ikan */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-cyan-200 pb-2 text-cyan-100">
              <span>🐟</span> PASAR IKAN
            </div>
            {level >= 10 ? (
              <div className="grid grid-cols-2 gap-2 mb-6">
                {FISHES.map(fish => {
                  return (
                    <div key={fish.id} className="glass-card p-2 rounded-xl border border-cyan-100/30 flex flex-col items-center hover:bg-white/10 transition-colors">
                      <span className="text-3xl mb-1">{fish.emoji}</span>
                      <span className="font-bold text-cyan-100 text-[10px] sm:text-xs mb-1 text-center line-clamp-1">{fish.name}</span>
                      <span className="text-yellow-400 font-bold text-xs mb-2">{fish.priceNormal * 2} 💰</span>
                      <button 
                        onClick={() => handleShopBuy({ id: fish.id, name: fish.name, price: fish.priceNormal * 2 }, 1)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1 rounded-lg text-xs w-full shadow-sm transition-transform active:scale-95"
                      >
                        Beli
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-3 rounded-xl border border-cyan-100/30 text-sm text-cyan-100 mb-6 text-center italic">
                Buka di Level 10
              </div>
            )}

            {/* 2. Dekorasi */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-2 text-green-100 mt-6">
              <span>🏡</span> DEKORASI
            </div>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {SHOP_DECORATIONS.map((item) => {
                const owned = (decorations || []).includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={owned}
                    onClick={() => handleBuyDecoration(item)}
                    className={`w-full glass-card p-2 rounded-xl flex justify-between items-center text-left transition-colors ${
                      owned ? 'opacity-60 cursor-default' : 'hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-green-100 text-sm">{item.emoji} {item.name}</div>
                      <div className="text-[10px] text-gray-400">{item.desc}</div>
                    </div>
                    <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs">
                      {owned ? '✅' : `${item.price}💰`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3. Bangunan */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-orange-200 pb-2 text-orange-100 mt-6">
              <span>🏗️</span> Bangunan
            </div>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {SHOP_BUILDINGS.map((item) => {
                const owned = !!buildings?.[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={owned}
                    onClick={() => handleBuyBuilding(item)}
                    className={`w-full glass-card p-2 rounded-xl flex justify-between items-center text-left transition-colors ${
                      owned ? 'opacity-60 cursor-default' : 'hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-orange-100 text-sm">{item.emoji} {item.name}</div>
                      <div className="text-[10px] text-gray-400">{item.desc}</div>
                    </div>
                    <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs">
                      {owned ? '✅' : `${item.price}💰`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 4. Booster */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-yellow-200 pb-2 text-yellow-900 mt-6">
              <span>⚡</span> Booster
            </div>
            <button onClick={handleBuyGrowthBooster} className={`w-full p-2 rounded-xl shadow-sm mb-2 font-bold flex justify-between items-center transition-transform ${growthMultiplier > 1 ? 'bg-green-500 text-white cursor-default' : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:scale-105'}`}>
              <span>🌱 Growth ×1.5</span>
              <span className="bg-black/20 px-2 py-0.5 rounded text-xs">{growthMultiplier > 1 ? 'AKTIF' : `${GAME_CONSTANTS.COSTS.GROWTH_BOOSTER}💰`}</span>
            </button>
            <button onClick={handleBuyBooster} className={`w-full p-2 rounded-xl shadow-sm mb-6 font-bold flex justify-between items-center transition-transform ${coinMultiplier > 1 ? 'bg-amber-600 text-white cursor-default' : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:scale-105'}`}>
              <span>💰 Coin ×2</span>
              <span className="bg-black/20 px-2 py-0.5 rounded text-xs">{coinMultiplier > 1 ? 'AKTIF' : `${GAME_CONSTANTS.COSTS.COIN_BOOSTER}💰`}</span>
            </button>

            {/* 5. Roda Harian */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-purple-200 pb-2 text-purple-100 mt-6">
              <span>🎡</span> Roda Harian
            </div>
            <button onClick={handleSpinWheel} className="w-full glass-card border border-amber-300 p-2 flex justify-between items-center transition-colors text-left mb-6">
              <div>
                <div className="font-bold text-amber-300 text-sm">🎰 Putar Roda</div>
                <div className="text-[10px] text-gray-300">1x Putaran Gratis/Hari</div>
              </div>
            </button>

            {/* 6. Pekerja Kota */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-blue-200 pb-2 text-blue-100 mt-6">
              <span>🧑‍🌾</span> Pekerja Kota (Auto)
            </div>
            <button onClick={handleBuyMerchant} className={`w-full glass-card p-2 rounded-xl flex justify-between items-center transition-colors text-left mb-2 ${workers?.fisher ? 'border-primary bg-white/10' : ''}`}>
              <div>
                <div className="font-bold text-blue-300 text-sm">🧑‍🌾 Pemancing Kota</div>
                <div className="text-[10px] text-gray-400">Auto-mancing & jual hasil</div>
              </div>
              <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs">
                {workers?.fisher ? '✅ Disewa' : `${GAME_CONSTANTS.COSTS.FISHER_WORKER}💰`}
              </span>
            </button>
            {workers?.fisher && (
              <p className="text-[10px] text-gray-400 mb-2">
                {autoFisher ? '✅ Kurcaci aktif — mancing otomatis' : 'Nyalakan tombol Auto di danau'}
              </p>
            )}

            {/* Cheat Panel / Dev Menu (Hanya tampil di development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 border-t border-red-200/30 pt-4">
                 <div className="font-bold text-xs text-red-400 mb-2">🛠️ CHEAT MENU (DEV)</div>
                 <div className="flex gap-2">
                    <button onClick={() => dev.addCoins(1000)} className="flex-1 bg-gray-800 text-green-400 text-xs py-1 rounded">
                      +1000 💰
                    </button>
                    <button onClick={() => dev.setLevel(useGameStore.getState().level + 1)} className="flex-1 bg-gray-800 text-blue-400 text-xs py-1 rounded">
                      +1 LVL
                    </button>
                 </div>
              </div>
            )}

          </div>
        </div>

        {/* ================= CENTER COLUMN ================= */}
        <div className="game-main">
          <div className="glass-panel p-4 min-h-[500px]">

            <StatusHeader />

            <GameAreaHeader icon="🎣" title="Danau Pemancingan">
              <GameActionButton
                variant="auto"
                active={autoFisher}
                onClick={() => {
                  if (workers.fisher) toggleAutoFisher();
                  else toast('Sewa Pemancing Kota dulu!', { icon: '🎣' });
                }}
              >
                🧑‍🌾 Auto: {autoFisher ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>
            <div 
              className="p-4 rounded-3xl shadow-inner border-4 border-[#357abd] relative min-h-[250px] overflow-hidden flex items-center justify-center mb-8 bg-cover bg-center"
              style={{ backgroundImage: "url('/img/backgrounds/lake_bg.png')" }}
            >
              <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
              
              {fishState === 'idle' && (
                <button onClick={startFishing} className="relative z-10 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 shadow-lg hover:scale-105 transition-transform text-center">
                  <span className="text-5xl drop-shadow-md inline-block mb-2">🎣</span>
                  <p className="text-blue-100 font-bold text-lg">Lempar Kail!</p>
                </button>
              )}

              {fishState === 'waiting' && (
                <div className="relative z-10 text-center">
                  <span className="text-5xl drop-shadow-md animate-bounce inline-block">🎣</span>
                  <p className="text-blue-100 font-bold mt-3 text-lg bg-black/30 px-4 py-1 rounded-full">Menunggu gigitan...</p>
                </div>
              )}

              {fishState === 'bite' && (
                <button onClick={startMinigame} className="relative z-10 bg-red-500 text-white px-8 py-4 rounded-full border-4 border-white shadow-xl hover:scale-110 animate-pulse text-center">
                  <span className="text-5xl drop-shadow-md inline-block mb-2">💦</span>
                  <p className="font-black text-2xl">TARIK SEKARANG!</p>
                </button>
              )}

              {fishState === 'minigame' && (
                <div className="relative z-10 w-full max-w-sm glass-card p-5 rounded-2xl shadow-2xl flex flex-col items-center border border-white/20">
                  <h3 className="font-bold mb-3 text-white text-center leading-tight">Tahan tombol saat garis merah<br/>di area HIJAU!</h3>
                  
                  <div className="w-full h-10 bg-gray-200 rounded-full relative overflow-hidden mb-5 border-[3px] border-gray-400 shadow-inner">
                    {/* Green zone (35% to 65%) */}
                    <div className="absolute left-[35%] right-[35%] top-0 bottom-0 bg-green-400 opacity-60 border-l-2 border-r-2 border-green-500" />
                    {/* Indicator */}
                    <div className="absolute w-2 h-full bg-red-600 top-0 shadow-md transition-all duration-75 z-10" style={{ left: `calc(${indicatorPos}%)` }} />
                  </div>
                  
                  <div className="w-full h-4 bg-gray-200 rounded-full mb-5 overflow-hidden shadow-inner border border-gray-300">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-100" style={{ width: `${(score / GAME_CONSTANTS.FISHING.WIN_THRESHOLD) * 100}%` }} />
                  </div>
                  
                  <button 
                    onPointerDown={() => setIsHolding(true)}
                    onPointerUp={() => setIsHolding(false)}
                    onPointerLeave={() => setIsHolding(false)}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 touch-none select-none ${isHolding ? 'bg-blue-600 shadow-inner' : 'bg-blue-500 hover:bg-blue-400'}`}
                  >
                    {isHolding ? 'MENARIK... 🎣' : 'TAHAN (KLIK) 👇'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="game-sidebar-right">
          <div className="glass-panel p-4 h-full">
            
            <InventoryWidget />

            {/* Hasil Tangkapan */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-cyan-200/30 pb-2 text-cyan-100 mt-6">
              <span>🏪</span> Hasil Tangkapan (Inventory Ikan)
            </div>
            <FishInventoryList inventory={inventory} />

            {/* Warga Kota (NPCs) */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-pink-200/30 pb-2 text-pink-100 mt-6">
              <span>👥</span> Warga Kota
            </div>
            <div className="space-y-3 mb-8">
              {NPC_LIST.map(npc => {
                const data = npcs[npc.id] || { level: 1, points: 0 };
                const maxPoints = data.level * 100;
                return (
                  <div key={npc.id} className="glass-card border border-pink-100/30 p-3 rounded-xl flex items-center gap-3">
                    <div className="text-3xl bg-white/20 p-2 rounded-full shadow-sm flex-shrink-0 w-14 h-14 flex items-center justify-center">
                      {npc.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm flex items-center justify-between gap-1 mb-0.5">
                        <span className="truncate">{npc.name}</span>
                        <span className="text-pink-300 bg-pink-900/50 px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap flex-shrink-0">Lv {data.level}</span>
                      </div>
                      <div className="text-[10px] text-pink-200 mb-1.5 truncate">{npc.role}</div>
                      <div className="w-full h-1.5 bg-pink-900/50 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500" style={{ width: `${(data.points / maxPoints) * 100}%` }} />
                      </div>
                    </div>
                    <button 
                      onClick={() => openNpcGift(npc.id)}
                      className="bg-white border-2 border-pink-300 text-pink-600 hover:bg-pink-100 p-2 rounded-xl transition-colors shadow-sm active:scale-95 flex-shrink-0"
                      title="Beri Hadiah"
                    >
                      🎁
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Dapur Ikan */}
            <CraftingWidget type="fish_kitchen" title="Dapur Ikan" icon="🍳" />
            
          </div>
        </div>

      </div>
    </div>
  );
}
