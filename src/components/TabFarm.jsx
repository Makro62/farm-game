'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import { CraftingWidget } from './ui/CraftingWidget';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { SeedShop } from './game/SeedShop';
import { PlotGrid } from './game/PlotGrid';
import { OrderBoard } from './game/OrderBoard';
import { QuestPanel } from './game/QuestPanel';
import toast from 'react-hot-toast';

export default function TabFarm() {
  const workers = useGameStore(state => state.workers);
  const autoFarm = useGameStore(state => state.autoFarmer);
  const toggleAutoFarm = useGameStore(state => state.toggleAutoFarmer);
  const inventory = useGameStore(state => state.inventory);
  
  const [isEditMode, setIsEditMode] = useState(false);

  const handleToggleAuto = () => {
    if (!workers?.farmer) {
      toast('Sewa Petani Budi dulu di panel kiri! 🔒', { icon: '👨‍🌾' });
      return;
    }
    const next = !autoFarm;
    toggleAutoFarm();
    if (next) {
      // Small check to see if there are any seeds in inventory
      // (not strictly accurate as SHOP_SEEDS is not imported here, but we can just check if any inventory item > 0, 
      // or simply rely on the notification).
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
      <div className="game-tab-grid">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
            <SeedShop />
          </div>
        </div>

        {/* ================= CENTER COLUMN ================= */}
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

        {/* ================= RIGHT COLUMN ================= */}
        <div className="game-sidebar-right">
          <div className="glass-panel p-4 h-full">
            <InventoryWidget />
            <QuestPanel />
            <CraftingWidget type="kitchen" title="Dapur Produksi" icon="🍳" />
          </div>
        </div>

      </div>
    </div>
  );
}
