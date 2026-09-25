const Show = require("../models/Show");
const Movie = require("../models/Movie");
const Screen = require("../models/Screen");

// ==========================================
// GET ALL SHOWS
// ==========================================

const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movie")
      .populate("theatre")
      .populate("screen")
      .sort({
        date: 1,
        time: 1,
      });

    return res.status(200).json({
      success: true,
      shows: shows,
    });
  } catch (error) {
    console.error(
      "========================================"
    );
    console.error(
      "GET ALL SHOWS ERROR"
    );
    console.error(
      "========================================"
    );
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load shows.",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE SHOW
// ==========================================

const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(
      req.params.id
    )
      .populate("movie")
      .populate("theatre")
      .populate("screen");

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found.",
      });
    }

    return res.status(200).json({
      success: true,
      show: show,
    });
  } catch (error) {
    console.error(
      "GET SHOW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load show.",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE SHOW
// ==========================================

const createShow = async (req, res) => {
  try {
    const {
      movie,
      screen,
      date,
      time,
      standardPrice,
      premiumPrice,
      reclinerPrice,
      status,
    } = req.body;

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Movie is required.",
      });
    }

    if (!screen) {
      return res.status(400).json({
        success: false,
        message: "Screen is required.",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required.",
      });
    }

    if (!time) {
      return res.status(400).json({
        success: false,
        message: "Time is required.",
      });
    }

    const movieExists =
      await Movie.findById(movie);

    if (!movieExists) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    const screenExists =
      await Screen.findById(screen);

    if (!screenExists) {
      return res.status(404).json({
        success: false,
        message: "Screen not found.",
      });
    }

    const existingShow =
      await Show.findOne({
        movie: movie,
        screen: screen,
        date: date,
        time: time,
      });

    if (existingShow) {
      return res.status(400).json({
        success: false,
        message:
          "This show already exists.",
      });
    }

    const show = await Show.create({
      movie: movie,
      theatre: screenExists.theatre,
      screen: screen,
      date: date,
      time: time,

      seatPrices: {
        standard:
          Number(standardPrice) || 150,

        premium:
          Number(premiumPrice) || 200,

        recliner:
          Number(reclinerPrice) || 280,
      },

      status: status || "active",
    });

    const populatedShow =
      await Show.findById(show._id)
        .populate("movie")
        .populate("theatre")
        .populate("screen");

    return res.status(201).json({
      success: true,
      message:
        "Show created successfully.",
      show: populatedShow,
    });
  } catch (error) {
    console.error(
      "CREATE SHOW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create show.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE SHOW
// ==========================================

const updateShow = async (req, res) => {
  try {
    const show =
      await Show.findById(
        req.params.id
      );

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found.",
      });
    }

    const {
      movie,
      screen,
      date,
      time,
      standardPrice,
      premiumPrice,
      reclinerPrice,
      status,
    } = req.body;

    const screenExists =
      await Screen.findById(screen);

    if (!screenExists) {
      return res.status(404).json({
        success: false,
        message: "Screen not found.",
      });
    }

    show.movie = movie;
    show.screen = screen;
    show.theatre =
      screenExists.theatre;
    show.date = date;
    show.time = time;

    show.seatPrices = {
      standard:
        Number(standardPrice) || 150,

      premium:
        Number(premiumPrice) || 200,

      recliner:
        Number(reclinerPrice) || 280,
    };

    show.status =
      status || "active";

    await show.save();

    const updatedShow =
      await Show.findById(show._id)
        .populate("movie")
        .populate("theatre")
        .populate("screen");

    return res.status(200).json({
      success: true,
      message:
        "Show updated successfully.",
      show: updatedShow,
    });
  } catch (error) {
    console.error(
      "UPDATE SHOW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update show.",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE SHOW
// ==========================================

const deleteShow = async (req, res) => {
  try {
    const show =
      await Show.findById(
        req.params.id
      );

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found.",
      });
    }

    await Show.deleteOne({
      _id: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Show deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE SHOW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete show.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
};