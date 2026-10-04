
package com.cinebook.cinebook.service;

import com.cinebook.cinebook.model.Movie;
import com.cinebook.cinebook.model.Screen;
import com.cinebook.cinebook.model.Show;
import com.cinebook.cinebook.repository.MovieRepository;
import com.cinebook.cinebook.repository.ScreenRepository;
import com.cinebook.cinebook.repository.ShowRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ShowService {

    private final ShowRepository showRepository;
    private final MovieRepository movieRepository;
    private final ScreenRepository screenRepository;

    public ShowService(
            ShowRepository showRepository,
            MovieRepository movieRepository,
            ScreenRepository screenRepository
    ) {
        this.showRepository = showRepository;
        this.movieRepository = movieRepository;
        this.screenRepository = screenRepository;
    }

    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    public Show getShowById(String id) {
        return showRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Show not found.")
                );
    }

    public Show createShow(
            String movieId,
            String screenId,
            String date,
            String time,
            Map<String, Object> ignoredSeatPrices,
            String status
    ) {
        validateShow(movieId, screenId, date, time);

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Selected movie not found.")
                );

        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Selected screen not found.")
                );

        Show show = new Show();

        show.setMovie(movie.getId());
        show.setScreen(screen.getId());
        show.setTheatre(screen.getTheatre());
        show.setDate(date);
        show.setTime(time);

        // Automatically calculate prices based on showtime.
        show.setSeatPrices(calculateSeatPrices(time));

        show.setStatus(
                status == null || status.isBlank()
                        ? "active"
                        : status.toLowerCase()
        );

        return showRepository.save(show);
    }

    public Show updateShow(
            String showId,
            String movieId,
            String screenId,
            String date,
            String time,
            Map<String, Object> ignoredSeatPrices,
            String status
    ) {
        validateShow(movieId, screenId, date, time);

        Show show = getShowById(showId);

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Selected movie not found.")
                );

        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Selected screen not found.")
                );

        show.setMovie(movie.getId());
        show.setScreen(screen.getId());
        show.setTheatre(screen.getTheatre());
        show.setDate(date);
        show.setTime(time);

        // Recalculate prices whenever a show is updated.
        show.setSeatPrices(calculateSeatPrices(time));

        show.setStatus(
                status == null || status.isBlank()
                        ? "active"
                        : status.toLowerCase()
        );

        return showRepository.save(show);
    }

    // Updates the prices of all existing shows.
    public int updateAllShowPricesByTime() {

        List<Show> shows = showRepository.findAll();

        for (Show show : shows) {
            show.setSeatPrices(calculateSeatPrices(show.getTime()));
        }

        showRepository.saveAll(shows);

        return shows.size();
    }

    private Map<String, Object> calculateSeatPrices(String time) {

        LocalTime showTime = parseShowTime(time);

        Map<String, Object> prices = new HashMap<>();

        if (showTime.isBefore(LocalTime.NOON)) {
            // Morning: Before 12 PM
            prices.put("standard", 160);
            prices.put("premium", 210);
            prices.put("recliner", 290);

        } else if (showTime.isBefore(LocalTime.of(16, 0))) {
            // Afternoon: 12 PM to before 4 PM
            prices.put("standard", 180);
            prices.put("premium", 230);
            prices.put("recliner", 310);

        } else if (showTime.isBefore(LocalTime.of(19, 0))) {
            // Evening: 4 PM to before 7 PM
            prices.put("standard", 200);
            prices.put("premium", 250);
            prices.put("recliner", 330);

        } else {
            // Night: 7 PM onwards
            prices.put("standard", 220);
            prices.put("premium", 270);
            prices.put("recliner", 350);
        }

        return prices;
    }

    private LocalTime parseShowTime(String time) {

        if (time == null || time.isBlank()) {
            throw new IllegalArgumentException("Show time is required.");
        }

        String normalized = time.trim()
                .toUpperCase(Locale.ENGLISH)
                .replaceAll("\\s+", " ");

        List<DateTimeFormatter> formats = List.of(
                DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("h a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("H:mm", Locale.ENGLISH)
        );

        for (DateTimeFormatter format : formats) {
            try {
                return LocalTime.parse(normalized, format);
            } catch (DateTimeParseException ignored) {
                // Try the next supported time format.
            }
        }

        throw new IllegalArgumentException(
                "Invalid showtime: " + time
                        + ". Use a format such as 10:00 AM or 19:00."
        );
    }

    public void deleteShow(String showId) {
        Show show = getShowById(showId);
        showRepository.delete(show);
    }

    private void validateShow(
            String movieId,
            String screenId,
            String date,
            String time
    ) {
        if (movieId == null || movieId.isBlank()) {
            throw new IllegalArgumentException("Movie is required.");
        }

        if (screenId == null || screenId.isBlank()) {
            throw new IllegalArgumentException("Screen is required.");
        }

        if (date == null || date.isBlank()) {
            throw new IllegalArgumentException("Show date is required.");
        }

        if (time == null || time.isBlank()) {
            throw new IllegalArgumentException("Show time is required.");
        }
    }
}