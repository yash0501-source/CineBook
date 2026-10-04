
package com.cinebook.cinebook.repository;

import com.cinebook.cinebook.model.Show;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ShowRepository extends MongoRepository<Show, String> {

    List<Show> findByMovie(String movie);

    List<Show> findByTheatre(String theatre);

    List<Show> findByScreen(String screen);

    List<Show> findByStatus(String status);

    List<Show> findByDate(String date);
}