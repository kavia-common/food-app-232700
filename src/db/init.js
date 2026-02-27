const { getDb, run } = require("./sqlite");
const { logger } = require("../utils/logger");

/**
 * Creates DB schema if it does not exist.
 * Run: npm run db:init
 */
async function init() {
  const db = getDb();
  try {
    await run(db, "PRAGMA foreign_keys = ON;");

    // Users
    await run(
      db,
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`
    );

    // Restaurants
    await run(
      db,
      `CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`
    );

    // Menu items
    await run(
      db,
      `CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price_cents INTEGER NOT NULL,
        available INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      );`
    );

    await run(db, "CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);");

    // Orders
    await run(
      db,
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'created',
        total_cents INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE RESTRICT
      );`
    );

    // Order items
    await run(
      db,
      `CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price_cents INTEGER NOT NULL,
        line_total_cents INTEGER NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
      );`
    );

    await run(db, "CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);");
    await run(db, "CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);");
    await run(db, "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);");

    logger.info("DB initialized successfully.");
  } finally {
    db.close();
  }
}

init().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("DB init failed:", err);
  process.exit(1);
});
