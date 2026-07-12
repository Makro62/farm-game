'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import TabsNav from '@/components/TabsNav';
import TabFarm from '@/components/TabFarm';
import TabAnimal from '@/components/TabAnimal';
import TabTown from '@/components/TabTown';
import TabMine from '@/components/TabMine';
import Modals from '@/components/Modals';
import { useGameStore } from '@/lib/store';

export default function Page() {
  const [activeTab, setActiveTab] = useState('farm');
  
  // Hitung offline progress saat game pertama dimuat
  useEffect(() => {
    useGameStore.getState().calculateOfflineProgress();
  }, []);

  // Development shortcuts
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const handleKeyPress = (e) => {
      // Ctrl+Shift+C untuk add coins
      if (e.ctrlKey && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        useGameStore.getState().dev.addCoins(1000);
        console.log('💰 +1000 coins (dev)');
      }
      
      // Ctrl+Shift+L untuk level up
      if (e.ctrlKey && e.shiftKey && e.key === 'l') {
        e.preventDefault();
        const state = useGameStore.getState();
        state.dev.setLevel(state.level + 1);
        console.log(`⭐ Level ${state.level + 1} (dev)`);
      }
      
      // Ctrl+Shift+R untuk reset plots
      if (e.ctrlKey && e.shiftKey && e.key === 'r') {
        e.preventDefault();
        useGameStore.getState().dev.resetPlots();
        console.log('🔄 Plots reset (dev)');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  return (
    <div id="app" className="min-h-screen flex flex-col">
      <Topbar />
      
      <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main id="main" className="flex-1 overflow-y-auto overflow-x-hidden pb-16 sm:pb-20 game-container min-h-0 py-3 sm:py-4">
        {activeTab === 'farm' && <TabFarm />}
        {activeTab === 'animal' && <TabAnimal />}
        {activeTab === 'mine' && <TabMine />}
        {activeTab === 'town' && <TabTown />}
      </main>
      
      <Modals />
      
      {/* Development indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-50">
          DEV MODE
        </div>
      )}
    </div>
  );
}
