const express = require("express");
const { validate } = require("../middleware/validate");
const { idParamSchema, userCreateSchema, userUpdateSchema } = require("../schemas");
const { usersService } = require("../services/usersService");

const usersRouter = express.Router();

/**
 * @route GET /api/users
 * @returns list of users
 */
usersRouter.get("/", async (_req, res, next) => {
  try {
    const users = await usersService.list();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/:id", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    const user = await usersService.getById(req.params.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

usersRouter.post("/", validate({ body: userCreateSchema }), async (req, res, next) => {
  try {
    const user = await usersService.create(req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
});

usersRouter.put("/:id", validate({ params: idParamSchema, body: userUpdateSchema }), async (req, res, next) => {
  try {
    const user = await usersService.update(req.params.id, req.body);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

usersRouter.delete("/:id", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    await usersService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { usersRouter };
