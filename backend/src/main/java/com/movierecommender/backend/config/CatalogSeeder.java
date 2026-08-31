package com.movierecommender.backend.config;

import com.movierecommender.backend.dto.MlMovieResult;
import com.movierecommender.backend.model.MovieRepository;
import com.movierecommender.backend.service.MLServiceClient;
import com.movierecommender.backend.service.MovieEnrichmentService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Primes the browsable catalog on startup so the homepage has something to
 * show immediately, instead of every user's first page load triggering a
 * wave of TMDB enrichment calls.
 *
 * This only eagerly enriches ~150 movies (the most-rated ones — a real
 * signal from actual MovieLens user behavior). The other ~9,500+ movies in
 * the ML service's full catalog remain reachable via search and
 * recommendations; they get enriched lazily the moment a user actually
 * looks at one (see MovieEnrichmentService).
 */
@Component
public class CatalogSeeder implements CommandLineRunner {

    private final MLServiceClient mlServiceClient;
    private final MovieRepository movieRepository;
    private final MovieEnrichmentService enrichmentService;

    public CatalogSeeder(MLServiceClient mlServiceClient, MovieRepository movieRepository,
                          MovieEnrichmentService enrichmentService) {
        this.mlServiceClient = mlServiceClient;
        this.movieRepository = movieRepository;
        this.enrichmentService = enrichmentService;
    }

    @Override
    public void run(String... args) {
        if (movieRepository.count() > 0) {
            return; // already seeded from a previous run
        }

        System.out.println("Priming browsable catalog from the ML service (this runs once)...");
        try {
            List<MlMovieResult> mostRated = mlServiceClient.mostRated(150);
            List<?> enriched = enrichmentService.enrichAll(mostRated);
            System.out.println("Seeded and enriched " + enriched.size() + " movies for browsing.");
            System.out.println(
                    "The full MovieLens catalog (~9,700 movies) is reachable via search and "
                            + "recommendations — those enrich on-demand the first time they're viewed."
            );
        } catch (Exception e) {
            System.err.println(
                    "WARNING: Could not prime the catalog (is the ML service running on the configured "
                            + "ml.service.url?). Starting with an empty catalog. Error: " + e.getMessage()
            );
        }
    }
}
