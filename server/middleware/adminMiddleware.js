const User = require("../models/User");

const adminOnly = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await User.findById(req.user._id).select(
      "_id name email role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.admin = user;

    next();
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify admin access.",
    });
  }
};

module.exports = { adminOnly };