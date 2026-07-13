import { useGameStore } from '@/lib/store';
import { getCropEmoji } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function OrderBoard() {
  const orders = useGameStore(state => state.orders);
  const fulfillOrder = useGameStore(state => state.fulfillOrder);
  const inventory = useGameStore(state => state.inventory);
  
  // We use a small local timer just to update the "timeLeft" display, 
  // so the whole page doesn't have to re-render.
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-[var(--wood-light)] pb-2 text-[var(--text-primary)] mt-6">
        <span>📋</span> Papan Pesanan
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {!orders || orders.length === 0 ? (
          <div className="col-span-full glass-card rounded-xl p-4 min-h-[120px] flex items-center justify-center">
            <span className="text-gray-400 text-sm font-medium">Belum ada pesanan masuk. Menunggu pesanan...</span>
          </div>
        ) : (
          orders.map((order, index) => {
            const timeLeft = Math.max(0, Math.floor((order.timer * 1000 - (now - order.createdAt)) / 1000));
            const m = Math.floor(timeLeft / 60);
            const currentTime = now;
            
            return (
              <div key={order.id} className="glass-card rounded-xl p-4 border-2 border-amber-200/30 flex flex-col hover:border-amber-400/50 transition-colors">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--wood-light)]/50">
                  <span className="font-black text-amber-300">Pesanan #{index + 1}</span>
                  <span className="text-xs font-bold bg-[#EF5350]/20 border border-[#EF5350]/40 text-[#C62828] px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    ⏰ {m}:{s.toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="flex-1 space-y-2 mb-4">
                  {order.items.map(item => {
                    const has = inventory[item.id] || 0;
                    const isEnough = has >= item.qty;
                    return (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-[#3E2723] flex items-center gap-1">
                          <span>{getCropEmoji(item.id)}</span> {item.id.replace('_', ' ')}
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded text-xs ${isEnough ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                          {has} / {item.qty}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-yellow-300 flex flex-col">
                    <span>{order.coins} 💰</span>
                    <span>{order.xp} ⭐</span>
                  </div>
                  <button 
                    onClick={() => fulfillOrder(order.id)}
                    className="btn-gold !px-4 !py-2 !text-sm"
                  >
                    Penuhi
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
