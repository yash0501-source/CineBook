const Movie = require("../models/Movie");

const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({
      releaseDate: 1,
    });

    res.status(200).json({
      movies,
    });
  } catch (error) {
    console.error("Get movies error:", error);

    res.status(500).json({
      message: "Failed to fetch movies",
    });
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.status(200).json({
      movie,
    });
  } catch (error) {
    console.error("Get movie error:", error);

    res.status(500).json({
      message: "Failed to fetch movie",
    });
  }
};

module.exports = {
  getMovies,
  getMovieById,
};