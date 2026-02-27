const express = require("express");
const { validate } = require("../middleware/validate");
const { idParamSchema, orderCreateSchema, orderUpdateSchema } = require("../schemas");
const { ordersService } = require("../services/ordersService");

const ordersRouter = express.Router();

ordersRouter.get("/", async (_req, res, next) => {
  try {
    const rows = await ordersService.list();
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

ordersRouter.get("/:id", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    const row = await ordersService.getById(req.params.id);
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post("/", validate({ body: orderCreateSchema }), async (req, res, next) => {
  try {
    const row = await ordersService.create(req.body);
    res.status(201).json({ data: row });
  } catch (err) {
    next(err);
  }
});

ordersRouter.put("/:id", validate({ params: idParamSchema, body: orderUpdateSchema }), async (req, res, next) => {
  try {
    const row = await ordersService.update(req.params.id, req.body);
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

ordersRouter.delete("/:id", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    await ordersService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { ordersRouter };
