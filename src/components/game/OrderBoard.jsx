import { useGameStore, useInventory } from "@/lib/store";
import { getCropEmoji } from "../../lib/data/item-helpers";
import { useState, useEffect } from "react";

function stripPrefix(key) {
  const parts = key.split(".");
  return parts.length === 2 ? parts[1] : key;
}

export function OrderBoard() {
  const orders = useGameStore((state) => state.orders);
  const fulfillOrder = useGameStore((state) => state.fulfillOrder);
  const inventory = useInventory();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-2 rounded-2xl border-[3px] border-[var(--wood)] bg-gradient-to-b from-[#FFFCF5] to-[var(--panel)] p-3 sm:p-4 shadow-[0_6px_0_var(--wood-dark)]">
      <div className="font-display font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-[var(--wood)]/30 pb-2 text-[var(--text-primary)]">
        <span>📋</span> Papan Pesanan
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {!orders || orders.length === 0 ? (
          <div className="col-span-full glass-card rounded-xl p-4 min-h-[100px] flex items-center justify-center">
            <span className="text-[var(--text-secondary)] text-sm font-medium">
              Belum ada pesanan. Menunggu pelanggan...
            </span>
          </div>
        ) : (
          orders.map((order, index) => {
            const timeLeft = Math.max(
              0,
              Math.floor((order.timer * 1000 - (now - order.createdAt)) / 1000),
            );
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;

            return (
              <div
                key={order.id}
                className="quest-parchment p-3 flex flex-col border-2 border-[var(--gold-rim)]"
              >
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-[var(--wood)]/25">
                  <span className="font-black text-[var(--gold-deep)]">
                    Pesanan #{index + 1}
                  </span>
                  <span className="text-[10px] font-bold bg-[#EF5350]/15 border border-[#EF5350]/40 text-[#C62828] px-2 py-0.5 rounded-full">
                    {m}:{s.toString().padStart(2, "0")}
                  </span>
                </div>

                <div className="flex-1 space-y-1.5 mb-3">
                  {order.items.map((item) => {
                    const itemName = stripPrefix(item.id);
                    const has = inventory[itemName] || 0;
                    const isEnough = has >= item.qty;
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-[var(--text-primary)] flex items-center gap-1 font-bold">
                          <span>{getCropEmoji(itemName)}</span>{" "}
                          {itemName.replace("_", " ")}
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                            isEnough
                              ? "bg-[var(--primary-light)]/50 text-[var(--primary-dark)]"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {has}/{item.qty}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center gap-2">
                  <div className="text-xs font-bold text-[var(--gold-deep)] flex flex-col">
                    <span>{order.coins} 💰</span>
                    <span>{order.xp} ⭐</span>
                  </div>
                  <button
                    type="button"
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
    </div>
  );
}
