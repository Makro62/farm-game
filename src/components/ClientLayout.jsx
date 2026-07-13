'use client';

import { useEffect } from 'react';
import Topbar from '@/components/Topbar';
import Modals from '@/components/Modals';
import { useGameStore } from '@/lib/store';

export default function ClientLayout({ children }) {
  // Hitung offline progress saat game pertama dimuat
  useEffect(() => {
    useGameStore.getState().calculateOfflineProgress();
  }, []);

  // Simpan timestamp hanya saat save nyata (bukan tiap tick)
  useEffect(() => {
    const touch = () => useGameStore.getState().touchSaveTimestamp?.();
    const interval = setInterval(touch, 30000);

    const onHide = () => {
      if (document.hidden) touch();
    };
    const onUnload = () => touch();

    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  // Development shortcuts
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        useGameStore.getState().dev.addCoins(1000);
        console.log('💰 +1000 coins (dev)');
      }

      if (e.ctrlKey && e.shiftKey && e.key === 'l') {
        e.preventDefault();
        const state = useGameStore.getState();
        state.dev.setLevel(state.level + 1);
        console.log(`⭐ Level ${state.level + 1} (dev)`);
      }

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

      <main id="main" className="flex-1 overflow-y-auto overflow-x-hidden pb-16 sm:pb-20 game-container min-h-0 py-3 sm:py-4">
        {children}
      </main>

      <Modals />

      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-[#3E2723] px-3 py-1 rounded-full text-xs font-bold shadow-lg z-50">
          DEV MODE
        </div>
      )}
    </div>
  );
}
