'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { SeedShop } from './game/SeedShop';
import { PlotGrid } from './game/PlotGrid';
import { QuestPanel } from './game/QuestPanel';
import { MarketBoard } from './game/MarketBoard';
import TabPage, { GameStage } from './ui/TabPage';
import SideDock from './ui/SideDock';
import ToolChip from './ui/ToolChip';
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
      toast('Sewa Petani Budi dulu di toko samping!', { icon: '👨‍🌾' });
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
    <TabPage>
      <GameStage
        main={
          <div className="glass-panel p-3 sm:p-4 stage-play-area">
            <GameAreaHeader icon="🌾" title="Ladang">
              <GameActionButton variant="edit" active={isEditMode} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Selesai Edit' : 'Edit Layout'}
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFarm} onClick={handleToggleAuto}>
                Auto: {autoFarm ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            <div className="flex flex-wrap justify-center gap-2 mb-2 p-2 rounded-full bg-[var(--wood)]/90 border-2 border-[var(--wood-dark)] shadow-[0_4px_0_var(--wood-dark)]">
              {FARM_TOOLS.map((tool) => (
                <ToolChip
                  key={tool.id}
                  emoji={tool.emoji}
                  active={farmTool === tool.id && !isEditMode}
                  onClick={() => {
                    setIsEditMode(false);
                    setFarmTool(tool.id);
                    if (tool.id === 'jual') {
                      toast('Klik petak mana saja untuk jual semua hasil', { icon: '💰' });
                    }
                  }}
                >
                  {tool.label}
                </ToolChip>
              ))}
            </div>

            <div className="stage-play-frame">
              <PlotGrid isEditMode={isEditMode} farmTool={farmTool} />
            </div>
          </div>
        }
        side={
          <SideDock
            tabs={[
              {
                id: 'toko',
                label: 'Bibit',
                emoji: '🌱',
                content: (
                  <>
                    <SeedShop />
                    {(buildings?.greenhouse || buildings?.silo) && (
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-2">
                        {buildings?.greenhouse ? 'Greenhouse aktif · ' : ''}
                        {buildings?.silo ? 'Silo +15% jual tanaman' : ''}
                      </p>
                    )}
                  </>
                ),
              },
              {
                id: 'info',
                label: 'Info',
                emoji: '📋',
                content: (
                  <>
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
