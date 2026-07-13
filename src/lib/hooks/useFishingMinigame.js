import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FISHES } from '@/lib/utils';
import { useGameStore } from '@/lib/store';
import { GAME_CONSTANTS } from '@/lib/constants';

export function useFishingMinigame() {
  const addItem = useGameStore(state => state.addItem);
  const addXP = useGameStore(state => state.addXP);
  const progressQuest = useGameStore(state => state.progressQuest);
  
  const [fishState, setFishState] = useState('idle'); // idle | waiting | bite | minigame
  const [indicatorPos, setIndicatorPos] = useState(50);
  const [score, setScore] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  
  const holdingRef = useRef(false);

  // Update ref when state changes so setInterval sees it
  useEffect(() => {
    holdingRef.current = isHolding;
  }, [isHolding]);

  // Handle waiting for bite
  useEffect(() => {
    if (fishState === 'waiting') {
      const waitTime = GAME_CONSTANTS.FISHING.WAIT_MIN_MS + Math.random() * GAME_CONSTANTS.FISHING.WAIT_RANDOM_MS;
      const timer = setTimeout(() => {
        setFishState('bite');
      }, waitTime);
      return () => clearTimeout(timer);
    }
  }, [fishState]);

  // Handle bite window
  useEffect(() => {
    if (fishState === 'bite') {
      const timer = setTimeout(() => {
        toast.error('Yah, ikannya lepas! 🐟💨');
        setFishState('idle');
      }, GAME_CONSTANTS.FISHING.BITE_WINDOW_MS);
      return () => clearTimeout(timer);
    }
  }, [fishState]);

  // Handle minigame loop
  useEffect(() => {
    if (fishState !== 'minigame') return;
    
    let pos = 50;
    let dir = 1;
    let currentScore = 0;
    const speed = 1.5 + Math.random() * 1.5;
    
    const interval = setInterval(() => {
      pos += dir * speed;
      if (pos >= 90) { pos = 90; dir = -1; }
      if (pos <= 10) { pos = 10; dir = 1; }
      
      setIndicatorPos(pos);
      
      // Hit zone is between 30 and 70 (easier)
      const inZone = pos >= 30 && pos <= 70;
      if (inZone && holdingRef.current) {
        currentScore += 1;
        setScore(currentScore);
      } else if (!inZone && holdingRef.current) {
        currentScore -= 0.1; // Penalty for holding outside zone
        if (currentScore < 0) currentScore = 0;
        setScore(currentScore);
      }

      if (currentScore >= GAME_CONSTANTS.FISHING.WIN_THRESHOLD) {
        finishMinigame(true);
      }
    }, GAME_CONSTANTS.FISHING.TICK_MS);

    const timeout = setTimeout(() => {
      finishMinigame(false);
    }, GAME_CONSTANTS.FISHING.MINIGAME_MAX_TIME_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [fishState]);

  const finishMinigame = (success) => {
    setFishState('idle');
    setIsHolding(false);
    setScore(0);
    
    if (success) {
      // Roll fish based on chance
      const rand = Math.random();
      let cumulative = 0;
      let caughtFish = FISHES[0];
      for (const fish of FISHES) {
        cumulative += fish.chance;
        if (rand <= cumulative) {
          caughtFish = fish;
          break;
        }
      }
      
      addItem(caughtFish.id, 1);
      addXP(15);
      progressQuest('fish', caughtFish.id, 1);
      toast.success(`Berhasil menangkap ${caughtFish.emoji} ${caughtFish.name}!`, { duration: 4000 });
    } else {
      toast.error('Gagal menangkap ikan, kurang tarikan!');
    }
  };

  const startFishing = () => {
    setFishState('waiting');
  };

  const startMinigame = () => {
    setFishState('minigame');
    setScore(0);
    setIndicatorPos(50);
  };

  return {
    fishState,
    indicatorPos,
    score,
    isHolding,
    setIsHolding,
    startFishing,
    startMinigame
  };
}
