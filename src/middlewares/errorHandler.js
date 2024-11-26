export const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes

  if (
    err.name === "MongooseError" &&
    err.message.includes("buffering timed out")
  ) {
    return res.status(503).json({
      success: false,
      message: "Database operation timed out. Please try again later.",
    });
  }

  // Handle Mongoose Cast Errors (e.g., invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: `Validation Error: ${messages.join(", ")}`,
    });
  }

  // Handle MongoDB Duplicate Key Errors (e.g., duplicate email)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: `Duplicate field value entered: ${Object.keys(err.keyValue)[0]}`,
    });
  }

  // Handle JWT Errors (invalid token, expired token, etc.)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token, please login again.",
    });
  }

  // Handle Token Expired Errors
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired, please refresh your session.",
    });
  }

  // Handle ReferenceError
  if (err instanceof ReferenceError) {
    return res.status(500).json({
      success: false,
      message: `Reference Error: ${err.message}`,
    });
  }

  // Handle TypeError
  if (err instanceof TypeError) {
    return res.status(500).json({
      success: false,
      message: `Type Error: ${err.message}`,
    });
  }

  // Fallback for any other errors that don't match
  return res.status(500).json({
    success: false,
    message: err.message || "An unexpected error occurred",
  });
};
