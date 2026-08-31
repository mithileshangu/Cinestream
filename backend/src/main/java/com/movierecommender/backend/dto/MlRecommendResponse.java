package com.movierecommender.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MlRecommendResponse {
    public List<MlMovieResult> recommendations;
}
