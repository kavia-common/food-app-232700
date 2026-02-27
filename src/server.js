const dotenv = require("dotenv");
dotenv.config();

const { getConfig } = require("./config");
const { createApp } = require("./app");
const sqlite = require("./db/sqlite");

/**
 * Entrypoint to start the HTTP server.
 * Initializes the SQLite database (schema + seed), then starts Express.
 */
// PUBLIC_INTERFACE
async function main() {
  /** Starts the backend server. */
  const config = getConfig();

  const db = sqlite.openDb(config.sqlitePath);

  // Ensure foreign keys are enforced (best-effort).
  await sqlite.run(db, "PRAGMA foreign_keys = ON;");

  await sqlite.initSchema(db);
  await sqlite.seedIfEmpty(db);

  const app = createApp({ config, db, dbHelpers: sqlite });

  const server = app.listen(config.port, config.host, () => {
    // eslint-disable-next-line no-console
    console.log(`food-app-backend listening on http://${config.host}:${config.port}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    // eslint-disable-next-line no-console
    console.log("Shutting down...");
    server.close(() => {
      db.close(() => process.exit(0));
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal startup error:", err);
  process.exit(1);
});
