import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { FISHES } from "@/lib/data/fishes";
import { SHOP_BAIT } from "@/lib/data/shop";
import { useGameStore } from "@/lib/store";
import { GAME_CONSTANTS } from "@/lib/constants";

function rollFish(rareBonus = 0) {
  // Rare fish (last 2) get boosted chance; common fish share the rest
  const weights = FISHES.map((fish, i) => {
    const isRare = i >= FISHES.length - 2;
    return isRare ? fish.chance * (1 + rareBonus * 3) : fish.chance;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < FISHES.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return FISHES[i];
  }
  return FISHES[0];
}

export function useFishingMinigame() {
  const selectedBait = useGameStore((state) => state?.selectedBait);
  const baitInv = useGameStore(
    (state) => state?.inventoryByCategory?.bait || {},
  );
  const weatherEffects = useGameStore((state) => state?.weatherEffects);

  const [fishState, setFishState] = useState("idle");
  const [indicatorPos, setIndicatorPos] = useState(50);
  const [score, setScore] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [activeBait, setActiveBait] = useState(null);

  const holdingRef = useRef(false);
  const baitRef = useRef(null);

  useEffect(() => {
    holdingRef.current = isHolding;
  }, [isHolding]);

  useEffect(() => {
    baitRef.current = activeBait;
  }, [activeBait]);

  useEffect(() => {
    if (fishState === "waiting") {
      const waitMult = activeBait?.waitMult ?? 1;
      const waitTime =
        (GAME_CONSTANTS.FISHING.WAIT_MIN_MS +
          Math.random() * GAME_CONSTANTS.FISHING.WAIT_RANDOM_MS) *
        waitMult;
      const timer = setTimeout(() => {
        setFishState("bite");
      }, waitTime);
      return () => clearTimeout(timer);
    }
  }, [fishState, activeBait]);

  useEffect(() => {
    if (fishState === "bite") {
      const timer = setTimeout(() => {
        toast.error("Yah, ikannya lepas! 🐟💨");
        setFishState("idle");
        setActiveBait(null);
      }, GAME_CONSTANTS.FISHING.BITE_WINDOW_MS);
      return () => clearTimeout(timer);
    }
  }, [fishState]);

  useEffect(() => {
    if (fishState !== "minigame") return;

    let pos = 50;
    let dir = 1;
    let currentScore = 0;
    const speed = 1.5 + Math.random() * 1.5;

    const interval = setInterval(() => {
      pos += dir * speed;
      if (pos >= 90) {
        pos = 90;
        dir = -1;
      }
      if (pos <= 10) {
        pos = 10;
        dir = 1;
      }

      setIndicatorPos(pos);

      const inZone = pos >= 30 && pos <= 70;
      if (inZone && holdingRef.current) {
        currentScore += 1;
        setScore(currentScore);
      } else if (!inZone && holdingRef.current) {
        currentScore -= 0.1;
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
    setFishState("idle");
    setIsHolding(false);
    setScore(0);
    const bait = baitRef.current;
    setActiveBait(null);

    if (success) {
      const weatherRareBonus = weatherEffects?.fishingRare
        ? weatherEffects.fishingRare - 1
        : 0;
      const caughtFish = rollFish((bait?.rareBonus || 0) + weatherRareBonus);
      useGameStore.getState().recordFishingCatch(caughtFish, bait);
      toast.success(
        `Berhasil menangkap ${caughtFish.emoji} ${caughtFish.name}!`,
        { duration: 4000 },
      );
    } else {
      toast.error("Gagal menangkap ikan, kurang tarikan!");
    }
  };

  const startFishing = () => {
    const store = useGameStore.getState();
    let bait = null;

    if (selectedBait && (baitInv[selectedBait]?.qty || 0) > 0) {
      bait = SHOP_BAIT.find((b) => b.id === selectedBait) || null;
      if (bait && store.removeItem(selectedBait, 1)) {
        const remaining =
          useGameStore.getState().inventoryByCategory?.bait?.[selectedBait]
            ?.qty || 0;
        if (remaining <= 0) {
          store.setSelectedBait(null);
        }
      } else {
        bait = null;
      }
    }

    setActiveBait(bait);
    setFishState("waiting");
    if (bait) {
      useGameStore.getState().recordBaitUsage(bait);
      toast(`Pakai ${bait.emoji} ${bait.name}`, {
        icon: "🎣",
        id: "bait-use",
        duration: 1500,
      });
    }
  };

  const startMinigame = () => {
    setFishState("minigame");
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
    startMinigame,
    activeBait,
  };
}
