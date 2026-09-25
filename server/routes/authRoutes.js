const express = require("express");

const {
  signup,
  login,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// PUBLIC AUTH ROUTES
// ===============================

// Register / Signup
router.post("/signup", signup);

// Register alias
// Supports frontend requests using /register
router.post("/register", signup);

// Login
router.post("/login", login);

// ===============================
// PROTECTED AUTH ROUTES
// ===============================

// Get currently logged-in user
router.get("/me", protect, getMe);

module.exports = router;