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
          <div className="flex flex-wrap gap-2 mb-4">
            {inventoryItems.map(item => (
              <div
                key={item}
                className="w-12 h-12 glass-card flex items-center justify-center relative hover:scale-105 transition-transform"
                title={getItemDisplayName(item)}
              >
                <span className="text-2xl">{getCropEmoji(item)}</span>
                <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border border-yellow-500">
                  {inventory[item]}
                </span>
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
