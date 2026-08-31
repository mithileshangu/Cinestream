package com.movierecommender.backend.controller;

import com.movierecommender.backend.dto.MlMovieResult;
import com.movierecommender.backend.service.MLServiceClient;
import com.movierecommender.backend.service.MovieEnrichmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final MLServiceClient mlServiceClient;
    private final MovieEnrichmentService enrichmentService;

    public RecommendationController(MLServiceClient mlServiceClient, MovieEnrichmentService enrichmentService) {
        this.mlServiceClient = mlServiceClient;
        this.enrichmentService = enrichmentService;
    }

    /** Used by the main browsing app's "More Like This" — includes posters. */
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> byMovie(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "10") int topN) {
        try {
            List<MlMovieResult> results = mlServiceClient.recommendSimilar(movieId, topN);
            return ResponseEntity.ok(enrichmentService.enrichAll(results));
        } catch (MLServiceClient.MLServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }

    /** Used by the main browsing app's "Recommended For You" — includes posters. */
    @GetMapping("/profile")
    public ResponseEntity<?> byProfile(
            @RequestParam List<Long> likedIds,
            @RequestParam(defaultValue = "10") int topN) {
        try {
            List<MlMovieResult> results = mlServiceClient.recommendForProfile(likedIds, topN);
            return ResponseEntity.ok(enrichmentService.enrichAll(results));
        } catch (MLServiceClient.MLServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }

    /**
     * Lightweight version for the standalone Recommender page — raw
     * title/genre/score data straight from the ML service, no TMDB calls
     * at all. This is the "just show me the algorithm's output" view.
     */
    @GetMapping("/lite/movie/{movieId}")
    public ResponseEntity<?> byMovieLite(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "10") int topN) {
        try {
            return ResponseEntity.ok(mlServiceClient.recommendSimilar(movieId, topN));
        } catch (MLServiceClient.MLServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }
}
