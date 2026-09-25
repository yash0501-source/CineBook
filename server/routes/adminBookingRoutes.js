const express = require("express");

const {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/adminBookingController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  adminOnly,
} = require("../middleware/adminMiddleware");

const router = express.Router();

// GET ALL BOOKINGS
router.get(
  "/",
  protect,
  adminOnly,
  getAllBookings
);

// GET SINGLE BOOKING
router.get(
  "/:id",
  protect,
  adminOnly,
  getBookingById
);

// UPDATE STATUS
router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateBookingStatus
);

// DELETE BOOKING
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteBooking
);

module.exports = router;