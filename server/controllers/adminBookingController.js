const Booking = require("../models/Booking");

// ========================================
// GET ALL BOOKINGS
// ========================================

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(
      "ADMIN GET BOOKINGS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings.",
    });
  }
};

// ========================================
// GET SINGLE BOOKING
// ========================================

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    ).populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "ADMIN GET BOOKING ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch booking.",
    });
  }
};

// ========================================
// UPDATE BOOKING STATUS
// ========================================

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Booking status is required.",
      });
    }

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be confirmed or cancelled.",
      });
    }

    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    booking.status = status;

    await booking.save();

    const updatedBooking =
      await Booking.findById(booking._id)
        .populate("user", "name email");

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(
      "ADMIN UPDATE BOOKING ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
    });
  }
};

// ========================================
// DELETE BOOKING
// ========================================

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    console.error(
      "ADMIN DELETE BOOKING ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete booking.",
    });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};