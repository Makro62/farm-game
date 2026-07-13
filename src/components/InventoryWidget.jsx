import { useGameStore } from '@/lib/store';
import { formatNumber, getCropEmoji, getItemDisplayName } from '@/lib/utils';
import toast from 'react-hot-toast';

export function InventoryWidget() {
  const inventory = useGameStore(state => state.inventory);
  const sellAllInventory = useGameStore(state => state.sellAllInventory);
  const coinMultiplier = useGameStore(state => state.coinMultiplier);

  const handleSellAll = () => {
    const earned = sellAllInventory();
    if (earned > 0) {
      toast.success(
        coinMultiplier > 1
          ? `Terjual ${formatNumber(earned)} 💰 (×${coinMultiplier} booster!)`
          : `Terjual semua seharga ${formatNumber(earned)} 💰!`
      );
    } else {
      toast.error('Inventory kosong atau tidak ada yang bisa dijual!');
    }
  };

  const inventoryItems = Object.keys(inventory).filter(id => inventory[id] > 0);

  return (
    <div className="mb-6">
      <div className="shop-section-title">
        <span>📦</span> Tas Petani
      </div>
      <div className="glass-card p-3 sm:p-4 min-h-[100px]">
        {inventoryItems.length === 0 ? (
          <div className="text-center text-sm text-[#d7e4c8]/80 py-4 italic font-bold">Tas masih kosong.</div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            {inventoryItems.map(item => (
              <div
                key={item}
                className="rounded-xl border-2 border-[#e8d296]/25 bg-[#1c301e]/70 p-2 flex flex-col items-center justify-center relative overflow-hidden w-full hover:scale-105 transition-transform"
                title={getItemDisplayName(item)}
              >
                <div className="text-3xl mb-1 drop-shadow-md">
                  {getCropEmoji(item)}
                </div>
                <div className="text-[10px] sm:text-xs font-extrabold text-center text-[#f7f4e8] leading-tight truncate w-full px-1">
                  {getItemDisplayName(item)}
                </div>
                <div className="mt-1 bg-[#f0b429] text-[#4a3208] px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm">
                  ×{inventory[item]}
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleSellAll}
          className="btn-gold w-full !py-2.5 !rounded-xl text-sm"
        >
          💰 Jual Semua Hasil
        </button>
      </div>
    </div>
  );
}
