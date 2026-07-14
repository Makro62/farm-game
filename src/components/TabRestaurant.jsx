'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { RECIPES } from '../lib/data/recipes';
import { getCropEmoji } from '../lib/data/item-helpers';
import { CraftingWidget } from './ui/CraftingWidget';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { QuestPanel } from './game/QuestPanel';
import { GAME_CONSTANTS } from '@/lib/constants';
import TabPage, { GameStage } from './ui/TabPage';
import SideDock from './ui/SideDock';
import toast from 'react-hot-toast';

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
  const craftingQueue = useGameStore((s) => s.craftingQueue);
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

export default function TabRestaurant() {
  const inventory = useGameStore((state) => state.inventory);
  const startCrafting = useGameStore((state) => state.startCrafting);
  const workers = useGameStore((state) => state.workers);
  const hireWorker = useGameStore((state) => state.hireWorker);
  const autoChef = useGameStore((state) => state.autoChef);
  const toggleAutoChef = useGameStore((state) => state.toggleAutoChef);
  const selectedRecipe = useGameStore((state) => state.selectedRecipe);
  const setSelectedRecipe = useGameStore((state) => state.setSelectedRecipe);
  const openConfirm = useGameStore((state) => state.openConfirm);

  const [menuFilter, setMenuFilter] = useState('all'); // all | kitchen | fish_kitchen | restaurant
  const [serviceOn, setServiceOn] = useState(true);

  const recipes =
    menuFilter === 'all' ? RECIPES : RECIPES.filter((r) => r.type === menuFilter);

  const canCook = (recipe) =>
    Object.entries(recipe.req).every(([item, qty]) => (inventory[item] || 0) >= qty);

  const handleCook = (recipeId) => {
    if (startCrafting(recipeId)) {
      // toast from store
    }
  };

  const handleHireWorker = () => {
    if (workers?.chef) {
      toast('Koki Juna sudah disewa! Aktifkan Auto. 👨‍🍳', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Koki Juna',
      `Sewa Koki Juna (Auto-Cooking) seharga ${GAME_CONSTANTS.COSTS.WORKER_CHEF} 💰?`,
      () => {
        if (hireWorker('chef', GAME_CONSTANTS.COSTS.WORKER_CHEF)) {
          toast.success('Koki Juna berhasil disewa! Pilih target menu.');
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleToggleAuto = () => {
    if (!workers?.chef) {
      toast('Sewa Koki Juna dulu di toko samping! 🔒', { icon: '👨‍🍳' });
      return;
    }
    if (!selectedRecipe && !autoChef) {
      toast('Pilih salah satu resep sebagai target sebelum menyalakan Koki!', { icon: '📌' });
      return;
    }
    const next = !autoChef;
    toggleAutoChef();
    toast.success(
      next ? 'Koki Juna mulai masak otomatis!' : 'Koki Juna istirahat.',
      { id: 'auto-chef-toggle' }
    );
  };

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
                  toast('Mode atur meja — siapkan menu di toko samping', { icon: '🪑' });
                }}
              >
                Atur Meja
              </GameActionButton>
              <GameActionButton variant="auto" active={autoChef} onClick={handleToggleAuto}>
                Auto: {autoChef ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

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
                <p className="text-sm text-[var(--text-secondary)] font-medium max-w-md">
                  Pilih menu di panel samping untuk memasak.
                  {serviceOn ? ' Layanan menerima pesanan.' : ' Mode atur meja aktif.'}
                </p>
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
                        const ready = canCook(recipe);
                        const isSelected = selectedRecipe === recipe.id;
                        return (
                          <div key={recipe.id} className="relative group">
                            <button
                              type="button"
                              onClick={() => handleCook(recipe.id)}
                              disabled={!ready}
                              className={`shop-item-card text-left w-full ${
                                ready ? 'ring-2 ring-[var(--primary)]' : 'opacity-75'
                              } ${isSelected ? 'ring-4 ring-yellow-400 !border-yellow-500 bg-yellow-50' : ''}`}
                            >
                              <div className="shop-item-info">
                                <span className="shop-item-icon">{recipe.emoji}</span>
                                <span className="shop-item-name">{recipe.name}</span>
                                <span className="shop-item-price">{recipe.price} 💰</span>
                                <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                                  {Object.entries(recipe.req).map(([item, qty]) => (
                                    <span
                                      key={item}
                                      className={`text-[9px] px-1 rounded ${
                                        (inventory[item] || 0) >= qty
                                          ? 'bg-[var(--primary-light)]/40'
                                          : 'bg-red-100 text-red-700'
                                      }`}
                                    >
                                      {getCropEmoji(item)}
                                      {qty}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </button>
                            {workers?.chef && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRecipe(isSelected ? null : recipe.id);
                                  if (!isSelected) {
                                    toast.success(`${recipe.name} jadi target Auto Chef!`, {
                                      icon: '📌',
                                      id: 'set-target',
                                    });
                                  }
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
