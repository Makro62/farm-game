import { ACHIEVEMENTS } from "@/lib/data/achievements";

export const createAchievementSlice = (set, get) => ({
  // ===== CHECK & UNLOCK =====
  checkAchievements: () => {
    const state = get();
    const stats = state.stats || {};
    const achievementsState = state.achievements || {};
    const mining = state.mining || {};

    ACHIEVEMENTS.forEach((ach) => {
      if (achievementsState[ach.id]?.unlocked) return; // Already unlocked

      let met = false;

      if (ach.condition.stat) {
        // Stats-based condition
        const current = stats[ach.condition.stat] || 0;
        met = current >= ach.condition.value;
      } else if (ach.condition.type === "custom") {
        // Custom conditions
        switch (ach.condition.key) {
          case "pickaxeGold":
            met = (mining.pickaxeLevel || 1) >= 3;
            break;
          case "allRounder": {
            // Butuh aksi di semua 5 area dalam sesi ini (tracked via sessionActions)
            const sa = state.sessionActions || {};
            met =
              sa.harvested &&
              sa.collected &&
              sa.mined &&
              sa.fished &&
              sa.cooked;
            break;
          }
          case "supplyChain":
            // Gunakan pupuk (fertilizer) DAN masak sesuatu
            met =
              (stats.totalFertilizerUsed || 0) >= 1 &&
              (stats.totalCooked || 0) >= 1;
            break;
          default:
            break;
        }
      }

      if (met) {
        get().unlockAchievement(ach.id);
      }
    });
  },

  unlockAchievement: (achId) => {
    const state = get();
    const ach = ACHIEVEMENTS.find((a) => a.id === achId);
    if (!ach) return;
    if (state.achievements?.[achId]?.unlocked) return;

    set((s) => ({
      achievements: {
        ...(s.achievements || {}),
        [achId]: { unlocked: true, unlockedAt: Date.now() },
      },
    }));

    // Reward
    if (ach.rewardXp) get().addXP(ach.rewardXp);
    if (ach.rewardCoins) get().addCoins(ach.rewardCoins);

    // Notification
    get().enqueueNotification(
      `🏆 Pencapaian Terbuka!\n${ach.emoji} ${ach.name}`,
      {
        duration: 5000,
        style: {
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "#fff",
          fontWeight: "bold",
        },
        icon: "🎉",
        type: "success",
      },
    );
  },

  // ===== STAT TRACKING =====
  incrementStat: (key, amount = 1) => {
    set((s) => ({
      stats: { ...s.stats, [key]: (s.stats?.[key] || 0) + amount },
    }));
  },

  // ===== SESSION TRACKING =====
  markSessionAction: (area) => {
    set((s) => ({
      sessionActions: {
        ...(s.sessionActions || {}),
        [area]: true,
      },
    }));
  },
});
