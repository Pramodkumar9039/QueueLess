const logger = require("../utils/logger");

const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const isJsonParseError =
    error instanceof SyntaxError &&
    error.status === 400 &&
    error.type === "entity.parse.failed";

  if (isJsonParseError) {
    return res.status(400).json({
      message: "Invalid JSON request body",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Database validation failed",
      errors: Object.values(error.errors).map((fieldError) => ({
        field: fieldError.path,
        message: fieldError.kind,
      })),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: "A resource with the same unique value already exists",
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid request parameter",
    });
  }

  const status = Number.isInteger(error.statusCode)
    ? error.statusCode
    : Number.isInteger(error.status)
      ? error.status
      : 500;

  if (status === 401) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (status === 403) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  const safeStatus = status >= 400 && status < 500 ? status : 500;

  if (safeStatus >= 500) {
    logger.error("Unhandled API error", {
      method: req.method,
      path: req.path,
      status: safeStatus,
      errorName: error.name || "Error",
    });
  }

  return res.status(safeStatus).json({
    message:
      safeStatus === 500
        ? "Internal server error"
        : "Request could not be processed",
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
