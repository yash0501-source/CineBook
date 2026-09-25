const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // ==========================================
    // GET AUTHORIZATION HEADER
    // ==========================================

    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // ==========================================
    // GET TOKEN
    // ==========================================

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing.",
      });
    }

    // ==========================================
    // VERIFY JWT
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==========================================
    // FIND USER IN DATABASE
    // ==========================================

    const user = await User.findById(
      decoded.id
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User account not found.",
      });
    }

    // ==========================================
    // ATTACH USER TO REQUEST
    // ==========================================

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "AUTHENTICATION ERROR:",
      error.message
    );

    // ==========================================
    // EXPIRED TOKEN
    // ==========================================

    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message:
          "Your login session has expired. Please login again.",
      });
    }

    // ==========================================
    // INVALID TOKEN
    // ==========================================

    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message:
          "Invalid authentication token.",
      });
    }

    // ==========================================
    // OTHER AUTH ERROR
    // ==========================================

    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
};

// ==========================================
// ADMIN ONLY
// ==========================================

const adminOnly = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};