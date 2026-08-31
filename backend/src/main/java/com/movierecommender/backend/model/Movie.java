package com.movierecommender.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Movie {

    @Id
    private Long id; // MovieLens movieId — the canonical ID used throughout the app

    @Column(length = 500)
    private String title;

    private Long tmdbId; // from MovieLens links.csv — null if no TMDB match exists

    @Column(length = 2000)
    private String overview;      // populated lazily from TMDB on first display
    private String posterPath;    // full TMDB CDN URL, populated lazily
    private String backdropPath;  // full TMDB CDN URL, populated lazily
    private Double voteAverage;   // from TMDB, populated lazily
    private String releaseDate;   // from TMDB, populated lazily

    private Integer ratingCount;  // from MovieLens — real number of user ratings
    private Double ratingMean;    // from MovieLens — real average of user ratings

    /** True once TMDB enrichment (poster/overview/etc) has been fetched and cached. */
    private boolean enriched = false;

    @ElementCollection
    @CollectionTable(name = "movie_genres", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "genre")
    private List<String> genres = new ArrayList<>();

    public Movie() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public String getPosterPath() { return posterPath; }
    public void setPosterPath(String posterPath) { this.posterPath = posterPath; }

    public String getBackdropPath() { return backdropPath; }
    public void setBackdropPath(String backdropPath) { this.backdropPath = backdropPath; }

    public Double getVoteAverage() { return voteAverage; }
    public void setVoteAverage(Double voteAverage) { this.voteAverage = voteAverage; }

    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }

    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }

    public Double getRatingMean() { return ratingMean; }
    public void setRatingMean(Double ratingMean) { this.ratingMean = ratingMean; }

    public boolean isEnriched() { return enriched; }
    public void setEnriched(boolean enriched) { this.enriched = enriched; }

    public List<String> getGenres() { return genres; }
    public void setGenres(List<String> genres) { this.genres = genres; }
}
