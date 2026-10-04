
package com.cinebook.cinebook.controller;

import com.cinebook.cinebook.model.Show;
import com.cinebook.cinebook.service.ShowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;

    public ShowController(ShowService showService) {
        this.showService = showService;
    }

    @GetMapping
    public ResponseEntity<?> getAllShows() {
        List<Show> shows = showService.getAllShows();
        return ResponseEntity.ok(shows);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShow(@PathVariable String id) {
        try {
            return ResponseEntity.ok(showService.getShowById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createShow(@RequestBody ShowRequest request) {
        try {
            Show show = showService.createShow(
                    request.movie(),
                    request.screen(),
                    request.date(),
                    request.time(),
                    request.seatPrices(),
                    request.status()
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Show created successfully.",
                    "show", show
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateShow(
            @PathVariable String id,
            @RequestBody ShowRequest request
    ) {
        try {
            Show show = showService.updateShow(
                    id,
                    request.movie(),
                    request.screen(),
                    request.date(),
                    request.time(),
                    request.seatPrices(),
                    request.status()
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Show updated successfully.",
                    "show", show
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // Recalculate prices for all existing shows using their showtimes.
    @PostMapping("/admin/recalculate-prices")
    public ResponseEntity<?> recalculateAllShowPrices() {
        try {
            int updatedCount = showService.updateAllShowPricesByTime();

            return ResponseEntity.ok(Map.of(
                    "message", "Show prices updated successfully.",
                    "updatedShows", updatedCount
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("message", "Could not update show prices.")
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShow(@PathVariable String id) {
        try {
            showService.deleteShow(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Show deleted successfully.");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    public record ShowRequest(
            String movie,
            String screen,
            String date,
            String time,
            Map<String, Object> seatPrices,
            String status
    ) {}
}