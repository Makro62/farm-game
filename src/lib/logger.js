const LOG_LEVEL = process.env.NEXT_PUBLIC_LOG_LEVEL || "warn";
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

function canLog(level) {
  return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

export const logger = {
  debug: (...args) => canLog("debug") && console.log("[DEBUG]", ...args),
  info: (...args) => canLog("info") && console.info("[INFO]", ...args),
  warn: (...args) => canLog("warn") && console.warn("[WARN]", ...args),
  error: (...args) => canLog("error") && console.error("[ERROR]", ...args),
};
