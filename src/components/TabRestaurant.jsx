'use client';

import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import { CraftingWidget } from './ui/CraftingWidget';
import { GameAreaHeader } from './ui/GameAreaHeader';
import { RECIPES } from '@/lib/utils';
import { useGameStore } from '@/lib/store';

export default function TabRestaurant() {
  const inventory = useGameStore((state) => state.inventory);

  const readyRecipes = RECIPES.filter((recipe) =>
    Object.entries(recipe.req).every(([item, qty]) => (inventory[item] || 0) >= qty)
  ).slice(0, 6);

  const missingHints = [
    { label: 'Tanaman', tip: 'Panen di Pertanian' },
    { label: 'Susu / Telur', tip: 'Ambil di Peternakan' },
    { label: 'Ikan', tip: 'Mancing di Kota' },
  ];

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="game-tab-grid">
        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
            <h3 className="shop-section-title">
              <span>📋</span> Menu Hari Ini
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3 font-medium">
              Semua dapur digabung di sini: olahan dasar, ikan, dan kue spesial.
            </p>

            <div className="space-y-2 mb-4">
              {missingHints.map((h) => (
                <div
                  key={h.label}
                  className="glass-card p-2.5 rounded-xl flex justify-between items-center text-sm"
                >
                  <span className="font-bold text-[var(--text-primary)]">{h.label}</span>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)]">{h.tip}</span>
                </div>
              ))}
            </div>

            <div className="shop-section-title !text-sm">
              <span>✅</span> Siap Masak
            </div>
            {readyRecipes.length === 0 ? (
              <div className="text-center text-sm text-[var(--text-secondary)] italic py-3 font-bold">
                Belum ada resep yang bahannya cukup.
              </div>
            ) : (
              <div className="space-y-1.5">
                {readyRecipes.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 bg-[var(--primary-light)]/30 border border-[var(--primary)]/40 rounded-xl px-2.5 py-1.5 text-sm font-bold text-[var(--text-primary)]"
                  >
                    <span className="text-xl">{r.emoji}</span>
                    <span className="truncate flex-1">{r.name}</span>
                    <span className="text-[10px] text-[var(--gold-deep)]">{r.price}💰</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="game-main">
          <div className="glass-panel p-4">
            <StatusHeader />
            <GameAreaHeader icon="👩‍🍳" title="Dapur Dewi Hidangan" />
            <div className="bg-[var(--shop-bg)] rounded-2xl p-3 sm:p-4 border-2 border-[var(--wood)] min-h-[300px]">
              <CraftingWidget hub type="kitchen" title="Pilih Jenis Dapur" icon="🍳" />
            </div>
          </div>
        </div>

        <div className="game-sidebar-right">
          <div className="glass-panel p-4 h-full">
            <InventoryWidget />
            <p className="text-[10px] text-[var(--text-secondary)] font-medium text-center">
              Hasil olahan masuk tas — jual lewat tombol di atas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
