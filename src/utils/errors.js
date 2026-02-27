/**
 * PUBLIC_INTERFACE
 * Represents an operational API error with an HTTP status.
 */
class ApiError extends Error {
  /**
   * @param {number} status HTTP status code.
   * @param {string} message Public error message.
   * @param {object} [details] Optional machine-readable details.
   */
  constructor(status, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

module.exports = { ApiError };
