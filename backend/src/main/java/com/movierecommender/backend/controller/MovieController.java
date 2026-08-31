package com.movierecommender.backend.controller;

import com.movierecommender.backend.dto.MlMovieResult;
import com.movierecommender.backend.model.Movie;
import com.movierecommender.backend.model.MovieRepository;
import com.movierecommender.backend.service.MLServiceClient;
import com.movierecommender.backend.service.MovieEnrichmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieRepository movieRepository;
    private final MLServiceClient mlServiceClient;
    private final MovieEnrichmentService enrichmentService;

    public MovieController(MovieRepository movieRepository, MLServiceClient mlServiceClient,
                            MovieEnrichmentService enrichmentService) {
        this.movieRepository = movieRepository;
        this.mlServiceClient = mlServiceClient;
        this.enrichmentService = enrichmentService;
    }

    /** Real popularity signal from actual MovieLens rating counts, not a proxy. */
    @GetMapping("/trending")
    public ResponseEntity<?> getTrending(@RequestParam(defaultValue = "100") int limit) {
        try {
            List<MlMovieResult> results = mlServiceClient.mostRated(limit);
            return ResponseEntity.ok(enrichmentService.enrichAll(results));
        } catch (MLServiceClient.MLServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }

    @GetMapping("/top-rated")
    public ResponseEntity<?> getTopRated(@RequestParam(defaultValue = "100") int limit) {
        try {
            List<MlMovieResult> results = mlServiceClient.topRated(limit);
            return ResponseEntity.ok(enrichmentService.enrichAll(results));
        } catch (MLServiceClient.MLServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<?> getByGenre(@PathVariable String genre) {
        try {
            List<MlMovieResult> results = mlServiceClient.byGenre(genre);
            return ResponseEntity.ok(enrichmentService.enrichAll(results));
        } catch (MLServiceClient.MLServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }

    /** Main browse search bar — includes posters, so results are enriched (small list, cheap). */
    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        try {
            List<MlMovieResult> results = mlServiceClient.search(q);
            return ResponseEntity.ok(enrichmentService.enrichAll(results));
        } catch (MLServiceClient.MLServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }

    /**
     * Lightweight search for the standalone Recommender page — plain
     * title/genre/rating data straight from the ML service, no TMDB
     * enrichment at all. Used when posters aren't needed.
     */
    @GetMapping("/search/lite")
    public ResponseEntity<?> searchLite(@RequestParam String q) {
        try {
            return ResponseEntity.ok(mlServiceClient.search(q));
        } catch (MLServiceClient.MLServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovie(@PathVariable Long id) {
        Movie cached = movieRepository.findById(id).orElse(null);
        if (cached != null && cached.isEnriched()) {
            return ResponseEntity.ok(cached);
        }
        try {
            MlMovieResult ml = mlServiceClient.getMovie(id);
            if (ml == null) return ResponseEntity.notFound().build();
            Movie enriched = enrichmentService.enrichAndSave(enrichmentService.toMovie(ml));
            return ResponseEntity.ok(enriched);
        } catch (MLServiceClient.MLServiceUnavailableException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        }
    }
}
