"use client";

import { useGameStore } from "@/lib/store";
import toast from "react-hot-toast";

export function QuestPanel() {
  const dailyQuests = useGameStore((state) => state.dailyQuests);
  const claimQuestReward = useGameStore((state) => state.claimQuestReward);

  return (
    <>
      <div className="shop-section-title mt-6">
        <span>📝</span> Quest Harian
      </div>

      {dailyQuests && dailyQuests.length > 0 ? (
        dailyQuests.map((quest) => {
          const percent = Math.min(100, (quest.count / quest.required) * 100);
          const isComplete = quest.count >= quest.required;

          return (
            <div
              key={quest.id}
              className="quest-parchment p-3 mb-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold text-[var(--text-primary)] line-clamp-1 pr-2">
                  {quest.action} {quest.required} {quest.targetName}
                </span>
                <span className="text-[var(--wood-dark)] font-black whitespace-nowrap">
                  {quest.count}/{quest.required}
                </span>
              </div>

              <div className="w-full bg-[var(--wood)]/25 rounded-full h-2 mb-2 shadow-inner">
                <div
                  className="bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] h-2 rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="text-xs font-bold text-[var(--gold-deep)]">
                  {quest.rewardCoins} 💰 | {quest.rewardXp} ⭐
                </div>

                {quest.claimed ? (
                  <span className="text-xs font-bold text-[var(--text-secondary)] bg-black/5 px-2 py-1 rounded-full border border-[var(--wood)]/40">
                    Diambil
                  </span>
                ) : isComplete ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (claimQuestReward(quest.id)) {
                        toast.success("Hadiah quest berhasil diambil!");
                      }
                    }}
                    className="btn-primary !text-xs !px-3 !py-1"
                  >
                    Klaim
                  </button>
                ) : null}
              </div>
            </div>
          );
        })
      ) : (
        <div className="quest-parchment p-3 min-h-[80px] mb-6 flex flex-col items-center justify-center text-center">
          <span className="text-[var(--text-secondary)] text-sm font-medium mb-2">
            Quest sedang disiapkan...
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            Tunggu sejenak untuk quest baru.
          </span>
        </div>
      )}
    </>
  );
}
