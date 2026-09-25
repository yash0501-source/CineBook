const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

// ==========================================
// GET USER ID FROM AUTH TOKEN
// ==========================================

const getUserId = (req) => {
  return req.user?.id || req.user?._id;
};

// ==========================================
// FIND BOOKING
// Supports both:
// 1. Custom bookingId: CB...
// 2. MongoDB _id
// ==========================================

const findBookingForUser = async (
  requestedBookingId,
  userId
) => {
  if (!requestedBookingId) {
    return null;
  }

  // ----------------------------------------
  // First try custom bookingId
  // ----------------------------------------

  let booking =
    await Booking.findOne({
      bookingId:
        requestedBookingId,
      user: userId,
    });

  if (booking) {
    return booking;
  }

  // ----------------------------------------
  // Then try MongoDB _id
  // ----------------------------------------

  if (
    mongoose.Types.ObjectId.isValid(
      requestedBookingId
    )
  ) {
    booking =
      await Booking.findOne({
        _id:
          requestedBookingId,
        user: userId,
      });
  }

  return booking;
};

// ==========================================
// CREATE PAYMENT
// ==========================================

const createPayment = async (
  req,
  res
) => {
  try {
    const {
      bookingId,
      paymentMethod,
    } = req.body;

    const userId =
      getUserId(req);

    console.log(
      "========================================"
    );

    console.log(
      "POST /api/payments received"
    );

    console.log(
      "REQUESTED BOOKING ID:",
      bookingId
    );

    console.log(
      "PAYMENT METHOD:",
      paymentMethod
    );

    console.log(
      "USER:",
      userId
    );

    console.log(
      "========================================"
    );

    // --------------------------------------
    // Authentication
    // --------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required.",
      });
    }

    // --------------------------------------
    // Booking ID
    // --------------------------------------

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message:
          "Booking ID is required.",
      });
    }

    // --------------------------------------
    // Payment method
    // --------------------------------------

    if (
      ![
        "UPI",
        "Card",
        "Net Banking",
      ].includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method.",
      });
    }

    // --------------------------------------
    // Find booking
    // --------------------------------------

    const booking =
      await findBookingForUser(
        bookingId,
        userId
      );

    if (!booking) {
      console.log(
        "BOOKING NOT FOUND FOR PAYMENT:",
        bookingId
      );

      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }

    console.log(
      "BOOKING FOUND:",
      booking.bookingId
    );

    console.log(
      "MONGO BOOKING ID:",
      booking._id
    );

    // --------------------------------------
    // Check booking status
    // --------------------------------------

    if (
      booking.status !==
      "confirmed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This booking cannot be paid for.",
      });
    }

    // --------------------------------------
    // Check existing payment
    // --------------------------------------

    const existingPayment =
      await Payment.findOne({
        booking:
          booking._id,

        status:
          "success",
      });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message:
          "Payment has already been completed.",
        payment:
          existingPayment,
      });
    }

    // --------------------------------------
    // Generate transaction ID
    // --------------------------------------

    const transactionId =
      "CBPAY" +
      Date.now() +
      Math.floor(
        Math.random() * 10000
      );

    // --------------------------------------
    // Create payment
    // --------------------------------------

    const payment =
      await Payment.create({
        booking:
          booking._id,

        user:
          userId,

        amount:
          booking.amount,

        paymentMethod,

        transactionId,

        status:
          "success",
      });

    console.log(
      "========================================"
    );

    console.log(
      "PAYMENT SUCCESS"
    );

    console.log(
      "USER:",
      userId
    );

    console.log(
      "BOOKING:",
      booking.bookingId
    );

    console.log(
      "MONGO BOOKING ID:",
      booking._id
    );

    console.log(
      "TRANSACTION:",
      transactionId
    );

    console.log(
      "AMOUNT:",
      booking.amount
    );

    console.log(
      "========================================"
    );

    return res.status(201).json({
      success: true,

      message:
        "Payment successful.",

      payment,
    });
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "PAYMENT ERROR"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Payment failed.",
    });
  }
};

// ==========================================
// GET PAYMENT BY BOOKING
// Supports both bookingId formats
// ==========================================

const getPaymentByBooking = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required.",
      });
    }

    const requestedBookingId =
      req.params.bookingId;

    const booking =
      await findBookingForUser(
        requestedBookingId,
        userId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found.",
      });
    }

    const payment =
      await Payment.findOne({
        booking:
          booking._id,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error(
      "GET PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch payment.",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  createPayment,
  getPaymentByBooking,
};