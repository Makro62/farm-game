"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/lib/store";
import toast from "react-hot-toast";

const MAX_QUEUE = 10;

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

    // Limit queue size
    if (notificationsQueue.length > MAX_QUEUE) {
      const excess = notificationsQueue.slice(MAX_QUEUE);
      excess.forEach((n) => dequeueNotification(n.id));
    }

    const notif = notificationsQueue[0];
    busy.current = true;

    const { type = "success", duration = 2800, ...options } =
      notif.options || {};
    const message = notif.message ?? "";

    const toastFn =
      type === "error"
        ? toast.error
        : type === "success"
          ? toast.success
          : toast;

    toastFn(message, { ...options, duration });

    timerRef.current = setTimeout(() => {
      dequeueNotification(notif.id);
      busy.current = false;
      timerRef.current = null;
    }, duration + 200);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [notificationsQueue, dequeueNotification]);

  return null;
}
