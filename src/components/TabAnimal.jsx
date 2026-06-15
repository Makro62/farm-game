'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import { getAnimalEmoji, SHOP_ANIMALS } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import toast from 'react-hot-toast';

export default function TabAnimal() {
  const animals = useGameStore(state => state.animals);
  const collectAnimal = useGameStore(state => state.collectAnimal);
  const swapAnimals = useGameStore(state => state.swapAnimals);
  const openPrompt = useGameStore(state => state.openPrompt);
  const openConfirm = useGameStore(state => state.openConfirm);
  const buyMultipleAnimals = useGameStore(state => state.buyMultipleAnimals);
  const workers = useGameStore(state => state.workers);
  const hireWorker = useGameStore(state => state.hireWorker);
  const coins = useGameStore(state => state.coins);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [autoFarm, setAutoFarm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);



  // Auto-collect: ambil hasil ternak yang siap (butuh Kurcaci Peternak).
  useEffect(() => {
    if (!autoFarm || !workers.rancher) return;
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      const now = Date.now();
      let collected = 0;
      state.animals.forEach((animal) => {
        const data = SHOP_ANIMALS.find((s) => s.id === animal.type);
        if (!data) return;
        if (now - animal.lastCollected >= animal.produceTime) {
          if (state.collectAnimal(animal.id, data.product)) collected++;
        }
      });
      if (collected > 0) {
        toast.success(`🧑‍🍳 Kurcaci ambil ${collected} hasil ternak!`, { id: 'auto-rancher' });
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [autoFarm, workers.rancher]);

  const handleToggleAuto = () => {
    if (!workers.rancher) {
      toast('Sewa Kurcaci Peternak dulu di panel kiri! 🔒', { icon: '🧑‍🍳' });
      return;
    }
    setAutoFarm((prev) => !prev);
  };

  const handleSellAnimal = (animal) => {
    const animalData = SHOP_ANIMALS.find(a => a.id === animal.type);
    if (!animalData) return;
    
    // Asumsikan harga jual hewan adalah setengah dari harga beli
    const sellPrice = Math.floor(animalData.price / 2);
    
    openConfirm(
      'Jual Hewan',
      `Apakah Anda yakin ingin menjual ${animalData.name} seharga ${sellPrice} 💰?`,
      () => {
        // Implement sell logic (hapus dari array animals dan tambah koin)
        useGameStore.setState(state => {
          const newAnimals = state.animals.filter(a => a.id !== animal.id);
          const currentCoins = state.coins;
          return { animals: newAnimals, coins: currentCoins + sellPrice };
        });
        toast.success(`${animalData.name} berhasil dijual! (+${sellPrice} 💰)`);
      }
    );
  };

  const handleHireWorker = () => {
    if (workers.rancher) {
      toast('Kurcaci Peternak sudah dimiliki! Aktifkan Auto. 🧑‍🍳', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Kurcaci Peternak',
      'Sewa Kurcaci Peternak (Auto-Collect Products) seharga 500 💰?',
      () => {
        if (hireWorker('rancher', 500)) {
          toast.success('Kurcaci Peternak disewa! Nyalakan tombol Auto. 🧑‍🍳');
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleShopClick = (animal) => {
    openPrompt(
      `Beli ${animal.name}`,
      `Harga: ${animal.price} 💰/ekor`,
      (amount) => {
        if (buyMultipleAnimals(animal.id, amount, animal.price, animal.time * 1000)) {
          toast.success(`Berhasil membeli ${amount} ${animal.name}!`);
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleCollect = (animal) => {
    const animalData = SHOP_ANIMALS.find(s => s.id === animal.type);
    if (!animalData) return;
    if (currentTime - animal.lastCollected >= animal.produceTime) {
      if (collectAnimal(animal.id, animalData.product)) {
        toast.success(`Mengambil ${animalData.productEmoji}!`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4">
            
            {/* 1. Shop Hewan */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white">
              <span>🐔</span> HEWAN TERNAK
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {SHOP_ANIMALS.map((animal) => (
                <button
                  key={animal.id}
                  onClick={() => handleShopClick(animal)}
                  disabled={coins < animal.price}
                  className="p-2 glass-card flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <img src={animal.image} alt={animal.name} className="w-12 h-12 object-contain" />
                  <span className="font-semibold text-xs text-white">{animal.name}</span>
                  <span className="text-[10px] font-bold text-pink-300">{animal.price}💰</span>
                </button>
              ))}
            </div>

            {/* 2. Pekerja (Auto) */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white mt-6">
              <span>🧑‍🌾</span> Pekerja (Auto)
            </div>
            <button
              onClick={handleHireWorker}
              className={`w-full glass-card p-2 flex justify-between items-center transition-colors text-left ${
                workers.rancher
                  ? 'border-primary bg-white/10'
                  : ''
              }`}
            >
              <div>
                <div className="font-bold text-gray-100 text-sm">🧑‍🍳 Kurcaci Peternak</div>
                <div className="text-[10px] text-gray-500">Auto-Collect Products</div>
              </div>
              <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs">
                {workers.rancher ? '✅ Dimiliki' : '500💰'}
              </span>
            </button>
          </div>
        </div>

        {/* ================= CENTER COLUMN ================= */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-4">
            
            <StatusHeader setAutoFarm={setAutoFarm} />

            <div className="flex justify-between items-center mb-4">
               <div className="font-bold text-lg flex items-center gap-2 text-white drop-shadow-md">
                 <span>🐔</span> Area Peternakan
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
                  className={`px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm transition-colors border ${autoFarm ? 'bg-blue-500 text-white border-blue-600' : 'glass-card text-gray-200'}`}
                 >
                  🧑‍🍳 Auto: {autoFarm ? 'ON' : 'OFF'}
                 </button>
               </div>
            </div>

            <div 
              className={`p-4 sm:p-6 rounded-3xl shadow-inner border-4 border-[#2e7d32] relative min-h-[400px] transition-all bg-cover bg-center ${isEditMode ? 'ring-4 ring-yellow-400 border-dashed' : ''}`}
              style={{ backgroundImage: "url('/img/backgrounds/animal_bg.png')" }}
            >
              <div className="absolute inset-0 bg-black/40 pointer-events-none rounded-2xl"></div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 relative z-10">
                {animals.map((animal, i) => {
                  const animalData = SHOP_ANIMALS.find(a => a.id === animal.type);
                  const progress = Math.min(100, ((currentTime - animal.lastCollected) / animal.produceTime) * 100);
                  const isReady = progress >= 100;
                  return (
                    <motion.button
                      key={animal.id}
                      layout
                      draggable={isEditMode}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('animalId', animal.id);
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
                          const draggedId = e.dataTransfer.getData('animalId');
                          if (draggedId && draggedId !== animal.id.toString()) {
                            swapAnimals(draggedId, animal.id);
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
                        handleCollect(animal);
                      }}
                      className={`group aspect-square w-full rounded-2xl relative overflow-hidden flex flex-col items-center justify-center transition-all shadow-md bg-white/20 backdrop-blur-sm border-2
                        ${isEditMode ? 'cursor-grab hover:ring-4 ring-yellow-400' : ''}
                        ${isReady ? 'border-yellow-300 ring-4 ring-yellow-400/50 bg-white/40' : 'border-white/30 hover:bg-white/30'}
                      `}
                    >
                      <motion.div animate={isReady ? { y: [0, -5, 0] } : {}} transition={{ duration: 1, repeat: Infinity }} className="drop-shadow-md z-10 flex items-center justify-center">
                        <img src={animalData?.image} alt={animalData?.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl" />
                      </motion.div>
                      {!isReady && (
                        <div className="absolute bottom-2 left-2 right-2 h-1.5 bg-black/30 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{ width: `${progress}%` }} />
                        </div>
                      )}
                      {isReady && (
                        <div className="absolute -top-2 -right-2 text-2xl animate-bounce drop-shadow-lg z-20">
                          {animalData?.productEmoji}
                        </div>
                      )}
                      
                      {/* Tombol Jual Hewan */}
                      {!isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSellAnimal(animal);
                          }}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md text-[10px] font-bold z-30 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Jual Hewan"
                        >
                          Jual
                        </button>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4 h-full">
            
            {/* Inventory */}
            <InventoryWidget />

            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white mt-6">
              <span>🍳</span> Dapur Produksi
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 min-h-[80px] flex items-center justify-center mb-4">
              <span className="text-amber-400 text-sm font-medium italic">Fitur ini akan segera hadir.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
