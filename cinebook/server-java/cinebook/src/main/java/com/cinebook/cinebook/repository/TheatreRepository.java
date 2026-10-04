package com.cinebook.cinebook.repository;

import com.cinebook.cinebook.model.Theatre;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TheatreRepository extends MongoRepository<Theatre, String> {
}