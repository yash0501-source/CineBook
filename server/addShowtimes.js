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

const SHOW_DAYS = 5;

const getIndiaDate = (daysFromToday = 0) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const todayString = formatter.format(new Date());

  const [year, month, day] = todayString
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day + daysFromToday
    )
  );

  return date.toISOString().split("T")[0];
};

const addShowtimes = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully.");
    console.log("");

    const existingShows = await Show.find({
      status: "active",
    }).lean();

    if (existingShows.length === 0) {
      console.log("No active shows found.");
      await mongoose.disconnect();
      return;
    }

    const templates = [];
    const templateKeys = new Set();

    for (const show of existingShows) {
      const key =
        `${show.movie}_${show.theatre}_${show.screen}`;

      if (!templateKeys.has(key)) {
        templateKeys.add(key);
        templates.push(show);
      }
    }

    console.log(
      `Found ${templates.length} movie/theatre/screen combinations.`
    );

    console.log("");

    let created = 0;

    // Create shows for 5 days only
    for (let day = 0; day < SHOW_DAYS; day++) {

      const date = getIndiaDate(day);

      console.log(`Checking ${date}...`);

      for (const template of templates) {

        for (const time of timeSlots) {

          const existingShow = await Show.findOne({
            movie: template.movie,
            theatre: template.theatre,
            screen: template.screen,
            date: date,
            time: time,
          });

          if (existingShow) {
            continue;
          }

          await Show.create({
            movie: template.movie,
            theatre: template.theatre,
            screen: template.screen,
            date: date,
            time: time,

            seatPrices: {
              standard:
                template.seatPrices?.standard || 180,

              premium:
                template.seatPrices?.premium || 250,

              recliner:
                template.seatPrices?.recliner || 350,
            },

            status: "active",
          });

          created++;
        }
      }

      console.log(`  ${date} → shows ready`);
    }

    // Sixth day intentionally has no shows
    const emptyDate = getIndiaDate(SHOW_DAYS);

    console.log("");
    console.log("========================================");
    console.log("SHOWTIME UPDATE COMPLETE");
    console.log("========================================");

    console.log(`New shows created: ${created}`);

    console.log("");
    console.log("Available dates:");

    for (let day = 0; day < SHOW_DAYS; day++) {
      console.log(
        `${getIndiaDate(day)} → SHOWS AVAILABLE`
      );
    }

    console.log(
      `${emptyDate} → NO SHOWS`
    );

    console.log("");
    console.log("The script has finished.");
    console.log("========================================");

    await mongoose.disconnect();

  } catch (error) {

    console.error("ERROR:", error);

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error(disconnectError);
    }
  }
};

addShowtimes();