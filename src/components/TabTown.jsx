'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { SHOP_BAIT } from '@/lib/data/shop';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { MarketBoard } from './game/MarketBoard';
import { QuestPanel } from './game/QuestPanel';
import { TownShop } from './game/TownShop';
import { TownPlaza, FishingLake, FishCatchBoard } from './game/TownPlaza';
import { OrderBoard } from './game/OrderBoard';
import { useFishingMinigame } from '@/lib/hooks/useFishingMinigame';
import TabPage, { GameStage } from './ui/TabPage';
import SideDock from './ui/SideDock';
import toast from 'react-hot-toast';

export default function TabTown() {
  const workers = useGameStore((s) => s.workers);
  const autoFisher = useGameStore((s) => s.autoFisher);
  const toggleAutoFisher = useGameStore((s) => s.toggleAutoFisher);
  const selectedBait = useGameStore((s) => s.selectedBait);
  const inventory = useGameStore((s) => s.inventory);

  const [area, setArea] = useState('plaza');

  const {
    fishState,
    indicatorPos,
    score,
    isHolding,
    setIsHolding,
    startFishing,
    startMinigame,
    activeBait,
  } = useFishingMinigame();

  const baitData = SHOP_BAIT.find((b) => b.id === selectedBait);
  const selectedBaitLabel =
    baitData && (inventory[selectedBait] || 0) > 0
      ? `${baitData.emoji} ${baitData.name} ×${inventory[selectedBait]}`
      : null;

  const handleToggleAuto = () => {
    if (!workers?.fisher) {
      toast('Sewa Pemancing Kota dulu di toko samping!', { icon: '🎣' });
      return;
    }
    const next = !autoFisher;
    toggleAutoFisher();
    toast.success(next ? 'Kurcaci pemancing aktif!' : 'Kurcaci pemancing istirahat.', {
      id: 'auto-fisher-toggle',
    });
  };

  return (
    <TabPage>
      <GameStage
        main={
          <div className="glass-panel p-3 sm:p-4 stage-play-area">
            <GameAreaHeader
              icon={area === 'plaza' ? '🏛️' : '🎣'}
              title={area === 'plaza' ? 'Pusat Kota' : 'Danau Pemancingan'}
            >
              <GameActionButton variant="toggle" active={area === 'plaza'} onClick={() => setArea('plaza')}>
                Pusat Kota
              </GameActionButton>
              <GameActionButton variant="toggle" active={area === 'lake'} onClick={() => setArea('lake')}>
                Danau
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFisher} onClick={handleToggleAuto}>
                Auto: {autoFisher ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            <div className="stage-play-frame flex flex-col gap-3">
              {area === 'plaza' ? (
                <TownPlaza />
              ) : (
                <FishingLake
                  fishState={fishState}
                  indicatorPos={indicatorPos}
                  score={score}
                  isHolding={isHolding}
                  setIsHolding={setIsHolding}
                  startFishing={startFishing}
                  startMinigame={startMinigame}
                  activeBait={activeBait}
                  selectedBaitLabel={selectedBaitLabel}
                />
              )}
              <OrderBoard />
            </div>
          </div>
        }
        side={
          <SideDock
            tabs={[
              { id: 'toko', label: 'Toko', emoji: '🏪', content: <TownShop /> },
              {
                id: 'info',
                label: 'Info',
                emoji: '📋',
                content: (
                  <>
                    <FishCatchBoard />
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
