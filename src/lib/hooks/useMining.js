import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { MINERALS } from '@/lib/data/minerals';
import { SHOP_MINING, PICKAXE_LABELS } from '@/lib/data/shop';
import { GAME_CONSTANTS } from '@/lib/constants';

export function useMining() {
  const mining = useGameStore((state) => state.mining);
  const inventory = useGameStore((state) => state.inventory);
  const mineNode = useGameStore((state) => state.mineNode);
  const useMiningTool = useGameStore((state) => state.useMiningTool);
  const setSelectedMiningTool = useGameStore((state) => state.setSelectedMiningTool);
  const selectedMiningTool = useGameStore((state) => state.selectedMiningTool);
  const hireWorker = useGameStore((state) => state.hireWorker);
  const workers = useGameStore((state) => state.workers);
  const autoMiner = useGameStore((state) => state.autoMiner);
  const toggleAutoMiner = useGameStore((state) => state.toggleAutoMiner);
  const openConfirm = useGameStore((state) => state.openConfirm);
  const buyItem = useGameStore((state) => state.buyItem);
  const enqueueNotification = useGameStore((state) => state.enqueueNotification);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [shopAmounts, setShopAmounts] = useState({});

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pickaxe = PICKAXE_LABELS[mining.pickaxeLevel] || PICKAXE_LABELS[1];
  const lanternActive = mining.lanternUntil && mining.lanternUntil > currentTime;
  const lanternSecs = lanternActive ? Math.ceil((mining.lanternUntil - currentTime) / 1000) : 0;
  const ownedTools = SHOP_MINING.filter((t) => (inventory[t.id] || 0) > 0);

  const handleUseTool = (toolId, nodeId = null) => {
    const result = useMiningTool(toolId, nodeId);
    if (result.ok) {
      enqueueNotification(result.message, { type: 'success' });
    } else if (result.needTarget) {
      setSelectedMiningTool(toolId);
      const tool = SHOP_MINING.find((t) => t.id === toolId);
      enqueueNotification(`Pilih petak tambang untuk memakai ${tool?.name}`, { icon: tool?.emoji, type: 'info' });
    } else {
      enqueueNotification(result.message, { type: 'error' });
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
      const mineral = MINERALS.find((m) => m.id === minedType);
      enqueueNotification(`Berhasil menambang ${mineral.emoji} ${mineral.name}!`, { type: 'success' });
    }
  };

  const handleHireMiner = () => {
    if (workers.miner) {
      enqueueNotification('Penambang Tarjo sudah bekerja! Aktifkan Auto jika perlu.', { icon: '✅', type: 'info' });
      return;
    }
    openConfirm(
      'Sewa Penambang Tarjo',
      `Sewa Penambang Tarjo seharga ${GAME_CONSTANTS.COSTS.WORKER_MINER.toLocaleString()} 💰?`,
      () => {
        if (hireWorker('miner', GAME_CONSTANTS.COSTS.WORKER_MINER)) {
          enqueueNotification('Kurcaci Penambang berhasil disewa!', { icon: '👷', type: 'success' });
        } else {
          enqueueNotification('Koin tidak cukup!', { type: 'error' });
        }
      }
    );
  };

  const handleToggleAuto = () => {
    if (!workers.miner) {
      enqueueNotification('Sewa Penambang Tarjo dulu di tab Alat!', { icon: '👷‍♂️', type: 'error' });
      return;
    }
    toggleAutoMiner();
  };

  const handleShopBuy = (item, amount) => {
    if (buyItem(item.id, amount, item.price)) {
      enqueueNotification(`Berhasil membeli ${amount} ${item.name}!`, { type: 'success' });
    } else {
      enqueueNotification('Koin tidak cukup!', { type: 'error' });
    }
  };

  const getRegenProgress = (node) => {
    if (!node.regenAt) return 0;
    const total = mining.pickaxeLevel >= 3 ? 60000 : mining.pickaxeLevel >= 2 ? 90000 : 120000;
    const lanternFactor = lanternActive ? 0.5 : 1;
    const duration = total * lanternFactor;
    return Math.max(0, Math.min(100, 100 - ((node.regenAt - currentTime) / duration) * 100));
  };

  return {
    mining,
    inventory,
    selectedMiningTool,
    workers,
    autoMiner,
    shopAmounts,
    setShopAmounts,
    pickaxe,
    lanternActive,
    lanternSecs,
    ownedTools,
    setSelectedMiningTool,
    handleUseTool,
    handleMine,
    handleHireMiner,
    handleToggleAuto,
    handleShopBuy,
    getRegenProgress
  };
}
