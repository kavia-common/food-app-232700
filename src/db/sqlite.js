const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");

function ensureParentDir(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Promisified wrapper for sqlite3.Database#run.
 * @param {sqlite3.Database} db
 * @param {string} sql
 * @param {any[]} params
 */
function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

/**
 * Promisified wrapper for sqlite3.Database#get.
 * @param {sqlite3.Database} db
 * @param {string} sql
 * @param {any[]} params
 */
function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function onGet(err, row) {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

/**
 * Promisified wrapper for sqlite3.Database#all.
 * @param {sqlite3.Database} db
 * @param {string} sql
 * @param {any[]} params
 */
function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function onAll(err, rows) {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

/**
 * Creates and returns an opened sqlite database handle.
 * @param {string} sqlitePath
 */
function openDb(sqlitePath) {
  ensureParentDir(sqlitePath);
  return new sqlite3.Database(sqlitePath);
}

/**
 * Initializes required tables and indexes.
 * @param {sqlite3.Database} db
 */
async function initSchema(db) {
  // Menu items
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price_cents INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'other',
      image_url TEXT,
      available INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`
  );

  await run(db, `CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);`);

  // Orders
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      customer_address TEXT,
      notes TEXT,
      subtotal_cents INTEGER NOT NULL,
      tax_cents INTEGER NOT NULL,
      total_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`
  );

  // Order items
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      menu_item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      line_total_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
    );`
  );

  await run(db, `CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`);
}

/**
 * Adds some initial menu items if table is empty.
 * @param {sqlite3.Database} db
 */
async function seedIfEmpty(db) {
  const row = await get(db, "SELECT COUNT(*) AS cnt FROM menu_items;");
  if (row && row.cnt > 0) return;

  const now = new Date().toISOString();
  const seed = [
    {
      id: "m_pizza_margherita",
      name: "Margherita Pizza",
      description: "Tomato, mozzarella, basil.",
      price_cents: 1299,
      category: "pizza",
      image_url: null,
      available: 1
    },
    {
      id: "m_burger_classic",
      name: "Classic Burger",
      description: "Beef patty, lettuce, tomato, onion, house sauce.",
      price_cents: 1099,
      category: "burger",
      image_url: null,
      available: 1
    },
    {
      id: "m_salad_greek",
      name: "Greek Salad",
      description: "Feta, olives, cucumber, tomato, oregano dressing.",
      price_cents: 899,
      category: "salad",
      image_url: null,
      available: 1
    }
  ];

  for (const item of seed) {
    await run(
      db,
      `INSERT INTO menu_items (id, name, description, price_cents, category, image_url, available, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.name,
        item.description,
        item.price_cents,
        item.category,
        item.image_url,
        item.available,
        now,
        now
      ]
    );
  }
}

module.exports = {
  openDb,
  initSchema,
  seedIfEmpty,
  run,
  get,
  all
};
