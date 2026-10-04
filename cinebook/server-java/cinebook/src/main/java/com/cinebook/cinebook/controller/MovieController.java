
package com.cinebook.cinebook.controller;

import com.cinebook.cinebook.model.Movie;
import com.cinebook.cinebook.service.MovieService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    // GET ALL MOVIES
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    // GET MOVIE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(
            @PathVariable("id") String id) {

        Optional<Movie> movie = movieService.getMovieById(id);

        if (movie.isPresent()) {
            return ResponseEntity.ok(movie.get());
        }

        return ResponseEntity.notFound().build();
    }

    // ADD MOVIE
    @PostMapping
    public ResponseEntity<?> createMovie(
            @RequestBody Movie movie) {

        try {
            Movie savedMovie = movieService.createMovie(movie);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedMovie);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // UPDATE MOVIE
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(
            @PathVariable("id") String id,
            @RequestBody Movie movie) {

        try {
            Optional<Movie> updatedMovie =
                    movieService.updateMovie(id, movie);

            if (updatedMovie.isPresent()) {
                return ResponseEntity.ok(updatedMovie.get());
            }

            return ResponseEntity.notFound().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE MOVIE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMovie(
            @PathVariable("id") String id) {

        boolean deleted = movieService.deleteMovie(id);

        if (!deleted) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Movie not found."));
        }

        return ResponseEntity.ok(
                Map.of("message", "Movie deleted successfully.")
        );
    }
}