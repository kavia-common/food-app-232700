const express = require("express");
const { validate } = require("../middleware/validate");
const { idParamSchema, restaurantCreateSchema, restaurantUpdateSchema } = require("../schemas");
const { restaurantsService } = require("../services/restaurantsService");

const restaurantsRouter = express.Router();

restaurantsRouter.get("/", async (_req, res, next) => {
  try {
    const rows = await restaurantsService.list();
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

restaurantsRouter.get("/:id", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    const row = await restaurantsService.getById(req.params.id);
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

restaurantsRouter.post("/", validate({ body: restaurantCreateSchema }), async (req, res, next) => {
  try {
    const row = await restaurantsService.create(req.body);
    res.status(201).json({ data: row });
  } catch (err) {
    next(err);
  }
});

restaurantsRouter.put("/:id", validate({ params: idParamSchema, body: restaurantUpdateSchema }), async (req, res, next) => {
  try {
    const row = await restaurantsService.update(req.params.id, req.body);
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

restaurantsRouter.delete("/:id", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    await restaurantsService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { restaurantsRouter };
