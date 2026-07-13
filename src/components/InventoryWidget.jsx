import { useGameStore } from '@/lib/store';
import { formatNumber, getCropEmoji, getItemDisplayName } from '@/lib/utils';
import toast from 'react-hot-toast';

export function InventoryWidget({ title = 'Tas Petani' }) {
  const inventory = useGameStore((state) => state.inventory);
  const sellAllInventory = useGameStore((state) => state.sellAllInventory);
  const coinMultiplier = useGameStore((state) => state.coinMultiplier);

  const handleSellAll = () => {
    const earned = sellAllInventory();
    if (earned > 0) {
      toast.success(
        coinMultiplier > 1
          ? `Terjual ${formatNumber(earned)} 💰 (×${coinMultiplier} booster!)`
          : `Terjual semua hasil seharga ${formatNumber(earned)} 💰!`
      );
    } else {
      toast.error('Tidak ada hasil yang bisa dijual (umpan & alat tidak ikut).');
    }
  };

  const inventoryItems = Object.keys(inventory).filter((id) => inventory[id] > 0);

  return (
    <div className="mb-6">
      <div className="shop-section-title">
        <span>📦</span> {title}
      </div>
      <div className="inventory-leather p-3 sm:p-4 min-h-[100px]">
        {inventoryItems.length === 0 ? (
          <div className="text-center text-sm text-[#FFF1D6]/80 py-4 italic font-bold">
            Tas masih kosong.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            {inventoryItems.map((item) => (
              <div
                key={item}
                className="rounded-xl border-2 border-[#C4A074]/50 bg-[#3E2414]/45 p-2 flex flex-col items-center justify-center relative overflow-hidden w-full hover:scale-105 transition-transform"
                title={getItemDisplayName(item)}
              >
                <div className="text-3xl mb-1 drop-shadow-md">{getCropEmoji(item)}</div>
                <div className="text-[10px] sm:text-xs font-extrabold text-center text-[#FFF8EC] leading-tight truncate w-full px-1">
                  {getItemDisplayName(item)}
                </div>
                <div className="mt-1 bg-[var(--gold)] text-[var(--text-primary)] px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm border border-[#FFF1B8]">
                  ×{inventory[item]}
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleSellAll}
          className="w-full !py-2.5 text-sm font-extrabold rounded-full text-white border-2 border-[#FFC4BA] shadow-[0_4px_0_#7A2E24]"
          style={{ background: 'linear-gradient(180deg, #E8896A 0%, #B54A3A 100%)' }}
        >
          Jual Semua Hasil
        </button>
      </div>
    </div>
  );
}
