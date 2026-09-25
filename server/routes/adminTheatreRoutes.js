const express = require("express");

const {
  getAllTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} = require("../controllers/adminTheatreController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  adminOnly,
} = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  adminOnly,
  getAllTheatres
);

router.get(
  "/:id",
  protect,
  adminOnly,
  getTheatreById
);

router.post(
  "/",
  protect,
  adminOnly,
  createTheatre
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateTheatre
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteTheatre
);

module.exports = router;