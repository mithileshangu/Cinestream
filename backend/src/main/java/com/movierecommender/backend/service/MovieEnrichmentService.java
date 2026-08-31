package com.movierecommender.backend.service;

import com.movierecommender.backend.dto.MlMovieResult;
import com.movierecommender.backend.dto.tmdb.TmdbMovie;
import com.movierecommender.backend.model.Movie;
import com.movierecommender.backend.model.MovieRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Bridges the MovieLens-backed ML service (real ratings, real collaborative
 * filtering, ~9,700 movies) with TMDB (posters, backdrops, overviews).
 *
 * The two datasets are joined via MovieLens's own links.csv, which maps
 * every MovieLens movieId to a TMDB id — that mapping comes back as
 * `tmdbId` on every ML service response.
 *
 * Fetching TMDB details for all ~9,700 movies up front isn't practical
 * (rate limits, slow startup, wasted calls on movies nobody views), so
 * enrichment happens lazily: the first time a movie is actually shown to
 * a user, its poster/overview/etc are fetched from TMDB and cached in H2.
 * Every subsequent request for that movie is a plain DB read.
 */
@Service
public class MovieEnrichmentService {

    private final MovieRepository movieRepository;
    private final TmdbService tmdbService;

    @Value("${tmdb.image.base.url}")
    private String imageBaseUrl;

    public MovieEnrichmentService(MovieRepository movieRepository, TmdbService tmdbService) {
        this.movieRepository = movieRepository;
        this.tmdbService = tmdbService;
    }

    /** Converts an ML service result into a Movie, reusing cached enrichment if we already have it. */
    public Movie toMovie(MlMovieResult ml) {
        Movie existing = movieRepository.findById(ml.id).orElse(null);
        if (existing != null && existing.isEnriched()) {
            return existing; // already enriched — don't re-fetch or overwrite
        }

        Movie movie = existing != null ? existing : new Movie();
        movie.setId(ml.id);
        movie.setTitle(ml.title);
        movie.setGenres(ml.genres);
        movie.setTmdbId(ml.tmdbId);
        movie.setRatingCount(ml.ratingCount);
        movie.setRatingMean(ml.ratingMean);
        return movie;
    }

    /** Enriches (if needed) and persists a single movie. Safe to call repeatedly — no-ops once enriched. */
    public Movie enrichAndSave(Movie movie) {
        if (movie.isEnriched() || movie.getTmdbId() == null) {
            return movieRepository.save(movie);
        }
        try {
            TmdbMovie details = tmdbService.fetchMovieDetails(movie.getTmdbId());
            if (details != null) {
                movie.setOverview(details.overview);
                movie.setPosterPath(details.poster_path != null ? imageBaseUrl + "/w500" + details.poster_path : null);
                movie.setBackdropPath(details.backdrop_path != null ? imageBaseUrl + "/w1280" + details.backdrop_path : null);
                movie.setVoteAverage(details.vote_average);
                movie.setReleaseDate(details.release_date);
                movie.setEnriched(true);
            }
        } catch (Exception e) {
            // TMDB might not have a match for this tmdbId, or the call failed after
            // retries — leave it unenriched rather than failing the whole request.
            // The frontend already handles a movie with no posterPath gracefully.
            System.err.println("Could not enrich movie " + movie.getId() + ": " + e.getMessage());
        }
        return movieRepository.save(movie);
    }

    /** Converts + enriches + saves a batch of ML results in one call. */
    public List<Movie> enrichAll(List<MlMovieResult> results) {
        return results.stream()
                .map(this::toMovie)
                .map(this::enrichAndSave)
                .collect(Collectors.toList());
    }
}
