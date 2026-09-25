const express = require("express");

const {
  signup,
  login,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// REGISTER
// ========================================

router.post("/signup", signup);
router.post("/register", signup);

// ========================================
// LOGIN
// ========================================

router.post("/login", login);

// ========================================
// CURRENT USER
// ========================================

// Existing route
router.get("/me", protect, getMe);

// Profile alias for frontend
router.get("/profile", protect, getMe);

module.exports = router;