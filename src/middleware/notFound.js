const { ApiError } = require("../utils/errors");

/**
 * PUBLIC_INTERFACE
 * Express middleware for handling unknown routes.
 * @returns {import("express").RequestHandler}
 */
function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { notFoundHandler };
