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
      <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-white">
        <span>📦</span> Inventory (Global)
      </div>
      <div className="glass-card border-orange-100/30 p-4 min-h-[100px]">
        {inventoryItems.length === 0 ? (
          <div className="text-center text-sm text-gray-300 py-4 italic">Tas masih kosong.</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3 mb-5">
            {inventoryItems.map(item => (
              <div
                key={item}
                className="glass-card border border-orange-100/30 p-2 rounded-xl flex flex-col items-center justify-center bg-white/5 relative overflow-hidden w-[72px] sm:w-[84px] flex-shrink-0 hover:scale-105 transition-transform"
                title={getItemDisplayName(item)}
              >
                <div className="text-3xl mb-1 drop-shadow-md">
                  {getCropEmoji(item)}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-center text-orange-50 leading-tight truncate w-full px-1">
                  {getItemDisplayName(item)}
                </div>
                <div className="mt-1 bg-orange-900/50 px-2 py-0.5 rounded-full text-[10px] border border-orange-400/30 text-orange-200 font-bold shadow-sm">
                  x{inventory[item]}
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleSellAll}
          className="w-full bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold py-2 rounded-lg transition-colors shadow-sm active:scale-95 text-sm"
        >
          💰 Jual Semua Hasil
        </button>
      </div>
    </div>
  );
}
