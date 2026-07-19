import { useGameStore } from '@/lib/store';
import { getItemEmoji } from '@/lib/data/item-helpers';

export function useFarming() {
  const workers = useGameStore((state) => state.workers);
  const autoFarm = useGameStore((state) => state.autoFarmer);
  const toggleAutoFarm = useGameStore((state) => state.toggleAutoFarmer);
  const inventory = useGameStore((state) => state.inventory);
  
  const plantSeed = useGameStore((state) => state.plantSeed);
  const harvest = useGameStore((state) => state.harvest);
  const waterPlot = useGameStore((state) => state.waterPlot);
  const sellAllInventory = useGameStore((state) => state.sellAllInventory);
  const selectedInventoryItem = useGameStore((state) => state.selectedSeed);
  const setSelectedInventoryItem = useGameStore((state) => state.setSelectedSeed);
  const enqueueNotification = useGameStore((state) => state.enqueueNotification);

  const handleToggleAuto = () => {
    if (!workers?.farmer) {
      enqueueNotification('Sewa Petani Budi dulu di toko samping!', { icon: '👨‍🌾', type: 'error' });
      return;
    }
    const next = !autoFarm;
    toggleAutoFarm();
    if (next) {
      const hasSeeds = Object.values(inventory).some((val) => val > 0);
      if (!hasSeeds) {
        enqueueNotification('Auto ON — beli bibit dulu agar kurcaci bisa menanam!', { icon: '👨‍🌾', type: 'error' });
      } else {
        enqueueNotification('Kurcaci petani aktif! Auto panen & tanam.', { id: 'auto-farm-toggle', type: 'success' });
      }
    }
  };

  const handlePlotClick = (plot, farmTool) => {
    if (farmTool === 'jual') {
      const earned = sellAllInventory();
      if (earned > 0) enqueueNotification(`Hasil terjual +${earned} 💰`, { type: 'success' });
      else enqueueNotification('Tidak ada hasil untuk dijual.', { type: 'error' });
      return;
    }

    if (farmTool === 'siram') {
      const result = waterPlot(plot.id);
      if (result.ok) enqueueNotification(result.message, { icon: '💧', type: 'success' });
      else enqueueNotification(result.message, { icon: '💧', type: 'error' });
      return;
    }

    if (farmTool === 'panen') {
      if (plot.status === 'ready' || (plot.status === 'growing' && plot.plantedAt && Date.now() - plot.plantedAt >= plot.growTime)) {
        const crop = harvest(plot.id);
        if (crop) enqueueNotification(`Panen ${getItemEmoji(crop)}!`, { type: 'success' });
      } else {
        enqueueNotification('Petak belum siap panen', { icon: '🌾', type: 'info' });
      }
      return;
    }

    if (plot.status === 'empty') {
      if (!selectedInventoryItem) {
        enqueueNotification('Pilih bibit dari toko samping dulu!', { icon: '👆', type: 'info' });
        return;
      }

      const result = plantSeed(plot.id, selectedInventoryItem);
      if (result.ok) {
        enqueueNotification(result.message, { icon: '🌱', id: 'plant', type: 'success' });
      } else {
        enqueueNotification(result.message, { type: 'error' });
        if (result.message?.includes('Kehabisan')) setSelectedInventoryItem(null);
      }
    } else if (plot.status === 'ready') {
      enqueueNotification('Ganti ke mode Panen untuk memanen', { icon: '✋', type: 'info' });
    } else if (plot.status === 'growing') {
      enqueueNotification('Masih tumbuh — pakai Siram untuk mempercepat', { icon: '🌱', type: 'info' });
    }
  };

  return {
    autoFarm,
    handleToggleAuto,
    handlePlotClick
  };
}
