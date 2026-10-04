
package com.cinebook.cinebook.repository;

import com.cinebook.cinebook.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends MongoRepository<Booking, String> {

    // Find all bookings for a particular show
    List<Booking> findByShow(String show);

    // Find bookings by show and status
    List<Booking> findByShowAndStatus(String show, String status);

    // Find booking using custom booking ID
    Optional<Booking> findByBookingId(String bookingId);

    // Find all bookings belonging to a customer
    List<Booking> findByUser(String user);
}