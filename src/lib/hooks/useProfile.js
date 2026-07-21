import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { getItemSellPrice } from "@/lib/data/item-helpers";
import { SEASON_META } from "@/lib/nav";

export function useProfile() {
  const inventoryByCategory = useGameStore(
    (state) => state?.inventoryByCategory,
  );
  const coins = useGameStore((state) => state?.coins);
  const level = useGameStore((state) => state?.level);
  const xp = useGameStore((state) => state?.xp);
  const day = useGameStore((state) => state?.season?.day || 1);
  const season = useGameStore((state) => state?.season?.current || "spring");
  const achievements = useGameStore((state) => state?.achievements || {});
  const sellItem = useGameStore((state) => state?.sellItem);
  const sellAllInventory = useGameStore((state) => state?.sellAllInventory);
  const coinMultiplier = useGameStore((state) => state?.coinMultiplier);
  const openConfirm = useGameStore((state) => state?.openConfirm);
  const resetGame = useGameStore((state) => state?.resetGame);
  const dev = useGameStore((state) => state?.dev);
  const enqueueNotification = useGameStore(
    (state) => state?.enqueueNotification,
  );

  const [showSettings, setShowSettings] = useState(false);
  const xpNeeded = level * 100;
  const seasonMeta = SEASON_META[season] || SEASON_META.spring;

  // Build flat inventory for display
  const inventory = {};
  for (const items of Object.values(inventoryByCategory || {})) {
    for (const [id, data] of Object.entries(items)) {
      if (!inventory[id]) {
        inventory[id] = { qty: 0, quality: data.quality || "normal" };
      }
      inventory[id].qty += data.qty || 0;
      // If there's a higher quality, we might just display the most recent/highest, 
      // but for simplicity we keep the last seen quality if it was just overwritten
      inventory[id].quality = data.quality || inventory[id].quality;
    }
  }

  const CATEGORY_LABELS = {
    seeds: "bibit",
    crops: "pertanian",
    animalProducts: "peternakan",
    minerals: "tambang",
    tools: "tambang",
    fish: "pancing",
    bait: "pancing",
    processed: "dapur",
    cooked: "dapur",
    collectibles: "lainnya",
  };

  const categorized = {
    bibit: [],
    pertanian: [],
    peternakan: [],
    tambang: [],
    pancing: [],
    dapur: [],
    lainnya: [],
  };

  Object.entries(inventory).forEach(([itemId, data]) => {
    if (data.qty <= 0) return;
    const category = null; // TODO: map from item data
    const label = CATEGORY_LABELS[category] || "lainnya";
    categorized[label].push({ id: itemId, qty: data.qty, quality: data.quality });
  });

  const hasSellable = Object.entries(inventory).some(
    ([id, data]) => data.qty > 0 && getItemSellPrice(id) > 0,
  );

  const handleSellItem = (itemId, name, qty) => {
    const price = getItemSellPrice(itemId);
    if (!price) {
      enqueueNotification("Barang ini tidak bisa dijual.", { type: "error" });
      return;
    }
    const total = price * qty;
    openConfirm(
      "Jual Barang",
      `Jual semua ${qty}x ${name} seharga ${formatNumber(total)} 💰?`,
      () => {
        const earned = sellItem(itemId, qty);
        if (earned > 0) {
          enqueueNotification(`Terjual seharga ${formatNumber(earned)} 💰`, {
            icon: "💰",
            type: "success",
          });
        }
      },
    );
  };

  const handleSellAll = () => {
    openConfirm(
      "Jual Semua Hasil",
      "Jual semua hasil yang bisa dijual? Umpan & alat tidak ikut.",
      () => {
        const earned = sellAllInventory();
        if (earned > 0) {
          enqueueNotification(
            coinMultiplier > 1
              ? `Terjual ${formatNumber(earned)} 💰 (×${coinMultiplier} booster!)`
              : `Terjual semua hasil seharga ${formatNumber(earned)} 💰!`,
            { type: "success" },
          );
        } else {
          enqueueNotification("Tidak ada hasil yang bisa dijual.", {
            type: "error",
          });
        }
      },
    );
  };

  const handleSellCategory = (categoryKey, itemsList) => {
    openConfirm(
      "Jual Kategori",
      `Jual semua barang yang bisa dijual di kategori ini?`,
      () => {
        let totalEarned = 0;
        let soldCount = 0;
        itemsList.forEach((item) => {
          const price = getItemSellPrice(item.id);
          if (price > 0 && item.qty > 0) {
            const earned = sellItem(item.id, item.qty);
            if (earned > 0) {
              totalEarned += earned;
              soldCount++;
            }
          }
        });
        if (totalEarned > 0) {
          enqueueNotification(
            coinMultiplier > 1
              ? `Terjual ${soldCount} jenis barang seharga ${formatNumber(totalEarned)} 💰 (×${coinMultiplier} booster!)`
              : `Terjual ${soldCount} jenis barang seharga ${formatNumber(totalEarned)} 💰!`,
            { type: "success" },
          );
        } else {
          enqueueNotification(
            "Tidak ada barang yang bisa dijual di kategori ini.",
            { type: "error" },
          );
        }
      },
    );
  };

  return {
    inventory,
    coins,
    level,
    xp,
    day,
    achievements,
    dev,
    showSettings,
    xpNeeded,
    seasonMeta,
    categorized,
    hasSellable,
    resetGame,
    setShowSettings,
    handleSellItem,
    handleSellAll,
    handleSellCategory,
    enqueueNotification,
  };
}
