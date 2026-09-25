const mongoose = require("mongoose");
require("dotenv").config();

const Show = require("./models/Show");

async function checkShowPrices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.\n");

    const shows = await Show.find({
      status: "active",
    })
      .populate("movie", "title")
      .populate("theatre", "name")
      .sort({ time: 1 });

    if (shows.length === 0) {
      console.log("No active shows found.");
      await mongoose.disconnect();
      return;
    }

    console.log("========================================");
    console.log("CURRENT SHOW PRICES");
    console.log("========================================");

    shows.forEach((show) => {
      console.log("");
      console.log("Movie:", show.movie?.title);
      console.log("Theatre:", show.theatre?.name);
      console.log("Date:", show.date);
      console.log("Time:", show.time);

      console.log(
        "Standard:",
        show.seatPrices?.standard
      );

      console.log(
        "Premium:",
        show.seatPrices?.premium
      );

      console.log(
        "Recliner:",
        show.seatPrices?.recliner
      );

      console.log("----------------------------------------");
    });

    await mongoose.disconnect();

    console.log("\nMongoDB disconnected.");
  } catch (error) {
    console.error("ERROR:", error);

    await mongoose.disconnect();
  }
}

checkShowPrices();