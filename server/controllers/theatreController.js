const Theatre = require("../models/Theatre");

const getTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find({
      status: "active",
    }).sort({
      name: 1,
    });

    res.status(200).json({
      theatres,
    });
  } catch (error) {
    console.error("Get theatres error:", error);

    res.status(500).json({
      message: "Failed to fetch theatres",
    });
  }
};

module.exports = {
  getTheatres,
};