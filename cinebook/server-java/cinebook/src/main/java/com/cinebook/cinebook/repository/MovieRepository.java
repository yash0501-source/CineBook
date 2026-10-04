package com.cinebook.cinebook.repository;

import com.cinebook.cinebook.model.Movie;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MovieRepository extends MongoRepository<Movie, String> {
}