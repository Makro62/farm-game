function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}

function isUsable(value: unknown): boolean {
  return !!value && typeof (value as Storage).getItem === "function";
}

const globalRef = globalThis as unknown as Record<string, unknown>;

let current: unknown;
try {
  current = globalRef.localStorage;
} catch {
  current = undefined;
}

if (!isUsable(current)) {
  let fromWindow: unknown;
  try {
    fromWindow =
      typeof window !== "undefined" ? window.localStorage : undefined;
  } catch {
    fromWindow = undefined;
  }
  const value = isUsable(fromWindow) ? fromWindow : createMemoryStorage();
  try {
    Object.defineProperty(globalRef, "localStorage", {
      value,
      configurable: true,
      writable: true,
    });
  } catch {
    globalRef.localStorage = value;
  }
}
