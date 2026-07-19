import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { SHOP_BAIT } from '@/lib/data/shop';
import { useFishingMinigame } from '@/lib/hooks/useFishingMinigame';

export function useTown() {
  const workers = useGameStore((s) => s.workers);
  const autoFisher = useGameStore((s) => s.autoFisher);
  const toggleAutoFisher = useGameStore((s) => s.toggleAutoFisher);
  const selectedBait = useGameStore((s) => s.selectedBait);
  const inventory = useGameStore((s) => s.inventory);
  const enqueueNotification = useGameStore((s) => s.enqueueNotification);

  const [area, setArea] = useState('plaza'); // 'plaza' | 'fishing' | 'processing'

  const fishingProps = useFishingMinigame();

  const baitData = SHOP_BAIT.find((b) => b.id === selectedBait);
  const selectedBaitLabel =
    baitData && (inventory[selectedBait] || 0) > 0
      ? `${baitData.emoji} ${baitData.name} ×${inventory[selectedBait]}`
      : null;

  const handleToggleAuto = () => {
    if (!workers?.fisher) {
      enqueueNotification('Sewa Pemancing Kota dulu di toko samping!', { icon: '🎣', type: 'error' });
      return;
    }
    const next = !autoFisher;
    toggleAutoFisher();
    enqueueNotification(next ? 'Kurcaci pemancing aktif!' : 'Kurcaci pemancing istirahat.', {
      id: 'auto-fisher-toggle',
      type: 'success'
    });
  };

  return {
    area,
    setArea,
    autoFisher,
    handleToggleAuto,
    selectedBaitLabel,
    fishingProps
  };
}
