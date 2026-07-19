'use client';

import { useTown } from '@/lib/hooks/useTown';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { MarketBoard } from './game/MarketBoard';
import { QuestPanel } from './game/QuestPanel';
import { TownShop } from './game/TownShop';
import { TownPlaza, FishingLake, FishCatchBoard } from './game/TownPlaza';
import { ProcessingPlant } from './game/ProcessingPlant';
import { OrderBoard } from './game/OrderBoard';
import TabPage, { GameStage } from './ui/TabPage';
import SideDock from './ui/SideDock';

export default function TabTown() {
  const {
    area,
    setArea,
    autoFisher,
    handleToggleAuto,
    selectedBaitLabel,
    fishingProps
  } = useTown();

  return (
    <TabPage>
      <GameStage
        main={
          <div className="glass-panel p-3 sm:p-4 stage-play-area">
            <GameAreaHeader icon="🏘️" title="Alun-Alun Kota">
              <GameActionButton
                variant="toggle"
                active={area === 'plaza'}
                onClick={() => setArea('plaza')}
              >
                Plaza
              </GameActionButton>
              <GameActionButton
                variant="toggle"
                active={area === 'fishing'}
                onClick={() => setArea('fishing')}
              >
                Memancing
              </GameActionButton>
              <GameActionButton
                variant="toggle"
                active={area === 'processing'}
                onClick={() => setArea('processing')}
              >
                Pabrik
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFisher} onClick={handleToggleAuto}>
                Auto: {autoFisher ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            <div className="stage-play-frame flex flex-col gap-3">
              {area === 'plaza' ? (
                <TownPlaza />
              ) : area === 'processing' ? (
                <ProcessingPlant />
              ) : (
                <FishingLake
                  fishState={fishingProps.fishState}
                  indicatorPos={fishingProps.indicatorPos}
                  score={fishingProps.score}
                  isHolding={fishingProps.isHolding}
                  setIsHolding={fishingProps.setIsHolding}
                  startFishing={fishingProps.startFishing}
                  startMinigame={fishingProps.startMinigame}
                  activeBait={fishingProps.activeBait}
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
