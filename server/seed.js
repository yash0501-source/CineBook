const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("./models/Movie");
const Theatre = require("./models/Theatre");
const Screen = require("./models/Screen");
const Show = require("./models/Show");

const movies = [
  {
    title: "Midnight Horizon",
    description:
      "A mysterious journey unfolds beneath a city that never sleeps.",
    genre: ["Thriller", "Drama"],
    language: "English",
    duration: 128,
    certificate: "U/A",
    releaseDate: "2026-09-01",
    poster: "",
    backdrop: "",
    status: "now_showing",
  },
  {
    title: "The Last Journey",
    description:
      "An emotional adventure about courage, friendship and one final mission.",
    genre: ["Adventure", "Drama"],
    language: "English",
    duration: 142,
    certificate: "U/A",
    releaseDate: "2026-09-05",
    poster: "",
    backdrop: "",
    status: "now_showing",
  },
  {
    title: "Neon City",
    description:
      "A futuristic city hides a secret that could change everything.",
    genre: ["Sci-Fi", "Action"],
    language: "English",
    duration: 135,
    certificate: "U/A",
    releaseDate: "2026-09-08",
    poster: "",
    backdrop: "",
    status: "now_showing",
  },
  {
    title: "Beyond The Stars",
    description:
      "A team of explorers travels beyond known space.",
    genre: ["Sci-Fi", "Adventure"],
    language: "English",
    duration: 150,
    certificate: "U/A",
    releaseDate: "2026-09-10",
    poster: "",
    backdrop: "",
    status: "now_showing",
  },
  {
    title: "Shadow Protocol",
    description:
      "A secret agent races against time to uncover a hidden conspiracy.",
    genre: ["Action", "Thriller"],
    language: "English",
    duration: 118,
    certificate: "U/A",
    releaseDate: "2026-09-12",
    poster: "",
    backdrop: "",
    status: "now_showing",
  },
  {
    title: "Ocean of Dreams",
    description:
      "A beautiful story about dreams, family and the sea.",
    genre: ["Drama", "Romance"],
    language: "English",
    duration: 124,
    certificate: "U",
    releaseDate: "2026-09-14",
    poster: "",
    backdrop: "",
    status: "now_showing",
  },
  {
    title: "The Final Mission",
    description:
      "A highly trained team takes on its most dangerous mission.",
    genre: ["Action", "Adventure"],
    language: "English",
    duration: 137,
    certificate: "U/A",
    releaseDate: "2026-09-16",
    poster: "",
    backdrop: "",
    status: "now_showing",
  },
  {
    title: "Love in Mumbai",
    description:
      "Two strangers discover an unexpected connection in Mumbai.",
    genre: ["Romance", "Drama"],
    language: "Hindi",
    duration: 130,
    certificate: "U/A",
    releaseDate: "2026-09-18",
    poster: "",
    backdrop: "",
    status: "now_showing",
  },
  {
    title: "Kingdom of Fire",
    description:
      "An ancient kingdom faces a battle for its future.",
    genre: ["Fantasy", "Action"],
    language: "English",
    duration: 146,
    certificate: "U/A",
    releaseDate: "2026-09-20",
    poster: "",
    backdrop: "",
    status: "now_showing",
  },
  {
    title: "Silent Witness",
    description:
      "A mysterious witness holds the key to solving a difficult case.",
    genre: ["Mystery", "Thriller"],
    language: "English",
    duration: 116,
    certificate: "U/A",
    releaseDate: "2026-09-22",
    poster: "",
    backdrop: "",
    status: "now_showing",
  },
  {
    title: "Galaxy Beyond",
    description:
      "Humanity discovers a distant world with an extraordinary secret.",
    genre: ["Sci-Fi", "Adventure"],
    language: "English",
    duration: 155,
    certificate: "U/A",
    releaseDate: "2026-10-05",
    poster: "",
    backdrop: "",
    status: "upcoming",
  },
  {
    title: "The Hidden Truth",
    description:
      "A journalist uncovers a mystery that powerful people want hidden.",
    genre: ["Mystery", "Drama"],
    language: "English",
    duration: 121,
    certificate: "U/A",
    releaseDate: "2026-10-12",
    poster: "",
    backdrop: "",
    status: "upcoming",
  },
];

