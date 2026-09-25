const express = require("express");

const router = express.Router();

const {
  getAllMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/adminMovieController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// ==========================================
// GET ALL MOVIES
// GET /api/admin/movies
// ==========================================

router.get(
  "/",
  protect,
  adminOnly,
  getAllMovies
);

// ==========================================
// CREATE MOVIE
// POST /api/admin/movies
// ==========================================

router.post(
  "/",
  protect,
  adminOnly,
  createMovie
);

// ==========================================
// UPDATE MOVIE
// PUT /api/admin/movies/:id
// ==========================================

router.put(
  "/:id",
  protect,
  adminOnly,
  updateMovie
);

// ==========================================
// DELETE MOVIE
// DELETE /api/admin/movies/:id
// ==========================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteMovie
);

module.exports = router;