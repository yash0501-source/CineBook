const Movie = require("../models/Movie");

const {
  generatePoster,
  deletePoster,
} = require("../utils/posterGenerator");

// ==========================================
// GET ALL MOVIES
// GET /api/admin/movies
// ==========================================

const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error(
      "ADMIN GET MOVIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch movies.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// CREATE MOVIE
// POST /api/admin/movies
// ==========================================

const createMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      duration,
      certificate,
      releaseDate,
      status,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !language ||
      !duration ||
      !releaseDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, language, duration and release date are required.",
      });
    }

    // Create movie first
    const movie = await Movie.create({
      title,
      description,
      genre: Array.isArray(genre)
        ? genre
        : [],
      language,
      duration,
      certificate:
        certificate || "U/A",
      releaseDate,
      status:
        status || "now_showing",
    });

    // Generate automatic poster
    const posterUrl = generatePoster({
      title: movie.title,
      genre: movie.genre,
      language: movie.language,
      certificate: movie.certificate,
      movieId: movie._id.toString(),
    });

    // Save poster URL
    movie.poster = posterUrl;

    await movie.save();

    return res.status(201).json({
      success: true,
      message:
        "Movie created successfully with automatic poster.",
      movie,
    });
  } catch (error) {
    console.error(
      "ADMIN CREATE MOVIE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create movie.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// UPDATE MOVIE
// PUT /api/admin/movies/:id
// ==========================================

const updateMovie = async (req, res) => {
  try {
    const movie =
      await Movie.findById(
        req.params.id
      );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    const {
      title,
      description,
      genre,
      language,
      duration,
      certificate,
      releaseDate,
      status,
    } = req.body;

    // Update only supplied fields
    if (title !== undefined) {
      movie.title = title;
    }

    if (description !== undefined) {
      movie.description =
        description;
    }

    if (genre !== undefined) {
      movie.genre = Array.isArray(genre)
        ? genre
        : [];
    }

    if (language !== undefined) {
      movie.language = language;
    }

    if (duration !== undefined) {
      movie.duration = duration;
    }

    if (certificate !== undefined) {
      movie.certificate =
        certificate;
    }

    if (releaseDate !== undefined) {
      movie.releaseDate =
        releaseDate;
    }

    if (status !== undefined) {
      movie.status = status;
    }

    await movie.save();

    return res.status(200).json({
      success: true,
      message:
        "Movie updated successfully.",
      movie,
    });
  } catch (error) {
    console.error(
      "ADMIN UPDATE MOVIE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update movie.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// DELETE MOVIE
// DELETE /api/admin/movies/:id
// ==========================================

const deleteMovie = async (req, res) => {
  try {
    const movie =
      await Movie.findById(
        req.params.id
      );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    // Delete generated poster
    deletePoster(movie.poster);

    // Delete movie
    await movie.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Movie and its poster deleted successfully.",
    });
  } catch (error) {
    console.error(
      "ADMIN DELETE MOVIE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete movie.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getAllMovies,
  createMovie,
  updateMovie,
  deleteMovie,
};