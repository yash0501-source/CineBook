const express = require("express");

const {
  getShows,
  getShowById,
} = require("../controllers/showController");

const router = express.Router();

router.get("/", getShows);

router.get("/:id", getShowById);

module.exports = router;