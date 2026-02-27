const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { asyncHandler, HttpError } = require("../middleware/errors");
const { menuItemCreateSchema, menuItemUpdateSchema } = require("../validation/schemas");

/**
 * @param {import("sqlite3").Database} db
 */
function createMenuItemsRouter(db, dbHelpers) {
  const router = express.Router();

  // PUBLIC_INTERFACE
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const category = req.query.category ? String(req.query.category) : null;
      const available = req.query.available ? String(req.query.available) : null;

      const where = [];
      const params = [];

      if (category) {
        where.push("category = ?");
        params.push(category);
      }

      if (available !== null) {
        const bool = available === "true" || available === "1";
        where.push("available = ?");
        params.push(bool ? 1 : 0);
      }

      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
      const rows = await dbHelpers.all(
        db,
        `SELECT * FROM menu_items ${whereSql} ORDER BY created_at DESC`,
        params
      );

      res.json({
        data: rows.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          priceCents: r.price_cents,
          category: r.category,
          imageUrl: r.image_url,
          available: Boolean(r.available),
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
      });
    })
  );

  // PUBLIC_INTERFACE
  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const parsed = menuItemCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(400, "Invalid menu item payload", parsed.error.flatten());
      }

      const now = new Date().toISOString();
      const id = `m_${uuidv4()}`;

      await dbHelpers.run(
        db,
        `INSERT INTO menu_items (id, name, description, price_cents, category, image_url, available, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          parsed.data.name,
          parsed.data.description ?? "",
          parsed.data.priceCents,
          parsed.data.category ?? "other",
          parsed.data.imageUrl ?? null,
          parsed.data.available ? 1 : 0,
          now,
          now
        ]
      );

      const row = await dbHelpers.get(db, "SELECT * FROM menu_items WHERE id = ?", [id]);

      res.status(201).json({
        data: {
          id: row.id,
          name: row.name,
          description: row.description,
          priceCents: row.price_cents,
          category: row.category,
          imageUrl: row.image_url,
          available: Boolean(row.available),
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
      });
    })
  );

  // PUBLIC_INTERFACE
  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = String(req.params.id);
      const row = await dbHelpers.get(db, "SELECT * FROM menu_items WHERE id = ?", [id]);
      if (!row) throw new HttpError(404, "Menu item not found");

      res.json({
        data: {
          id: row.id,
          name: row.name,
          description: row.description,
          priceCents: row.price_cents,
          category: row.category,
          imageUrl: row.image_url,
          available: Boolean(row.available),
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
      });
    })
  );

  // PUBLIC_INTERFACE
  router.put(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = String(req.params.id);

      const existing = await dbHelpers.get(db, "SELECT * FROM menu_items WHERE id = ?", [id]);
      if (!existing) throw new HttpError(404, "Menu item not found");

      const parsed = menuItemUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(400, "Invalid menu item payload", parsed.error.flatten());
      }

      const next = {
        name: parsed.data.name ?? existing.name,
        description: parsed.data.description ?? existing.description,
        priceCents: parsed.data.priceCents ?? existing.price_cents,
        category: parsed.data.category ?? existing.category,
        imageUrl:
          parsed.data.imageUrl === undefined ? existing.image_url : parsed.data.imageUrl ?? null,
        available: parsed.data.available === undefined ? existing.available : parsed.data.available ? 1 : 0
      };

      const now = new Date().toISOString();

      await dbHelpers.run(
        db,
        `UPDATE menu_items
         SET name = ?, description = ?, price_cents = ?, category = ?, image_url = ?, available = ?, updated_at = ?
         WHERE id = ?`,
        [
          next.name,
          next.description,
          next.priceCents,
          next.category,
          next.imageUrl,
          next.available,
          now,
          id
        ]
      );

      const row = await dbHelpers.get(db, "SELECT * FROM menu_items WHERE id = ?", [id]);

      res.json({
        data: {
          id: row.id,
          name: row.name,
          description: row.description,
          priceCents: row.price_cents,
          category: row.category,
          imageUrl: row.image_url,
          available: Boolean(row.available),
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
      });
    })
  );

  // PUBLIC_INTERFACE
  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = String(req.params.id);
      const existing = await dbHelpers.get(db, "SELECT id FROM menu_items WHERE id = ?", [id]);
      if (!existing) throw new HttpError(404, "Menu item not found");

      await dbHelpers.run(db, "DELETE FROM menu_items WHERE id = ?", [id]);
      res.status(204).send();
    })
  );

  return router;
}

module.exports = { createMenuItemsRouter };
