const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const { env } = require("./utils/env");
const { openApiSpec } = require("./openapi/spec");
const { notFoundHandler } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");
const { requestTimeout } = require("./middleware/requestTimeout");

const { usersRouter } = require("./routes/users");
const { restaurantsRouter } = require("./routes/restaurants");
const { menuItemsRouter } = require("./routes/menuItems");
const { ordersRouter } = require("./routes/orders");

/**
 * PUBLIC_INTERFACE
 * Creates and configures the Express application instance.
 * @returns {import("express").Express} Configured Express app.
 */
function createApp() {
  const app = express();

  if (env.TRUST_PROXY) {
    app.set("trust proxy", 1);
  }

  // Security & base middleware
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  // Timeout
  app.use(requestTimeout(env.REQUEST_TIMEOUT_MS));

  // Rate limit
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_S * 1000,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  // CORS
  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS,
      allowedHeaders: env.ALLOWED_HEADERS,
      methods: env.ALLOWED_METHODS,
      maxAge: env.CORS_MAX_AGE
    })
  );

  // Basic endpoints
  app.get("/health", (req, res) => res.json({ ok: true }));

  // OpenAPI
  app.get("/openapi.json", (req, res) => res.json(openApiSpec));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));

  // API routes
  app.use("/api/users", usersRouter);
  app.use("/api/restaurants", restaurantsRouter);
  app.use("/api/menu-items", menuItemsRouter);
  app.use("/api/orders", ordersRouter);

  // 404 + error
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
