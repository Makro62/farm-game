import { useGameStore } from '@/lib/store';
import toast from 'react-hot-toast';

export function QuestPanel() {
  const dailyQuests = useGameStore(state => state.dailyQuests);
  const claimQuestReward = useGameStore(state => state.claimQuestReward);

  return (
    <>
      <div className="font-bold text-lg mb-3 flex items-center gap-2 border-b-2 border-[var(--wood-light)] pb-2 text-[var(--text-primary)] mt-6">
        <span>📝</span> Quest Harian
      </div>
      
      {dailyQuests && dailyQuests.length > 0 ? (
        dailyQuests.map(quest => {
          const percent = Math.min(100, (quest.count / quest.required) * 100);
          const isComplete = quest.count >= quest.required;
          
          return (
            <div key={quest.id} className="glass-card rounded-xl p-3 mb-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-[#3E2723] line-clamp-1 pr-2">
                  {quest.action} {quest.required} {quest.targetName}
                </span>
                <span className="text-purple-300 font-bold whitespace-nowrap">{quest.count}/{quest.required}</span>
              </div>
              
              <div className="w-full bg-[var(--wood)]/20 rounded-full h-2 mb-2 shadow-inner">
                <div className="bg-purple-400 h-2 rounded-full transition-all" style={{width: `${percent}%`}}></div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs font-bold text-yellow-600">
                  🎁 {quest.rewardCoins} 💰 | {quest.rewardXp} ⭐
                </div>
                
                {quest.claimed ? (
                  <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--wood-light)]/20 px-2 py-1 rounded border border-[var(--wood-light)]">Diambil</span>
                ) : isComplete ? (
                  <button 
                    onClick={() => {
                      if (claimQuestReward(quest.id)) {
                        toast.success('Hadiah quest berhasil diambil!');
                      }
                    }}
                    className="text-xs font-bold text-white bg-[var(--primary)] hover:brightness-110 px-3 py-1 rounded-lg shadow-sm transition-colors animate-pulse border border-[var(--primary-dark)]"
                  >
                    Klaim
                  </button>
                ) : null}
              </div>
            </div>
          );
        })
      ) : (
        <div className="glass-card rounded-xl p-3 min-h-[80px] mb-6 flex flex-col items-center justify-center text-center">
          <span className="text-gray-400 text-sm font-medium mb-2">Quest sedang disiapkan...</span>
          <span className="text-xs text-gray-500">Tunggu sejenak untuk quest baru.</span>
        </div>
      )}
    </>
  );
}
