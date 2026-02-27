const express = require("express");
const { z } = require("zod");
const { validate } = require("../middleware/validate");
const { idParamSchema, menuItemCreateSchema, menuItemUpdateSchema } = require("../schemas");
const { menuItemsService } = require("../services/menuItemsService");

const menuItemsRouter = express.Router();

const listQuerySchema = z.object({
  restaurant_id: z.coerce.number().int().positive().optional()
});

menuItemsRouter.get("/", validate({ query: listQuerySchema }), async (req, res, next) => {
  try {
    const rows = await menuItemsService.list(req.query.restaurant_id);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

menuItemsRouter.get("/:id", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    const row = await menuItemsService.getById(req.params.id);
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

menuItemsRouter.post("/", validate({ body: menuItemCreateSchema }), async (req, res, next) => {
  try {
    const row = await menuItemsService.create(req.body);
    res.status(201).json({ data: row });
  } catch (err) {
    next(err);
  }
});

menuItemsRouter.put("/:id", validate({ params: idParamSchema, body: menuItemUpdateSchema }), async (req, res, next) => {
  try {
    const row = await menuItemsService.update(req.params.id, req.body);
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

menuItemsRouter.delete("/:id", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    await menuItemsService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { menuItemsRouter };
