package com.movierecommender.backend.service;

import com.movierecommender.backend.dto.MlMovieResult;
import com.movierecommender.backend.dto.MlRecommendResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.annotation.PostConstruct;

@Service
public class MLServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ml.service.url}")
    private String baseUrl;

    public MLServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostConstruct
    void normalizeBaseUrl() {
        if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
            baseUrl = "http://" + baseUrl;
        }
        baseUrl = baseUrl.replaceAll("/+$", "");
    }

    public List<MlMovieResult> listMovies(int limit, int offset) {
        String url = String.format("%s/movies?limit=%d&offset=%d", baseUrl, limit, offset);
        return call(url);
    }

    public List<MlMovieResult> mostRated(int limit) {
        return call(String.format("%s/movies/most-rated?limit=%d", baseUrl, limit));
    }

    public List<MlMovieResult> topRated(int limit) {
        return call(String.format("%s/movies/top-rated?limit=%d", baseUrl, limit));
    }

    public List<MlMovieResult> byGenre(String genre) {
        return call(String.format("%s/movies/genre/%s", baseUrl, genre));
    }

    public List<MlMovieResult> search(String query) {
        String url = String.format(
                "%s/movies/search?q=%s", baseUrl,
                java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8)
        );
        return call(url);
    }

    public MlMovieResult getMovie(Long movieId) {
        try {
            return restTemplate.getForObject(baseUrl + "/movies/" + movieId, MlMovieResult.class);
        } catch (RestClientException e) {
            throw new MLServiceUnavailableException("ML service unreachable: " + e.getMessage(), e);
        }
    }

    public List<MlMovieResult> recommendSimilar(Long movieId, int topN) {
        String url = String.format("%s/recommend/movie/%d?top_n=%d", baseUrl, movieId, topN);
        return callRecommend(url);
    }

    public List<MlMovieResult> recommendForProfile(List<Long> likedIds, int topN) {
        String idsParam = likedIds.stream().map(String::valueOf).collect(Collectors.joining(","));
        String url = String.format("%s/recommend/profile?likedIds=%s&top_n=%d", baseUrl, idsParam, topN);
        return callRecommend(url);
    }

    private List<MlMovieResult> call(String url) {
        try {
            MlMovieResult[] results = restTemplate.getForObject(url, MlMovieResult[].class);
            return results == null ? List.of() : Arrays.asList(results);
        } catch (RestClientException e) {
            throw new MLServiceUnavailableException("ML service unreachable: " + e.getMessage(), e);
        }
    }

    private List<MlMovieResult> callRecommend(String url) {
        try {
            MlRecommendResponse response = restTemplate.getForObject(url, MlRecommendResponse.class);
            return response == null || response.recommendations == null ? List.of() : response.recommendations;
        } catch (RestClientException e) {
            throw new MLServiceUnavailableException("ML service unreachable: " + e.getMessage(), e);
        }
    }

    public static class MLServiceUnavailableException extends RuntimeException {
        public MLServiceUnavailableException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
