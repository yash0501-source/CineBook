const express = require("express");

const {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
} = require("../controllers/adminShowController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// ========================================
// GET ALL SHOWS
// ========================================

router.get(
  "/",
  protect,
  adminOnly,
  getAllShows
);

// ========================================
// GET SINGLE SHOW
// ========================================

router.get(
  "/:id",
  protect,
  adminOnly,
  getShowById
);

// ========================================
// CREATE SHOW
// ========================================

router.post(
  "/",
  protect,
  adminOnly,
  createShow
);

// ========================================
// UPDATE SHOW
// ========================================

router.put(
  "/:id",
  protect,
  adminOnly,
  updateShow
);

// ========================================
// DELETE SHOW
// ========================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteShow
);

// ========================================
// EXPORT
// ========================================

module.exports = router;