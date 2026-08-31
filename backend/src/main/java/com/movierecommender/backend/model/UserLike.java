package com.movierecommender.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_likes", uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "movieId"}))
public class UserLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId; // anonymous ID generated and stored in the browser (localStorage)
    private Long movieId;

    public UserLike() {}

    public UserLike(String userId, Long movieId) {
        this.userId = userId;
        this.movieId = movieId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }
}
