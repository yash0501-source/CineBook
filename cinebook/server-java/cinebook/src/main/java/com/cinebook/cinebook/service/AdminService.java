package com.cinebook.cinebook.service;

import com.cinebook.cinebook.repository.BookingRepository;
import com.cinebook.cinebook.repository.MovieRepository;
import com.cinebook.cinebook.repository.TheatreRepository;
import com.cinebook.cinebook.repository.UserRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final TheatreRepository theatreRepository;
    private final BookingRepository bookingRepository;
    private final MongoTemplate mongoTemplate;

    public AdminService(
            UserRepository userRepository,
            MovieRepository movieRepository,
            TheatreRepository theatreRepository,
            BookingRepository bookingRepository,
            MongoTemplate mongoTemplate
    ) {
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.theatreRepository = theatreRepository;
        this.bookingRepository = bookingRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Map<String, Object> getDashboardStats() {

        long totalUsers = userRepository.count();
        long totalMovies = movieRepository.count();
        long totalTheatres = theatreRepository.count();
        long totalBookings = bookingRepository.count();

        long totalShows = mongoTemplate
                .getCollection("shows")
                .countDocuments();

        long totalScreens = mongoTemplate
                .getCollection("screens")
                .countDocuments();

        BigDecimal totalRevenue = BigDecimal.ZERO;

        var bookings = bookingRepository.findAll();

        for (var booking : bookings) {

            if (!"confirmed".equalsIgnoreCase(booking.getStatus())) {
                continue;
            }

            Number amount = booking.getTotalAmount();

            if (amount != null) {
                totalRevenue = totalRevenue.add(
                        BigDecimal.valueOf(amount.doubleValue())
                );
            }
        }

        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", totalUsers);
        stats.put("totalMovies", totalMovies);
        stats.put("totalTheatres", totalTheatres);
        stats.put("totalScreens", totalScreens);
        stats.put("totalShows", totalShows);
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue);

        return stats;
    }
}