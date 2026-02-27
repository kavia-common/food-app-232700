const { getDb, all, get, run } = require("../db/sqlite");
const { ApiError } = require("../utils/errors");

async function ensureRestaurantExists(db, restaurantId) {
  const r = await get(db, "SELECT id FROM restaurants WHERE id = ?;", [restaurantId]);
  if (!r) throw new ApiError(400, "restaurant_id does not exist");
}

const menuItemsService = {
  // PUBLIC_INTERFACE
  async list(restaurantId) {
    /** Lists menu items; optionally filter by restaurant_id. */
    const db = getDb();
    try {
      if (restaurantId) {
        return await all(
          db,
          `SELECT id, restaurant_id, name, description, price_cents, available, created_at
           FROM menu_items
           WHERE restaurant_id = ?
           ORDER BY id DESC;`,
          [restaurantId]
        );
      }
      return await all(
        db,
        `SELECT id, restaurant_id, name, description, price_cents, available, created_at
         FROM menu_items
         ORDER BY id DESC;`
      );
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async getById(id) {
    /** Gets a menu item by id, throws 404 if missing. */
    const db = getDb();
    try {
      const row = await get(
        db,
        `SELECT id, restaurant_id, name, description, price_cents, available, created_at
         FROM menu_items WHERE id = ?;`,
        [id]
      );
      if (!row) throw new ApiError(404, "Menu item not found");
      return row;
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async create(payload) {
    /** Creates a menu item. */
    const db = getDb();
    try {
      await ensureRestaurantExists(db, payload.restaurant_id);

      const r = await run(
        db,
        `INSERT INTO menu_items (restaurant_id, name, description, price_cents, available)
         VALUES (?, ?, ?, ?, ?);`,
        [
          payload.restaurant_id,
          payload.name,
          payload.description ?? null,
          payload.price_cents,
          payload.available === undefined ? 1 : payload.available ? 1 : 0
        ]
      );
      return await this.getById(r.lastID);
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async update(id, payload) {
    /** Updates a menu item. */
    const db = getDb();
    try {
      await this.getById(id);

      if (payload.restaurant_id !== undefined) {
        await ensureRestaurantExists(db, payload.restaurant_id);
      }

      const fields = [];
      const params = [];
      if (payload.restaurant_id !== undefined) {
        fields.push("restaurant_id = ?");
        params.push(payload.restaurant_id);
      }
      if (payload.name !== undefined) {
        fields.push("name = ?");
        params.push(payload.name);
      }
      if (payload.description !== undefined) {
        fields.push("description = ?");
        params.push(payload.description ?? null);
      }
      if (payload.price_cents !== undefined) {
        fields.push("price_cents = ?");
        params.push(payload.price_cents);
      }
      if (payload.available !== undefined) {
        fields.push("available = ?");
        params.push(payload.available ? 1 : 0);
      }
      params.push(id);

      await run(db, `UPDATE menu_items SET ${fields.join(", ")} WHERE id = ?;`, params);
      return await this.getById(id);
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async remove(id) {
    /** Deletes a menu item. */
    const db = getDb();
    try {
      await this.getById(id);
      await run(db, "DELETE FROM menu_items WHERE id = ?;", [id]);
    } finally {
      db.close();
    }
  }
};

module.exports = { menuItemsService };
