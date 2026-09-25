const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    genre: {
      type: [String],
      default: [],
    },

    language: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    certificate: {
      type: String,
      default: "U/A",
    },

    releaseDate: {
      type: Date,
      required: true,
    },

    poster: {
      type: String,
      default: "",
    },

    backdrop: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["now_showing", "upcoming"],
      default: "now_showing",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movie", movieSchema);