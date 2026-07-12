'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import { CropIcon } from './ui/CropIcon';
import { getCropEmoji, SHOP_SEEDS, RECIPES } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import { ShopItemCard, ShopSectionTitle } from './ui/ShopItemCard';
import { CraftingWidget } from './ui/CraftingWidget';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import toast from 'react-hot-toast';

export default function TabFarm() {
  const plots = useGameStore(state => state.plots);
  const inventory = useGameStore(state => state.inventory);
  const plant = useGameStore(state => state.plant);
  const harvest = useGameStore(state => state.harvest);
  const swapPlots = useGameStore(state => state.swapPlots);
  const openPrompt = useGameStore(state => state.openPrompt);
  const openConfirm = useGameStore(state => state.openConfirm);
  const buyItem = useGameStore(state => state.buyItem);
  const removeItem = useGameStore(state => state.removeItem);
  const growthMultiplier = useGameStore(state => state.growthMultiplier);
  const buyGrowthBooster = useGameStore(state => state.buyGrowthBooster);
  const workers = useGameStore(state => state.workers);
  const hireWorker = useGameStore(state => state.hireWorker);
  const autoFarm = useGameStore(state => state.autoFarmer);
  const toggleAutoFarm = useGameStore(state => state.toggleAutoFarmer);
  const selectedInventoryItem = useGameStore(state => state.selectedSeed);
  const setSelectedInventoryItem = useGameStore(state => state.setSelectedSeed);
  const orders = useGameStore(state => state.orders);
  const fulfillOrder = useGameStore(state => state.fulfillOrder);
  const dailyQuests = useGameStore(state => state.dailyQuests);
  const claimQuestReward = useGameStore(state => state.claimQuestReward);
  
  const [shopAmounts, setShopAmounts] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const availableSeeds = SHOP_SEEDS.filter(s => s.season === 'all' || s.season === useGameStore.getState().season.current);

  const handleToggleAuto = () => {
    if (!workers?.farmer) {
      toast('Sewa Petani Budi dulu di panel kiri! 🔒', { icon: '👨‍🌾' });
      return;
    }
    const next = !autoFarm;
    toggleAutoFarm();
    if (next) {
      const hasSeeds = SHOP_SEEDS.some((s) => (inventory[s.id] || 0) > 0);
      if (!hasSeeds) {
        toast('Auto ON — beli bibit dulu agar kurcaci bisa menanam! 🌱', { icon: '👨‍🌾' });
      } else {
        toast.success('Kurcaci petani aktif! Auto panen & tanam.', { id: 'auto-farm-toggle' });
      }
    }
  };

  const handleBuyGrowthBooster = () => {
    if (growthMultiplier > 1) {
      toast('Booster Growth sudah aktif! ⚡', { icon: '⚡' });
      return;
    }
    if (buyGrowthBooster(50)) {
      toast.success('Booster Growth ×1.5 aktif!');
    } else {
      toast.error('Koin tidak cukup!');
    }
  };

  const handleHireFarmer = () => {
    if (workers.farmer) {
      toast('Petani Budi sudah dimiliki! Aktifkan Auto. 👨‍🌾', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Petani Budi',
      'Sewa Petani Budi (Auto-Farm & Harvest) seharga 5000 💰?',
      () => {
        if (hireWorker('farmer', 5000)) {
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

  const handlePlotClick = (plot) => {
    if (plot.status === 'empty') {
      if (!selectedInventoryItem) {
        toast('Pilih bibit dari Inventory dulu!', { icon: '👆' });
        return;
      }
      
      const seedData = SHOP_SEEDS.find(s => s.id === selectedInventoryItem);
      if (!seedData) {
        toast.error('Item ini tidak bisa ditanam!', { icon: '❌' });
        return;
      }
      
      if (removeItem(selectedInventoryItem, 1)) {
        plant(plot.id, seedData.cropId, (seedData.time * 1000) / growthMultiplier);
      } else {
        toast.error(`Anda kehabisan ${seedData.name}! Beli lagi di Shop.`);
        setSelectedInventoryItem(null);
      }
    } else if (plot.status === 'ready' || (plot.status === 'growing' && currentTime - plot.plantedAt >= plot.growTime)) {
      const crop = harvest(plot.id);
      if (crop) {
        toast.success(`Panen ${getCropEmoji(crop)}!`);
      }
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="game-tab-grid">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
            {/* 1. Shop Bibit */}
            <ShopSectionTitle icon="🛒">Shop Bibit</ShopSectionTitle>
            <div className="shop-grid mb-6">
              {availableSeeds.map((seed) => {
                const amt = shopAmounts[seed.id] || 1;
                return (
                  <ShopItemCard
                    key={`shop-${seed.id}`}
                    icon={<CropIcon itemId={seed.id} className="shop-item-icon" />}
                    name={seed.name}
                    price={seed.price}
                    amount={amt}
                    onDecrease={() => setShopAmounts(p => ({ ...p, [seed.id]: Math.max(1, amt - 1) }))}
                    onIncrease={() => setShopAmounts(p => ({ ...p, [seed.id]: amt + 1 }))}
                    onBuy={() => handleShopBuy(seed, amt)}
                  />
                );
              })}
            </div>

            <ShopSectionTitle icon="🌱">Bibit Tanaman</ShopSectionTitle>
            <div className="glass-card rounded-xl p-3 mb-6">
              {SHOP_SEEDS.filter(s => inventory[s.id] > 0).length === 0 ? (
                <div className="text-center text-sm text-gray-400 italic">Belum ada bibit di Inventory.</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {SHOP_SEEDS.filter(s => inventory[s.id] > 0).map(seed => (
                    <button
                      key={`inv-${seed.id}`}
                      onClick={() => setSelectedInventoryItem(seed.id)}
                      className={`p-2 glass-card flex flex-col items-center gap-1 transition-all
                        ${selectedInventoryItem === seed.id ? 'border-primary scale-105 shadow-md bg-white/20' : 'hover:bg-white/10'}`}
                    >
                      <span className="text-2xl relative">
                        <CropIcon itemId={seed.id} />
                        <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1 rounded-sm shadow-sm">
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
                workers?.farmer ? 'border-primary bg-white/10' : ''
              }`}
            >
              <div>
                <div className="font-bold text-white text-sm">👨‍🌾 Petani Budi</div>
                <div className="text-[10px] text-gray-500">Auto-Farm & Harvest</div>
              </div>
              <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                {workers?.farmer ? '✅ Dimiliki' : '5000 💰'}
              </span>
            </button>
            {workers?.farmer && (
              <p className="text-[10px] text-gray-400 mb-2">
                {autoFarm
                  ? SHOP_SEEDS.some((s) => (inventory[s.id] || 0) > 0)
                    ? '✅ Kurcaci aktif — panen & tanam otomatis'
                    : '⚠️ Auto ON — beli bibit agar bisa menanam'
                  : 'Nyalakan tombol Auto di atas untuk mulai'}
              </p>
            )}
          </div>
        </div>

        {/* ================= CENTER COLUMN ================= */}
        <div className="game-main">
          <div className="glass-panel p-4">
            
            <StatusHeader />

            <GameAreaHeader icon="🌾" title="Area Pertanian">
              <GameActionButton variant="edit" active={isEditMode} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? '💾 Selesai Edit' : '✏️ Edit Layout'}
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFarm} onClick={handleToggleAuto}>
                🧙‍♂️ Auto: {autoFarm ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            <div 
              className={`p-4 sm:p-6 rounded-3xl shadow-inner border-4 border-[#6b4226] relative overflow-hidden mb-6 transition-all bg-cover bg-center ${isEditMode ? 'ring-4 ring-yellow-400 border-dashed' : ''}`}
              style={{ backgroundImage: "url('/img/backgrounds/farm_bg.png')" }}
            >
              <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
              <div className="game-plot-grid relative z-10">
                {plots.map((plot, i) => {
                  const isGrowing = plot.status === 'growing';
                  let progress = 0;
                  let isReady = false;
                  if (isGrowing && plot.plantedAt) {
                    progress = Math.min(100, ((currentTime - plot.plantedAt) / plot.growTime) * 100);
                    isReady = progress >= 100;
                  } else if (plot.status === 'ready') {
                    isReady = true;
                    progress = 100;
                  }
                  return (
                    <motion.button
                      key={plot.id}
                      layout
                      draggable={isEditMode}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('plotId', plot.id);
                        e.currentTarget.style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onDragOver={(e) => {
                        if (isEditMode) e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (isEditMode) {
                          const draggedId = e.dataTransfer.getData('plotId');
                          if (draggedId && draggedId !== plot.id.toString()) {
                            swapPlots(parseInt(draggedId, 10), plot.id);
                          }
                        }
                      }}
                      whileHover={!isEditMode ? { scale: 1.05 } : {}}
                      whileTap={!isEditMode ? { scale: 0.95 } : {}}
                      onClick={(e) => {
                        if (isEditMode) {
                          e.preventDefault();
                          return;
                        }
                        handlePlotClick(plot);
                      }}
                      className={`game-plot-cell
                        ${isEditMode ? 'cursor-grab hover:ring-4 ring-yellow-400' : ''}
                        ${plot.status === 'empty' ? 'bg-[#a06a38] border-b-4 border-[#7a4e28] hover:bg-[#b07843]' : ''}
                        ${isGrowing && !isReady ? 'bg-[#5c4033] border-b-4 border-[#3e2b22]' : ''}
                        ${isReady ? 'bg-[#7c5836] border-b-4 border-[#5a4027] animate-glow ring-2 ring-yellow-400 z-10' : ''}
                      `}
                    >
                      {plot.crop && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ scale: 0, y: 10 }}
                            animate={{ scale: isReady ? 1.5 : 0.8 + (progress / 100) * 0.4, y: 0 }}
                            className="z-10"
                          >
                            <CropIcon cropId={plot.crop} />
                          </motion.div>
                        </AnimatePresence>
                      )}
                      {isGrowing && !isReady && (
                        <div className="absolute bottom-1 left-1 right-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400" style={{ width: `${progress}%` }} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white mt-6">
              <span>📋</span> Papan Pesanan
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              {!orders || orders.length === 0 ? (
                <div className="col-span-full glass-card rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-medium">Belum ada pesanan masuk. Menunggu pesanan...</span>
                </div>
              ) : (
                orders.map((order, index) => {
                  const timeLeft = Math.max(0, Math.floor((order.timer * 1000 - (Date.now() - order.createdAt)) / 1000));
                  const m = Math.floor(timeLeft / 60);
                  const s = timeLeft % 60;
                  
                  return (
                    <div key={order.id} className="glass-card rounded-xl p-4 border-2 border-amber-200/30 flex flex-col hover:border-amber-400/50 transition-colors">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                        <span className="font-black text-amber-300">Pesanan #{index + 1}</span>
                        <span className="text-xs font-bold bg-black/40 text-red-300 px-2 py-1 rounded-full flex items-center gap-1">
                          ⏰ {m}:{s.toString().padStart(2, '0')}
                        </span>
                      </div>
                      
                      <div className="flex-1 space-y-2 mb-4">
                        {order.items.map(item => {
                          const has = inventory[item.id] || 0;
                          const isEnough = has >= item.qty;
                          return (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <span className="text-white flex items-center gap-1">
                                <span>{getCropEmoji(item.id)}</span> {item.id.replace('_', ' ')}
                              </span>
                              <span className={`font-bold px-2 py-0.5 rounded text-xs ${isEnough ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                {has} / {item.qty}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs font-bold text-yellow-300 flex flex-col">
                          <span>{order.coins} 💰</span>
                          <span>{order.xp} ⭐</span>
                        </div>
                        <button 
                          onClick={() => fulfillOrder(order.id)}
                          className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-md transition-transform active:scale-95"
                        >
                          Penuhi
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="game-sidebar-right">
          <div className="glass-panel p-4 h-full">
            
            {/* 1. Inventory */}
            <InventoryWidget />

            {/* 2. Quest Harian */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white mt-6">
              <span>📝</span> Quest Harian
            </div>
            
            {dailyQuests && dailyQuests.length > 0 ? (
              dailyQuests.map(quest => {
                const percent = Math.min(100, (quest.count / quest.required) * 100);
                const isComplete = quest.count >= quest.required;
                
                return (
                  <div key={quest.id} className="glass-card rounded-xl p-3 mb-3 relative overflow-hidden">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-white line-clamp-1 pr-2">
                        {quest.action} {quest.required} {quest.targetName}
                      </span>
                      <span className="text-purple-300 font-bold whitespace-nowrap">{quest.count}/{quest.required}</span>
                    </div>
                    
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                      <div className="bg-purple-400 h-2 rounded-full transition-all" style={{width: `${percent}%`}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs font-bold text-yellow-600">
                        🎁 {quest.rewardCoins} 💰 | {quest.rewardXp} ⭐
                      </div>
                      
                      {quest.claimed ? (
                        <span className="text-xs font-bold text-gray-400 bg-white/10 px-2 py-1 rounded">Diambil</span>
                      ) : isComplete ? (
                        <button 
                          onClick={() => {
                            if (claimQuestReward(quest.id)) {
                              toast.success('Hadiah quest berhasil diambil!');
                            }
                          }}
                          className="text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md shadow-sm transition-colors animate-pulse"
                        >
                          Klaim
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-card rounded-xl p-3 min-h-[80px] mb-6 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-sm font-medium mb-2">Quest sedang disiapkan...</span>
                <span className="text-xs text-gray-500">Tunggu sejenak untuk quest baru.</span>
              </div>
            )}

            {/* Dapur Produksi */}
            <CraftingWidget type="kitchen" title="Dapur Produksi" icon="🍳" />

          </div>
        </div>

      </div>
    </div>
  );
}
