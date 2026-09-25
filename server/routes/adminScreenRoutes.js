const express = require("express");

const {
  getAllScreens,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen,
} = require("../controllers/adminScreenController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// ========================================
// GET ALL SCREENS
// ========================================

router.get(
  "/",
  protect,
  adminOnly,
  getAllScreens
);

// ========================================
// GET SINGLE SCREEN
// ========================================

router.get(
  "/:id",
  protect,
  adminOnly,
  getScreenById
);

// ========================================
// CREATE SCREEN
// ========================================

router.post(
  "/",
  protect,
  adminOnly,
  createScreen
);

// ========================================
// UPDATE SCREEN
// ========================================

router.put(
  "/:id",
  protect,
  adminOnly,
  updateScreen
);

// ========================================
// DELETE SCREEN
// ========================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteScreen
);

module.exports = router;