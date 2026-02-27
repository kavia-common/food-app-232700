const { z } = require("zod");

/**
 * PUBLIC_INTERFACE
 * Creates a request validation middleware using Zod schemas.
 * @param {{ body?: import("zod").ZodTypeAny, query?: import("zod").ZodTypeAny, params?: import("zod").ZodTypeAny }} schemas
 * @returns {import("express").RequestHandler}
 */
function validate(schemas) {
  return (req, _res, next) => {
    const bodySchema = schemas.body ?? z.any();
    const querySchema = schemas.query ?? z.any();
    const paramsSchema = schemas.params ?? z.any();

    // Parsing will throw ZodError which is handled by errorHandler.
    req.body = bodySchema.parse(req.body);
    req.query = querySchema.parse(req.query);
    req.params = paramsSchema.parse(req.params);

    next();
  };
}

module.exports = { validate };
