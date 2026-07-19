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
import { useFarming } from '@/lib/hooks/useFarming';
import { useGameStore } from '@/lib/store';

const FARM_TOOLS = [
  { id: 'tanam', label: 'Tanam', emoji: '🌱' },
  { id: 'siram', label: 'Siram', emoji: '💧' },
  { id: 'panen', label: 'Panen', emoji: '🌾' },
  { id: 'jual', label: 'Jual', emoji: '💰' },
];

export default function TabFarm() {
  const { autoFarm, handleToggleAuto } = useFarming();
  const buildings = useGameStore((state) => state.buildings);
  const enqueueNotification = useGameStore((state) => state.enqueueNotification);
  const [isEditMode, setIsEditMode] = useState(false);
  const [farmTool, setFarmTool] = useState('tanam');
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
                      enqueueNotification('Klik petak mana saja untuk jual semua hasil', { icon: '💰', type: 'info' });
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
