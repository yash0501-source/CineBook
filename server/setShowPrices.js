const mongoose = require("mongoose");
require("dotenv").config();

const Show = require("./models/Show");

const pricesByTime = {
  "10:00 AM": {
    standard: 150,
    premium: 200,
    recliner: 280,
  },

  "10:30 AM": {
    standard: 160,
    premium: 210,
    recliner: 290,
  },

  "01:00 PM": {
    standard: 180,
    premium: 240,
    recliner: 320,
  },

  "02:00 PM": {
    standard: 190,
    premium: 250,
    recliner: 330,
  },

  "04:00 PM": {
    standard: 210,
    premium: 270,
    recliner: 350,
  },

  "07:00 PM": {
    standard: 230,
    premium: 300,
    recliner: 380,
  },

  "07:30 PM": {
    standard: 240,
    premium: 310,
    recliner: 390,
  },

  "10:00 PM": {
    standard: 260,
    premium: 330,
    recliner: 420,
  },
};

async function setShowPrices() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected successfully."
    );

    let updated = 0;

    for (const [time, seatPrices] of Object.entries(
      pricesByTime
    )) {
      const result = await Show.updateMany(
        {
          time,
          status: "active",
        },
        {
          $set: {
            seatPrices,
          },
        }
      );

      updated += result.modifiedCount;

      console.log(
        `${time} → Standard ₹${seatPrices.standard}, Premium ₹${seatPrices.premium}, Recliner ₹${seatPrices.recliner}`
      );
    }

    console.log("");
    console.log(
      "================================"
    );
    console.log("SHOW PRICES UPDATED");
    console.log(
      "================================"
    );
    console.log(
      `Updated shows: ${updated}`
    );

    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "ERROR:",
      error
    );

    await mongoose.disconnect();

    process.exit(1);
  }
}

setShowPrices();