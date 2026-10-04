
package com.cinebook.cinebook.controller;

import com.cinebook.cinebook.model.Booking;
import com.cinebook.cinebook.repository.BookingRepository;
import com.cinebook.cinebook.service.BookingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class BookingSeatController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    // GET BOOKED SEATS FOR A SHOW
    @GetMapping("/seats/{showId}")
    public ResponseEntity<?> getBookedSeats(@PathVariable String showId) {
        try {
            List<Booking> bookings = bookingRepository.findByShow(showId);

            List<String> bookedSeats = bookings.stream()
                    .filter(booking -> {
                        String status = booking.getStatus();

                        return status != null
                                && !status.equalsIgnoreCase("cancelled")
                                && !status.equalsIgnoreCase("failed")
                                && !status.equalsIgnoreCase("refunded")
                                && !status.equalsIgnoreCase("expired");
                    })
                    .filter(booking -> booking.getSeats() != null)
                    .flatMap(booking -> booking.getSeats().stream())
                    .distinct()
                    .toList();

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("showId", showId);
            response.put("bookedSeats", bookedSeats);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve booked seats."));
        }
    }

    // CREATE BOOKING
    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody CreateBookingRequest request) {
        try {
            if (request == null
                    || request.showId() == null
                    || request.showId().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Show ID is required."));
            }

            if (request.userId() == null || request.userId().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is required."));
            }

            if (request.seats() == null || request.seats().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Please select at least one seat."));
            }

            Booking booking = bookingService.createBooking(
                    request.showId(),
                    request.userId(),
                    request.seats()
            );

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "Booking created successfully.");
            response.put("booking", booking);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to create booking."
                    ));
        }
    }

    // GET BOOKINGS FOR LOGGED-IN USER
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(@RequestParam String userId) {
        try {
            if (userId == null || userId.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is required."));
            }

            String normalizedUserId = userId.trim();

            List<Booking> bookings =
                    bookingRepository.findByUser(normalizedUserId);

            System.out.println("MY BOOKINGS USER ID: " + normalizedUserId);
            System.out.println("MY BOOKINGS FOUND: " + bookings.size());

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("bookings", bookings);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unable to retrieve bookings."));
        }
    }

    // BOOKING REQUEST
    public record CreateBookingRequest(
            String showId,
            String movieId,
            String theatreId,
            String userId,
            List<String> seats,
            Double totalAmount
    ) {
    }
}