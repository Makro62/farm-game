'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { SeedShop } from './game/SeedShop';
import { PlotGrid } from './game/PlotGrid';
import { QuestPanel } from './game/QuestPanel';
import { MarketBoard } from './game/MarketBoard';
import { SEASON_META } from '@/lib/nav';
import { getCropGrowthSpeed } from '@/lib/utils/economy';
import TabPage, { GameStage } from './ui/TabPage';
import SideDock from './ui/SideDock';
import ToolChip from './ui/ToolChip';
import { useFarming } from '@/lib/hooks/useFarming';

const FARM_TOOLS = [
  { id: 'tanam', label: 'Tanam', emoji: '🌱' },
  { id: 'siram', label: 'Siram', emoji: '💧' },
  { id: 'panen', label: 'Panen', emoji: '🌾' },
];

const WEATHER_EMOJI = {
  '☀️ Cerah': '☀️', '⛅ Berawan': '⛅', '🌧️ Hujan': '🌧️',
  '⛈️ Badai': '⛈️', '🌫️ Berkabut': '🌫️', '🌬️ Berangin': '🌬️', '☃️ Bersalju': '☃️',
};

export default function TabFarm() {
  const { autoFarm, handleToggleAuto } = useFarming();
  const buildings = useGameStore((state) => state.buildings);
  const season = useGameStore((state) => state.season);
  const weather = useGameStore((state) => state.weather);
  const workers = useGameStore((state) => state.workers);
  const enqueueNotification = useGameStore((state) => state.enqueueNotification);
  const [isEditMode, setIsEditMode] = useState(false);
  const [farmTool, setFarmTool] = useState('tanam');

  const seasonMeta = SEASON_META[season?.current] || SEASON_META.spring;
  const growthSpeed = getCropGrowthSpeed(season?.current, weather?.current, buildings, workers);
  const weatherEmoji = WEATHER_EMOJI[weather?.current] || '☀️';

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

            {/* Weather & Season Banner */}
            <div className="flex items-center justify-between gap-2 mb-2 px-3 py-1.5 rounded-xl bg-[var(--primary-light)]/20 border border-[var(--primary)]/30 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span>{seasonMeta.emoji}</span>
                <span className="text-[var(--text-primary)]">{seasonMeta.label}</span>
                <span className="text-[var(--text-secondary)]">Hari {season?.day || 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{weatherEmoji}</span>
                <span className="text-[var(--text-primary)]">{weather?.current || 'Cerah'}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                  growthSpeed > 1.0 ? 'bg-green-100 text-green-700' : growthSpeed < 1.0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {growthSpeed.toFixed(1)}x tumbuh
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-2 p-2 rounded-full bg-[var(--wood)]/90 border-2 border-[var(--wood-dark)] shadow-[0_4px_0_var(--wood-dark)]">
              {FARM_TOOLS.map((tool) => (
                <ToolChip
                  key={tool.id}
                  emoji={tool.emoji}
                  active={farmTool === tool.id && !isEditMode}
                  onClick={() => {
                    setIsEditMode(false);
                    setFarmTool(tool.id);
                  }}
                >
                  {tool.label}
                </ToolChip>
              ))}
            </div>

            {/* Building & Worker Status */}
            <div className="flex flex-wrap gap-1 mb-2 px-2">
              {buildings?.greenhouse?.unlocked && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  🏠 Greenhouse
                </span>
              )}
              {buildings?.silo?.unlocked && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  🏚️ Silo Lv{buildings.silo.level || 1}
                </span>
              )}
              {workers?.farmer && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  👨‍🌾 Petani {autoFarm ? 'Aktif' : 'Istirahat'}
                </span>
              )}
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
                    {(buildings?.silo?.unlocked) && (
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-2">
                        Silo +15% jual tanaman (Lv{buildings.silo.level})
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
