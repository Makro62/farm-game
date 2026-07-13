'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { SHOP_BAIT } from '@/lib/utils';
import { InventoryWidget } from './InventoryWidget';
import { CraftingWidget } from './ui/CraftingWidget';
import { StatusHeader } from './StatusHeader';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import { TownShop } from './game/TownShop';
import { TownPlaza, FishingLake, FishCatchBoard } from './game/TownPlaza';
import { useFishingMinigame } from '@/lib/hooks/useFishingMinigame';
import toast from 'react-hot-toast';

export default function TabTown() {
  const workers = useGameStore((s) => s.workers);
  const autoFisher = useGameStore((s) => s.autoFisher);
  const toggleAutoFisher = useGameStore((s) => s.toggleAutoFisher);
  const season = useGameStore((s) => s.season);
  const buildings = useGameStore((s) => s.buildings);
  const decorations = useGameStore((s) => s.decorations);
  const selectedBait = useGameStore((s) => s.selectedBait);
  const inventory = useGameStore((s) => s.inventory);
  const dev = useGameStore((s) => s.dev);

  const [area, setArea] = useState('plaza'); // plaza | lake

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
      toast('Sewa Pemancing Kota dulu di panel kiri! 🔒', { icon: '🎣' });
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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-2xl border-2 border-[#e8d296]/35 bg-gradient-to-r from-[#2a5f6b]/90 to-[#1c3028]/90 px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-lg"
      >
        <div>
          <p className="font-display font-bold text-lg text-[#f7f4e8] text-shadow">
            🏘️ Kota Musim {season?.current}
          </p>
          <p className="text-xs font-bold text-[#d7e4c8]/90">
            Beli umpan · mancing di danau · jual ikan · hadiah warga · upgrade kota
            {buildings?.silo ? ' · 🏚️ Silo' : ''}
            {buildings?.greenhouse ? ' · 🏠 Greenhouse' : ''}
            {(decorations || []).length > 0 ? ` · 🪴 ${(decorations || []).length} dekor` : ''}
          </p>
        </div>
        <div className="text-[11px] font-black uppercase tracking-wide bg-[#f0b429] text-[#4a3208] px-3 py-1.5 rounded-xl border border-[#fff1b8]">
          Hari {season?.day || 1}/7
        </div>
      </motion.div>

      <div className="game-tab-grid">
        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
            <TownShop />

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 border-t border-red-200/30 pt-4">
                <div className="font-bold text-xs text-red-400 mb-2">🛠️ CHEAT MENU (DEV)</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => dev.addCoins(1000)}
                    className="flex-1 bg-gray-800 text-green-400 text-xs py-1 rounded"
                  >
                    +1000 💰
                  </button>
                  <button
                    type="button"
                    onClick={() => dev.setLevel(useGameStore.getState().level + 1)}
                    className="flex-1 bg-gray-800 text-blue-400 text-xs py-1 rounded"
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

            <GameAreaHeader icon={area === 'plaza' ? '🏛️' : '🎣'} title={area === 'plaza' ? 'Alun-alun Kota' : 'Danau Pemancingan'}>
              <GameActionButton variant="edit" active={area === 'plaza'} onClick={() => setArea('plaza')}>
                🏛️ Alun-alun
              </GameActionButton>
              <GameActionButton variant="edit" active={area === 'lake'} onClick={() => setArea('lake')}>
                🎣 Danau
              </GameActionButton>
              <GameActionButton variant="auto" active={autoFisher} onClick={handleToggleAuto}>
                🧑‍🌾 Auto: {autoFisher ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            {area === 'plaza' ? (
              <TownPlaza onGoFish={() => setArea('lake')} />
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
            <InventoryWidget />
            <FishCatchBoard />
            <CraftingWidget type="fish_kitchen" title="Dapur Ikan" icon="🍳" />
          </div>
        </div>
      </div>
    </div>
  );
}
