'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { RECIPES, getCropEmoji } from '@/lib/utils';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import { CraftingWidget } from './ui/CraftingWidget';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { QuestPanel } from './game/QuestPanel';
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

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="game-tab-grid">
        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
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
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setMenuFilter(f.id)}
                  className={`game-action-btn !min-h-0 !py-1 !px-2 !text-[10px] ${
                    menuFilter === f.id ? 'game-action-btn--edit' : ''
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="shop-grid mb-6">
              {recipes.map((recipe) => {
                const ready = canCook(recipe);
                return (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => handleCook(recipe.id)}
                    disabled={!ready}
                    className={`shop-item-card text-left ${
                      ready ? 'ring-2 ring-[var(--primary)]' : 'opacity-75'
                    }`}
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
                      <span className="text-[9px] font-black text-[var(--text-secondary)] mt-1">
                        {ready ? 'Klik untuk masak' : 'Bahan kurang'} · {recipe.time}s
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <KitchenSlots />
          </div>
        </div>

        <div className="game-main">
          <div className="glass-panel p-4">
            <StatusHeader />

            <GameAreaHeader icon="👩‍🍳" title="Interior Restoran">
              <GameActionButton
                variant="edit"
                active={!serviceOn}
                onClick={() => {
                  setServiceOn(false);
                  toast('Mode atur meja — siapkan menu di panel kiri', { icon: '🪑' });
                }}
              >
                Atur Meja
              </GameActionButton>
              <GameActionButton
                variant="auto"
                active={serviceOn}
                onClick={() => {
                  setServiceOn(true);
                  toast.success('Layanan restoran aktif!');
                }}
              >
                Layanan: {serviceOn ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            <div
              className="field-frame relative min-h-[320px] overflow-hidden mb-4 bg-cover bg-center"
              style={{
                backgroundImage:
                  'linear-gradient(165deg, rgba(253,246,232,0.75), rgba(232,240,200,0.55)), url(/img/backgrounds/farm_bg.png)',
              }}
            >
              <div className="relative z-10 p-4 sm:p-5 flex flex-col items-center justify-center min-h-[280px] text-center gap-3">
                <div className="text-5xl">🍽️</div>
                <p className="font-display font-bold text-xl text-[var(--text-primary)]">
                  Dapur Dewi Hidangan
                </p>
                <p className="text-sm text-[var(--text-secondary)] font-medium max-w-md">
                  Pilih menu di kiri untuk memasak. Hasil masuk tas dan bisa dijual.
                  {serviceOn ? ' Layanan sedang menerima pesanan.' : ' Mode atur meja aktif.'}
                </p>
                <div className="flex gap-3 text-3xl mt-2">
                  <span title="Koki">👨‍🍳</span>
                  <span title="Meja">🪑</span>
                  <span title="Tamu">🧑‍🤝‍🧑</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--shop-bg)] rounded-2xl p-3 sm:p-4 border-2 border-[var(--wood)]">
              <CraftingWidget hub type="kitchen" title="Antrean Memasak" icon="🍳" />
            </div>
          </div>
        </div>

        <div className="game-sidebar-right">
          <div className="glass-panel p-4 h-full">
            <InventoryWidget title="Persediaan Dapur" />
            <MenuBoard />
            <QuestPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
