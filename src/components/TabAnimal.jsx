'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import { getAnimalEmoji, SHOP_ANIMALS } from '@/lib/utils';
import { motion } from 'framer-motion';
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

  const handleHireRancher = () => {
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
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-pink-200 pb-2 text-pink-900">
              <span>🐔</span> HEWAN TERNAK
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {SHOP_ANIMALS.map((animal) => (
                <button
                  key={animal.id}
                  onClick={() => handleShopClick(animal)}
                  className="p-2 rounded-xl border-2 border-pink-100 hover:border-pink-300 hover:shadow-sm transition-all flex flex-col items-center gap-1 bg-white"
                >
                  <span className="text-3xl">{getAnimalEmoji(animal.id)}</span>
                  <span className="font-semibold text-xs">{animal.name}</span>
                  <span className="text-[10px] font-bold text-pink-600">{animal.price}💰</span>
                </button>
              ))}
            </div>

            {/* 2. Pekerja (Auto) */}
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-pink-200 pb-2 text-pink-900 mt-6">
              <span>🧑‍🌾</span> Pekerja (Auto)
            </div>
            <button
              onClick={handleHireRancher}
              className={`w-full border-2 p-2 rounded-xl shadow-sm flex justify-between items-center transition-colors text-left ${
                workers.rancher
                  ? 'bg-green-50 border-green-300'
                  : 'bg-white border-blue-200 hover:bg-blue-50'
              }`}
            >
              <div>
                <div className="font-bold text-blue-900 text-sm">🧑‍🍳 Kurcaci Peternak</div>
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
            
            <div className="flex justify-between items-center mb-4">
               <div className="font-bold text-lg flex items-center gap-2 text-green-900">
                 <span>🐔</span> Area Peternakan
               </div>
               <div className="flex gap-2">
                 <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm transition-colors border ${isEditMode ? 'bg-yellow-400 text-yellow-900 border-yellow-500 animate-pulse' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'}`}
                 >
                  {isEditMode ? '💾 Selesai Edit' : '✏️ Edit Layout'}
                 </button>
                 <button 
                  onClick={handleToggleAuto}
                  className={`px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm transition-colors border ${autoFarm ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'}`}
                 >
                  🧑‍🍳 Auto: {autoFarm ? 'ON' : 'OFF'}
                 </button>
               </div>
            </div>

            <div className={`bg-[#4caf50] p-4 sm:p-6 rounded-3xl shadow-inner border-8 border-[#2e7d32] relative min-h-[400px] transition-all ${isEditMode ? 'ring-4 ring-yellow-400 border-dashed' : ''}`}>
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
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
                      className={`aspect-square w-full rounded-2xl relative overflow-hidden flex flex-col items-center justify-center transition-all shadow-md bg-white/20 backdrop-blur-sm border-2
                        ${isEditMode ? 'cursor-grab hover:ring-4 ring-yellow-400' : ''}
                        ${isReady ? 'border-yellow-300 ring-4 ring-yellow-400/50 bg-white/40' : 'border-white/30 hover:bg-white/30'}
                      `}
                    >
                      <motion.div animate={isReady ? { y: [0, -5, 0] } : {}} transition={{ duration: 1, repeat: Infinity }} className="text-4xl drop-shadow-md z-10">
                        {getAnimalEmoji(animal.type)}
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
            <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-amber-200 pb-2 text-amber-900">
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
