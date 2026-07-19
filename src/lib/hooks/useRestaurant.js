import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { RECIPES } from '@/lib/data/recipes';
import { getItemDisplayName } from '@/lib/data/item-helpers';
import { GAME_CONSTANTS } from '@/lib/constants';

export function useRestaurant() {
  const inventory = useGameStore((state) => state.inventory);
  const startCrafting = useGameStore((state) => state.startCrafting);
  const workers = useGameStore((state) => state.workers);
  const hireWorker = useGameStore((state) => state.hireWorker);
  const autoChef = useGameStore((state) => state.autoChef);
  const toggleAutoChef = useGameStore((state) => state.toggleAutoChef);
  const selectedRecipe = useGameStore((state) => state.selectedRecipe);
  const setSelectedRecipe = useGameStore((state) => state.setSelectedRecipe);
  const openConfirm = useGameStore((state) => state.openConfirm);
  const enqueueNotification = useGameStore((state) => state.enqueueNotification);
  const eatFood = useGameStore((state) => state.eatFood);
  const level = useGameStore((state) => state.level || 1);

  const [menuFilter, setMenuFilter] = useState('all');
  const [serviceOn, setServiceOn] = useState(true);

  const recipes =
    menuFilter === 'all' ? RECIPES : RECIPES.filter((r) => r.type === menuFilter);

  const canCook = (recipe) =>
    Object.entries(recipe.req || {}).every(([item, qty]) => (inventory[item] || 0) >= qty);

  const handleCook = (recipeId) => {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    const missing = Object.entries(recipe.req)
      .filter(([item, qty]) => (inventory[item] || 0) < qty)
      .map(([item, qty]) => `${qty - (inventory[item] || 0)}x ${getItemDisplayName(item)}`);
    if (missing.length > 0) {
      enqueueNotification(`Kurang bahan: ${missing.join(', ')}`, { icon: '📋', duration: 4000, type: 'error' });
      return;
    }
    if (startCrafting(recipeId)) {
      // toast from store
    }
  };

  const handleHireWorker = () => {
    if (workers?.chef) {
      enqueueNotification('Koki Juna sudah disewa! Aktifkan Auto. 👨‍🍳', { icon: '✅', type: 'info' });
      return;
    }
    openConfirm(
      'Sewa Koki Juna',
      `Sewa Koki Juna (Auto-Cooking) seharga ${GAME_CONSTANTS.COSTS.WORKER_CHEF} 💰?`,
      () => {
        if (hireWorker('chef', GAME_CONSTANTS.COSTS.WORKER_CHEF)) {
          enqueueNotification('Koki Juna berhasil disewa! Pilih target menu.', { type: 'success' });
        } else {
          enqueueNotification('Koin tidak cukup!', { type: 'error' });
        }
      }
    );
  };

  const handleToggleAuto = () => {
    if (!workers?.chef) {
      enqueueNotification('Sewa Koki Juna dulu di toko samping! 🔒', { icon: '👨‍🍳', type: 'error' });
      return;
    }
    if (!selectedRecipe && !autoChef) {
      enqueueNotification('Pilih salah satu resep sebagai target sebelum menyalakan Koki!', { icon: '📌', type: 'error' });
      return;
    }
    const next = !autoChef;
    toggleAutoChef();
    enqueueNotification(
      next ? 'Koki Juna mulai masak otomatis!' : 'Koki Juna istirahat.',
      { id: 'auto-chef-toggle', type: 'success' }
    );
  };

  const handleSetTarget = (recipe, isSelected) => {
    setSelectedRecipe(isSelected ? null : recipe.id);
    if (!isSelected) {
      enqueueNotification(`${recipe.name} jadi target Auto Chef!`, {
        icon: '📌',
        id: 'set-target',
        type: 'success'
      });
    }
  };

  return {
    inventory,
    workers,
    autoChef,
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
    enqueueNotification
  };
}
