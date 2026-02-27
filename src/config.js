const processEnvBool = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return String(value).toLowerCase() === "true";
};

const processEnvInt = (value, defaultValue) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : defaultValue;
};

// PUBLIC_INTERFACE
function getConfig() {
  /** Returns validated server configuration derived from environment variables. */
  const port = processEnvInt(process.env.PORT, 3001);
  const host = process.env.HOST || "0.0.0.0";

  const allowedOriginsRaw = process.env.ALLOWED_ORIGINS || "";
  const allowedOrigins = allowedOriginsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allowedMethods = (process.env.ALLOWED_METHODS || "GET,POST,PUT,DELETE,PATCH,OPTIONS")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allowedHeaders = (process.env.ALLOWED_HEADERS || "Content-Type,Authorization")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const corsMaxAge = processEnvInt(process.env.CORS_MAX_AGE, 3600);

  const requestTimeoutMs = processEnvInt(process.env.REQUEST_TIMEOUT_MS, 30000);

  const rateLimitWindowMs = processEnvInt(process.env.RATE_LIMIT_WINDOW_S, 60) * 1000;
  const rateLimitMax = processEnvInt(process.env.RATE_LIMIT_MAX, 100);

  const trustProxy = processEnvBool(process.env.TRUST_PROXY, false);

  const sqlitePath = process.env.SQLITE_PATH || "./data/app.sqlite";

  return {
    host,
    port,
    allowedOrigins,
    allowedMethods,
    allowedHeaders,
    corsMaxAge,
    requestTimeoutMs,
    rateLimitWindowMs,
    rateLimitMax,
    trustProxy,
    sqlitePath,
    nodeEnv: process.env.NODE_ENV || "development"
  };
}

module.exports = { getConfig };
