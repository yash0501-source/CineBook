const express = require("express");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookedSeats,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBooking);

router.get("/my", protect, getMyBookings);

router.get("/seats/:showId", getBookedSeats);

router.get("/:bookingId", protect, getBookingById);

module.exports = router;