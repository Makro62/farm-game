import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { RECIPES, canCraft, getItemCategory } from "@/lib/data/recipes";
import { getItemDisplayName, getItemEmoji } from "@/lib/data/item-helpers";
import { GAME_CONSTANTS } from "@/lib/constants";

export function useRestaurant() {
  const inventoryByCategory = useGameStore(
    (state) => state.inventoryByCategory,
  );
  const startCrafting = useGameStore((state) => state.startCrafting);
  const workers = useGameStore((state) => state.workers);
  const chef = workers?.chef;
  const hireWorker = useGameStore((state) => state.hireWorker);
  const toggleAutoMode = useGameStore((state) => state.toggleAutoMode);
  const selectedRecipe = useGameStore((state) => state.selectedRecipe);
  const setSelectedRecipe = useGameStore((state) => state.setSelectedRecipe);
  const openConfirm = useGameStore((state) => state.openConfirm);
  const enqueueNotification = useGameStore(
    (state) => state.enqueueNotification,
  );
  const eatFood = useGameStore((state) => state.eatFood);
  const level = useGameStore((state) => state.level || 1);

  const [menuFilter, setMenuFilter] = useState("all");
  const [serviceOn, setServiceOn] = useState(true);

  const recipes =
    menuFilter === "all"
      ? RECIPES.filter((r) => r.type !== "processing")
      : RECIPES.filter((r) => r.type === menuFilter);

  const canCook = (recipe) => {
    if (!recipe || !recipe.req) return false;
    const result = canCraft(recipe.id, inventoryByCategory);
    return result.canCraft;
  };

  const handleCook = (recipeId) => {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;
    const result = canCraft(recipe.id, inventoryByCategory);
    if (!result.canCraft && result.missing) {
      const [cat, itemId] = result.missing.split(".");
      const have = inventoryByCategory?.[cat]?.[itemId]?.qty || 0;
      const req = recipe.req[result.missing];
      enqueueNotification(`Kurang bahan: butuh ${req - have}x ${itemId}`, {
        icon: "📋",
        duration: 4000,
        type: "error",
      });
      return;
    }
    startCrafting(recipeId);
  };

  const handleHireWorker = () => {
    if (chef?.hired) {
      enqueueNotification("Kurcaci Juna sudah disewa! Aktifkan Auto. 👨‍🍳", {
        icon: "✅",
        type: "info",
      });
      return;
    }
    openConfirm(
      "Sewa Kurcaci Juna",
      `Sewa Kurcaci Juna (Auto-Cooking) seharga ${GAME_CONSTANTS.COSTS.WORKER_CHEF} 💰?`,
      () => {
        if (hireWorker("chef", GAME_CONSTANTS.COSTS.WORKER_CHEF)) {
          enqueueNotification(
            "Kurcaci Juna berhasil disewa! Pilih target menu.",
            { type: "success" },
          );
        } else {
          enqueueNotification("Koin tidak cukup!", { type: "error" });
        }
      },
    );
  };

  const handleToggleAuto = () => {
    if (!chef?.hired) {
      enqueueNotification("Sewa Kurcaci Juna dulu di toko samping! 🔒", {
        icon: "👨‍🍳",
        type: "error",
      });
      return;
    }
    if (!selectedRecipe && !chef.isAutoMode) {
      enqueueNotification(
        "Pilih salah satu resep sebagai target sebelum menyalakan Koki!",
        { icon: "📌", type: "error" },
      );
      return;
    }
    toggleAutoMode("chef");
    enqueueNotification(
      !chef.isAutoMode
        ? "Kurcaci Juna mulai masak otomatis!"
        : "Kurcaci Juna istirahat.",
      { id: "auto-chef-toggle", type: "success" },
    );
  };

  const handleSetTarget = (recipe, isSelected) => {
    setSelectedRecipe(isSelected ? null : recipe.id);
    if (!isSelected) {
      enqueueNotification(`${recipe.name} jadi target Auto Chef!`, {
        icon: "📌",
        id: "set-target",
        type: "success",
      });
    }
  };

  return {
    inventory: inventoryByCategory,
    workers,
    autoChef: chef?.isAutoMode || false,
    selectedRecipe,
    level,
    menuFilter,
    serviceOn,
    recipes,
    setMenuFilter,
    setServiceOn,
    canCook,
    eatFood,
    handleCook,
    handleHireWorker,
    handleToggleAuto,
    handleSetTarget,
    enqueueNotification,
  };
}