const theatres = [
  {
    name: "CineBook IMAX Andheri",
    city: "Mumbai",
    address: "Andheri West, Mumbai",
    facilities: ["IMAX", "Dolby Atmos", "Parking", "Food Court"],
    status: "active",
  },
  {
    name: "CineBook PVR Lower Parel",
    city: "Mumbai",
    address: "Lower Parel, Mumbai",
    facilities: ["IMAX", "Recliner", "Parking", "Food Court"],
    status: "active",
  },
  {
    name: "CineBook Cinemas Bandra",
    city: "Mumbai",
    address: "Bandra West, Mumbai",
    facilities: ["4DX", "Dolby Atmos", "Parking", "Cafe"],
    status: "active",
  },
  {
    name: "CineBook Multiplex Powai",
    city: "Mumbai",
    address: "Powai, Mumbai",
    facilities: ["Premium", "Dolby Atmos", "Parking", "Food Court"],
    status: "active",
  },
];

const dates = [
  "2026-09-25",
  "2026-09-26",
  "2026-09-27",
  "2026-09-28",
  "2026-09-29",
];

const showTimes = [
  {
    time: "10:30 AM",
    seatPrices: {
      standard: 180,
      premium: 250,
      recliner: 350,
    },
  },
  {
    time: "2:00 PM",
    seatPrices: {
      standard: 200,
      premium: 280,
      recliner: 380,
    },
  },
  {
    time: "7:30 PM",
    seatPrices: {
      standard: 220,
      premium: 300,
      recliner: 400,
    },
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Remove old show-related data
    await Show.deleteMany({});
    await Screen.deleteMany({});
    await Theatre.deleteMany({});
    await Movie.deleteMany({});

    console.log("Old movies, theatres, screens and shows removed");

    // Create movies
    const createdMovies = await Movie.insertMany(movies);

    console.log(
      `${createdMovies.length} movies created`
    );

    // Create theatres
    const createdTheatres =
      await Theatre.insertMany(theatres);

    console.log(
      `${createdTheatres.length} theatres created`
    );

    // Create screens
    const screenData = [];

    createdTheatres.forEach((theatre, theatreIndex) => {
      screenData.push(
        {
          theatre: theatre._id,
          name: "Screen 1",
          totalSeats: 56,
          rows: ["A", "B", "C", "D", "E", "F", "G"],
          seatsPerRow: 8,
          screenType:
            theatreIndex === 0
              ? "imax"
              : theatreIndex === 2
              ? "4dx"
              : "premium",
        },
        {
          theatre: theatre._id,
          name: "Screen 2",
          totalSeats: 56,
          rows: ["A", "B", "C", "D", "E", "F", "G"],
          seatsPerRow: 8,
          screenType: "standard",
        }
      );
    });

    const createdScreens =
      await Screen.insertMany(screenData);

    console.log(
      `${createdScreens.length} screens created`
    );

    // Create shows
    const showData = [];

    const nowShowingMovies =
      createdMovies.filter(
        (movie) => movie.status === "now_showing"
      );

    nowShowingMovies.forEach((movie, movieIndex) => {
      dates.forEach((date, dateIndex) => {
        createdTheatres.forEach(
          (theatre, theatreIndex) => {
            const screen =
              createdScreens.find(
                (item) =>
                  item.theatre.toString() ===
                  theatre._id.toString() &&
                  item.name ===
                    `Screen ${
                      (movieIndex +
                        dateIndex +
                        theatreIndex) %
                        2 +
                      1
                    }`
              );

            showTimes.forEach(
              (showTime, timeIndex) => {
                showData.push({
                  movie: movie._id,
                  theatre: theatre._id,
                  screen: screen._id,
                  date,
                  time: showTime.time,
                  seatPrices: {
                    standard:
                      showTime.seatPrices.standard +
                      theatreIndex * 10,
                    premium:
                      showTime.seatPrices.premium +
                      theatreIndex * 15,
                    recliner:
                      showTime.seatPrices.recliner +
                      theatreIndex * 20,
                  },
                  status: "active",
                });
              }
            );
          }
        );
      });
    });

    const createdShows =
      await Show.insertMany(showData);

    console.log(
      `${createdShows.length} shows created`
    );

    console.log("");
    console.log("================================");
    console.log("CINEBOOK DATABASE SEEDED");
    console.log("================================");
    console.log(`Movies: ${createdMovies.length}`);
    console.log(`Theatres: ${createdTheatres.length}`);
    console.log(`Screens: ${createdScreens.length}`);
    console.log(`Shows: ${createdShows.length}`);
    console.log("Dates: 25 Sep - 29 Sep");
    console.log("================================");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("SEED ERROR:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedDatabase();