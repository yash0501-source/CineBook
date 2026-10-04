
package com.cinebook.cinebook.controller;

import com.cinebook.cinebook.model.Booking;
import com.cinebook.cinebook.service.BookingService;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class BookingController {

    private final BookingService bookingService;
    private final MongoTemplate mongoTemplate;

    public BookingController(
            BookingService bookingService,
            MongoTemplate mongoTemplate
    ) {
        this.bookingService = bookingService;
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBookings() {

        List<Booking> bookings = bookingService.getAllBookings();
        List<Map<String, Object>> results = new ArrayList<>();

        for (Booking booking : bookings) {
            results.add(toAdminBooking(booking));
        }

        return ResponseEntity.ok(results);
    }

    private Map<String, Object> toAdminBooking(Booking booking) {

        String userId = booking.getUser();
        String movieId = booking.getMovieId();
        String theatreId = booking.getTheatre();
        String storedShowId = booking.getShow();

        Document user = findDocumentById(userId, "users");
        Document movie = findDocumentById(movieId, "movies");
        Document theatre = findDocumentById(theatreId, "theatres");

        Document show = findDocumentById(storedShowId, "shows");

        // Some bookings store no show ID. Try matching the show
        // using the movie, theatre, date and time.
        if (show == null
                && hasText(movieId)
                && hasText(theatreId)
                && hasText(booking.getDate())
                && hasText(booking.getTime())) {

            Query showQuery = new Query();
            showQuery.addCriteria(
                    Criteria.where("movie").is(movieId)
                            .and("theatre").is(theatreId)
                            .and("date").is(booking.getDate())
                            .and("time").is(booking.getTime())
            );

            show = mongoTemplate.findOne(
                    showQuery,
                    Document.class,
                    "shows"
            );
        }

        String customerName = user == null
                ? displayFallback(userId)
                : firstText(user.getString("name"), user.getString("email"));

        String movieTitle = movie == null
                ? firstText(booking.getMovieTitle(), movieId)
                : firstText(movie.getString("title"), booking.getMovieTitle(), movieId);

        String theatreName = theatre == null
                ? displayFallback(theatreId)
                : firstText(theatre.getString("name"), theatreId);

        String resolvedShowId = show == null
                ? displayFallback(storedShowId)
                : idAsString(show.get("_id"));

        String showDate = show == null
                ? displayFallback(booking.getDate())
                : firstText(show.getString("date"), booking.getDate());

        String showTime = show == null
                ? displayFallback(booking.getTime())
                : firstText(show.getString("time"), booking.getTime());

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("id", booking.getId());
        result.put("bookingId", booking.getBookingId());

        // Keep the original references available for searching/debugging.
        result.put("user", userId);
        result.put("movieId", movieId);
        result.put("theatreId", theatreId);
        result.put("show", storedShowId);

        // Readable values for the admin table.
        result.put("customerName", customerName);
        result.put("movieTitle", movieTitle);
        result.put("theatreName", theatreName);
        result.put("showId", resolvedShowId);

        result.put("date", showDate);
        result.put("time", showTime);
        result.put("seats", booking.getSeats());
        result.put("totalAmount", booking.getTotalAmount());
        result.put("status", booking.getStatus());
        result.put("createdAt", booking.getCreatedAt());

        return result;
    }

    private Document findDocumentById(String id, String collection) {

        if (!hasText(id)) {
            return null;
        }

        if (ObjectId.isValid(id)) {
            return mongoTemplate.findById(
                    new ObjectId(id),
                    Document.class,
                    collection
            );
        }

        return mongoTemplate.findOne(
                Query.query(Criteria.where("_id").is(id)),
                Document.class,
                collection
        );
    }

    private String idAsString(Object id) {
        return id == null ? "—" : String.valueOf(id);
    }

    private String displayFallback(String value) {
        return hasText(value) ? value : "—";
    }

    private String firstText(String... values) {
        for (String value : values) {
            if (hasText(value)) {
                return value;
            }
        }
        return "—";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable String id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(toAdminBooking(booking));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request
    ) {
        try {
            String status = request.get("status");

            Booking updatedBooking =
                    bookingService.updateBookingStatus(id, status);

            return ResponseEntity.ok(toAdminBooking(updatedBooking));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable String id) {
        try {
            bookingService.deleteBooking(id);

            return ResponseEntity.ok(
                    Map.of("message", "Booking deleted successfully")
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", exception.getMessage()));
        }
    }
}