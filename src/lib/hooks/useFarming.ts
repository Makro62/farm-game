import { useGameStore } from "@/lib/store";
import { getItemEmoji } from "@/lib/data/item-helpers";

export function useFarming() {
  const workers = useGameStore((state) => state?.workers);
  const farmer = workers?.farmer;
  const toggleAutoFarmer = useGameStore((state) => state?.toggleAutoMode);
  const seeds = useGameStore(
    (state) => state?.inventoryByCategory?.seeds || {},
  );

  const plantSeed = useGameStore((state) => state?.plantSeed);
  const harvest = useGameStore((state) => state?.harvest);
  const waterPlot = useGameStore((state) => state?.waterPlot);
  const upgradePlot = useGameStore((state) => state?.upgradePlot);
  const sellAllInventory = useGameStore((state) => state?.sellAllInventory);
  const selectedInventoryItem = useGameStore((state) => state?.selectedSeed);
  const setSelectedInventoryItem = useGameStore(
    (state) => state?.setSelectedSeed,
  );
  const enqueueNotification = useGameStore(
    (state) => state?.enqueueNotification,
  );

  const handleToggleAuto = () => {
    if (!farmer?.hired) {
      enqueueNotification("Sewa Kurcaci Budi dulu di toko samping!", {
        icon: "👨‍🌾",
        type: "error",
      });
      return;
    }
    const next = !farmer.isAutoMode;
    toggleAutoFarmer("farmer");
    if (next) {
      const hasSeeds = Object.values(seeds).some((val) => val.qty > 0);
      if (!hasSeeds) {
        enqueueNotification(
          "Auto ON — beli bibit dulu agar kurcaci bisa menanam!",
          { icon: "👨‍🌾", type: "error" },
        );
      } else {
        enqueueNotification("Kurcaci petani aktif! Auto panen & tanam.", {
          id: "auto-farm-toggle",
          type: "success",
        });
      }
    }
  };

  const handlePlotClick = (plot, farmTool) => {
    if (farmTool === "upgrade") {
      const result = upgradePlot(plot.id);
      if (result.ok)
        enqueueNotification(result.message, { icon: "⭐", type: "success" });
      else enqueueNotification(result.message, { icon: "⭐", type: "error" });
      return;
    }

    if (farmTool === "siram") {
      const result = waterPlot(plot.id);
      if (result.ok)
        enqueueNotification(result.message, { icon: "💧", type: "success" });
      else enqueueNotification(result.message, { icon: "💧", type: "error" });
      return;
    }

    if (farmTool === "panen") {
      if (
        plot.status === "ready" ||
        (plot.status === "growing" &&
          plot.plantedAt &&
          Date.now() - plot.plantedAt >= plot.growTime)
      ) {
        const crop = harvest(plot.id);
        if (crop)
          enqueueNotification(`Panen ${getItemEmoji(crop)}!`, {
            type: "success",
          });
      } else {
        enqueueNotification("Petak belum siap panen", {
          icon: "🌾",
          type: "info",
        });
      }
      return;
    }

    if (plot.status === "empty" || plot.status === "dead") {
      if (!selectedInventoryItem) {
        enqueueNotification("Pilih bibit dari toko samping dulu!", {
          icon: "👆",
          type: "info",
        });
        return;
      }
      const result = plantSeed(plot.id, selectedInventoryItem);
      if (result.ok) {
        enqueueNotification(result.message, {
          icon: "🌱",
          id: "plant",
          type: "success",
        });
      } else {
        enqueueNotification(result.message, { type: "error" });
        if (result.message?.includes("Kehabisan"))
          setSelectedInventoryItem(null);
      }
    } else if (plot.status === "ready") {
      enqueueNotification("Ganti ke mode Panen untuk memanen", {
        icon: "✋",
        type: "info",
      });
    } else if (plot.status === "growing") {
      enqueueNotification("Masih tumbuh — pakai Siram untuk mempercepat", {
        icon: "🌱",
        type: "info",
      });
    }
  };

  return {
    autoFarm: farmer?.isAutoMode || false,
    handleToggleAuto,
    handlePlotClick,
  };
}
