'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { getAnimalEmoji, getShopAnimal } from '../lib/data/item-helpers';
import { SHOP_ANIMALS, ANIMAL_FEED } from '../lib/data/shop';
import { getAnimalProduceTime } from '@/lib/store/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ShopItemCard, ShopSectionTitle } from './ui/ShopItemCard';
import { AnimalIcon } from './ui/AnimalIcon';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { MarketBoard } from './game/MarketBoard';
import { QuestPanel } from './game/QuestPanel';
import { GAME_CONSTANTS } from '@/lib/constants';
import TabPage, { GameStage } from './ui/TabPage';
import SideDock from './ui/SideDock';
import toast from 'react-hot-toast';

export default function TabAnimal() {
  const animals = useGameStore((state) => state.animals);
  const feedAnimal = useGameStore((state) => state.feedAnimal);
  const collectAnimal = useGameStore((state) => state.collectAnimal);
  const swapAnimals = useGameStore((state) => state.swapAnimals);
  const inventory = useGameStore((state) => state.inventory);
  const workers = useGameStore((state) => state.workers);
  const hireWorker = useGameStore((state) => state.hireWorker);
  const autoFarm = useGameStore((state) => state.autoRancher);
  const toggleAutoFarm = useGameStore((state) => state.toggleAutoRancher);
  const openConfirm = useGameStore((state) => state.openConfirm);
  const buyMultipleAnimals = useGameStore((state) => state.buyMultipleAnimals);
  const weatherEffects = useGameStore((state) => state.weatherEffects);
  
  const [shopAmounts, setShopAmounts] = useState({});

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [isEditMode, setIsEditMode] = useState(false);


  // Auto-collect ditangani lewat store.runAutoWorkers()

  const handleToggleAuto = () => {
    if (!workers?.rancher) {
      toast('Sewa Peternak Siti dulu di toko samping! 🔒', { icon: '👩‍🌾' });
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
    const produceTime = getAnimalProduceTime(animal, weatherEffects);
    if (currentTime - animal.lastCollected >= produceTime) {
      if (collectAnimal(animal.id, animalData.product)) {
        toast.success(`Berhasil memanen dari ternak!`, { icon: '✨', id: `harvest-${animal.id}` });
      }
    }
  };

  const handleFeed = (e, animal) => {
    e.stopPropagation();
    const result = feedAnimal(animal.id);
    if (result.ok) {
      toast.success(result.message, { icon: '🌽' });
    } else {
      toast.error(result.message, { icon: '😢' });
    }
  };

  return (
    <TabPage>
      <GameStage
        main={
          <div className="glass-panel p-3 sm:p-4 stage-play-area">
            <GameAreaHeader icon="🐔" title="Area Peternakan">
              <GameActionButton variant="edit" active={isEditMode} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Selesai Edit' : 'Edit Layout'}
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFarm} onClick={handleToggleAuto}>
                Auto: {autoFarm ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            <div
              className={`p-3 sm:p-4 field-frame relative stage-play-frame transition-all bg-cover bg-center ${isEditMode ? 'ring-4 ring-yellow-400 border-dashed' : ''}`}
              style={{ backgroundImage: "url('/img/backgrounds/animal_bg.png')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 pointer-events-none rounded-[22px]" />
              <div className="kandang-grid relative z-10">
                {Array.from({ length: 36 }).map((_, i) => {
                  const animal = animals[i];
                  if (!animal) {
                    return <div key={`empty-${i}`} className="kandang-empty-cell" />;
                  }

                  const animalData = getShopAnimal(animal.type);
                  const produceTime = getAnimalProduceTime(animal, weatherEffects);
                  const progress = Math.min(100, ((currentTime - animal.lastCollected) / produceTime) * 100);
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
                        ${isReady ? 'ring-2 ring-yellow-400/80 animate-breathe' : ''}
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
                        <div className="absolute bottom-0 left-0 right-0 h-4 progress-bar !rounded-none overflow-hidden border-t border-white/10 z-20 flex items-center justify-center">
                          <div className="progress-fill absolute left-0 top-0 bottom-0" style={{ width: `${progress}%` }} />
                          <span className="relative z-10 text-[9px] font-black text-white drop-shadow-md tracking-wider">
                            {isReady ? (
                              <span className="text-white drop-shadow-md">Siap Diambil! ✨</span>
                            ) : (
                              <span className="text-white drop-shadow-md">
                                {Math.ceil((produceTime - (currentTime - animal.lastCollected)) / 1000)}s ⚡
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      <AnimatePresence mode="popLayout">
                        {isReady && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 2.5, y: -80, opacity: 0, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))', transition: { duration: 0.6, ease: "easeOut" } }}
                            className="absolute -top-2 -right-2 text-xl sm:text-2xl animate-bounce drop-shadow-lg z-20"
                          >
                            {animalData?.productEmoji}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {!isEditMode && (
                        <>
                          {/* Tombol Jual */}
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
                          {/* Tombol Beri Makan */}
                          <span
                            role="button"
                            title={animal.fed ? 'Sudah kenyang' : `Beri makan (butuh ${ANIMAL_FEED[animal.type]?.feedQty ?? '?'}x ${ANIMAL_FEED[animal.type]?.feedItem ?? '?'})`}
                            onClick={(e) => handleFeed(e, animal)}
                            className={`absolute -bottom-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md z-30 border transition-all ${
                              animal.fed
                                ? 'bg-green-400 border-green-200 opacity-80 cursor-default'
                                : 'bg-yellow-300 border-yellow-100 opacity-0 group-hover:opacity-100 cursor-pointer hover:brightness-110'
                            }`}
                          >
                            {animal.fed ? '🟢' : '🌽'}
                          </span>
                        </>
                      )}

                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        }
        side={
          <SideDock
            tabs={[
              {
                id: 'toko',
                label: 'Toko',
                emoji: '🐔',
                content: (
                  <>
                    <ShopSectionTitle icon="🐔">Shop Hewan</ShopSectionTitle>
                    <div className="shop-grid mb-3">
                      {SHOP_ANIMALS.map((animal) => {
                        const amt = shopAmounts[animal.id] || 1;
                        return (
                          <ShopItemCard
                            key={animal.id}
                            icon={getAnimalEmoji(animal.id)}
                            name={animal.name}
                            price={animal.price}
                            amount={amt}
                            onDecrease={() => setShopAmounts((p) => ({ ...p, [animal.id]: Math.max(1, amt - 1) }))}
                            onIncrease={() => setShopAmounts((p) => ({ ...p, [animal.id]: amt + 1 }))}
                            onBuy={() => handleShopBuy(animal, amt)}
                          />
                        );
                      })}
                    </div>
                    <ShopSectionTitle icon="🧑‍🌾">Pekerja</ShopSectionTitle>
                    <button
                      type="button"
                      onClick={handleHireWorker}
                      className={`w-full glass-card p-2 flex justify-between items-center text-left ${
                        workers?.rancher ? 'border-[var(--primary)] bg-[var(--primary)]/10' : ''
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[var(--text-primary)] text-sm">Peternak Siti</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">Auto-Collect</div>
                      </div>
                      <span className="font-bold bg-[var(--gold)] px-2 py-0.5 rounded-full text-xs border border-[#FFF1B8]">
                        {workers?.rancher ? 'Dimiliki' : `${GAME_CONSTANTS.COSTS.WORKER_RANCHER} 💰`}
                      </span>
                    </button>
                  </>
                ),
              },
              {
                id: 'info',
                label: 'Info',
                emoji: '📋',
                content: (
                  <>
                    <ShopSectionTitle icon="🐾">Hewan Saya</ShopSectionTitle>
                    <div className="glass-card rounded-xl p-3 mb-3">
                      {animals.length === 0 ? (
                        <div className="text-center text-sm text-[var(--text-secondary)] italic font-bold">
                          Belum ada hewan.
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {SHOP_ANIMALS.map((animal) => {
                            const count = animals.filter((a) => getShopAnimal(a.type)?.id === animal.id).length;
                            if (count === 0) return null;
                            return (
                              <div key={animal.id} className="p-2 glass-card flex flex-col items-center gap-1">
                                <span className="text-2xl relative">
                                  <AnimalIcon type={animal.id} />
                                  <span className="absolute -bottom-1 -right-1 bg-[var(--gold)] text-[var(--text-primary)] text-[9px] font-black px-1.5 rounded-full border border-[#FFF1B8]">
                                    {count}
                                  </span>
                                </span>
                                <span className="text-[9px] text-[var(--text-secondary)] text-center font-bold">
                                  {animal.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <MarketBoard />
                    <QuestPanel />
                  </>
                ),
              },
            ]}
          />
        }
      />
    </TabPage>
  );
}
