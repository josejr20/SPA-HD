package com.andreutp.centromasajes.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.andreutp.centromasajes.model.RatingModel;
import com.andreutp.centromasajes.service.RatingService;

@RestController
@RequestMapping("/ratings")
@CrossOrigin(origins = "http://localhost:3000")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping
    public ResponseEntity<?> createRating(@RequestBody Map<String, Object> request) {
        try {
            Long appointmentId = Long.valueOf(request.get("appointmentId").toString());
            Integer stars = Integer.valueOf(request.get("stars").toString());
            String comment = request.get("comment") != null ? request.get("comment").toString() : "";
            Long userId = Long.valueOf(request.get("userId").toString());

            RatingModel rating = ratingService.createRating(appointmentId, stars, comment, userId);
            return ResponseEntity.ok(rating);
        } catch (NumberFormatException | NullPointerException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid input: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getRatingByAppointment(@PathVariable Long appointmentId) {
        Optional<RatingModel> rating = ratingService.getRatingByAppointment(appointmentId);
        if (rating.isPresent()) {
            return ResponseEntity.ok(rating.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/appointment/{appointmentId}/exists")
    public ResponseEntity<Map<String, Boolean>> hasRating(@PathVariable Long appointmentId) {
        boolean exists = ratingService.hasRating(appointmentId);
        return ResponseEntity.ok(Map.of("hasRating", exists));
    }
}