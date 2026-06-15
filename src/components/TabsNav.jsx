'use client';

export default function TabsNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'farm', label: '🌾 Pertanian' },
    { id: 'animal', label: '🐔 Peternakan' },
    { id: 'mine', label: '⛏️ Tambang' },
    { id: 'town', label: '🏘️ Kota & Fitur' }
  ];

  return (
    <div className="flex gap-2 p-3 sm:p-4 bg-white/80 backdrop-blur-md border-b border-green-200 shadow-sm sticky top-[68px] sm:top-[76px] z-40 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 w-full max-w-7xl mx-auto px-1 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-[120px] py-2 sm:py-3 px-4 rounded-xl font-bold transition-all duration-300 ease-out whitespace-nowrap shadow-sm
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-[1.02] ring-2 ring-green-300 ring-offset-1' 
                : 'bg-white text-green-700 hover:bg-green-50 border border-green-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
