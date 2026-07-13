'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';
import { getAnimalEmoji, getShopAnimal, SHOP_ANIMALS, RECIPES, getCropEmoji } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import { ShopItemCard, ShopSectionTitle } from './ui/ShopItemCard';
import { AnimalIcon } from './ui/AnimalIcon';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { GAME_CONSTANTS } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function TabAnimal() {
  const animals = useGameStore(state => state.animals);
  const inventory = useGameStore(state => state.inventory);
  const collectAnimal = useGameStore(state => state.collectAnimal);
  const swapAnimals = useGameStore(state => state.swapAnimals);
  const openPrompt = useGameStore(state => state.openPrompt);
  const openConfirm = useGameStore(state => state.openConfirm);
  const buyItem = useGameStore(state => state.buyItem);
  const coins = useGameStore(state => state.coins);
  const buyMultipleAnimals = useGameStore(state => state.buyMultipleAnimals);
  const workers = useGameStore(state => state.workers);
  const hireWorker = useGameStore(state => state.hireWorker);
  const autoFarm = useGameStore(state => state.autoRancher);
  const toggleAutoFarm = useGameStore(state => state.toggleAutoRancher);
  
  const [shopAmounts, setShopAmounts] = useState({});

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [isEditMode, setIsEditMode] = useState(false);


  // Global Game Loop (di page.js) sudah menangani auto-collect via store.runAutoWorkers()

  const handleToggleAuto = () => {
    if (!workers?.rancher) {
      toast('Sewa Peternak Siti dulu di panel kiri! 🔒', { icon: '👩‍🌾' });
      return;
    }
    const next = !autoFarm;
    toggleAutoFarm();
    toast.success(
      next ? 'Kurcaci peternak aktif!' : 'Kurcaci peternak istirahat.',
      { id: 'auto-rancher-toggle' }
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
        // Implement sell logic (hapus dari array animals dan tambah koin)
        useGameStore.setState(state => ({
          animals: state.animals.filter(a => a.id !== animal.id),
        }));
        useGameStore.getState().addCoins(sellPrice);
        toast.success(`${animalData.name} berhasil dijual! (+${sellPrice} 💰)`);
      }
    );
  };

  const handleHireWorker = () => {
    if (workers.rancher) {
      toast('Peternak Siti sudah dimiliki! Aktifkan Auto. 👩‍🌾', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Peternak Siti',
      `Sewa Peternak Siti (Auto-Collect Products) seharga ${GAME_CONSTANTS.COSTS.WORKER_RANCHER} 💰?`,
      () => {
        if (hireWorker('rancher', GAME_CONSTANTS.COSTS.WORKER_RANCHER)) {
          toast.success('Peternak Siti berhasil disewa! Auto ternak aktif. 👩‍🌾');
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleShopBuy = (animal, amount) => {
    if (buyMultipleAnimals(animal.id, amount, animal.price, animal.time * 1000)) {
      toast.success(`Berhasil membeli ${amount} ${animal.name}!`);
    } else {
      toast.error('Koin tidak cukup!');
    }
  };

  const handleCollect = (animal) => {
    const animalData = getShopAnimal(animal.type);
    if (!animalData) return;
    if (currentTime - animal.lastCollected >= animal.produceTime) {
      if (collectAnimal(animal.id, animalData.product)) {
        toast.success(`Mengambil ${animalData.productEmoji}!`);
      }
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="game-tab-grid">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
            
            {/* 1. Shop Hewan */}
            <ShopSectionTitle icon="🐔">Shop Hewan</ShopSectionTitle>
            <div className="shop-grid mb-6">
              {SHOP_ANIMALS.map((animal) => {
                const amt = shopAmounts[animal.id] || 1;
                return (
                  <ShopItemCard
                    key={animal.id}
                    icon={getAnimalEmoji(animal.id)}
                    name={animal.name}
                    price={animal.price}
                    amount={amt}
                    onDecrease={() => setShopAmounts(p => ({ ...p, [animal.id]: Math.max(1, amt - 1) }))}
                    onIncrease={() => setShopAmounts(p => ({ ...p, [animal.id]: amt + 1 }))}
                    onBuy={() => handleShopBuy(animal, amt)}
                  />
                );
              })}
            </div>

            <ShopSectionTitle icon="🥚">Hasil Ternak</ShopSectionTitle>
            <div className="glass-card rounded-xl p-3 mb-6">
              {SHOP_ANIMALS.filter(a => inventory[a.product] > 0).length === 0 ? (
                <div className="text-center text-sm text-gray-400 italic">Belum ada hasil ternak.</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {SHOP_ANIMALS.filter(a => inventory[a.product] > 0).map(animal => (
                    <div
                      key={animal.product}
                      className="p-2 glass-card flex flex-col items-center gap-1"
                      title={animal.name}
                    >
                      <span className="text-2xl relative">
                        {animal.productEmoji}
                        <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1 rounded-sm shadow-sm">
                          {inventory[animal.product]}
                        </span>
                      </span>
                      <span className="text-[9px] text-gray-300 text-center leading-tight capitalize">
                        {animal.product.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ShopSectionTitle icon="🧑‍🌾">Pekerja (Auto)</ShopSectionTitle>
            <button
              onClick={handleHireWorker}
              className={`w-full glass-card p-2 flex justify-between items-center transition-colors text-left mb-2 ${
                workers?.rancher ? 'border-primary bg-white/10' : ''
              }`}
            >
              <div>
                <div className="font-bold text-[#3E2723] text-sm">👩‍🌾 Peternak Siti</div>
                <div className="text-[10px] text-gray-500">Auto-Collect Products</div>
              </div>
              <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                {workers?.rancher ? '✅ Dimiliki' : `${GAME_CONSTANTS.COSTS.WORKER_RANCHER} 💰`}
              </span>
            </button>
            {workers?.rancher && (
              <p className="text-[10px] text-gray-400 mb-2">
                {autoFarm
                  ? animals.length > 0
                    ? '✅ Kurcaci aktif — ambil hasil ternak otomatis'
                    : '⚠️ Auto ON — beli hewan dulu'
                  : 'Nyalakan tombol Auto di atas untuk mulai'}
              </p>
            )}
          </div>
        </div>

        {/* ================= CENTER COLUMN ================= */}
        <div className="game-main">
          <div className="glass-panel p-4">
            
            <StatusHeader />

            <GameAreaHeader icon="🐔" title="Area Peternakan">
              <GameActionButton variant="edit" active={isEditMode} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Selesai Edit' : 'Edit Layout'}
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFarm} onClick={handleToggleAuto}>
                Auto: {autoFarm ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            <div 
              className={`p-4 sm:p-6 field-frame relative min-h-[400px] transition-all bg-cover bg-center ${isEditMode ? 'ring-4 ring-yellow-400 border-dashed' : ''}`}
              style={{ backgroundImage: "url('/img/backgrounds/animal_bg.png')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 pointer-events-none rounded-[22px]"></div>
              <div className="kandang-grid relative z-10 pt-4">
                {Array.from({ length: 20 }).map((_, i) => {
                  const animal = animals[i];
                  if (!animal) {
                    return (
                      <div key={`empty-${i}`} className="kandang-empty-cell"></div>
                    );
                  }
                  
                  const animalData = getShopAnimal(animal.type);
                  const progress = Math.min(100, ((currentTime - animal.lastCollected) / animal.produceTime) * 100);
                  const isReady = progress >= 100;
                  return (
                    <motion.button
                      key={animal.id}
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
                      className={`group kandang-animal-cell
                        ${isEditMode ? 'cursor-grab ring-2 ring-yellow-400' : ''}
                        ${isReady ? 'ring-2 ring-yellow-400/80 animate-glow' : ''}
                      `}
                    >
                      <motion.div
                        animate={isReady ? { y: [0, -5, 0] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="z-10 w-full h-full flex items-center justify-center"
                      >
                        <AnimalIcon type={animal.type} />
                      </motion.div>
                      {!isReady && (
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/60 overflow-hidden border-t border-white/10 z-20 flex items-center justify-center">
                          <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#ffe08a] to-[#f0b429]" style={{ width: `${progress}%` }} />
                          <span className="relative z-10 text-[9px] font-black text-white drop-shadow-md tracking-wider">
                            {Math.ceil((animal.produceTime - (currentTime - animal.lastCollected)) / 1000)}s ⚡
                          </span>
                        </div>
                      )}
                      {isReady && (
                        <div className="absolute -top-2 -right-2 text-xl sm:text-2xl animate-bounce drop-shadow-lg z-20">
                          {animalData?.productEmoji}
                        </div>
                      )}
                      
                      {/* Tombol Jual Hewan */}
                      {!isEditMode && (
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSellAnimal(animal);
                          }}
                          className="absolute -top-2 -left-2 bg-[#ff7a6b] text-[#3b120c] rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer hover:brightness-110 border border-[#ffb3aa]"
                        >
                          ✕
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="game-sidebar-right">
          <div className="glass-panel p-4 h-full">
            
            <InventoryWidget />
            <p className="text-[10px] text-center text-[var(--text-secondary)] font-medium mt-2">
              Olah susu & telur di tab Restoran
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
