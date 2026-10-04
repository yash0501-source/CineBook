
package com.cinebook.cinebook.service;

import com.cinebook.cinebook.model.Movie;
import com.cinebook.cinebook.repository.MovieRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    // GET ALL MOVIES
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // GET MOVIE BY ID
    public Optional<Movie> getMovieById(String id) {
        return movieRepository.findById(id);
    }

    // ADD MOVIE
    public Movie createMovie(Movie movie) {
        validateMovie(movie);
        movie.setId(null);
        return movieRepository.save(movie);
    }

    // UPDATE MOVIE
    public Optional<Movie> updateMovie(String id, Movie updatedMovie) {
        validateMovie(updatedMovie);

        return movieRepository.findById(id).map(existingMovie -> {
            existingMovie.setTitle(updatedMovie.getTitle());
            existingMovie.setDescription(updatedMovie.getDescription());
            existingMovie.setGenre(updatedMovie.getGenre());
            existingMovie.setLanguage(updatedMovie.getLanguage());
            existingMovie.setDuration(updatedMovie.getDuration());
            existingMovie.setCertificate(updatedMovie.getCertificate());
            existingMovie.setReleaseDate(updatedMovie.getReleaseDate());
            existingMovie.setPoster(updatedMovie.getPoster());
            existingMovie.setTrailerUrl(updatedMovie.getTrailerUrl());
            existingMovie.setStatus(updatedMovie.getStatus());

            return movieRepository.save(existingMovie);
        });
    }

    // DELETE MOVIE
    public boolean deleteMovie(String id) {
        if (!movieRepository.existsById(id)) {
            return false;
        }

        movieRepository.deleteById(id);
        return true;
    }

    // VALIDATE MOVIE
    private void validateMovie(Movie movie) {
        if (movie == null) {
            throw new IllegalArgumentException(
                    "Movie details are required."
            );
        }

        if (movie.getTitle() == null ||
                movie.getTitle().isBlank()) {
            throw new IllegalArgumentException(
                    "Movie title is required."
            );
        }

        if (movie.getStatus() == null ||
                !List.of("now_showing", "upcoming")
                        .contains(movie.getStatus().trim().toLowerCase())) {
            throw new IllegalArgumentException(
                    "Status must be now_showing or upcoming."
            );
        }

        movie.setStatus(
                movie.getStatus().trim().toLowerCase()
        );
    }
}