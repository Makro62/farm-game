'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { RECIPES, canCook as canCookRecipe } from '../lib/data/recipes';
import { getItemEmoji, getItemDisplayName } from '../lib/data/item-helpers';
import { CraftingWidget } from './ui/CraftingWidget';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { QuestPanel } from './game/QuestPanel';
import { GAME_CONSTANTS } from '@/lib/constants';
import TabPage, { GameStage } from './ui/TabPage';
import SideDock from './ui/SideDock';
import { useRestaurant } from '@/lib/hooks/useRestaurant';

function MenuBoard() {
  return (
    <div className="market-board p-3 mb-5">
      <div className="font-display font-bold text-base mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-[#F4F7E8]">
        <span className="text-xl">📋</span> Papan Menu
      </div>
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {RECIPES.map((recipe) => (
          <div key={recipe.id} className="market-row px-2.5 py-2 flex items-center justify-between gap-2">
            <span className="text-sm font-extrabold text-[#F4F7E8] truncate">
              {recipe.emoji} {recipe.name}
            </span>
            <span className="text-xs font-black text-[#FFE08A] tabular-nums whitespace-nowrap">
              {recipe.price}💰
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KitchenSlots() {
  const craftingQueue = useGameStore((s) => s.craftingQueue || []);
  const slots = Array.from({ length: 3 }, (_, i) => craftingQueue[i] || null);

  return (
    <>
      <h3 className="shop-section-title">
        <span>🍳</span> Dapur Saya
      </h3>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {slots.map((item, i) => {
          const recipe = item ? RECIPES.find((r) => r.id === item.recipeId) : null;
          return (
            <div
              key={i}
              className="aspect-square rounded-xl border-2 border-[var(--wood)] bg-[var(--shop-bg)] flex flex-col items-center justify-center gap-1"
            >
              {recipe ? (
                <>
                  <span className="text-2xl">{recipe.emoji}</span>
                  <span className="text-[9px] font-bold text-[var(--text-secondary)]">Masak...</span>
                </>
              ) : (
                <span className="text-2xl opacity-30">🍳</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-[var(--text-secondary)] font-medium mb-4">
        Slot antrean dapur · maks 3 per jenis menu
      </p>
    </>
  );
}

function TableGrid() {
  const activeCustomers = useGameStore((s) => s.activeCustomers || []);
  const totalTables = useGameStore((s) => s.totalTables || 4);
  const serveCustomer = useGameStore((s) => s.serveCustomer);
  const upgradeTables = useGameStore((s) => s.upgradeTables);
  const openConfirm = useGameStore((s) => s.openConfirm);
  const tables = Array.from({ length: 9 }, (_, i) => i);

  // Force re-render for progress bar animation
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = () => {
    const cost = totalTables * 1000;
    openConfirm(
      'Beli Meja Baru',
      `Beli meja baru seharga ${cost} 💰?`,
      () => {
        upgradeTables();
      }
    );
  };

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-lg mx-auto mb-6 mt-2">
      {tables.map(tableId => {
        const isLocked = tableId >= totalTables;
        const customer = activeCustomers.find(c => c.tableId === tableId);
        
        if (isLocked) {
          return (
            <div 
              key={tableId} 
              onClick={tableId === totalTables ? handleUpgrade : undefined}
              className={`relative aspect-[3/2] bg-[#7a4629] rounded-xl border-4 border-[#5c331a] shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] flex items-center justify-center opacity-70 ${tableId === totalTables ? 'cursor-pointer hover:opacity-100 hover:scale-105 transition-transform' : 'cursor-not-allowed'}`}
            >
              <div className="text-3xl opacity-50">🔒</div>
              {tableId === totalTables && (
                <div className="absolute -bottom-2 bg-[var(--gold)] text-black text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white/20 whitespace-nowrap shadow-sm hover:scale-110 transition-transform">
                  Beli {totalTables * 1000}💰
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={tableId} className="relative aspect-[3/2] bg-[#a86540] rounded-xl border-4 border-[#7a4629] shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)] flex items-center justify-center">
            {/* Table detail */}
            <div className="absolute inset-1.5 bg-[#8b5233] rounded pointer-events-none border border-[#9b6343]" />
             
            <AnimatePresence>
              {customer && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  onClick={() => serveCustomer(customer.id)}
                  className="relative cursor-pointer hover:scale-105 transition-transform z-10"
                >
                  <span className="text-4xl drop-shadow-lg">{customer.emoji}</span>
                  
                  {/* Speech bubble */}
                  <div className="absolute -top-10 -right-6 bg-white rounded-xl p-1.5 shadow-lg border-2 border-gray-200 animate-bounce flex flex-col items-center">
                    <span className="text-xl leading-none">{RECIPES.find(r => r.id === customer.recipeId)?.emoji}</span>
                    <div className="w-1.5 h-1.5 bg-white border-r-2 border-b-2 border-gray-200 absolute -bottom-1 left-3 rotate-45" />
                  </div>
                  
                  {/* Patience bar */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-2 bg-black/40 rounded-full overflow-hidden border border-white/20">
                    <div 
                      className={`h-full transition-all duration-1000 ease-linear ${customer.patience / customer.maxPatience > 0.5 ? 'bg-[#7BC47F]' : customer.patience / customer.maxPatience > 0.25 ? 'bg-[#FFE08A]' : 'bg-red-400'}`}
                      style={{ width: `${Math.max(0, (customer.patience / customer.maxPatience) * 100)}%` }} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function TabRestaurant() {
  const {
    inventory,
    workers,
    autoChef,
    selectedRecipe,
    level,
    menuFilter,
    serviceOn,
    recipes,
    setMenuFilter,
    setServiceOn,
    canCook,
    eatFood,
    handleCook,
    handleHireWorker,
    handleToggleAuto,
    handleSetTarget,
    enqueueNotification
  } = useRestaurant();

  const restaurant = useGameStore((s) => s.restaurant);
  const totalServed = useGameStore((s) => s.stats?.totalServed || 0);

  return (
    <TabPage>
      <GameStage
        main={
          <div className="glass-panel p-3 sm:p-4 stage-play-area">
            <GameAreaHeader icon="👩‍🍳" title="Interior Restoran">
              <GameActionButton
                variant="edit"
                active={!serviceOn}
                onClick={() => {
                  setServiceOn(false);
                  enqueueNotification('Mode atur meja — siapkan menu di toko samping', { icon: '🪑', type: 'info' });
                }}
              >
                Atur Meja
              </GameActionButton>
              <GameActionButton variant="auto" active={autoChef} onClick={handleToggleAuto}>
                Auto: {autoChef ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            {/* Restaurant Stats */}
            <div className="flex items-center justify-between gap-2 mb-2 px-3 py-1.5 rounded-xl bg-[var(--primary-light)]/20 border border-[var(--primary)]/30 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span className="text-[var(--text-primary)]">
                  Reputasi: {restaurant?.reputation || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🍽️</span>
                <span className="text-[var(--text-primary)]">
                  {totalServed} dilayani
                </span>
                <span className="text-[var(--text-secondary)]">
                  {activeCustomers.length} sekarang
                </span>
              </div>
            </div>

            <div
              className="field-frame relative stage-play-frame overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage:
                  'linear-gradient(165deg, rgba(253,246,232,0.75), rgba(232,240,200,0.55)), url(/img/backgrounds/farm_bg.png)',
              }}
            >
              <div className="relative z-10 p-4 sm:p-5 flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-3">
                <div className="text-5xl">🍽️</div>
                <p className="font-display font-bold text-xl text-[var(--text-primary)]">
                  Dapur Dewi Hidangan
                </p>
                <p className="text-sm text-[var(--text-secondary)] font-medium max-w-md mb-2">
                  Pilih menu di panel samping untuk memasak.
                  {serviceOn ? ' Sajikan ke pelanggan dengan mengkliknya!' : ' Mode atur meja aktif.'}
                </p>
                <TableGrid />
                <KitchenSlots />
              </div>
            </div>
          </div>
        }
        side={
          <SideDock
            tabs={[
              {
                id: 'menu',
                label: 'Menu',
                emoji: '🍽️',
                content: (
                  <>
                    <h3 className="shop-section-title">
                      <span>🍽️</span> Menu Hidangan
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {[
                        { id: 'all', label: 'Semua' },
                        { id: 'kitchen', label: 'Dasar' },
                        { id: 'fish_kitchen', label: 'Ikan' },
                        { id: 'restaurant', label: 'Kue' },
                      ].map((f) => (
                        <GameActionButton
                          key={f.id}
                          variant="toggle"
                          active={menuFilter === f.id}
                          onClick={() => setMenuFilter(f.id)}
                          className="!min-h-0 !py-1 !px-2 !text-[10px]"
                        >
                          {f.label}
                        </GameActionButton>
                      ))}
                    </div>
                    <div className="shop-grid mb-3">
                      {recipes.map((recipe) => {
                        const isUnlocked = level >= (recipe.unlockLevel || 1);
                        const ready = isUnlocked && canCook(recipe);
                        const isSelected = selectedRecipe === recipe.id;
                        return (
                          <div key={recipe.id} className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                if (!isUnlocked) {
                                  enqueueNotification(`Resep ini butuh Level ${recipe.unlockLevel}!`, { icon: '🔒', type: 'error' });
                                  return;
                                }
                                handleCook(recipe.id);
                              }}
                              disabled={!ready && isUnlocked}
                              className={`shop-item-card text-left w-full ${!isUnlocked ? 'filter grayscale opacity-60 cursor-not-allowed' : ''} ${
                                ready ? 'ring-2 ring-[var(--primary)]' : (isUnlocked ? 'opacity-75' : '')
                              } ${isSelected ? 'ring-4 ring-yellow-400 !border-yellow-500 bg-yellow-50' : ''}`}
                            >
                              <div className="shop-item-info relative">
                                <span className="shop-item-icon">{recipe.emoji}</span>
                                <span className="shop-item-name">{recipe.name}</span>
                                <span className="shop-item-price">{recipe.price} 💰</span>
                                
                                {!isUnlocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded backdrop-blur-[1px]">
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md border border-white/50">
                                      🔒 Lv {recipe.unlockLevel}
                                    </span>
                                  </div>
                                )}
                                
                                <div className={`flex flex-wrap gap-0.5 justify-center mt-1 ${!isUnlocked ? 'opacity-0' : ''}`}>
                                  {Object.entries(recipe.req).map(([ingredient, qty]) => {
                                    const parts = ingredient.split('.');
                                    const itemId = parts.length === 2 ? parts[1] : ingredient;
                                    const cat = parts.length === 2 ? parts[0] : null;
                                    const available = cat
                                      ? (useGameStore.getState().inventoryByCategory?.[cat]?.[itemId]?.quantity || 0)
                                      : (inventory[itemId] || 0);
                                    return (
                                      <span
                                        key={ingredient}
                                        className={`text-[9px] px-1 rounded ${
                                          available >= qty
                                            ? 'bg-[var(--primary-light)]/40'
                                            : 'bg-red-100 text-red-700'
                                        }`}
                                      >
                                        {getItemEmoji(itemId)}
                                        {qty}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </button>
                            {(inventory[recipe.id] || 0) > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  eatFood(recipe.id);
                                }}
                                className="absolute top-1 left-1 w-6 h-6 rounded-full bg-green-400 text-white flex items-center justify-center text-xs shadow-md z-10 hover:scale-110 transition-transform"
                                title="Makan untuk pulihkan energi"
                              >
                                🍽️
                              </button>
                            )}
                            {workers?.chef && isUnlocked && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetTarget(recipe, isSelected);
                                }}
                                className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md z-10 ${
                                  isSelected
                                    ? 'bg-yellow-400 text-white scale-110'
                                    : 'bg-white text-gray-400 opacity-0 group-hover:opacity-100 border'
                                }`}
                                title="Set target masak otomatis"
                              >
                                📌
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <h3 className="shop-section-title">
                      <span>👨‍🍳</span> Pekerja
                    </h3>
                    <button
                      type="button"
                      onClick={handleHireWorker}
                      className={`w-full glass-card p-2 flex justify-between items-center text-left ${
                        workers?.chef ? 'border-[var(--primary)] bg-[var(--primary)]/10' : ''
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[var(--text-primary)] text-sm">Koki Juna</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">Auto-Cooking</div>
                      </div>
                      <span className="font-bold bg-[var(--gold)] px-2 py-0.5 rounded-full text-xs border border-[#FFF1B8]">
                        {workers?.chef ? 'Dimiliki' : `${GAME_CONSTANTS.COSTS.WORKER_CHEF} 💰`}
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
                    <MenuBoard />
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
