package com.cinebook.cinebook.config;

import com.cinebook.cinebook.model.Movie;
import com.cinebook.cinebook.repository.MovieRepository;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class MovieReplacementRunner {

    @Bean
    CommandLineRunner updateMovies(
            MovieRepository movieRepository,
            MongoTemplate mongoTemplate
    ) {

        return args -> {

            System.out.println("======================================");
            System.out.println("CineBook movie replacement started...");
            System.out.println("======================================");

            // ==========================================
            // MOVIES
            // ==========================================

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd5f",
                    "Avengers: Endgame",
                    "Action,Sci-Fi,Adventure",
                    "English",
                    181,
                    "PG-13",
                    "Apr 26, 2019",
                    "https://www.youtube.com/watch?v=TcMBFSGVi1c",
                    "/posters/avengers-endgame.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd5b",
                    "Avengers: Infinity War",
                    "Action,Sci-Fi,Adventure",
                    "English",
                    149,
                    "PG-13",
                    "Apr 27, 2018",
                    "https://www.youtube.com/watch?v=6ZfuNTqbHE8",
                    "/posters/avengers-infinity-war.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd5a",
                    "Spider-Man: No Way Home",
                    "Action,Adventure,Sci-Fi",
                    "English",
                    148,
                    "PG-13",
                    "Dec 17, 2021",
                    "https://www.youtube.com/results?search_query=Spider-Man+No+Way+Home+official+trailer",
                    "/posters/spiderman-no-way-home.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd5e",
                    "The Batman",
                    "Action,Crime,Drama",
                    "English",
                    176,
                    "PG-13",
                    "Mar 4, 2022",
                    "https://www.youtube.com/results?search_query=The+Batman+official+trailer",
                    "/posters/the-batman.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd5d",
                    "The Dark Knight",
                    "Action,Crime,Drama",
                    "English",
                    152,
                    "PG-13",
                    "Jul 18, 2008",
                    "https://www.youtube.com/results?search_query=The+Dark+Knight+official+trailer",
                    "/posters/the-dark-knight.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd60",
                    "Interstellar",
                    "Adventure,Drama,Sci-Fi",
                    "English",
                    169,
                    "PG-13",
                    "Nov 7, 2014",
                    "https://www.youtube.com/results?search_query=Interstellar+official+trailer",
                    "/posters/interstellar.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd5c",
                    "Inception",
                    "Action,Sci-Fi,Thriller",
                    "English",
                    148,
                    "PG-13",
                    "Jul 16, 2010",
                    "https://www.youtube.com/results?search_query=Inception+official+trailer",
                    "/posters/inception.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd63",
                    "Avatar: The Way of Water",
                    "Action,Adventure,Fantasy",
                    "English",
                    192,
                    "PG-13",
                    "Dec 16, 2022",
                    "https://www.youtube.com/watch?v=d9MyW72ELq0",
                    "/posters/avatar-way-of-water.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd59",
                    "Jurassic World",
                    "Action,Adventure,Sci-Fi",
                    "English",
                    124,
                    "PG-13",
                    "Jun 12, 2015",
                    "https://www.youtube.com/results?search_query=Jurassic+World+official+trailer",
                    "/posters/jurassic-world.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd58",
                    "Top Gun: Maverick",
                    "Action,Drama",
                    "English",
                    131,
                    "PG-13",
                    "May 27, 2022",
                    "https://www.youtube.com/results?search_query=Top+Gun+Maverick+official+trailer",
                    "/posters/top-gun-maverick.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd61",
                    "Dune: Part Two",
                    "Action,Adventure,Drama",
                    "English",
                    166,
                    "PG-13",
                    "Mar 1, 2024",
                    "https://www.youtube.com/results?search_query=Dune+Part+Two+official+trailer",
                    "/posters/dune-part-two.png"
            );

            updateMovie(
                    movieRepository,
                    "6ab3f4e7fe8b884add3dcd62",
                    "Oppenheimer",
                    "Biography,Drama,History",
                    "English",
                    180,
                    "R",
                    "Jul 21, 2023",
                    "https://www.youtube.com/results?search_query=Oppenheimer+official+trailer",
                    "/posters/oppenheimer.png"
            );

            // ==========================================
            // ROLLING SHOW GENERATION
            // ==========================================

            System.out.println("======================================");
            System.out.println("Updating CineBook rolling shows...");
            System.out.println("======================================");

            createRollingShows(mongoTemplate);

            System.out.println("======================================");
            System.out.println("CineBook setup completed successfully.");
            System.out.println("======================================");
        };
    }

    // ==========================================
    // MOVIE UPDATE
    // ==========================================

    private void updateMovie(
            MovieRepository movieRepository,
            String id,
            String title,
            String genre,
            String language,
            Integer duration,
            String certificate,
            String releaseDate,
            String trailerUrl,
            String poster
    ) {

        movieRepository.findById(id).ifPresent(movie -> {

            movie.setTitle(title);
            movie.setGenre(genre);
            movie.setLanguage(language);
            movie.setDuration(duration);
            movie.setCertificate(certificate);
            movie.setReleaseDate(releaseDate);
            movie.setTrailerUrl(trailerUrl);
            movie.setPoster(poster);
            movie.setStatus("now_showing");

            movieRepository.save(movie);

            System.out.println("Updated: " + title);
        });
    }

    // ==========================================
    // ROLLING SHOW GENERATION
    // ==========================================

    private void createRollingShows(
            MongoTemplate mongoTemplate
    ) {

        // ==========================================
        // THEATRES + SCREENS
        // ==========================================

        String[][] theatres = {

                {
                        "6ab3f4e7fe8b884add3dcd65",
                        "6ab3f4e7fe8b884add3dcd6b"
                },

                {
                        "6ab3f4e7fe8b884add3dcd67",
                        "6ab3f4e7fe8b884add3dcd6f"
                },

                {
                        "6ab3f4e7fe8b884add3dcd66",
                        "6ab3f4e7fe8b884add3dcd6d"
                },

                {
                        "6ab3f4e7fe8b884add3dcd64",
                        "6ab3f4e7fe8b884add3dcd68"
                }
        };

        // ==========================================
        // 12 MOVIES
        // ==========================================

        List<String> movieIds = List.of(

                "6ab3f4e7fe8b884add3dcd5f",
                "6ab3f4e7fe8b884add3dcd5b",
                "6ab3f4e7fe8b884add3dcd5a",
                "6ab3f4e7fe8b884add3dcd5e",
                "6ab3f4e7fe8b884add3dcd5d",
                "6ab3f4e7fe8b884add3dcd60",
                "6ab3f4e7fe8b884add3dcd5c",
                "6ab3f4e7fe8b884add3dcd63",
                "6ab3f4e7fe8b884add3dcd59",
                "6ab3f4e7fe8b884add3dcd58",
                "6ab3f4e7fe8b884add3dcd61",
                "6ab3f4e7fe8b884add3dcd62"
        );

        // ==========================================
        // SHOW TIMES
        // ==========================================

        String[] times = {
                "10:00 AM",
                "1:00 PM",
                "4:00 PM",
                "7:00 PM",
                "10:00 PM"
        };

        // ==========================================
        // ROLLING DATE WINDOW
        // ==========================================

        LocalDate today = LocalDate.now();

        /*
         * SHOWS:
         *
         * Today       -> YES
         * Today + 1   -> YES
         * Today + 2   -> YES
         * Today + 3   -> YES
         *
         * Today + 4   -> EMPTY
         *
         * The next day the whole window moves forward
         * automatically.
         */

        LocalDate lastShowDate =
                today.plusDays(3);

        LocalDate nextEmptyDate =
                today.plusDays(4);

        System.out.println(
                "Today: " + today
        );

        System.out.println(
                "Show dates: "
                        + today
                        + " to "
                        + lastShowDate
        );

        System.out.println(
                "Next empty date: "
                        + nextEmptyDate
        );

        // ==========================================
        // DELETE ALL SHOWS OUTSIDE THE WINDOW
        //
        // ONE BULK DATABASE OPERATION
        // ==========================================

        Query deleteQuery =
                new Query(
                        new Criteria().orOperator(
                                Criteria.where("date")
                                        .lt(today.toString()),

                                Criteria.where("date")
                                        .gt(lastShowDate.toString())
                        )
                );

        long removedShows =
                mongoTemplate
                        .remove(
                                deleteQuery,
                                "shows"
                        )
                        .getDeletedCount();

        System.out.println(
                "Old/out-of-window shows removed: "
                        + removedShows
        );

        // ==========================================
        // LOAD REMAINING SHOWS
        // ==========================================

        List<Document> existingShows =
                mongoTemplate.find(
                        new Query(),
                        Document.class,
                        "shows"
                );

        System.out.println(
                "Valid shows currently in database: "
                        + existingShows.size()
        );

        // ==========================================
        // CREATE UNIQUE KEYS
        // ==========================================

        Set<String> existingKeys =
                new HashSet<>();

        for (Document show : existingShows) {

            Object movie =
                    show.get("movie");

            Object theatre =
                    show.get("theatre");

            Object date =
                    show.get("date");

            Object time =
                    show.get("time");

            if (
                    movie != null
                            && theatre != null
                            && date != null
                            && time != null
            ) {

                String key =
                        movie.toString()
                                + "|"
                                + theatre.toString()
                                + "|"
                                + date.toString()
                                + "|"
                                + time.toString();

                existingKeys.add(key);
            }
        }

        // ==========================================
        // PREPARE MISSING SHOWS
        // ==========================================

        List<Document> newShows =
                new ArrayList<>();

        for (String movieId : movieIds) {

            ObjectId movieObjectId =
                    new ObjectId(movieId);

            for (
                    LocalDate showDate = today;
                    !showDate.isAfter(lastShowDate);
                    showDate = showDate.plusDays(1)
            ) {

                String date =
                        showDate.toString();

                for (String[] theatre : theatres) {

                    String theatreId =
                            theatre[0];

                    String screenId =
                            theatre[1];

                    ObjectId theatreObjectId =
                            new ObjectId(theatreId);

                    ObjectId screenObjectId =
                            new ObjectId(screenId);

                    for (String time : times) {

                        String key =
                                movieId
                                        + "|"
                                        + theatreId
                                        + "|"
                                        + date
                                        + "|"
                                        + time;

                        // Don't create duplicates
                        if (existingKeys.contains(key)) {
                            continue;
                        }

                        // ==================================
                        // SEAT PRICES
                        // ==================================

                        Document seatPrices =
                                new Document()
                                        .append(
                                                "standard",
                                                230
                                        )
                                        .append(
                                                "premium",
                                                300
                                        )
                                        .append(
                                                "recliner",
                                                380
                                        );

                        // ==================================
                        // SHOW DOCUMENT
                        // ==================================

                        Document show =
                                new Document()
                                        .append(
                                                "movie",
                                                movieObjectId
                                        )
                                        .append(
                                                "theatre",
                                                theatreObjectId
                                        )
                                        .append(
                                                "screen",
                                                screenObjectId
                                        )
                                        .append(
                                                "date",
                                                date
                                        )
                                        .append(
                                                "time",
                                                time
                                        )
                                        .append(
                                                "seatPrices",
                                                seatPrices
                                        )
                                        .append(
                                                "status",
                                                "active"
                                        );

                        newShows.add(show);

                        existingKeys.add(key);
                    }
                }
            }
        }

        // ==========================================
        // INSERT ALL NEW SHOWS AT ONCE
        // ==========================================

        if (!newShows.isEmpty()) {

            System.out.println(
                    "Preparing to create "
                            + newShows.size()
                            + " new shows..."
            );

            mongoTemplate.insert(
                    newShows,
                    "shows"
            );

            System.out.println(
                    "New shows created: "
                            + newShows.size()
            );

        } else {

            System.out.println(
                    "No new shows needed."
            );
        }

        // ==========================================
        // FINAL STATUS
        // ==========================================

        System.out.println("--------------------------------------");

        System.out.println(
                "ROLLING SHOW WINDOW"
        );

        System.out.println(
                "Shows available: "
                        + today
                        + " -> "
                        + lastShowDate
        );

        System.out.println(
                "No shows: "
                        + nextEmptyDate
        );

        System.out.println(
                "Automatic next-day rollover: ENABLED"
        );

        System.out.println(
                "Show generation finished."
        );

        System.out.println("--------------------------------------");
    }
}