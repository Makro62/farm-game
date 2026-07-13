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

const FARM_TOOLS = [
  { id: 'tanam', label: 'Tanam', emoji: '🌱' },
  { id: 'siram', label: 'Siram', emoji: '💧' },
  { id: 'panen', label: 'Panen', emoji: '🌾' },
  { id: 'jual', label: 'Jual', emoji: '💰' },
];

export default function TabFarm() {
  const workers = useGameStore((state) => state.workers);
  const autoFarm = useGameStore((state) => state.autoFarmer);
  const toggleAutoFarm = useGameStore((state) => state.toggleAutoFarmer);
  const inventory = useGameStore((state) => state.inventory);
  const buildings = useGameStore((state) => state.buildings);

  const [isEditMode, setIsEditMode] = useState(false);
  const [farmTool, setFarmTool] = useState('tanam');

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

            <GameAreaHeader icon="🌾" title="Ladang">
              <GameActionButton variant="edit" active={isEditMode} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Selesai Edit' : 'Edit Layout'}
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFarm} onClick={handleToggleAuto}>
                Auto: {autoFarm ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            {/* Toolbar seperti mockup: Tanam / Siram / Panen / Jual */}
            <div className="flex flex-wrap justify-center gap-2 mb-3 p-2 rounded-full bg-[var(--wood)]/90 border-2 border-[var(--wood-dark)] shadow-[0_4px_0_var(--wood-dark)]">
              {FARM_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setIsEditMode(false);
                    setFarmTool(tool.id);
                    if (tool.id === 'jual') {
                      toast('Klik petak mana saja untuk jual semua hasil', { icon: '💰' });
                    }
                  }}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition-all border-2 ${
                    farmTool === tool.id && !isEditMode
                      ? 'bg-gradient-to-b from-[#FFE9A0] to-[var(--gold)] text-[var(--text-primary)] border-[#FFF1B8] shadow-md scale-105'
                      : 'bg-[var(--wood-dark)]/40 text-[#FFF1D6] border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className="mr-1">{tool.emoji}</span>
                  {tool.label}
                </button>
              ))}
            </div>

            <PlotGrid isEditMode={isEditMode} farmTool={farmTool} />
            <OrderBoard />
          </div>
        </div>

        <div className="game-sidebar-right">
          <div className="glass-panel p-4 h-full">
            <MarketBoard />
            <QuestPanel />
            <InventoryWidget title="Hasil Panen" />
            <p className="text-[10px] text-center text-[var(--text-secondary)] font-medium mt-2">
              Masak hasil di tab Restoran
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
