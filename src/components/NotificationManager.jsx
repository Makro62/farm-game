'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function NotificationManager() {
  const notificationsQueue = useGameStore((state) => state.notificationsQueue);
  const dequeueNotification = useGameStore((state) => state.dequeueNotification);

  useEffect(() => {
    if (notificationsQueue && notificationsQueue.length > 0) {
      notificationsQueue.forEach((notif) => {
        const { type = 'success', ...options } = notif.options || {};
        
        // Show toast
        if (type === 'error') {
          toast.error(notif.message, options);
        } else if (type === 'success') {
          toast.success(notif.message, options);
        } else {
          toast(notif.message, options);
        }

        // Remove from queue
        dequeueNotification(notif.id);
      });
    }
  }, [notificationsQueue, dequeueNotification]);

  return null;
}
