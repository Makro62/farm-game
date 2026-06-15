import { create } from 'zustand';
import { Plot } from '../types/farm';

interface FarmState {
  plots: Plot[];
  selectedTool: 'scythe' | 'water' | 'plant' | 'harvest' | 'fertilize';
  selectedCropId: string;

  initPlots: (count: number) => void;
  clickPlot: (plotId: number) => void;
  setTool: (tool: FarmState['selectedTool']) => void;
  setCrop: (cropId: string) => void;
  tickGrowth: (now: number) => void;
}

export const useFarmStore = create<FarmState>()((set, get) => ({
  plots: [],
  selectedTool: 'scythe',
  selectedCropId: 'wortel',

  initPlots: (count) => set(() => ({
    plots: Array.from({ length: count }, (_, i) => ({
      id: i,
      status: i < 15 ? 'grass' : 'locked',
      cropId: null,
      plantedAt: null,
      growDuration: 0,
      watered: false,
      fertilized: false,
      upgradeLevel: 0,
    }))
  })),

  setTool: (tool) => set({ selectedTool: tool }),
  setCrop: (cropId) => set({ selectedCropId: cropId }),

  clickPlot: (plotId) => {
    set((state) => {
      const newPlots = [...state.plots];
      const plotIndex = newPlots.findIndex(p => p.id === plotId);
      if (plotIndex === -1 || newPlots[plotIndex].status === 'locked') return state;

      const p = { ...newPlots[plotIndex] };
      const { selectedTool, selectedCropId } = state;

      switch (selectedTool) {
        case 'scythe':
          if (p.status === 'grass') p.status = 'empty';
          break;
        case 'water':
          if (p.status === 'growing' && !p.watered) p.watered = true;
          break;
        case 'plant':
          if (p.status === 'empty') {
            p.status = 'growing';
            p.cropId = selectedCropId;
            p.plantedAt = Date.now();
            p.growDuration = 30000; // akan dihitung dari cropEngine nanti
          }
          break;
        case 'harvest':
          if (p.status === 'ready') {
            p.status = 'empty';
            p.cropId = null;
            p.plantedAt = null;
          }
          break;
      }
      
      newPlots[plotIndex] = p;
      return { plots: newPlots };
    });
  },

  tickGrowth: (now) => set((state) => {
    let hasChanges = false;
    const newPlots = state.plots.map(p => {
      if (p.status !== 'growing' || !p.plantedAt) return p;
      const elapsed = now - p.plantedAt;
      const speed = p.watered ? 1.5 : 1.0;
      if (elapsed * speed >= p.growDuration) {
        hasChanges = true;
        return { ...p, status: 'ready' as const };
      }
      return p;
    });

    return hasChanges ? { plots: newPlots } : state;
  }),
}));
