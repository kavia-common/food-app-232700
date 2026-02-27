const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { notFoundHandler, errorHandler } = require("./middleware/errors");
const { createMenuItemsRouter } = require("./routes/menuItems");
const { createOrdersRouter } = require("./routes/orders");

// PUBLIC_INTERFACE
function createApp({ config, db, dbHelpers }) {
  /** Creates and returns a configured Express app. */
  const app = express();

  if (config.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(morgan("combined"));

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow same-origin/non-browser requests (no Origin header), and allow-list otherwise.
        if (!origin) return callback(null, true);
        if (config.allowedOrigins.length === 0) return callback(null, true);
        if (config.allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("CORS origin not allowed"), false);
      },
      methods: config.allowedMethods,
      allowedHeaders: config.allowedHeaders,
      maxAge: config.corsMaxAge,
      credentials: true
    })
  );

  app.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      limit: config.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.use(express.json({ limit: "1mb" }));

  // Simple request timeout guard.
  app.use((req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({
          error: { code: "TIMEOUT", message: "Request timed out" }
        });
      }
    }, config.requestTimeoutMs);

    res.on("finish", () => clearTimeout(timeout));
    res.on("close", () => clearTimeout(timeout));
    next();
  });

  // Operational endpoints
  app.get("/", (req, res) => {
    res.json({
      name: "food-app-backend",
      version: "1.0.0",
      status: "ok",
      endpoints: {
        health: "/health",
        ready: "/ready",
        menuItems: "/api/menu-items",
        orders: "/api/orders"
      }
    });
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok", uptimeS: Math.floor(process.uptime()) });
  });

  app.get("/ready", async (req, res, next) => {
    try {
      // Validate DB connectivity with a simple query.
      await dbHelpers.get(db, "SELECT 1 AS ok;");
      res.json({ status: "ready" });
    } catch (err) {
      next(err);
    }
  });

  // API routes
  app.use("/api/menu-items", createMenuItemsRouter(db, dbHelpers));
  app.use("/api/orders", createOrdersRouter(db, dbHelpers));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
