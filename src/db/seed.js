const { getDb, run, get } = require("./sqlite");
const { logger } = require("../utils/logger");

/**
 * Seeds the DB with sample data.
 * Run: npm run db:seed
 */
async function seed() {
  const db = getDb();
  try {
    await run(db, "PRAGMA foreign_keys = ON;");

    // Users
    await run(db, "INSERT OR IGNORE INTO users (email, name) VALUES (?, ?);", ["alice@example.com", "Alice"]);
    await run(db, "INSERT OR IGNORE INTO users (email, name) VALUES (?, ?);", ["bob@example.com", "Bob"]);

    // Restaurants
    await run(db, "INSERT INTO restaurants (name, address) VALUES (?, ?);", ["Pasta Palace", "123 Noodle St"]);
    await run(db, "INSERT INTO restaurants (name, address) VALUES (?, ?);", ["Burger Barn", "9 Patty Ave"]);

    const pasta = await get(db, "SELECT id FROM restaurants WHERE name = ?;", ["Pasta Palace"]);
    const burger = await get(db, "SELECT id FROM restaurants WHERE name = ?;", ["Burger Barn"]);

    if (pasta?.id) {
      await run(
        db,
        "INSERT INTO menu_items (restaurant_id, name, description, price_cents, available) VALUES (?, ?, ?, ?, ?);",
        [pasta.id, "Spaghetti Carbonara", "Classic carbonara with pancetta", 1399, 1]
      );
      await run(
        db,
        "INSERT INTO menu_items (restaurant_id, name, description, price_cents, available) VALUES (?, ?, ?, ?, ?);",
        [pasta.id, "Penne Arrabbiata", "Spicy tomato sauce", 1199, 1]
      );
    }

    if (burger?.id) {
      await run(
        db,
        "INSERT INTO menu_items (restaurant_id, name, description, price_cents, available) VALUES (?, ?, ?, ?, ?);",
        [burger.id, "Classic Cheeseburger", "Beef patty + cheese", 1099, 1]
      );
    }

    logger.info("DB seeded successfully.");
  } finally {
    db.close();
  }
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("DB seed failed:", err);
  process.exit(1);
});
