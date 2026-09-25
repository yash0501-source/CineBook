const express = require("express");

const {
  getTheatres,
} = require("../controllers/theatreController");

const router = express.Router();

router.get("/", getTheatres);

module.exports = router;