"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function NotificationManager() {
  const notificationsQueue = useGameStore((state) => state.notificationsQueue);
  const dequeueNotification = useGameStore(
    (state) => state.dequeueNotification,
  );
  const busy = useRef(false);

  useEffect(() => {
    if (busy.current) return;
    if (!notificationsQueue || notificationsQueue.length === 0) return;

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

    setTimeout(() => {
      dequeueNotification(notif.id);
      busy.current = false;
    }, duration + 200);
  }, [notificationsQueue, dequeueNotification]);

  return null;
}
