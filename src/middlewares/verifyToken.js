import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header("authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided. Access denied." });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded || !decoded._id) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired token." });
    }

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found. Token is invalid." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res
        .status(403)
        .json({ success: false, message: "Token is malformed or invalid." });
    }

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during token verification.",
    });
  }
};

export default verifyToken;
