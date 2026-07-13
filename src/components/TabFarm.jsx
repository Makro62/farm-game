'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { SeedShop } from './game/SeedShop';
import { PlotGrid } from './game/PlotGrid';
import { OrderBoard } from './game/OrderBoard';
import { QuestPanel } from './game/QuestPanel';
import { MarketBoard } from './game/MarketBoard';
import toast from 'react-hot-toast';

export default function TabFarm() {
  const workers = useGameStore((state) => state.workers);
  const autoFarm = useGameStore((state) => state.autoFarmer);
  const toggleAutoFarm = useGameStore((state) => state.toggleAutoFarmer);
  const inventory = useGameStore((state) => state.inventory);
  const buildings = useGameStore((state) => state.buildings);

  const [isEditMode, setIsEditMode] = useState(false);

  const handleToggleAuto = () => {
    if (!workers?.farmer) {
      toast('Sewa Petani Budi dulu di panel kiri!', { icon: '👨‍🌾' });
      return;
    }
    const next = !autoFarm;
    toggleAutoFarm();
    if (next) {
      const hasSeeds = Object.values(inventory).some((val) => val > 0);
      if (!hasSeeds) {
        toast('Auto ON — beli bibit dulu agar kurcaci bisa menanam!', { icon: '👨‍🌾' });
      } else {
        toast.success('Kurcaci petani aktif! Auto panen & tanam.', { id: 'auto-farm-toggle' });
      }
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="game-tab-grid">
        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
            <SeedShop />
            {(buildings?.greenhouse || buildings?.silo) && (
              <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-2">
                {buildings?.greenhouse ? 'Greenhouse aktif · ' : ''}
                {buildings?.silo ? 'Silo +15% jual tanaman' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="game-main">
          <div className="glass-panel p-4">
            <StatusHeader />

            <GameAreaHeader icon="🌾" title="Area Pertanian">
              <GameActionButton variant="edit" active={isEditMode} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Selesai Edit' : 'Edit Layout'}
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFarm} onClick={handleToggleAuto}>
                Auto: {autoFarm ? 'ON' : 'OFF'}
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
            <p className="text-[10px] text-center text-[var(--text-secondary)] font-medium mt-2">
              Masak hasil panen di tab Restoran
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
