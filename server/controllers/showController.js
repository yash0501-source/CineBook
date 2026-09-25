const Show = require("../models/Show");
require("../models/Screen");
require("../models/Movie");
require("../models/Theatre");

const getShows = async (req, res) => {
  try {
    const { movieId, theatreId, date } = req.query;

    const filter = {
      status: "active",
    };

    if (movieId) {
      filter.movie = movieId;
    }

    if (theatreId) {
      filter.theatre = theatreId;
    }

    if (date) {
      filter.date = date;
    }

    console.log("Show filter:", filter);

    const shows = await Show.find(filter)
      .populate("movie", "title")
      .populate("theatre", "name city address")
      .populate("screen", "name screenType");

    console.log("Shows found:", shows.length);

    res.status(200).json({
      shows,
    });
  } catch (error) {
    console.error("SHOW API ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch shows",
      error: error.message,
    });
  }
};

const getShowById = async (req, res) => {
  try {
    const show = await Show.findOne({
      _id: req.params.id,
      status: "active",
    })
      .populate("movie", "title")
      .populate("theatre", "name city address")
      .populate("screen", "name screenType");

    if (!show) {
      return res.status(404).json({
        message: "Show not found",
      });
    }

    res.status(200).json({
      show,
    });
  } catch (error) {
    console.error("GET SHOW ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch show",
      error: error.message,
    });
  }
};

module.exports = {
  getShows,
  getShowById,
};