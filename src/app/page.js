'use client';

import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import TabsNav from '../components/TabsNav';
import TabFarm from '../components/TabFarm';
import TabAnimal from '../components/TabAnimal';
import TabTown from '../components/TabTown';
import Modals from '../components/Modals';
import { useGameStore } from '@/lib/store';

export default function Page() {
  const [activeTab, setActiveTab] = useState('farm');
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Auto-save every 30 seconds
  useEffect(() => {
    if (!isHydrated) return;
    
    const interval = setInterval(() => {
      // Zustand auto-saves via persist middleware
      console.log('💾 Game auto-saved');
    }, 30000);
    
    // Save on visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('💾 Game saved on tab switch');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHydrated]);
  
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
  
  if (!isHydrated) {
    return null; // Return null to prevent hydration mismatch. Handled by GameProvider.
  }
  
  return (
    <div id="app" className="min-h-screen flex flex-col">
      <Topbar />
      
      <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main id="main" className="flex-1 overflow-y-auto pb-20 p-4">
        {activeTab === 'farm' && <TabFarm />}
        {activeTab === 'animal' && <TabAnimal />}
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
