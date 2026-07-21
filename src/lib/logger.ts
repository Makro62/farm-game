type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LOG_LEVEL = (process.env.NEXT_PUBLIC_LOG_LEVEL || "warn") as LogLevel;
const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

function canLog(level: LogLevel) {
  return LEVELS[level] >= (LEVELS[LOG_LEVEL] ?? LEVELS.warn);
}

export const logger = {
  debug: (...args: unknown[]) => canLog("debug") && console.log("[DEBUG]", ...args),
  info: (...args: unknown[]) => canLog("info") && console.info("[INFO]", ...args),
  warn: (...args: unknown[]) => canLog("warn") && console.warn("[WARN]", ...args),
  error: (...args: unknown[]) => canLog("error") && console.error("[ERROR]", ...args),
};
