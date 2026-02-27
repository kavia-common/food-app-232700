/**
 * Very small logger abstraction so we can swap later without touching call sites.
 */
const logger = {
  info: (...args) => console.log("[INFO]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  error: (...args) => console.error("[ERROR]", ...args)
};

module.exports = { logger };
