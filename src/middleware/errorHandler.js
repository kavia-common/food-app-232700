const { ZodError } = require("zod");
const { ApiError } = require("../utils/errors");
const { logger } = require("../utils/logger");

/**
 * PUBLIC_INTERFACE
 * Express error-handling middleware.
 * Produces consistent JSON errors:
 *   { error: { message, details? } }
 * @returns {import("express").ErrorRequestHandler}
 */
function errorHandler(err, req, res, _next) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: "Validation error",
        details: err.flatten()
      }
    });
  }

  // Operational API errors
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        details: err.details
      }
    });
  }

  // Unknown errors
  logger.error("Unhandled error:", {
    message: err?.message,
    stack: err?.stack,
    path: req.originalUrl,
    method: req.method
  });

  return res.status(500).json({
    error: {
      message: "Internal server error"
    }
  });
}

module.exports = { errorHandler };
