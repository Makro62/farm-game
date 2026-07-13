'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { SHOP_BAIT } from '@/lib/utils';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { MarketBoard } from './game/MarketBoard';
import { QuestPanel } from './game/QuestPanel';
import { TownShop } from './game/TownShop';
import { TownPlaza, FishingLake, FishCatchBoard } from './game/TownPlaza';
import { useFishingMinigame } from '@/lib/hooks/useFishingMinigame';
import toast from 'react-hot-toast';

export default function TabTown() {
  const workers = useGameStore((s) => s.workers);
  const autoFisher = useGameStore((s) => s.autoFisher);
  const toggleAutoFisher = useGameStore((s) => s.toggleAutoFisher);
  const selectedBait = useGameStore((s) => s.selectedBait);
  const inventory = useGameStore((s) => s.inventory);
  const dev = useGameStore((s) => s.dev);

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
      toast('Sewa Pemancing Kota dulu di panel kiri!', { icon: '🎣' });
      return;
    }
    const next = !autoFisher;
    toggleAutoFisher();
    toast.success(next ? 'Kurcaci pemancing aktif!' : 'Kurcaci pemancing istirahat.', {
      id: 'auto-fisher-toggle',
    });
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="game-tab-grid">
        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
            <TownShop />

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 border-t border-red-200/30 pt-4">
                <div className="font-bold text-xs text-red-400 mb-2">CHEAT MENU (DEV)</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => dev.addCoins(1000)} className="flex-1 btn-wood">
                    +1000
                  </button>
                  <button
                    type="button"
                    onClick={() => dev.setLevel(useGameStore.getState().level + 1)}
                    className="flex-1 btn-wood"
                  >
                    +1 LVL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="game-main">
          <div className="glass-panel p-4">
            <StatusHeader />

            <GameAreaHeader
              icon={area === 'plaza' ? '🏛️' : '🎣'}
              title={area === 'plaza' ? 'Pusat Kota' : 'Danau Pemancingan'}
            >
              <GameActionButton variant="edit" active={area === 'plaza'} onClick={() => setArea('plaza')}>
                Pusat Kota
              </GameActionButton>
              <GameActionButton variant="edit" active={area === 'lake'} onClick={() => setArea('lake')}>
                Danau
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFisher} onClick={handleToggleAuto}>
                Auto: {autoFisher ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

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
          </div>
        </div>

        <div className="game-sidebar-right">
          <div className="glass-panel p-4 h-full">
            <InventoryWidget title="Tas Kota" />
            <FishCatchBoard />
            <MarketBoard />
            <QuestPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
