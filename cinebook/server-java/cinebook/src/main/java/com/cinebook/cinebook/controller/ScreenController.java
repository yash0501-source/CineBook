
package com.cinebook.cinebook.controller;

import com.cinebook.cinebook.model.Screen;
import com.cinebook.cinebook.repository.ScreenRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/screens")
public class ScreenController {

    private final ScreenRepository screenRepository;

    public ScreenController(ScreenRepository screenRepository) {
        this.screenRepository = screenRepository;
    }

    // GET: Check whether the controller is working
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Screen controller is working");
    }

    // GET: Retrieve all screens
    @GetMapping
    public ResponseEntity<?> getAllScreens() {
        try {
            List<Screen> screens = screenRepository.findAll();
            return ResponseEntity.ok(screens);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse(e));
        }
    }

    // GET: Retrieve one screen
    @GetMapping("/{id}")
    public ResponseEntity<?> getScreen(@PathVariable String id) {
        try {
            Optional<Screen> screen = screenRepository.findById(id);

            if (screen.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(screen.get());

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse(e));
        }
    }

    // GET: Retrieve screens belonging to a theatre
    @GetMapping("/theatre/{theatreId}")
    public ResponseEntity<?> getScreensByTheatre(
            @PathVariable String theatreId
    ) {
        try {
            List<Screen> screens =
                    screenRepository.findByTheatre(theatreId);

            return ResponseEntity.ok(screens);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse(e));
        }
    }

    // POST: Create a new screen
    @PostMapping
    public ResponseEntity<?> createScreen(
            @RequestBody Screen screen
    ) {
        try {
            if (screen.getName() == null ||
                    screen.getName().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Screen name is required."));
            }

            if (screen.getTheatre() == null ||
                    screen.getTheatre().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Theatre is required."));
            }

            if (screen.getRows() == null ||
                    screen.getRows().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of("message", "At least one row is required."));
            }

            if (screen.getSeatsPerRow() == null ||
                    screen.getSeatsPerRow() <= 0) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Seats per row must be greater than 0."
                        ));
            }

            screen.setTotalSeats(
                    screen.getRows().size() * screen.getSeatsPerRow()
            );

            if (screen.getScreenType() == null ||
                    screen.getScreenType().trim().isEmpty()) {

                screen.setScreenType("2d");
            }

            if (screen.getStatus() == null ||
                    screen.getStatus().trim().isEmpty()) {

                screen.setStatus("active");
            }

            Instant now = Instant.now();

            screen.setCreatedAt(now);
            screen.setUpdatedAt(now);

            Screen savedScreen = screenRepository.save(screen);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(savedScreen);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse(e));
        }
    }

    // PUT: Update an existing screen
    @PutMapping("/{id}")
    public ResponseEntity<?> updateScreen(
            @PathVariable String id,
            @RequestBody Screen updatedScreen
    ) {
        try {
            Optional<Screen> result = screenRepository.findById(id);

            if (result.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Screen existingScreen = result.get();

            if (updatedScreen.getName() != null) {
                existingScreen.setName(updatedScreen.getName());
            }

            if (updatedScreen.getTheatre() != null) {
                existingScreen.setTheatre(updatedScreen.getTheatre());
            }

            if (updatedScreen.getScreenType() != null) {
                existingScreen.setScreenType(
                        updatedScreen.getScreenType()
                );
            }

            if (updatedScreen.getRows() != null) {
                existingScreen.setRows(updatedScreen.getRows());
            }

            if (updatedScreen.getSeatsPerRow() != null) {
                existingScreen.setSeatsPerRow(
                        updatedScreen.getSeatsPerRow()
                );
            }

            if (updatedScreen.getStatus() != null) {
                existingScreen.setStatus(updatedScreen.getStatus());
            }

            if (existingScreen.getRows() != null &&
                    existingScreen.getSeatsPerRow() != null) {

                existingScreen.setTotalSeats(
                        existingScreen.getRows().size()
                                * existingScreen.getSeatsPerRow()
                );
            }

            existingScreen.setUpdatedAt(Instant.now());

            Screen savedScreen =
                    screenRepository.save(existingScreen);

            return ResponseEntity.ok(savedScreen);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse(e));
        }
    }

    // DELETE: Delete a screen
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteScreen(
            @PathVariable String id
    ) {
        try {
            if (!screenRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            screenRepository.deleteById(id);

            return ResponseEntity.ok(
                    Map.of("message", "Screen deleted successfully.")
            );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse(e));
        }
    }

    // Common error response
    private Map<String, String> errorResponse(Exception e) {
        return Map.of(
                "error", e.getClass().getSimpleName(),
                "message", e.getMessage() == null
                        ? "Unknown server error"
                        : e.getMessage()
        );
    }
}