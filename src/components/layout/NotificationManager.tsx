"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/lib/store";
import type { NotificationOptions } from "@/types/game";
import toast from "react-hot-toast";
import type { ToastOptions } from "react-hot-toast";
import audioManager from "@/lib/audio";

const MAX_QUEUE = 10;

type Tier = "common" | "rare" | "legendary";

const TIER_DURATION: Record<Tier, number> = {
  common: 2800,
  rare: 3600,
  legendary: 5200,
};

const TIER_STYLE: Partial<Record<Tier, ToastOptions["style"]>> = {
  rare: {
    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    color: "#fff",
    fontWeight: 700,
  },
  legendary: {
    background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
    color: "#1f1400",
    fontWeight: 800,
    border: "1px solid #fde68a",
  },
};

function resolveTier(tier?: string, rewardCoins?: number): Tier {
  if (tier === "rare" || tier === "legendary" || tier === "common") return tier;
  if (typeof rewardCoins === "number" && rewardCoins > 0) {
    if (rewardCoins >= 2500) return "legendary";
    if (rewardCoins >= 750) return "rare";
  }
  return "common";
}

export default function NotificationManager() {
  const notificationsQueue = useGameStore((state) => state.notificationsQueue);
  const dequeueNotification = useGameStore(
    (state) => state.dequeueNotification,
  );
  const busy = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (busy.current) return;
    if (!notificationsQueue || notificationsQueue.length === 0) return;

    if (notificationsQueue.length > MAX_QUEUE) {
      const excess = notificationsQueue.slice(MAX_QUEUE);
      excess.forEach((n) => dequeueNotification(n.id));
    }

    const notif = notificationsQueue[0];
    busy.current = true;

    const {
      type = "success",
      duration,
      id: _queueId,
      sfx,
      tier,
      rewardCoins,
      style,
      ...options
    } = notif.options ?? ({} as NotificationOptions);
    void _queueId;
    const message = notif.message ?? "";
    const finalTier = resolveTier(tier, rewardCoins);
    const finalDuration = duration ?? TIER_DURATION[finalTier];

    if (sfx) audioManager.play(sfx);

    const toastFn =
      type === "error"
        ? toast.error
        : type === "success"
          ? toast.success
          : toast;

    const toastOpts: ToastOptions = { ...options, duration: finalDuration };
    if (style) toastOpts.style = style;
    else if (TIER_STYLE[finalTier]) toastOpts.style = TIER_STYLE[finalTier];
    if (finalTier === "legendary" && !options.icon) toastOpts.icon = "👑";

    toastFn(message, toastOpts);

    timerRef.current = setTimeout(() => {
      dequeueNotification(notif.id);
      busy.current = false;
      timerRef.current = null;
    }, finalDuration + 200);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [notificationsQueue, dequeueNotification]);

  return null;
}
