import { useGameStore } from '@/lib/store';
import { SHOP_SEEDS, SHOP_ANIMALS, FISHES, MINERALS, getCropEmoji } from '@/lib/utils';
import toast from 'react-hot-toast';

export function InventoryWidget() {
  const inventory = useGameStore(state => state.inventory);
  const addCoins = useGameStore(state => state.addCoins);
  const removeItem = useGameStore(state => state.removeItem);
  const coinMultiplier = useGameStore(state => state.coinMultiplier);

  const handleSellAll = () => {
    let totalCoins = 0;
    const currentInventory = { ...inventory };
    
    Object.keys(currentInventory).forEach(itemId => {
      const amount = currentInventory[itemId];
      if (amount <= 0) return;
      
      const seedData = SHOP_SEEDS.find(s => s.id === itemId);
      const animalData = SHOP_ANIMALS.find(a => a.id === itemId);
      const fishData = FISHES.find(f => f.id === itemId);
      const mineralData = MINERALS.find(m => m.id === itemId);

      if (seedData && seedData.sellPrice) {
        totalCoins += seedData.sellPrice * amount;
        removeItem(itemId, amount);
      } else if (animalData && animalData.productPrice) {
        totalCoins += animalData.productPrice * amount;
        removeItem(itemId, amount);
      } else if (fishData) {
        totalCoins += fishData.price * amount;
        removeItem(itemId, amount);
      } else if (mineralData) {
        totalCoins += mineralData.price * amount;
        removeItem(itemId, amount);
      }
    });

    if (totalCoins > 0) {
      const finalCoins = totalCoins * coinMultiplier;
      addCoins(finalCoins);
      toast.success(`Terjual semua seharga ${finalCoins} 💰!`);
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
            {inventoryItems.map(item => {
              const seedData = SHOP_SEEDS.find(s => s.id === item);
              const animalData = SHOP_ANIMALS.find(a => a.id === item);
              const fishData = FISHES.find(f => f.id === item);
              const mineralData = MINERALS.find(m => m.id === item);

              let emoji = '📦';
              if (seedData && item.includes('seed')) emoji = '🌱';
              else if (seedData) emoji = getCropEmoji(item);
              else if (animalData) emoji = getProductEmoji(item);
              else if (fishData) emoji = fishData.emoji;
              else if (mineralData) emoji = mineralData.emoji;

              return (
                <div 
                  key={item}
                  className="w-12 h-12 glass-card flex items-center justify-center relative hover:scale-105 transition-transform"
                  title={item}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border border-yellow-500">
                    {inventory[item]}
                  </span>
                </div>
              );
            })}
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
