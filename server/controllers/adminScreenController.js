const Screen = require("../models/Screen");
const Theatre = require("../models/Theatre");
const Show = require("../models/Show");

// ========================================
// GET ALL SCREENS
// ========================================

const getAllScreens = async (req, res) => {
  try {
    const screens = await Screen.find()
      .populate("theatre", "name city address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      screens,
    });
  } catch (error) {
    console.error(
      "ADMIN GET SCREENS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch screens.",
    });
  }
};

// ========================================
// GET SINGLE SCREEN
// ========================================

const getScreenById = async (req, res) => {
  try {
    const screen = await Screen.findById(
      req.params.id
    ).populate(
      "theatre",
      "name city address"
    );

    if (!screen) {
      return res.status(404).json({
        success: false,
        message: "Screen not found.",
      });
    }

    res.status(200).json({
      success: true,
      screen,
    });
  } catch (error) {
    console.error(
      "ADMIN GET SCREEN ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch screen.",
    });
  }
};

// ========================================
// CREATE SCREEN
// ========================================

const createScreen = async (req, res) => {
  try {
    const {
      name,
      theatre,
      screenType,
      totalSeats,
      rows,
      seatsPerRow,
      status,
    } = req.body;

    // REQUIRED FIELDS
    if (
      !name ||
      !theatre ||
      !screenType ||
      !totalSeats
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, theatre, screen type and total seats are required.",
      });
    }

    // CHECK THEATRE
    const theatreExists =
      await Theatre.findById(theatre);

    if (!theatreExists) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found.",
      });
    }

    // CHECK DUPLICATE SCREEN
    const existingScreen =
      await Screen.findOne({
        name: name.trim(),
        theatre,
      });

    if (existingScreen) {
      return res.status(400).json({
        success: false,
        message:
          "A screen with this name already exists in this theatre.",
      });
    }

    // CREATE SCREEN
    const screen = await Screen.create({
      name: name.trim(),
      theatre,
      screenType,
      totalSeats: Number(totalSeats),
      rows: Number(rows) || 0,
      seatsPerRow:
        Number(seatsPerRow) || 0,
      status: status || "active",
    });

    const populatedScreen =
      await Screen.findById(screen._id).populate(
        "theatre",
        "name city address"
      );

    res.status(201).json({
      success: true,
      message: "Screen created successfully.",
      screen: populatedScreen,
    });
  } catch (error) {
    console.error(
      "ADMIN CREATE SCREEN ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create screen.",
    });
  }
};

// ========================================
// UPDATE SCREEN
// ========================================

const updateScreen = async (req, res) => {
  try {
    const {
      name,
      theatre,
      screenType,
      totalSeats,
      rows,
      seatsPerRow,
      status,
    } = req.body;

    const screen = await Screen.findById(
      req.params.id
    );

    if (!screen) {
      return res.status(404).json({
        success: false,
        message: "Screen not found.",
      });
    }

    // CHECK THEATRE IF CHANGED
    if (theatre) {
      const theatreExists =
        await Theatre.findById(theatre);

      if (!theatreExists) {
        return res.status(404).json({
          success: false,
          message: "Theatre not found.",
        });
      }

      screen.theatre = theatre;
    }

    // CHECK DUPLICATE NAME
    if (name && name.trim() !== screen.name) {
      const duplicate =
        await Screen.findOne({
          name: name.trim(),
          theatre: theatre || screen.theatre,
          _id: {
            $ne: screen._id,
          },
        });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message:
            "A screen with this name already exists in this theatre.",
        });
      }

      screen.name = name.trim();
    }

    if (screenType) {
      screen.screenType = screenType;
    }

    if (
      totalSeats !== undefined &&
      totalSeats !== ""
    ) {
      screen.totalSeats = Number(totalSeats);
    }

    if (
      rows !== undefined &&
      rows !== ""
    ) {
      screen.rows = Number(rows);
    }

    if (
      seatsPerRow !== undefined &&
      seatsPerRow !== ""
    ) {
      screen.seatsPerRow =
        Number(seatsPerRow);
    }

    if (status) {
      screen.status = status;
    }

    await screen.save();

    const populatedScreen =
      await Screen.findById(screen._id).populate(
        "theatre",
        "name city address"
      );

    res.status(200).json({
      success: true,
      message: "Screen updated successfully.",
      screen: populatedScreen,
    });
  } catch (error) {
    console.error(
      "ADMIN UPDATE SCREEN ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update screen.",
    });
  }
};

// ========================================
// DELETE SCREEN
// ========================================

const deleteScreen = async (req, res) => {
  try {
    const screen = await Screen.findById(
      req.params.id
    );

    if (!screen) {
      return res.status(404).json({
        success: false,
        message: "Screen not found.",
      });
    }

    // CHECK SHOWS
    const showCount =
      await Show.countDocuments({
        screen: screen._id,
      });

    if (showCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this screen because shows are attached to it.",
      });
    }

    await screen.deleteOne();

    res.status(200).json({
      success: true,
      message: "Screen deleted successfully.",
    });
  } catch (error) {
    console.error(
      "ADMIN DELETE SCREEN ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete screen.",
    });
  }
};

module.exports = {
  getAllScreens,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen,
};