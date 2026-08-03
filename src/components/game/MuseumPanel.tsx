"use client";

import { useGameStore } from "@/lib/store";
import { MINERALS } from "@/lib/data/minerals";
import { FISHES } from "@/lib/data/fishes";

function museumPointsOf(itemId: string): number {
  const m = MINERALS.find((x) => x.id === itemId);
  if (m?.museumPoints) return m.museumPoints;
  const f = FISHES.find((x) => x.id === itemId);
  return f?.museumPoints || 0;
}

const DONATABLE = [
  ...MINERALS.filter((m) => m.museumPoints).map((m) => ({
    id: m.id,
    name: m.name,
    emoji: m.emoji,
    points: m.museumPoints,
  })),
  ...FISHES.filter((f) => f.museumPoints).map((f) => ({
    id: f.id,
    name: f.name,
    emoji: f.emoji,
    points: f.museumPoints,
  })),
];

export function MuseumPanel() {
  const inventory = useGameStore((s) => s.inventoryByCategory);
  const donations = useGameStore((s) => s.town?.museumDonations || []);
  const donateToMuseum = useGameStore((s) => s.donateToMuseum);
  const enqueueNotification = useGameStore((s) => s.enqueueNotification);

  const totalPoints = donations.reduce((sum, d) => sum + (d.points || 0), 0);

  const handleDonate = (itemId: string) => {
    const r = donateToMuseum(itemId);
    enqueueNotification(r.message, {
      type: r.ok ? "success" : "error",
    });
  };

  const qtyOf = (itemId: string) => {
    for (const cat of Object.values(inventory || {})) {
      if (cat?.[itemId]?.qty) return cat[itemId].qty;
    }
    return 0;
  };

  return (
    <div className="glass-card p-3 mb-3">
      <h3 className="shop-section-title">
        <span>🏛️</span> Museum Kota
      </h3>
      <div className="flex justify-between items-center mb-2 text-xs">
        <span className="text-[var(--text-secondary)]">Total Poin</span>
        <span className="font-bold text-[var(--gold-deep)]">
          {totalPoints} pts
        </span>
      </div>
      <div className="text-[9px] text-[var(--text-secondary)] mb-2">
        Donasikan temuan langka. Milestone 100/300/600/1000 pts memberi bonus
        koin!
      </div>
      <div className="space-y-1.5">
        {DONATABLE.map((item) => {
          const qty = qtyOf(item.id);
          const donatedCount = donations.filter(
            (d) => d.itemId === item.id,
          ).length;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/40 border border-white/60 px-2 py-1.5"
            >
              <span className="text-xs font-bold">
                {item.emoji} {item.name}{" "}
                <span className="text-[9px] text-[var(--text-secondary)]">
                  +{item.points} pts
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[9px] text-[var(--text-secondary)]">
                  {qty} di inventori
                  {donatedCount > 0 && ` · ${donatedCount}x didonasi`}
                </span>
                <button
                  type="button"
                  disabled={qty <= 0}
                  onClick={() => handleDonate(item.id)}
                  className="text-[10px] font-bold px-2 py-1 rounded-full bg-[var(--gold)] border border-[var(--gold-deep)] disabled:opacity-30"
                >
                  Donasi
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
