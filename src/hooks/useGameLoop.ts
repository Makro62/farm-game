import { useEffect, useRef, useCallback } from 'react';
import { useFarmStore } from '../store/farmStore';
// import { useAnimalStore } from '../store/animalStore';
// import { useWeatherStore } from '../store/weatherStore';

export function useGameLoop() {
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const tickFarm = useFarmStore(state => state.tickGrowth);
  // const tickAnimals = useAnimalStore(state => state.tick);
  // const tickWeather = useWeatherStore(state => state.tick);

  const tick = useCallback((timestamp: number) => {
    // Throttle ke 10fps untuk efisiensi
    if (timestamp - lastTickRef.current >= 100) {
      lastTickRef.current = timestamp;

      try {
        const now = Date.now();
        tickFarm(now);
        // tickAnimals(now);
        // tickWeather(now);
      } catch (err) {
        console.error('[GameLoop]', err);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [tickFarm]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);
}
