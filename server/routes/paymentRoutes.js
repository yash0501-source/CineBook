const express = require("express");

const {
  createPayment,
  getPaymentByBooking,
} = require("../controllers/paymentController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  createPayment
);

router.get(
  "/:bookingId",
  protect,
  getPaymentByBooking
);

module.exports = router;