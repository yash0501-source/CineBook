const Theatre = require("../models/Theatre");
const Screen = require("../models/Screen");
const Show = require("../models/Show");
const Booking = require("../models/Booking");

// ========================================
// GET ALL THEATRES
// ========================================

const getAllTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      theatres,
    });
  } catch (error) {
    console.error(
      "ADMIN GET THEATRES ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch theatres.",
    });
  }
};

// ========================================
// GET SINGLE THEATRE
// ========================================

const getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(
      req.params.id
    );

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found.",
      });
    }

    res.status(200).json({
      success: true,
      theatre,
    });
  } catch (error) {
    console.error(
      "ADMIN GET THEATRE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch theatre.",
    });
  }
};

// ========================================
// CREATE THEATRE
// ========================================

const createTheatre = async (req, res) => {
  try {
    const {
      name,
      city,
      address,
      facilities,
      status,
    } = req.body;

    if (
      !name ||
      !city ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Theatre name, city and address are required.",
      });
    }

    const existingTheatre =
      await Theatre.findOne({
        name: name.trim(),
        city: city.trim(),
      });

    if (existingTheatre) {
      return res.status(400).json({
        success: false,
        message:
          "A theatre with this name already exists in this city.",
      });
    }

    const theatre =
      await Theatre.create({
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),

        facilities:
          Array.isArray(facilities)
            ? facilities
            : [],

        status:
          status || "active",
      });

    res.status(201).json({
      success: true,
      message:
        "Theatre created successfully.",
      theatre,
    });
  } catch (error) {
    console.error(
      "ADMIN CREATE THEATRE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create theatre.",
    });
  }
};

// ========================================
// UPDATE THEATRE
// ========================================

const updateTheatre = async (req, res) => {
  try {
    const theatre =
      await Theatre.findById(
        req.params.id
      );

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found.",
      });
    }

    const {
      name,
      city,
      address,
      facilities,
      status,
    } = req.body;

    if (name !== undefined) {
      theatre.name = name.trim();
    }

    if (city !== undefined) {
      theatre.city = city.trim();
    }

    if (address !== undefined) {
      theatre.address =
        address.trim();
    }

    if (facilities !== undefined) {
      theatre.facilities =
        Array.isArray(facilities)
          ? facilities
          : [];
    }

    if (status !== undefined) {
      theatre.status = status;
    }

    await theatre.save();

    res.status(200).json({
      success: true,
      message:
        "Theatre updated successfully.",
      theatre,
    });
  } catch (error) {
    console.error(
      "ADMIN UPDATE THEATRE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update theatre.",
    });
  }
};

// ========================================
// DELETE THEATRE
// ========================================

const deleteTheatre = async (req, res) => {
  try {
    const theatreId = req.params.id;

    console.log(
      "========================================"
    );

    console.log(
      "ADMIN DELETE THEATRE"
    );

    console.log(
      "Theatre ID:",
      theatreId
    );

    // ----------------------------------------
    // FIND THEATRE
    // ----------------------------------------

    const theatre =
      await Theatre.findById(
        theatreId
      );

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found.",
      });
    }

    // ----------------------------------------
    // FIND ALL SCREENS
    // ----------------------------------------

    const screens =
      await Screen.find({
        theatre: theatreId,
      }).select("_id");

    const screenIds =
      screens.map(
        (screen) => screen._id
      );

    console.log(
      "Screens found:",
      screenIds.length
    );

    // ----------------------------------------
    // FIND ALL SHOWS
    // ----------------------------------------

    const showConditions = [
      {
        theatre: theatreId,
      },
    ];

    if (screenIds.length > 0) {
      showConditions.push({
        screen: {
          $in: screenIds,
        },
      });
    }

    const shows =
      await Show.find({
        $or: showConditions,
      }).select("_id");

    const showIds =
      shows.map(
        (show) => show._id
      );

    console.log(
      "Shows found:",
      showIds.length
    );

    // ----------------------------------------
    // CHECK BOOKINGS
    // ----------------------------------------

    if (showIds.length > 0) {
      const booking =
        await Booking.findOne({
          show: {
            $in: showIds,
          },
        }).select("_id");

      if (booking) {
        return res.status(400).json({
          success: false,
          message:
            "This theatre cannot be deleted because it has existing bookings. Cancel or remove the related bookings first.",
        });
      }
    }

    // ----------------------------------------
    // DELETE SHOWS
    // ----------------------------------------

    if (showIds.length > 0) {
      const result =
        await Show.deleteMany({
          _id: {
            $in: showIds,
          },
        });

      console.log(
        "Shows deleted:",
        result.deletedCount
      );
    }

    // ----------------------------------------
    // DELETE SCREENS
    // ----------------------------------------

    if (screenIds.length > 0) {
      const result =
        await Screen.deleteMany({
          theatre: theatreId,
        });

      console.log(
        "Screens deleted:",
        result.deletedCount
      );
    }

    // ----------------------------------------
    // DELETE THEATRE
    // ----------------------------------------

    await Theatre.deleteOne({
      _id: theatreId,
    });

    console.log(
      "Theatre deleted:",
      theatre.name
    );

    console.log(
      "========================================"
    );

    res.status(200).json({
      success: true,
      message:
        "Theatre, its screens and unused shows were deleted successfully.",
    });
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "ADMIN DELETE THEATRE ERROR:"
    );

    console.error(error);

    console.error(
      "========================================"
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete theatre.",
    });
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  getAllTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};