class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

// PUBLIC_INTERFACE
function notFoundHandler(req, res) {
  /** Express 404 handler for unknown routes. */
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found"
    }
  });
}

// PUBLIC_INTERFACE
function errorHandler(err, req, res, next) {
  /** Express error handler producing JSON error envelopes. */
  // eslint-disable-next-line no-unused-vars
  const _next = next;

  const statusCode = err instanceof HttpError ? err.statusCode : 500;

  const body = {
    error: {
      code: err instanceof HttpError ? "HTTP_ERROR" : "INTERNAL_ERROR",
      message: err.message || "Internal Server Error"
    }
  };

  if (err instanceof HttpError && err.details) {
    body.error.details = err.details;
  }

  // Helpful in development; avoid leaking in prod.
  if (process.env.NODE_ENV !== "production" && !(err instanceof HttpError)) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

// PUBLIC_INTERFACE
function asyncHandler(fn) {
  /** Wraps an async route so errors are forwarded to Express error middleware. */
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  HttpError,
  notFoundHandler,
  errorHandler,
  asyncHandler
};
