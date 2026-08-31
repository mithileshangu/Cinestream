package com.movierecommender.backend.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbMovie {
    public Long id;
    public String title;
    public String overview;
    public String poster_path;
    public String backdrop_path;
    public Double vote_average;
    public Double popularity;
    public String release_date;
    public List<Integer> genre_ids;
}
