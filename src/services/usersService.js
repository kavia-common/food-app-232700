const { getDb, all, get, run } = require("../db/sqlite");
const { ApiError } = require("../utils/errors");

/**
 * Simple users service backed by SQLite.
 */
const usersService = {
  // PUBLIC_INTERFACE
  async list() {
    /** Lists users. */
    const db = getDb();
    try {
      return await all(db, "SELECT id, name, email, created_at FROM users ORDER BY id DESC;");
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async getById(id) {
    /** Gets a user by id, throws 404 if missing. */
    const db = getDb();
    try {
      const row = await get(db, "SELECT id, name, email, created_at FROM users WHERE id = ?;", [id]);
      if (!row) throw new ApiError(404, "User not found");
      return row;
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async create(payload) {
    /** Creates a user. */
    const db = getDb();
    try {
      try {
        const r = await run(db, "INSERT INTO users (name, email) VALUES (?, ?);", [payload.name, payload.email]);
        return await this.getById(r.lastID);
      } catch (err) {
        if (String(err?.message || "").includes("UNIQUE")) {
          throw new ApiError(409, "Email already exists");
        }
        throw err;
      }
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async update(id, payload) {
    /** Updates a user. */
    const db = getDb();
    try {
      await this.getById(id);

      const fields = [];
      const params = [];
      if (payload.name !== undefined) {
        fields.push("name = ?");
        params.push(payload.name);
      }
      if (payload.email !== undefined) {
        fields.push("email = ?");
        params.push(payload.email);
      }
      params.push(id);

      try {
        await run(db, `UPDATE users SET ${fields.join(", ")} WHERE id = ?;`, params);
      } catch (err) {
        if (String(err?.message || "").includes("UNIQUE")) {
          throw new ApiError(409, "Email already exists");
        }
        throw err;
      }

      return await this.getById(id);
    } finally {
      db.close();
    }
  },

  // PUBLIC_INTERFACE
  async remove(id) {
    /** Deletes a user. */
    const db = getDb();
    try {
      await this.getById(id);
      await run(db, "DELETE FROM users WHERE id = ?;", [id]);
    } finally {
      db.close();
    }
  }
};

module.exports = { usersService };
