const User = require("../models/User");
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const Screen = require("../models/Screen");
const Show = require("../models/Show");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalTheatres,
      totalScreens,
      totalShows,
      totalBookings,
      successfulPayments,
    ] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Screen.countDocuments(),
      Show.countDocuments(),
      Booking.countDocuments(),
      Payment.find({ status: "success" }).select("amount"),
    ]);

    const totalRevenue = successfulPayments.reduce(
      (total, payment) => total + (payment.amount || 0),
      0
    );

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalTheatres,
        totalScreens,
        totalShows,
        totalBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};

module.exports = {
  getDashboardStats,
};