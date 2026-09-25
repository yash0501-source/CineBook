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

// Original signup route
router.post("/signup", signup);

// Register alias for frontend
router.post("/register", signup);

// ========================================
// LOGIN
// ========================================

router.post("/login", login);

// ========================================
// CURRENT USER
// ========================================

router.get("/me", protect, getMe);

module.exports = router;