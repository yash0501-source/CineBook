const mongoose = require("mongoose");
require("dotenv").config();

const Show = require("./models/Show");

const MONGO_URI = process.env.MONGO_URI;

const timeSlots = [
  "10:00 AM",
  "01:00 PM",
  "04:00 PM",
  "07:00 PM",
  "10:00 PM",
];

const addShowtimes = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully.");

    const shows = await Show.find({
      status: "active",
    });

    if (shows.length === 0) {
      console.log("No active shows found.");
      process.exit(0);
    }

    let created = 0;

    for (const show of shows) {
      for (const time of timeSlots) {
        const existingShow = await Show.findOne({
          movie: show.movie,
          theatre: show.theatre,
          screen: show.screen,
          date: show.date,
          time: time,
        });

        if (existingShow) {
          continue;
        }

        await Show.create({
          movie: show.movie,
          theatre: show.theatre,
          screen: show.screen,
          date: show.date,
          time: time,
          seatPrices: {
            standard: 180,
            premium: 250,
            recliner: 350,
          },
          status: "active",
        });

        created++;

        console.log(
          `Added ${time} for movie ${show.movie} on ${show.date}`
        );
      }
    }

    console.log("");
    console.log("================================");
    console.log("SHOWTIME UPDATE COMPLETE");
    console.log("================================");
    console.log(`New showtimes created: ${created}`);
    console.log("");
    console.log("Available time slots:");
    timeSlots.forEach((time) => {
      console.log(`- ${time}`);
    });

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("ERROR:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

addShowtimes();