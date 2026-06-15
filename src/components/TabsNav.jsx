'use client';

export default function TabsNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'farm', label: 'Pertanian', emoji: '🌱' },
    { id: 'animal', label: 'Peternakan', emoji: '🐄' },
    { id: 'mine', label: 'Tambang', emoji: '⛏️' },
    { id: 'town', label: 'Kota', emoji: '🏪' }
  ];

  return (
    <div className="flex gap-2 p-3 sm:p-4 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-[68px] sm:top-[76px] z-40 overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 w-full max-w-7xl mx-auto px-1 sm:px-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-4 rounded-2xl font-bold transition-all duration-300 ease-out whitespace-nowrap shadow-sm border-b-4
                ${isActive 
                  ? 'btn-primary border-green-700 transform scale-105' 
                  : 'glass-card text-gray-100 hover:text-white'
                }`}
            >
              <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'drop-shadow-sm group-hover:scale-105'}`}>
                {tab.emoji}
              </span>
              <span className="text-sm sm:text-base">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
