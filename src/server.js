const http = require("http");

const { createApp } = require("./app");
const { env } = require("./utils/env");
const { logger } = require("./utils/logger");

/**
 * Bootstraps and starts the HTTP server.
 * This file is the runtime entry point for the backend.
 */
async function main() {
  const app = createApp();

  const server = http.createServer(app);

  server.listen(env.PORT, env.HOST, () => {
    logger.info(`API listening on http://${env.HOST}:${env.PORT}`);
    logger.info(`Swagger UI available at http://${env.HOST}:${env.PORT}/docs`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info("Shutting down server...");
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
