const { getDb, all, get, run } = require("../db/sqlite");
const { ApiError } = require("../utils/errors");

const restaurantsService = {
  // PUBLIC_INTERFACE
  async list() {
    /** Lists restaurants. */
    const db = getDb();
    try {
      return await all(db, "SELECT id, name, address, created_at FROM restaurants ORDER BY id DESC;");
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async getById(id) {
    /** Gets a restaurant by id, throws 404 if missing. */
    const db = getDb();
    try {
      const row = await get(db, "SELECT id, name, address, created_at FROM restaurants WHERE id = ?;", [id]);
      if (!row) throw new ApiError(404, "Restaurant not found");
      return row;
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async create(payload) {
    /** Creates a restaurant. */
    const db = getDb();
    try {
      const r = await run(db, "INSERT INTO restaurants (name, address) VALUES (?, ?);", [
        payload.name,
        payload.address ?? null
      ]);
      return await this.getById(r.lastID);
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async update(id, payload) {
    /** Updates a restaurant. */
    const db = getDb();
    try {
      await this.getById(id);

      const fields = [];
      const params = [];
      if (payload.name !== undefined) {
        fields.push("name = ?");
        params.push(payload.name);
      }
      if (payload.address !== undefined) {
        fields.push("address = ?");
        params.push(payload.address ?? null);
      }
      params.push(id);

      await run(db, `UPDATE restaurants SET ${fields.join(", ")} WHERE id = ?;`, params);
      return await this.getById(id);
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async remove(id) {
    /** Deletes a restaurant (cascades menu_items). */
    const db = getDb();
    try {
      await this.getById(id);
      await run(db, "DELETE FROM restaurants WHERE id = ?;", [id]);
    } finally {
      db.close();
    }
  }
};

module.exports = { restaurantsService };
