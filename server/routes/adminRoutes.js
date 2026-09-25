const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {
  getDashboardStats,
} = require("../controllers/adminController");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getDashboardStats
);

module.exports = router;