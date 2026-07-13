'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import { CraftingWidget } from './ui/CraftingWidget';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { SeedShop } from './game/SeedShop';
import { PlotGrid } from './game/PlotGrid';
import { OrderBoard } from './game/OrderBoard';
import { QuestPanel } from './game/QuestPanel';
import { MarketBoard } from './game/MarketBoard';
import toast from 'react-hot-toast';

export default function TabFarm() {
  const workers = useGameStore(state => state.workers);
  const autoFarm = useGameStore(state => state.autoFarmer);
  const toggleAutoFarm = useGameStore(state => state.toggleAutoFarmer);
  const inventory = useGameStore(state => state.inventory);
  const season = useGameStore(state => state.season);
  const buildings = useGameStore(state => state.buildings);

  const [isEditMode, setIsEditMode] = useState(false);

  const handleToggleAuto = () => {
    if (!workers?.farmer) {
      toast('Sewa Petani Budi dulu di panel kiri! 🔒', { icon: '👨‍🌾' });
      return;
    }
    const next = !autoFarm;
    toggleAutoFarm();
    if (next) {
      const hasSeeds = Object.values(inventory).some(val => val > 0);
      if (!hasSeeds) {
        toast('Auto ON — beli bibit dulu agar kurcaci bisa menanam! 🌱', { icon: '👨‍🌾' });
      } else {
        toast.success('Kurcaci petani aktif! Auto panen & tanam.', { id: 'auto-farm-toggle' });
      }
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-2xl border-2 border-[#e8d296]/35 bg-gradient-to-r from-[#2f6b3a]/90 to-[#1c301e]/90 px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-lg"
      >
        <div>
          <p className="font-display font-bold text-lg text-[#f7f4e8] text-shadow">🌾 Ladang Musim {season?.current}</p>
          <p className="text-xs font-bold text-[#d7e4c8]/90">
            Beli bibit musiman · tanam · panen · jual di papan harga
            {buildings?.greenhouse ? ' · 🏠 Greenhouse aktif' : ''}
            {buildings?.silo ? ' · 🏚️ Silo +15%' : ''}
          </p>
        </div>
        <div className="text-[11px] font-black uppercase tracking-wide bg-[#f0b429] text-[#4a3208] px-3 py-1.5 rounded-xl border border-[#fff1b8]">
          Hari {season?.day || 1}/7
        </div>
      </motion.div>

      <div className="game-tab-grid">
        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
            <SeedShop />
          </div>
        </div>

        <div className="game-main">
          <div className="glass-panel p-4">
            <StatusHeader />

            <GameAreaHeader icon="🌾" title="Area Pertanian">
              <GameActionButton variant="edit" active={isEditMode} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? '💾 Selesai Edit' : '✏️ Edit Layout'}
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFarm} onClick={handleToggleAuto}>
                🧙‍♂️ Auto: {autoFarm ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            <PlotGrid isEditMode={isEditMode} />
            <OrderBoard />
          </div>
        </div>

        <div className="game-sidebar-right">
          <div className="glass-panel p-4 h-full">
            <InventoryWidget />
            <MarketBoard />
            <QuestPanel />
            <CraftingWidget type="kitchen" title="Dapur Produksi" icon="🍳" />
          </div>
        </div>
      </div>
    </div>
  );
}
