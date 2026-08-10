"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { CropIcon } from "@/components/ui/CropIcon";
import { SHOP_SEEDS } from "@/lib/data/crops";
import { ShopItemCard, ShopSectionTitle } from "@/components/ui/ShopItemCard";
import { GAME_CONSTANTS } from "@/lib/constants";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

export function SeedShop() {
  const seeds = useGameStore((state) => state.inventoryByCategory?.seeds || {});
  const buyItem = useGameStore((state) => state.buyItem);
  const farmer = useGameStore((state) => state.workers?.farmer);
  const hireWorker = useGameStore((state) => state.hireWorker);
  const toggleAutoMode = useGameStore((state) => state.toggleWorkerAutoMode);
  const selectedInventoryItem = useGameStore((state) => state.selectedSeed);
  const setSelectedInventoryItem = useGameStore(
    (state) => state.setSelectedSeed,
  );
  const openConfirm = useGameStore((state) => state.openConfirm);
  const currentSeason = useGameStore((state) => state.season.current);
  const buildings = useGameStore((state) => state.buildings);

  const [shopAmounts, setShopAmounts] = useState({});

  const availableSeeds = SHOP_SEEDS.filter((s) => {
    if (buildings?.greenhouse) return true;
    return s.season === "all" || s.season === currentSeason;
  });

  const seasonLabel =
    {
      spring: "🌸 Spring",
      summer: "☀️ Summer",
      autumn: "🍂 Autumn",
      winter: "❄️ Winter",
    }[currentSeason] || currentSeason;

  const handleHireFarmer = () => {
    if (farmer?.hired) {
      toast(
        `Kurcaci Budi siap! ${farmer.isAutoMode ? "Auto aktif" : "Nyalakan Auto dulu"} 👨‍🌾`,
        { icon: "✅" },
      );
      return;
    }
    openConfirm(
      "Sewa Kurcaci Budi",
      `Sewa Kurcaci Budi (Auto-Farm & Harvest) seharga ${GAME_CONSTANTS.COSTS.WORKER_FARMER} 💰?`,
      () => {
        if (hireWorker("farmer", GAME_CONSTANTS.COSTS.WORKER_FARMER)) {
          toast.success("Kurcaci Budi disewa! Auto farm sudah aktif. 👨‍🌾");
        } else {
          toast.error("Koin tidak cukup!");
        }
      },
    );
  };

  const handleShopBuy = (item, amount) => {
    if (buyItem(item.id, amount, item.price)) {
      toast.success(`Berhasil membeli ${amount} ${item.name}!`);
    } else {
      toast.error("Koin tidak cukup!");
    }
  };

  return (
    <>
      <ShopSectionTitle icon="🛒">Bibit Toko ({seasonLabel})</ShopSectionTitle>
      {buildings?.greenhouse && (
        <p className="text-[10px] text-[var(--primary-dark)] mb-2 font-bold">
          Greenhouse aktif — semua musim tersedia
        </p>
      )}
      <div className="shop-grid mb-6">
        {availableSeeds.length === 0 ? (
          <div className="col-span-full text-center text-sm text-[var(--text-secondary)] italic py-2">
            Tidak ada bibit untuk musim ini.
          </div>
        ) : (
          availableSeeds.map((seed) => {
            const amt = shopAmounts[seed.id] || 1;
            return (
              <ShopItemCard
                key={`shop-${seed.id}`}
                icon={<CropIcon itemId={seed.id} className="shop-item-icon" />}
                name={`${seed.name}${seed.season !== "all" ? ` · ${seed.season}` : ""}`}
                price={seed.price}
                amount={amt}
                onDecrease={() =>
                  setShopAmounts((p) => ({
                    ...p,
                    [seed.id]: Math.max(1, amt - 1),
                  }))
                }
                onIncrease={() =>
                  setShopAmounts((p) => ({ ...p, [seed.id]: amt + 1 }))
                }
                onBuy={() => handleShopBuy(seed, amt)}
                dataTutorial={
                  seed.id === "bibit_wortel" ? "shop-seed" : undefined
                }
              />
            );
          })
        )}
      </div>

      <ShopSectionTitle icon="🌱">Bibit Tanaman</ShopSectionTitle>
      <div className="glass-card p-3 mb-6">
        {SHOP_SEEDS.filter((s) => seeds[s.id]?.qty > 0).length === 0 ? (
          <div className="text-center text-sm text-[var(--text-secondary)] font-bold py-2">
            Belum ada bibit di Inventory.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {SHOP_SEEDS.filter((s) => seeds[s.id]?.qty > 0).map((seed) => (
              <button
                key={`inv-${seed.id}`}
                onClick={() => setSelectedInventoryItem(seed.id)}
                className={`p-2 glass-card flex flex-col items-center gap-1 transition-all border-2
                  ${selectedInventoryItem === seed.id ? "border-[var(--primary)] bg-[var(--primary)]/20 shadow-inner scale-105" : "border-transparent hover:bg-black/5"}`}
              >
                <span className="text-2xl relative drop-shadow-sm">
                  <CropIcon itemId={seed.id} />
                  <span className="absolute -bottom-2 -right-2 bg-[var(--gold)] text-[var(--text-primary)] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm border border-[#FFF1B8]">
                    {seeds[seed.id]?.qty || 0}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <ShopSectionTitle icon="🧑‍🌾">Pekerja (Auto)</ShopSectionTitle>
      <div className="w-full glass-card p-2 flex flex-col transition-colors text-left mb-2 border-[var(--primary)] bg-[var(--primary)]/10">
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="font-bold text-[var(--text-primary)] text-sm">
              Petani Budi {farmer ? `(Kebahagiaan: ${farmer.happiness}%)` : ""}
            </div>
            <div className="text-[10px] text-[var(--text-secondary)]">
              Auto-Farm & Harvest
            </div>
          </div>
          <Button
            type="button"
            variant={farmer ? "secondary" : "gold"}
            size="sm"
            onClick={handleHireFarmer}
            disabled={!!farmer}
          >
            {farmer ? "Dimiliki" : `${GAME_CONSTANTS.COSTS.WORKER_FARMER} 💰`}
          </Button>
        </div>
        {farmer?.hired && (
          <div className="flex justify-between items-center border-t border-[var(--primary)]/20 pt-2 mt-1">
            <p className="text-[10px] text-[var(--text-secondary)] font-medium">
              {farmer.isAutoMode
                ? SHOP_SEEDS.some((s) => (seeds[s.id]?.qty || 0) > 0)
                  ? "Kurcaci aktif — panen & tanam otomatis"
                  : "Auto ON — beli bibit agar bisa menanam"
                : "Nyalakan tombol Auto Kurcaci untuk mulai"}
            </p>
            {farmer.happiness < 100 && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  const res = useGameStore.getState().giveKopiWorker?.("farmer");
                  if (res?.ok) toast.success(res.message);
                  else toast.error(res?.message || "Gagal memberi kopi.");
                }}
              >
                <span>☕</span> Beri Kopi
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
