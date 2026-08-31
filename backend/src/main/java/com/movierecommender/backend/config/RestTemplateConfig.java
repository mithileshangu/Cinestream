package com.movierecommender.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        // Generous timeouts — TMDB calls happen once at startup, not on a hot
        // path, so it's worth waiting out a slow/flaky connection rather than
        // failing fast and crashing the whole application.
        factory.setConnectTimeout(20_000);
        factory.setReadTimeout(20_000);
        return new RestTemplate(factory);
    }
}
