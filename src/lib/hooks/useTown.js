import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { SHOP_BAIT } from '@/lib/data/shop';
import { useFishingMinigame } from '@/lib/hooks/useFishingMinigame';

export function useTown() {
  const workers = useGameStore((s) => s.workers);
  const fisher = workers?.fisher;
  const toggleAutoMode = useGameStore((s) => s.toggleAutoMode);
  const selectedBait = useGameStore((s) => s.selectedBait);
  const baitInv = useGameStore((s) => s.inventoryByCategory?.bait || {});
  const enqueueNotification = useGameStore((s) => s.enqueueNotification);

  const [area, setArea] = useState('plaza');

  const fishingProps = useFishingMinigame();

  const baitData = SHOP_BAIT.find((b) => b.id === selectedBait);
  const baitQty = baitData ? (baitInv[selectedBait]?.qty || 0) : 0;
  const selectedBaitLabel =
    baitData && baitQty > 0
      ? `${baitData.emoji} ${baitData.name} ×${baitQty}`
      : null;

  const handleToggleAuto = () => {
    if (!fisher?.hired) {
      enqueueNotification('Sewa Kurcaci Mamat dulu di toko samping!', { icon: '🎣', type: 'error' });
      return;
    }
    toggleAutoMode('fisher');
    enqueueNotification(!fisher.isAutoMode ? 'Kurcaci pemancing aktif!' : 'Kurcaci pemancing istirahat.', {
      id: 'auto-fisher-toggle',
      type: 'success'
    });
  };

  return {
    area,
    setArea,
    autoFisher: fisher?.isAutoMode || false,
    handleToggleAuto,
    selectedBaitLabel,
    fishingProps
  };
}
