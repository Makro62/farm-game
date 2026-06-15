'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import { getCropEmoji, formatNumber, SHOP_SEEDS, SHOP_ANIMALS } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import toast from 'react-hot-toast';

export default function TabFarm() {
  const plots = useGameStore(state => state.plots);
  const inventory = useGameStore(state => state.inventory);
  const plant = useGameStore(state => state.plant);
  const harvest = useGameStore(state => state.harvest);
  const swapPlots = useGameStore(state => state.swapPlots);
  const addCoins = useGameStore(state => state.addCoins);
  const openPrompt = useGameStore(state => state.openPrompt);
  const openConfirm = useGameStore(state => state.openConfirm);
  const buyItem = useGameStore(state => state.buyItem);
  const removeItem = useGameStore(state => state.removeItem);
  const coinMultiplier = useGameStore(state => state.coinMultiplier);
  const growthMultiplier = useGameStore(state => state.growthMultiplier);
  const buyGrowthBooster = useGameStore(state => state.buyGrowthBooster);
  const workers = useGameStore(state => state.workers);
  const hireWorker = useGameStore(state => state.hireWorker);

  const availableSeeds = SHOP_SEEDS.filter(s => s.season === 'all' || s.season === useGameStore.getState().season.current);

  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [shopAmounts, setShopAmounts] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [autoFarm, setAutoFarm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);



  // Tick: perbarui waktu + sinkronkan status petak (growing -> ready)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      useGameStore.getState().syncPlots();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-farm: panen dan tanam otomatis (butuh Kurcaci Petani).
  useEffect(() => {
    if (!autoFarm || !workers.farmer) return;
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      const now = Date.now();
      let harvested = 0;
      let planted = 0;
      
      state.plots.forEach((p) => {
        // Harvest
        const ready =
          p.crop &&
          (p.status === 'ready' ||
            (p.status === 'growing' && p.plantedAt && now - p.plantedAt >= p.growTime));
        if (ready && state.harvest(p.id)) {
          harvested++;
        } 
        // Plant
        else if (p.status === 'empty' && selectedInventoryItem) {
          const seedData = SHOP_SEEDS.find(s => s.id === selectedInventoryItem);
          if (seedData && state.inventory[selectedInventoryItem] > 0) {
             state.removeItem(selectedInventoryItem, 1);
             state.plant(p.id, seedData.cropId, (seedData.time * 1000) / state.growthMultiplier);
             planted++;
          }
        }
      });
      
      if (harvested > 0 || planted > 0) {
        toast.success(`🧙‍♂️ Kurcaci panen ${harvested} & tanam ${planted}!`, { id: 'auto-farm' });
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [autoFarm, workers.farmer, selectedInventoryItem]);

  const handleToggleAuto = () => {
    if (!workers.farmer) {
      toast('Sewa Kurcaci Petani dulu di panel kiri! 🔒', { icon: '🧙‍♂️' });
      return;
    }
    setAutoFarm((prev) => !prev);
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
      toast('Kurcaci Petani sudah dimiliki! Aktifkan Auto. 🧙‍♂️', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Kurcaci Petani',
      'Sewa Kurcaci Petani (Auto-Farm & Harvest) seharga 5000 💰?',
      () => {
        if (hireWorker('farmer', 5000)) {
          toast.success('Kurcaci Petani disewa! Nyalakan tombol Auto. 🧙‍♂️');
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleShopClick = (seed) => {
    openPrompt(
      `Beli ${seed.name}`, 
      `Harga: ${seed.price} 💰/bibit`, 
      (amount) => {
        if (buyItem(seed.id, amount, seed.price)) {
          toast.success(`Berhasil membeli ${amount} ${seed.name}!`);
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
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

  const handleSellAll = () => {
    let totalEarned = 0;
    const currentInventory = { ...inventory };
    Object.keys(currentInventory).forEach(itemId => {
      const amount = currentInventory[itemId];
      if (amount > 0) {
        let sellPrice = 20;
        
        // Cek jika item adalah bibit (jual rugi)
        const seedData = SHOP_SEEDS.find(s => s.id === itemId);
        if (seedData) {
          sellPrice = Math.floor(seedData.price * 0.5);
        } else {
          // Cek jika item adalah hasil panen (jual untung)
          const cropData = SHOP_SEEDS.find(s => s.cropId === itemId);
          if (cropData) {
            sellPrice = Math.floor(cropData.price * 1.5);
          } else {
            // Cek jika item adalah hasil ternak
            const animalData = SHOP_ANIMALS.find(a => a.product === itemId);
            if (animalData) {
              sellPrice = Math.floor(animalData.price * 0.5); 
            }
          }
        }
        
        totalEarned += sellPrice * amount;
        removeItem(itemId, amount);
      }
    });
    if (totalEarned > 0) {
      const finalEarned = Math.round(totalEarned * coinMultiplier);
      addCoins(finalEarned);
      toast.success(
        coinMultiplier > 1
          ? `Terjual ${formatNumber(finalEarned)} 💰 (×${coinMultiplier} booster!)`
          : `Terjual seharga ${formatNumber(finalEarned)} 💰`
      );
    } else {
      toast.error('Inventory kosong!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4">
            {/* 1. Shop Bibit */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-2">
              <span>🛒</span> Shop Bibit
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {availableSeeds.map((seed) => {
                const amt = shopAmounts[seed.id] || 1;
                return (
                  <div
                    key={`shop-${seed.id}`}
                    className="p-2 glass-card flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">{getCropEmoji(seed.id)}</span>
                    <span className="font-semibold text-[11px] text-white text-center leading-tight">{seed.name}</span>
                    <span className="text-[10px] font-bold text-green-300">{seed.price}💰</span>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                      <button onClick={() => setShopAmounts(p => ({ ...p, [seed.id]: Math.max(1, amt - 1) }))} className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-gray-700 font-bold">-</button>
                      <span className="text-xs font-bold w-4 text-center">{amt}</span>
                      <button onClick={() => setShopAmounts(p => ({ ...p, [seed.id]: amt + 1 }))} className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-gray-700 font-bold">+</button>
                    </div>
                    <button 
                      onClick={() => buyItem(seed.id, amt, seed.price)}
                      className="w-full text-[11px] font-bold text-white bg-green-500 hover:bg-green-600 px-2 py-1.5 rounded-lg transition-colors mt-1"
                    >
                      Beli ({seed.price * amt} 💰)
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white">
              <span>🌱</span> BIBIT TANAMAN
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-6">
              {SHOP_SEEDS.filter(s => inventory[s.id] > 0).length === 0 ? (
                <div className="text-center text-sm text-green-700 italic">Belum ada bibit di Inventory.</div>
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
                        {getCropEmoji(seed.id)}
                        <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1 rounded-sm shadow-sm">
                          {inventory[seed.id]}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Pekerja (Auto) */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white mt-6">
              <span>🧑‍🌾</span> Pekerja (Auto)
            </div>
            <button
              onClick={handleHireFarmer}
              className={`w-full glass-card p-2 flex justify-between items-center transition-colors text-left ${
                workers.farmer
                  ? 'border-primary bg-white/10'
                  : ''
              }`}
            >
              <div>
                <div className="font-bold text-white text-sm">🧙‍♂️ Kurcaci Petani</div>
                <div className="text-[10px] text-gray-500">Auto-Farm & Harvest</div>
              </div>
              <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs">
                {workers.farmer ? '✅ Dimiliki' : '5000💰'}
              </span>
            </button>
          </div>
        </div>

        {/* ================= CENTER COLUMN ================= */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-4">
            
            <StatusHeader setAutoFarm={setAutoFarm} setSelectedInventoryItem={setSelectedInventoryItem} />

            <div className="flex justify-between items-center mb-4">
               <div className="font-bold text-lg flex items-center gap-2 text-white drop-shadow-md">
                 <span>🌾</span> Area Pertanian
               </div>
               <div className="flex gap-2">
                 <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm transition-colors border ${isEditMode ? 'bg-yellow-400 text-yellow-900 border-yellow-500 animate-pulse' : 'glass-card text-gray-200'}`}
                 >
                  {isEditMode ? '💾 Selesai Edit' : '✏️ Edit Layout'}
                 </button>
                 <button 
                  onClick={handleToggleAuto}
                  className={`px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm transition-colors border ${autoFarm ? 'bg-green-500 text-white border-green-600' : 'glass-card text-gray-200'}`}
                 >
                  🧙‍♂️ Auto: {autoFarm ? 'ON' : 'OFF'}
                 </button>
               </div>
            </div>

            <div 
              className={`p-4 sm:p-6 rounded-3xl shadow-inner border-4 border-[#6b4226] relative overflow-hidden mb-6 transition-all bg-cover bg-center ${isEditMode ? 'ring-4 ring-yellow-400 border-dashed' : ''}`}
              style={{ backgroundImage: "url('/img/backgrounds/farm_bg.png')" }}
            >
              <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 relative z-10">
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
                      className={`aspect-square w-full rounded-xl relative overflow-hidden flex flex-col items-center justify-center transition-all shadow-md
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
                            className="text-4xl drop-shadow-lg z-10"
                          >
                            {getCropEmoji(plot.crop)}
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
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
              <span className="text-gray-400 text-sm font-medium">Belum ada pesanan masuk.</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4 h-full">
            
            {/* 1. Inventory */}
            <InventoryWidget />

            {/* 2. Quest Harian */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white mt-6">
              <span>📝</span> Quest Harian
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 min-h-[80px] mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-purple-800">Panen 10 Wortel</span>
                <span className="text-purple-600 font-bold">0/10</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{width: '0%'}}></div>
              </div>
            </div>

            {/* Dapur Produksi */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white mt-6">
              <span>🍳</span> Dapur Produksi
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 min-h-[80px] flex items-center justify-center">
              <span className="text-red-300 text-sm font-medium italic">Fitur ini akan segera hadir.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
