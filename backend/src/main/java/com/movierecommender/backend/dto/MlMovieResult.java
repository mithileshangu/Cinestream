package com.movierecommender.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MlMovieResult {
    public Long id; // MovieLens movieId
    public String title;
    public List<String> genres;
    public Long tmdbId;
    public Integer ratingCount;
    public Double ratingMean;
    public Double score; // present only on recommendation endpoints
}
