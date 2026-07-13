'use client';

import { useGameStore } from '@/lib/store';
import { MINERALS, SHOP_MINING, PICKAXE_LABELS } from '@/lib/utils';
import { motion } from 'framer-motion';
import { InventoryWidget } from './InventoryWidget';
import { StatusHeader } from './StatusHeader';
import { ShopItemCard, ShopSectionTitle } from './ui/ShopItemCard';
import { GameAreaHeader, GameActionButton } from './ui/GameAreaHeader';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const TARGET_TOOLS = new Set(['bom_kecil', 'tali']);

export default function TabMine() {
  const mining = useGameStore(state => state.mining);
  const inventory = useGameStore(state => state.inventory);
  const mineNode = useGameStore(state => state.mineNode);
  const useMiningTool = useGameStore(state => state.useMiningTool);
  const setSelectedMiningTool = useGameStore(state => state.setSelectedMiningTool);
  const selectedMiningTool = useGameStore(state => state.selectedMiningTool);
  const hireWorker = useGameStore(state => state.hireWorker);
  const workers = useGameStore(state => state.workers);
  const autoMiner = useGameStore(state => state.autoMiner);
  const toggleAutoMiner = useGameStore(state => state.toggleAutoMiner);
  const openConfirm = useGameStore(state => state.openConfirm);
  const buyItem = useGameStore(state => state.buyItem);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [shopAmounts, setShopAmounts] = useState({});

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pickaxe = PICKAXE_LABELS[mining.pickaxeLevel] || PICKAXE_LABELS[1];
  const lanternActive = mining.lanternUntil && mining.lanternUntil > currentTime;
  const lanternSecs = lanternActive ? Math.ceil((mining.lanternUntil - currentTime) / 1000) : 0;

  const ownedTools = SHOP_MINING.filter(t => (inventory[t.id] || 0) > 0);

  const handleUseTool = (toolId, nodeId = null) => {
    const result = useMiningTool(toolId, nodeId);
    if (result.ok) {
      toast.success(result.message);
    } else if (result.needTarget) {
      setSelectedMiningTool(toolId);
      const tool = SHOP_MINING.find(t => t.id === toolId);
      toast(`Pilih petak tambang untuk memakai ${tool?.name}`, { icon: tool?.emoji });
    } else {
      toast.error(result.message);
    }
  };

  const handleMine = (node) => {
    if (selectedMiningTool) {
      handleUseTool(selectedMiningTool, node.id);
      return;
    }

    if (node.status !== 'ready') return;

    const minedType = mineNode(node.id);
    if (minedType) {
      const mineral = MINERALS.find(m => m.id === minedType);
      toast.success(`Berhasil menambang ${mineral.emoji} ${mineral.name}!`);
    }
  };

  const handleHireMiner = () => {
    if (workers.miner) {
      toast('Penambang Tarjo sudah bekerja! Aktifkan Auto jika perlu. 👷‍♂️', { icon: '✅' });
      return;
    }
    openConfirm(
      'Sewa Penambang Tarjo',
      `Sewa Penambang Tarjo seharga ${GAME_CONSTANTS.COSTS.WORKER_MINER.toLocaleString()} 💰? Dia akan menambang otomatis untukmu!`,
      () => {
        if (hireWorker('miner', GAME_CONSTANTS.COSTS.WORKER_MINER)) {
          toast.success('Kurcaci Penambang berhasil disewa!', { icon: '👷' });
        } else {
          toast.error('Koin tidak cukup!');
        }
      }
    );
  };

  const handleToggleAuto = () => {
    if (!workers.miner) {
      toast('Sewa Penambang Tarjo dulu di panel kiri! 🔒', { icon: '👷‍♂️' });
      return;
    }
    toggleAutoMiner();
  };

  const handleShopBuy = (item, amount) => {
    if (buyItem(item.id, amount, item.price)) {
      toast.success(`Berhasil membeli ${amount} ${item.name}!`);
    } else {
      toast.error('Koin tidak cukup!');
    }
  };

  const getRegenProgress = (node) => {
    if (!node.regenAt) return 0;
    const total = mining.pickaxeLevel >= 3 ? 60000 : mining.pickaxeLevel >= 2 ? 90000 : 120000;
    const lanternFactor = lanternActive ? 0.5 : 1;
    const duration = total * lanternFactor;
    return Math.max(0, Math.min(100, 100 - ((node.regenAt - currentTime) / duration) * 100));
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="game-tab-grid">

        <div className="game-sidebar-left">
          <div className="glass-panel p-4">
            <div className="mb-6">
              <ShopSectionTitle icon="🛒">Shop Peralatan</ShopSectionTitle>
              <div className="shop-grid">
                {SHOP_MINING.map((item) => {
                  const amt = shopAmounts[item.id] || 1;
                  return (
                    <ShopItemCard
                      key={item.id}
                      icon={item.emoji}
                      name={item.name}
                      price={item.price}
                      amount={amt}
                      onDecrease={() => setShopAmounts(p => ({ ...p, [item.id]: Math.max(1, amt - 1) }))}
                      onIncrease={() => setShopAmounts(p => ({ ...p, [item.id]: amt + 1 }))}
                      onBuy={() => handleShopBuy(item, amt)}
                    />
                  );
                })}
              </div>
            </div>

            <ShopSectionTitle icon="⛏️">Alat Aktif</ShopSectionTitle>
            <div className="glass-card p-3 mb-4 flex justify-between items-center border border-white/10">
              <div>
                <div className="font-bold text-[#3E2723] text-sm drop-shadow-sm">{pickaxe.emoji} {pickaxe.name}</div>
                <div className="text-[10px] text-[#5D4037]/80 font-medium mt-0.5">Regen: {pickaxe.regen}{lanternActive ? ' (senter aktif)' : ''}</div>
              </div>
              <span className="bg-[#6fbf55]/30 border border-[#6fbf55]/50 text-[#3E2723] text-xs px-2 py-1 rounded-lg font-black">Lv {mining.pickaxeLevel}</span>
            </div>
            {lanternActive && (
              <div className="glass-card p-2 mb-4 text-center text-xs text-yellow-200">
                🔦 Senter aktif — {lanternSecs}s tersisa
              </div>
            )}

            {workers?.miner && (
              <p className="text-[10px] text-gray-400 mb-2">
                {autoMiner ? '✅ Kurcaci aktif — tambang otomatis' : 'Nyalakan tombol Auto di gua'}
              </p>
            )}

            <ShopSectionTitle icon="🧰">Alat di Tas</ShopSectionTitle>
            <div className="glass-card rounded-xl p-3 mb-6 space-y-2">
              {ownedTools.length === 0 ? (
                <div className="text-center text-sm text-gray-400 italic">Belum ada alat. Beli di shop kanan.</div>
              ) : (
                ownedTools.map(tool => (
                  <div key={tool.id} className="flex items-center justify-between gap-2 p-2 glass-card rounded-lg">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[#3E2723] text-xs flex items-center gap-1">
                        <span>{tool.emoji}</span>
                        <span className="truncate">{tool.name}</span>
                        <span className="text-yellow-300 shrink-0">×{inventory[tool.id]}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">{tool.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUseTool(tool.id)}
                      className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors border-2 ${
                        selectedMiningTool === tool.id
                          ? 'bg-[var(--gold)] text-[#4a3208] border-[var(--gold-deep)]'
                          : 'bg-white/50 text-[var(--text-primary)] border-[var(--wood-light)] hover:bg-white'
                      }`}
                    >
                      {TARGET_TOOLS.has(tool.id) ? 'Pilih' : 'Pakai'}
                    </button>
                  </div>
                ))
              )}
            </div>
            {selectedMiningTool && (
              <button
                type="button"
                onClick={() => setSelectedMiningTool(null)}
                className="w-full mb-4 text-xs text-gray-300 underline"
              >
                ✕ Batal pilih alat
              </button>
            )}

            <ShopSectionTitle icon="🧑‍🌾">Pekerja (Auto)</ShopSectionTitle>
            <button
              onClick={handleHireMiner}
              className={`w-full glass-card p-2 flex justify-between items-center transition-colors text-left ${
                workers.miner ? 'border-primary bg-white/10' : ''
              }`}
            >
              <div>
                <div className="font-bold text-[#3E2723] text-sm">👷‍♂️ Penambang Tarjo</div>
                <div className="text-[10px] text-gray-500">Auto-Mine</div>
              </div>
              <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                {workers.miner ? '✅ Dimiliki' : '15000 💰'}
              </span>
            </button>
          </div>
        </div>

        <div className="game-main">
          <div className="glass-panel p-4">
            <StatusHeader />

            <GameAreaHeader icon="⛏️" title="Gua Tambang">
              <GameActionButton
                variant="miner"
                active={autoMiner}
                onClick={handleToggleAuto}
              >
                ⛏️ Auto: {autoMiner ? 'ON' : 'OFF'}
              </GameActionButton>
            </GameAreaHeader>

            {selectedMiningTool && (
              <div className="mb-3 text-center text-sm text-orange-200 bg-orange-500/20 rounded-lg py-2 px-3">
                {SHOP_MINING.find(t => t.id === selectedMiningTool)?.emoji} Klik petak untuk memakai alat
              </div>
            )}

            <div
              className="p-4 sm:p-6 field-frame relative min-h-[400px] bg-cover bg-center"
              style={{ backgroundImage: "url('/img/backgrounds/mine_bg.png')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/45 rounded-[22px] pointer-events-none" />
              <div className="game-plot-grid relative z-10">
                {mining.nodes.map((node) => {
                  const isReady = node.status === 'ready';
                  const progress = getRegenProgress(node);
                  const mineral = MINERALS.find(m => m.id === node.type);

                  return (
                    <motion.button
                      key={node.id}
                      whileHover={{ scale: isReady || selectedMiningTool ? 1.05 : 1 }}
                      whileTap={{ scale: isReady || selectedMiningTool ? 0.95 : 1 }}
                      onClick={() => handleMine(node)}
                      disabled={!isReady && !selectedMiningTool}
                      className={`game-plot-cell border-b-4
                        ${isReady ? 'bg-[#5c5952] border-[#3d3b36] hover:bg-[#6b6861] cursor-pointer' : selectedMiningTool ? 'bg-[#3d3a35] border-[#5c5952] cursor-crosshair' : 'bg-[#1f1e1c] border-[#141312] cursor-not-allowed'}
                        ${selectedMiningTool ? 'ring-1 ring-orange-400/50' : ''}
                      `}
                      title={isReady && mineral ? `${mineral.emoji} ${mineral.name}` : undefined}
                    >
                      {isReady ? (
                        <span className="plot-emoji">{mineral?.emoji || '🪨'}</span>
                      ) : (
                        <div className="w-full px-2 flex flex-col items-center">
                          <span className="text-xl opacity-30 mb-1">{mineral?.emoji || '🪨'}</span>
                          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-400 transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="game-sidebar-right">
          <div className="glass-panel p-4 h-full">
            <InventoryWidget />
          </div>
        </div>

      </div>
    </div>
  );
}
