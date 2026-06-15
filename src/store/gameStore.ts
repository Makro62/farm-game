import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Karena immer bukan default dep, kita pakai Vanilla Zustand pattern untuk mutasi state
// Jika user ingin immer, bisa tambahkan belakangan
import { GameState } from '../types/game';

interface GameStore extends GameState {
  addCoins: (amount: number, source?: string) => void;
  spendCoins: (amount: number) => boolean;
  addXP: (amount: number) => void;
  advanceDay: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        coins: 80,
        level: 1,
        xp: 0,
        day: 1,
        season: 'spring',
        streak: 0,
        lastLogin: null,
        totalHarvest: 0,
        totalEarned: 0,

        addCoins: (amount, source) => set((state) => {
          console.debug(`[Economy] +${amount} coins from ${source}`);
          return { coins: state.coins + amount, totalEarned: state.totalEarned + amount };
        }),

        spendCoins: (amount) => {
          const { coins } = get();
          if (coins < amount) return false;
          set((state) => ({ coins: state.coins - amount }));
          return true;
        },

        addXP: (amount) => set((state) => {
          let newXp = state.xp + amount;
          let newLevel = state.level;
          const xpNeeded = state.level * 100;
          
          if (newXp >= xpNeeded) {
            newXp -= xpNeeded;
            newLevel += 1;
            // Level up side effects akan ditangani di useEffect komponen
          }
          return { xp: newXp, level: newLevel };
        }),

        advanceDay: () => set((state) => {
          const newDay = state.day + 1;
          // Ganti musim setiap 7 hari
          const seasons: GameState['season'][] = ['spring', 'summer', 'autumn', 'winter'];
          const newSeason = seasons[Math.floor((newDay - 1) / 7) % 4];
          return { day: newDay, season: newSeason };
        }),
      }),
      {
        name: 'farm-tycoon-game',
        version: 3,
        migrate: (persisted: any, version: number) => {
          if (version < 2) persisted.streak = 0;
          if (version < 3) persisted.lastLogin = null;
          return persisted;
        },
      }
    ),
    { name: 'FarmTycoon/GameStore' }
  )
);
