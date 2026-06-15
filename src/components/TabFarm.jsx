'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import { getCropEmoji, formatNumber, SHOP_SEEDS, SHOP_ANIMALS } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function TabFarm() {
  const plots = useGameStore(state => state.plots);
  const inventory = useGameStore(state => state.inventory);
  const plant = useGameStore(state => state.plant);
  const harvest = useGameStore(state => state.harvest);
  const movePlot = useGameStore(state => state.movePlot);
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
  const checkStreak = useGameStore(state => state.checkStreak);
  const resetGame = useGameStore(state => state.resetGame);
  const season = useGameStore(state => state.season);
  const weather = useGameStore(state => state.weather);

  const availableSeeds = SHOP_SEEDS.filter(s => s.season === 'all' || s.season === season.current);

  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [autoFarm, setAutoFarm] = useState(false);
  const farmRef = useRef(null);

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

  const handleClaimDaily = () => {
    const result = checkStreak();
    if (result.claimed) {
      toast.success(result.message);
    } else {
      toast(result.message, { icon: '📅' });
    }
  };

  const handleSave = () => {
    // Zustand persist menyimpan otomatis pada setiap perubahan; ini hanya feedback.
    toast.success('Game tersimpan! 💾');
  };

  const handleReset = () => {
    openConfirm(
      'Reset Game',
      'Semua progress (koin, level, tanaman, hewan) akan hilang. Yakin?',
      () => {
        resetGame();
        setSelectedInventoryItem(null);
        setAutoFarm(false);
        toast.success('Game di-reset ke awal!');
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
              {availableSeeds.map((seed) => (
                <button
                  key={`shop-${seed.id}`}
                  onClick={() => handleShopClick(seed)}
                  className="p-2 rounded-xl border-2 border-gray-200 transition-all flex flex-col items-center gap-1 bg-white hover:border-green-300 hover:shadow-sm"
                >
                  <span className="text-2xl">{getCropEmoji(seed.id)}</span>
                  <span className="font-semibold text-xs">{seed.name}</span>
                  <span className="text-[10px] font-bold text-amber-600">{seed.price}💰</span>
                </button>
              ))}
            </div>

            {/* 2. Pilih Tanaman (Feedback Visual) */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-2">
              <span>🌱</span> PILIH TANAMAN
            </div>
            <div className={`p-3 rounded-xl border mb-6 font-medium text-sm text-center ${selectedInventoryItem ? 'bg-green-100 border-green-300 text-green-900 shadow-inner' : 'bg-green-50 border-green-100 text-green-700'}`}>
              {selectedInventoryItem 
                ? (SHOP_SEEDS.find(s=>s.id === selectedInventoryItem) 
                   ? `Siap Ditanam: ${SHOP_SEEDS.find(s=>s.id === selectedInventoryItem).name}` 
                   : 'Item ini bukan bibit!') 
                : 'Pilih dari Inventory 👉'}
            </div>

            {/* 3. Booster */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-2">
              <span>⚡</span> Booster
            </div>
            <button
              onClick={handleBuyGrowthBooster}
              className={`w-full p-2 rounded-xl shadow-sm mb-6 font-bold flex justify-between items-center transition-transform ${
                growthMultiplier > 1
                  ? 'bg-green-500 text-white cursor-default'
                  : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:scale-105'
              }`}
            >
              <span>⚡ Growth ×1.5</span>
              <span className="bg-black/20 px-2 py-0.5 rounded text-xs">
                {growthMultiplier > 1 ? 'AKTIF' : '50💰'}
              </span>
            </button>

            {/* 4. Pekerja (Auto) */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-green-200 pb-2">
              <span>🧑‍🌾</span> Pekerja (Auto)
            </div>
            <button
              onClick={handleHireFarmer}
              className={`w-full border-2 p-2 rounded-xl shadow-sm flex justify-between items-center transition-colors text-left ${
                workers.farmer
                  ? 'bg-green-50 border-green-300'
                  : 'bg-white border-blue-200 hover:bg-blue-50'
              }`}
            >
              <div>
                <div className="font-bold text-blue-900 text-sm">🧙‍♂️ Kurcaci Petani</div>
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
            
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4 bg-white/50 p-2 rounded-xl border border-green-100">
              <div className="flex gap-2">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                  <span className="font-bold text-sm text-pink-600 capitalize">
                    {season.current === 'spring' ? '🌸' : season.current === 'summer' ? '☀️' : season.current === 'autumn' ? '🍂' : '❄️'} Musim {season.current} (Hari {season.day})
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                  <span className="font-bold text-sm text-blue-600">
                    {weather.current}
                  </span>
                  <span className="text-xs text-gray-400 ml-2 font-mono">{weather.nextChangeIn}s</span>
                </div>
              </div>
              <button 
                onClick={handleToggleAuto}
                className={`px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm transition-colors border ${autoFarm ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'}`}
              >
                🧙‍♂️ Auto: {autoFarm ? 'ON' : 'OFF'}
              </button>
              <div className="flex gap-2">
                <button onClick={handleClaimDaily} className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm hover:scale-105 transition-transform">🎁 Daily</button>
                <button onClick={handleSave} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-300">💾 Save</button>
                <button onClick={handleReset} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm border border-red-200 hover:bg-red-200">🔄 Reset</button>
              </div>
            </div>

            <div ref={farmRef} className="bg-[#8b5a2b] p-4 sm:p-6 rounded-3xl shadow-inner border-8 border-[#6b4226] relative overflow-hidden mb-6 min-h-[500px]">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="relative w-full h-full z-10 min-h-[450px]">
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
                  
                  const pX = plot.x ?? ((i % 4) * 80 + 10);
                  const pY = plot.y ?? (Math.floor(i / 4) * 80 + 10);

                  return (
                    <motion.button
                      key={plot.id}
                      drag
                      dragMomentum={false}
                      dragConstraints={farmRef}
                      onDragEnd={(e, info) => movePlot(plot.id, pX + info.offset.x, pY + info.offset.y)}
                      animate={{ x: pX, y: pY }}
                      style={{ position: 'absolute' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        // Prevent click if we are dragging
                        if (e.defaultPrevented) return;
                        handlePlotClick(plot);
                      }}
                      className={`w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] rounded-xl relative overflow-hidden flex flex-col items-center justify-center transition-all shadow-md
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

            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-blue-200 pb-2 text-blue-900 mt-8">
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
            <div className="font-bold text-lg mb-3 flex items-center justify-between border-b-2 border-amber-200 pb-2">
              <div className="flex items-center gap-2 text-amber-900">
                <span>📦</span> Inventory
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-3">
              {Object.keys(inventory).length === 0 && (
                <div className="col-span-4 text-center text-xs text-gray-400 py-2">Kosong...</div>
              )}
              {Object.entries(inventory).map(([item, amount]) => amount > 0 && (
                <button 
                  key={item} 
                  onClick={() => setSelectedInventoryItem(item)}
                  className={`bg-white rounded-lg p-1 flex flex-col items-center border-2 relative transition-all hover:scale-105 active:scale-95
                    ${selectedInventoryItem === item ? 'border-green-500 bg-green-50 shadow-md transform scale-110' : 'border-gray-100'}
                  `}
                >
                  <span className="text-xl">{getCropEmoji(item)}</span>
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1 rounded shadow-sm">
                    {amount}
                  </span>
                </button>
              ))}
            </div>
            <button onClick={handleSellAll} className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white py-2 rounded-xl shadow-sm mb-6 font-bold hover:scale-105 transition-transform text-sm">
              💰 Jual Semua
            </button>

            {/* 2. Quest Harian */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-purple-200 pb-2 text-purple-900 mt-6">
              <span>📋</span> Quest Harian
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
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-red-200 pb-2 text-red-900 mt-6">
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
