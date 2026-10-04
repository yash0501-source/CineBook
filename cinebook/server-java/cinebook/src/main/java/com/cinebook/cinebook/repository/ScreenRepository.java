package com.cinebook.cinebook.repository;

import com.cinebook.cinebook.model.Screen;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ScreenRepository extends MongoRepository<Screen, String> {

    List<Screen> findByTheatre(String theatre);

}