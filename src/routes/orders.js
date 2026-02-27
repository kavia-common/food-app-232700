const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { asyncHandler, HttpError } = require("../middleware/errors");
const { orderCreateSchema, orderStatusPatchSchema, orderStatusSchema } = require("../validation/schemas");

/**
 * @param {import("sqlite3").Database} db
 */
function createOrdersRouter(db, dbHelpers) {
  const router = express.Router();

  async function fetchOrderById(orderId) {
    const order = await dbHelpers.get(db, "SELECT * FROM orders WHERE id = ?", [orderId]);
    if (!order) return null;

    const items = await dbHelpers.all(
      db,
      "SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC",
      [orderId]
    );

    return {
      id: order.id,
      status: order.status,
      customer: {
        name: order.customer_name,
        phone: order.customer_phone,
        address: order.customer_address
      },
      notes: order.notes,
      subtotalCents: order.subtotal_cents,
      taxCents: order.tax_cents,
      totalCents: order.total_cents,
      items: items.map((it) => ({
        id: it.id,
        menuItemId: it.menu_item_id,
        quantity: it.quantity,
        unitPriceCents: it.unit_price_cents,
        lineTotalCents: it.line_total_cents
      })),
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };
  }

  // PUBLIC_INTERFACE
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const status = req.query.status ? String(req.query.status) : null;
      if (status && !orderStatusSchema.safeParse(status).success) {
        throw new HttpError(400, "Invalid status filter");
      }

      const rows = status
        ? await dbHelpers.all(db, "SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC", [
            status
          ])
        : await dbHelpers.all(db, "SELECT * FROM orders ORDER BY created_at DESC");

      res.json({
        data: rows.map((o) => ({
          id: o.id,
          status: o.status,
          subtotalCents: o.subtotal_cents,
          taxCents: o.tax_cents,
          totalCents: o.total_cents,
          createdAt: o.created_at,
          updatedAt: o.updated_at
        }))
      });
    })
  );

  // PUBLIC_INTERFACE
  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const parsed = orderCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(400, "Invalid order payload", parsed.error.flatten());
      }

      // Compute pricing from menu items to avoid trusting client.
      // A simple fixed 8% tax for now.
      const TAX_RATE = 0.08;

      const menuItemIds = parsed.data.items.map((i) => i.menuItemId);
      const uniqueIds = [...new Set(menuItemIds)];

      const placeholders = uniqueIds.map(() => "?").join(",");
      const menuRows = await dbHelpers.all(
        db,
        `SELECT id, price_cents, available FROM menu_items WHERE id IN (${placeholders})`,
        uniqueIds
      );

      const priceById = new Map(menuRows.map((r) => [r.id, r]));
      for (const reqItem of parsed.data.items) {
        const row = priceById.get(reqItem.menuItemId);
        if (!row) throw new HttpError(400, `Unknown menuItemId: ${reqItem.menuItemId}`);
        if (!row.available) throw new HttpError(400, `Menu item not available: ${reqItem.menuItemId}`);
      }

      const subtotalCents = parsed.data.items.reduce((acc, it) => {
        const unit = priceById.get(it.menuItemId).price_cents;
        return acc + unit * it.quantity;
      }, 0);

      const taxCents = Math.round(subtotalCents * TAX_RATE);
      const totalCents = subtotalCents + taxCents;

      const now = new Date().toISOString();
      const orderId = `o_${uuidv4()}`;

      const customer = parsed.data.customer || {};
      await dbHelpers.run(
        db,
        `INSERT INTO orders
          (id, status, customer_name, customer_phone, customer_address, notes, subtotal_cents, tax_cents, total_cents, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          "pending",
          customer.name || null,
          customer.phone || null,
          customer.address || null,
          parsed.data.notes || null,
          subtotalCents,
          taxCents,
          totalCents,
          now,
          now
        ]
      );

      for (const it of parsed.data.items) {
        const unitPriceCents = priceById.get(it.menuItemId).price_cents;
        const lineTotalCents = unitPriceCents * it.quantity;
        const orderItemId = `oi_${uuidv4()}`;

        await dbHelpers.run(
          db,
          `INSERT INTO order_items
            (id, order_id, menu_item_id, quantity, unit_price_cents, line_total_cents, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderItemId, orderId, it.menuItemId, it.quantity, unitPriceCents, lineTotalCents, now]
        );
      }

      const order = await fetchOrderById(orderId);

      res.status(201).json({ data: order });
    })
  );

  // PUBLIC_INTERFACE
  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = String(req.params.id);
      const order = await fetchOrderById(id);
      if (!order) throw new HttpError(404, "Order not found");
      res.json({ data: order });
    })
  );

  // PUBLIC_INTERFACE
  router.patch(
    "/:id/status",
    asyncHandler(async (req, res) => {
      const id = String(req.params.id);
      const parsed = orderStatusPatchSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(400, "Invalid status payload", parsed.error.flatten());
      }

      const existing = await dbHelpers.get(db, "SELECT id FROM orders WHERE id = ?", [id]);
      if (!existing) throw new HttpError(404, "Order not found");

      const now = new Date().toISOString();
      await dbHelpers.run(db, "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?", [
        parsed.data.status,
        now,
        id
      ]);

      const order = await fetchOrderById(id);
      res.json({ data: order });
    })
  );

  // PUBLIC_INTERFACE
  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = String(req.params.id);
      const existing = await dbHelpers.get(db, "SELECT id FROM orders WHERE id = ?", [id]);
      if (!existing) throw new HttpError(404, "Order not found");

      // Remove items then order (no guarantee of FK enforcement without pragmas).
      await dbHelpers.run(db, "DELETE FROM order_items WHERE order_id = ?", [id]);
      await dbHelpers.run(db, "DELETE FROM orders WHERE id = ?", [id]);

      res.status(204).send();
    })
  );

  return router;
}

module.exports = { createOrdersRouter };
