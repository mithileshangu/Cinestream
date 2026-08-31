package com.movierecommender.backend.model;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * This table is purely a cache of TMDB enrichment (poster/overview/etc) —
 * the actual movie catalog, ratings, and recommendation logic all live in
 * the ML service (see MLServiceClient). Browsing/search/genre/recommend
 * endpoints all go through the ML service by movieId, then look up or
 * create a cache row here — see MovieEnrichmentService.
 */
public interface MovieRepository extends JpaRepository<Movie, Long> {
}
