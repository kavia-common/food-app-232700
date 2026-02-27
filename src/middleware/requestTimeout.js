const { ApiError } = require("../utils/errors");

/**
 * PUBLIC_INTERFACE
 * Express middleware to enforce a request timeout.
 * @param {number} timeoutMs Timeout in milliseconds.
 * @returns {import("express").RequestHandler}
 */
function requestTimeout(timeoutMs) {
  return (req, res, next) => {
    res.setTimeout(timeoutMs, () => {
      next(new ApiError(503, "Request timed out"));
    });
    next();
  };
}

module.exports = { requestTimeout };
