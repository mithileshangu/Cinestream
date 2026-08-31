package com.movierecommender.backend.service;

import com.movierecommender.backend.dto.tmdb.TmdbMovie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * TMDB's only job in this app is enrichment: given a TMDB id (obtained from
 * MovieLens's links.csv), fetch poster/backdrop/overview/rating/release
 * date for one movie. The ML service owns the actual catalog and
 * recommendation logic — see MLServiceClient and MovieEnrichmentService.
 */
@Service
public class TmdbService {

    private static final int MAX_ATTEMPTS = 4;
    private static final long INITIAL_BACKOFF_MS = 1500;

    private final RestTemplate restTemplate;

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.base.url}")
    private String baseUrl;

    public TmdbService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Retries transient network failures (connection resets, timeouts) with
     * exponential backoff. Enrichment happens on a semi-hot path (the first
     * time any given movie is viewed), so it's worth a few retries before
     * giving up and leaving that movie unenriched.
     */
    private <T> T withRetry(String description, java.util.function.Supplier<T> call) {
        RestClientException lastError = null;
        long backoff = INITIAL_BACKOFF_MS;

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return call.get();
            } catch (RestClientException e) {
                lastError = e;
                System.out.println(
                        "TMDB call failed (" + description + "), attempt " + attempt + "/" + MAX_ATTEMPTS
                                + ": " + e.getMessage()
                );
                if (attempt < MAX_ATTEMPTS) {
                    try {
                        Thread.sleep(backoff);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    backoff *= 2;
                }
            }
        }
        throw lastError;
    }

    /**
     * Fetches full details for one TMDB movie by its TMDB id — used to
     * lazily enrich a MovieLens-sourced Movie the first time it's actually
     * shown to a user, instead of enriching all ~9,700 movies up front.
     */
    public TmdbMovie fetchMovieDetails(Long tmdbId) {
        String url = String.format("%s/movie/%d?api_key=%s&language=en-US", baseUrl, tmdbId, apiKey);
        return withRetry("fetchMovieDetails " + tmdbId, () -> restTemplate.getForObject(url, TmdbMovie.class));
    }
}
