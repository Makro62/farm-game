"use client";
import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import TabsNav from '../components/TabsNav';
import TabFarm from '../components/TabFarm';
import TabAnimal from '../components/TabAnimal';
import TabTown from '../components/TabTown';
import Modals from '../components/Modals';
import { GameStateProvider } from './context/GameStateContext';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      if (window.initFarmGame && !window.gameInitializedNext) {
        window.gameInitializedNext = true;
        window.initFarmGame();
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <GameStateProvider>
      <div id="app">
        <Topbar />
        <TabsNav />
        <div id="main">
          <TabFarm />
          <TabAnimal />
          <TabTown />
        </div>
      </div>
      <Modals />
    </GameStateProvider>
  );
}
