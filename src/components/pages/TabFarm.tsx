'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/lib/store'
import { useMusic } from '@/lib/hooks/useSound'
import {
  GameAreaHeader,
  GameActionButton,
} from '@/components/ui/GameAreaHeader'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { SeedShop } from '@/components/game/SeedShop'
import { PlotGrid } from '@/components/game/PlotGrid'
import { QuestPanel } from '@/components/game/QuestPanel'
import { MarketBoard } from '@/components/game/MarketBoard'
import { SEASON_META } from '@/lib/nav'
import { getCropGrowthSpeed } from '@/lib/utils/economy'
import TabPage, { GameStage } from '@/components/ui/TabPage'
import SideDock from '@/components/ui/SideDock'
import ToolChip from '@/components/ui/ToolChip'
import { useFarming } from '@/lib/hooks/useFarming'

const FARM_TOOLS = [
  { id: 'tanam', label: 'Tanam', emoji: '🌱' },
  { id: 'siram', label: 'Siram', emoji: '💧' },
  { id: 'panen', label: 'Panen', emoji: '🌾' },
  { id: 'upgrade', label: 'Upgrade', emoji: '⭐' },
]

const WEATHER_EMOJI = {
  '☀️ Cerah': '☀️',
  '⛅ Berawan': '⛅',
  '🌧️ Hujan': '🌧️',
  '⛈️ Badai': '⛈️',
  '🌫️ Berkabut': '🌫️',
  '🌬️ Berangin': '🌬️',
  '☃️ Bersalju': '☃️',
}

export default function TabFarm() {
  const music = useMusic('farm')

  useEffect(() => {
    music.play()
    return () => music.stop()
  }, [])

  const { autoFarm, handleToggleAuto } = useFarming()
  const buildings = useGameStore(state => state.buildings)
  const season = useGameStore(state => state.season)
  const weather = useGameStore(state => state.weather)
  const workers = useGameStore(state => state.workers)
  const enqueueNotification = useGameStore(state => state.enqueueNotification)
  const harvestAll = useGameStore(state => state.harvestAll)
  const plantAll = useGameStore(state => state.plantAll)
  const selectedSeed = useGameStore(state => state.selectedSeed)
  const level = useGameStore(state => state.level)
  const [isEditMode, setIsEditMode] = useState(false)
  const [farmTool, setFarmTool] = useState('tanam')
  const [activePlotTab, setActivePlotTab] = useState('plots')

  const seasonMeta = SEASON_META[season?.current] || SEASON_META.spring
  const growthSpeed = getCropGrowthSpeed(
    season?.current,
    weather?.current,
    buildings,
    workers
  )
  const weatherEmoji = WEATHER_EMOJI[weather?.current] || '☀️'

  return (
    <TabPage>
      <GameStage
        main={
          <div 
            className="glass-panel p-3 sm:p-4 stage-play-area relative overflow-hidden"
            style={{
              backgroundImage: 'linear-gradient(rgba(255, 252, 245, 0.4), rgba(255, 252, 245, 0.5)), url("/img/backgrounds/farm_bg.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <GameAreaHeader icon="🌾" title="Ladang">
              <GameActionButton
                variant="edit"
                active={isEditMode}
                onClick={() => setIsEditMode(!isEditMode)}
              >
                {isEditMode ? 'Selesai Edit' : 'Edit Layout'}
              </GameActionButton>
              <GameActionButton
                variant="auto"
                active={autoFarm}
                onClick={handleToggleAuto}
              >
                Auto: {autoFarm ? 'ON' : 'OFF'}
              </GameActionButton>
              {level >= 5 && (
                <>
                  <GameActionButton
                    variant="edit"
                    active={false}
                    onClick={() => {
                      const res = harvestAll(activePlotTab)
                      if (res?.ok) toast.success(res.message)
                      else toast.error(res?.message || 'Gagal panen.')
                    }}
                  >
                    🌾 Panen Semua
                  </GameActionButton>
                  <GameActionButton
                    variant="edit"
                    active={false}
                    onClick={() => {
                      if (!selectedSeed) {
                        toast.error('Pilih bibit dari tas terlebih dahulu!')
                        return
                      }
                      const res = plantAll(activePlotTab, selectedSeed)
                      if (res?.ok) toast.success(res.message)
                      else toast.error(res?.message || 'Gagal menanam.')
                    }}
                  >
                    🌱 Tanam Semua
                  </GameActionButton>
                </>
              )}
            </GameAreaHeader>

            {/* Weather & Season Banner */}
            <div className="flex items-center justify-between gap-2 mb-2 px-3 py-1.5 rounded-xl bg-[var(--primary-light)]/20 border border-[var(--primary)]/30 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span>{seasonMeta.emoji}</span>
                <span className="text-[var(--text-primary)]">
                  {seasonMeta.label}
                </span>
                <span className="text-[var(--text-secondary)]">
                  Hari {season?.day || 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>{weatherEmoji}</span>
                <span className="text-[var(--text-primary)]">
                  {weather?.current || 'Cerah'}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                    growthSpeed > 1.0
                      ? 'bg-green-100 text-green-700'
                      : growthSpeed < 1.0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {growthSpeed.toFixed(1)}x tumbuh
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-2 p-2 rounded-xl bg-[var(--wood)]/90 border-2 border-[var(--wood-dark)] shadow-[0_4px_0_var(--wood-dark)]">
              {FARM_TOOLS.map(tool => (
                <ToolChip
                  key={tool.id}
                  emoji={tool.emoji}
                  active={farmTool === tool.id && !isEditMode}
                  onClick={() => {
                    setIsEditMode(false)
                    setFarmTool(tool.id)
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
              {buildings?.scarecrow?.unlocked && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  🪄 Scarecrow
                </span>
              )}
              {buildings?.sprinkler?.unlocked && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200">
                  🚿 Sprinkler
                </span>
              )}
              {workers?.farmer && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  👨‍🌾 Petani {autoFarm ? 'Aktif' : 'Istirahat'}
                </span>
              )}
            </div>

            <div className="flex gap-2 mb-3">
              {[
                { id: 'plots', label: 'Utama', emoji: '🌾' },
                { id: 'feedPlots', label: 'Pakan', emoji: '🐄' },
                { id: 'kitchenPlots', label: 'Dapur', emoji: '🍳' },
              ].map(tab => (
                <Button
                  key={tab.id}
                  variant={activePlotTab === tab.id ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setActivePlotTab(tab.id as any)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border-b-4 border-transparent data-[active=true]:border-[var(--primary-dark)]"
                  data-active={activePlotTab === tab.id}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </Button>
              ))}
            </div>

            <div className="stage-play-frame">
              <PlotGrid
                isEditMode={isEditMode}
                farmTool={farmTool}
                plotListKey={activePlotTab}
              />
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
                    {buildings?.silo?.unlocked && (
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
  )
}
