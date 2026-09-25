const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("../models/Movie");

const {
  generatePoster,
} = require("../utils/posterGenerator");

const run = async () => {
  try {
    console.log("========================================");
    console.log("   CINEBOOK POSTER REGENERATION");
    console.log("========================================");

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected successfully"
    );

    const movies = await Movie.find({});

    console.log(
      `Found ${movies.length} movies.`
    );

    for (const movie of movies) {
      const posterUrl = generatePoster({
        title: movie.title,
        genre: movie.genre,
        language: movie.language,
        certificate: movie.certificate,
        movieId: movie._id.toString(),
      });

      movie.poster = posterUrl;

      await movie.save();

      console.log(
        `New poster generated: ${movie.title}`
      );
    }

    console.log("========================================");
    console.log(
      "All movie posters regenerated successfully."
    );
    console.log("========================================");
  } catch (error) {
    console.error(
      "POSTER REGENERATION ERROR:"
    );

    console.error(error);
  } finally {
    await mongoose.disconnect();

    console.log(
      "MongoDB connection closed."
    );
  }
};

run();