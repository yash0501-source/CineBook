const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },

    screenType: {
      type: String,
      enum: [
        "Standard",
        "IMAX",
        "4DX",
        "Dolby Atmos",
        "Premium",
      ],
      default: "Standard",
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    rows: {
      type: Number,
      required: true,
      min: 1,
    },

    seatsPerRow: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Screen",
  screenSchema
);