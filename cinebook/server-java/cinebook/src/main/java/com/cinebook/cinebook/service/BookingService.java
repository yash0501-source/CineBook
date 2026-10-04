
package com.cinebook.cinebook.service;

import com.cinebook.cinebook.model.Booking;
import com.cinebook.cinebook.model.Show;
import com.cinebook.cinebook.model.Theatre;
import com.cinebook.cinebook.repository.BookingRepository;
import com.cinebook.cinebook.repository.TheatreRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowService showService;
    private final TheatreRepository theatreRepository;

    public BookingService(
            BookingRepository bookingRepository,
            ShowService showService,
            TheatreRepository theatreRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.showService = showService;
        this.theatreRepository = theatreRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Booking not found: " + id));
    }

    public Booking getBookingByBookingId(String bookingId) {
        return bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Booking not found: " + bookingId));
    }

    public Booking createBooking(
            String showId,
            String userId,
            List<String> requestedSeats
    ) {
        if (showId == null || showId.isBlank()) {
            throw new IllegalArgumentException("Show ID is required.");
        }

        if (requestedSeats == null || requestedSeats.isEmpty()) {
            throw new IllegalArgumentException("Please select at least one seat.");
        }

        if (requestedSeats.size() > 8) {
            throw new IllegalArgumentException("You can book a maximum of 8 seats.");
        }

        List<String> seats = requestedSeats.stream()
                .map(seat -> seat == null
                        ? ""
                        : seat.trim().toUpperCase(Locale.ROOT))
                .toList();

        if (seats.stream().anyMatch(String::isBlank)
                || new HashSet<>(seats).size() != seats.size()) {
            throw new IllegalArgumentException(
                    "Invalid or duplicate seat selection.");
        }

        Show show = showService.getShowById(showId);

        List<Booking> existingBookings =
                bookingRepository.findByShow(showId);

        for (Booking existing : existingBookings) {
            String status = existing.getStatus() == null
                    ? ""
                    : existing.getStatus().trim().toLowerCase(Locale.ROOT);

            if (List.of(
                    "cancelled",
                    "canceled",
                    "failed",
                    "refunded",
                    "expired"
            ).contains(status)) {
                continue;
            }

            if (existing.getSeats() != null) {
                for (String seat : seats) {
                    if (existing.getSeats().contains(seat)) {
                        throw new IllegalStateException(
                                "Seat " + seat + " is already booked.");
                    }
                }
            }
        }

        if (show.getSeatPrices() == null) {
            throw new IllegalStateException(
                    "Seat prices are not configured for this show.");
        }

        double amount = 0;

        for (String seat : seats) {
            if (seat.length() < 2) {
                throw new IllegalArgumentException("Invalid seat: " + seat);
            }

            String row = seat.substring(0, 1);
            String category;

            if ("ABCD".contains(row)) {
                category = "standard";
            } else if ("EF".contains(row)) {
                category = "premium";
            } else if ("GH".contains(row)) {
                category = "recliner";
            } else {
                throw new IllegalArgumentException(
                        "Invalid seat: " + seat);
            }

            Object priceValue = show.getSeatPrices().get(category);

            if (!(priceValue instanceof Number)) {
                throw new IllegalStateException(
                        "Price not configured for " + category + " seats.");
            }

            amount += ((Number) priceValue).doubleValue();
        }

        // Resolve the theatre ID into its actual theatre name.
        String theatreId = show.getTheatre();

        if (theatreId == null || theatreId.isBlank()) {
            throw new IllegalStateException(
                    "The selected show does not have a theatre assigned.");
        }

        Theatre theatre = theatreRepository.findById(theatreId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Theatre not found for ID: " + theatreId));

        String theatreName = theatre.getName();

        if (theatreName == null || theatreName.isBlank()) {
            throw new IllegalStateException(
                    "The theatre name is missing.");
        }

        Date now = new Date();

        Booking booking = new Booking();

        booking.setBookingId(
                "CB" + UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 10)
                        .toUpperCase(Locale.ROOT)
        );

        booking.setUser(
                userId == null || userId.isBlank()
                        ? "guest"
                        : userId
        );

        booking.setMovieId(show.getMovie());
        booking.setTheatre(theatreName);
        booking.setShow(show.getId());
        booking.setDate(show.getDate());
        booking.setTime(show.getTime());
        booking.setSeats(new ArrayList<>(seats));
        booking.setTotalAmount(amount);
        booking.setStatus("confirmed");
        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);

        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(String id, String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Booking status is required");
        }

        Booking booking = getBookingById(id);
        booking.setStatus(status.trim().toLowerCase(Locale.ROOT));
        booking.setUpdatedAt(new Date());

        return bookingRepository.save(booking);
    }

    public void deleteBooking(String id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(booking);
    }
}