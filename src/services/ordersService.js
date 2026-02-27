const { getDb, all, get, run } = require("../db/sqlite");
const { ApiError } = require("../utils/errors");

/**
 * Helper to fetch an order with items.
 */
async function getOrderWithItems(db, id) {
  const order = await get(
    db,
    `SELECT id, user_id, restaurant_id, status, total_cents, created_at
     FROM orders WHERE id = ?;`,
    [id]
  );
  if (!order) throw new ApiError(404, "Order not found");

  const items = await all(
    db,
    `SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.unit_price_cents, oi.line_total_cents,
            mi.name AS menu_item_name
     FROM order_items oi
     JOIN menu_items mi ON mi.id = oi.menu_item_id
     WHERE oi.order_id = ?
     ORDER BY oi.id ASC;`,
    [id]
  );

  return { ...order, items };
}

async function ensureUserExists(db, userId) {
  const u = await get(db, "SELECT id FROM users WHERE id = ?;", [userId]);
  if (!u) throw new ApiError(400, "user_id does not exist");
}

async function ensureRestaurantExists(db, restaurantId) {
  const r = await get(db, "SELECT id FROM restaurants WHERE id = ?;", [restaurantId]);
  if (!r) throw new ApiError(400, "restaurant_id does not exist");
}

async function getMenuItemForOrder(db, menuItemId, restaurantId) {
  const mi = await get(
    db,
    `SELECT id, restaurant_id, name, price_cents, available
     FROM menu_items
     WHERE id = ?;`,
    [menuItemId]
  );
  if (!mi) throw new ApiError(400, `menu_item_id ${menuItemId} does not exist`);
  if (mi.restaurant_id !== restaurantId) {
    throw new ApiError(400, `menu_item_id ${menuItemId} does not belong to restaurant_id ${restaurantId}`);
  }
  if (mi.available !== 1) {
    throw new ApiError(400, `menu_item_id ${menuItemId} is not available`);
  }
  return mi;
}

const ordersService = {
  // PUBLIC_INTERFACE
  async list() {
    /** Lists orders (without embedding items). */
    const db = getDb();
    try {
      return await all(
        db,
        `SELECT id, user_id, restaurant_id, status, total_cents, created_at
         FROM orders
         ORDER BY id DESC;`
      );
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async getById(id) {
    /** Gets an order by id including its items. */
    const db = getDb();
    try {
      return await getOrderWithItems(db, id);
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async create(payload) {
    /** Creates an order and its items in a transaction. */
    const db = getDb();
    try {
      await run(db, "PRAGMA foreign_keys = ON;");
      await ensureUserExists(db, payload.user_id);
      await ensureRestaurantExists(db, payload.restaurant_id);

      await run(db, "BEGIN;");
      try {
        const orderRes = await run(
          db,
          `INSERT INTO orders (user_id, restaurant_id, status, total_cents)
           VALUES (?, ?, 'created', 0);`,
          [payload.user_id, payload.restaurant_id]
        );

        let total = 0;
        for (const item of payload.items) {
          const mi = await getMenuItemForOrder(db, item.menu_item_id, payload.restaurant_id);
          const unit = mi.price_cents;
          const qty = item.quantity;
          const lineTotal = unit * qty;
          total += lineTotal;

          await run(
            db,
            `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price_cents, line_total_cents)
             VALUES (?, ?, ?, ?, ?);`,
            [orderRes.lastID, item.menu_item_id, qty, unit, lineTotal]
          );
        }

        await run(db, "UPDATE orders SET total_cents = ? WHERE id = ?;", [total, orderRes.lastID]);
        await run(db, "COMMIT;");

        return await getOrderWithItems(db, orderRes.lastID);
      } catch (err) {
        await run(db, "ROLLBACK;");
        throw err;
      }
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async update(id, payload) {
    /** Updates order status only. */
    const db = getDb();
    try {
      await getOrderWithItems(db, id);
      await run(db, "UPDATE orders SET status = ? WHERE id = ?;", [payload.status, id]);
      return await getOrderWithItems(db, id);
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async remove(id) {
    /** Deletes an order (cascades order_items). */
    const db = getDb();
    try {
      await getOrderWithItems(db, id);
      await run(db, "DELETE FROM orders WHERE id = ?;", [id]);
    } finally {
      db.close();
    }
  }
};

module.exports = { ordersService };
