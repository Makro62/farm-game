'use client';

export default function TabsNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'farm', label: 'Pertanian', emoji: '🌱' },
    { id: 'animal', label: 'Peternakan', emoji: '🐄' },
    { id: 'mine', label: 'Tambang', emoji: '⛏️' },
    { id: 'town', label: 'Kota', emoji: '🏪' }
  ];

  return (
    <div className="game-container py-2 sm:py-3 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-[68px] sm:top-[76px] z-40">
      <div className="flex gap-1.5 sm:gap-2 md:gap-3 w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 ease-out shadow-sm border-b-4 min-h-[2.75rem] sm:min-h-[3rem]
                ${isActive 
                  ? 'btn-primary border-green-700 scale-[1.02] sm:scale-105' 
                  : 'glass-card text-gray-100 hover:text-white'
                }`}
            >
              <span className={`text-xl sm:text-2xl shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'drop-shadow-sm'}`}>
                {tab.emoji}
              </span>
              <span className="text-[11px] sm:text-sm md:text-base truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
