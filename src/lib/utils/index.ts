import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number) {
  if (!Number.isFinite(num)) return "0";
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString("id-ID");
}

export function formatCurrency(num: number) {
  return `${formatNumber(num)} 💰`;
}

export function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}j ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}d`;
  }
  return `${seconds}d`;
}

export function formatRelativeTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return "Baru saja";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
  return `${Math.floor(diff / 86400000)} hari lalu`;
}

export function calculateProgress(plantedAt: number | null, growTime: number | null) {
  if (!plantedAt || !growTime) return 0;

  const elapsed = Date.now() - plantedAt;
  const progress = (elapsed / growTime) * 100;

  return Math.min(100, Math.max(0, progress));
}

export function isCropReady(plantedAt: number | null, growTime: number | null) {
  if (!plantedAt || !growTime) return false;
  return Date.now() - plantedAt >= growTime;
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function isMobile() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

export function isIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function getSafeAreaInsets() {
  if (typeof window === "undefined") return { top: 0, bottom: 0 };

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue("--sat") || "0"),
    bottom: parseInt(style.getPropertyValue("--sab") || "0"),
  };
}

export const storage = {
  set: (key: string, value: unknown, expiryMs: number | null = null) => {
    if (typeof window === "undefined") return;
    const item = {
      value,
      expiry: expiryMs ? Date.now() + expiryMs : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get: (key: string) => {
    if (typeof window === "undefined") return null;
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  },

  remove: (key: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};
