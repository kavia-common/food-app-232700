const dotenv = require("dotenv");

dotenv.config();

function parseBool(value, fallback = false) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
}

function parseIntSafe(value, fallback) {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseList(value, fallback = []) {
  if (!value) return fallback;
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  HOST: process.env.HOST || "0.0.0.0",
  PORT: parseIntSafe(process.env.PORT, 3001),

  TRUST_PROXY: parseBool(process.env.TRUST_PROXY, false),

  ALLOWED_ORIGINS: parseList(process.env.ALLOWED_ORIGINS, ["http://localhost:3000"]),
  ALLOWED_HEADERS: parseList(process.env.ALLOWED_HEADERS, ["Content-Type", "Authorization", "X-Requested-With"]),
  ALLOWED_METHODS: parseList(process.env.ALLOWED_METHODS, ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]),
  CORS_MAX_AGE: parseIntSafe(process.env.CORS_MAX_AGE, 3600),

  REQUEST_TIMEOUT_MS: parseIntSafe(process.env.REQUEST_TIMEOUT_MS, 30000),

  RATE_LIMIT_WINDOW_S: parseIntSafe(process.env.RATE_LIMIT_WINDOW_S, 60),
  RATE_LIMIT_MAX: parseIntSafe(process.env.RATE_LIMIT_MAX, 100)
};

module.exports = { env };
