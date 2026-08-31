package com.movierecommender.backend.controller;

import com.movierecommender.backend.model.Movie;
import com.movierecommender.backend.model.MovieRepository;
import com.movierecommender.backend.model.UserLike;
import com.movierecommender.backend.model.UserLikeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users/{userId}/likes")
public class UserLikeController {

    private final UserLikeRepository userLikeRepository;
    private final MovieRepository movieRepository;

    public UserLikeController(UserLikeRepository userLikeRepository, MovieRepository movieRepository) {
        this.userLikeRepository = userLikeRepository;
        this.movieRepository = movieRepository;
    }

    /** Returns the full Movie objects the user has liked (not just IDs) so the frontend can render them directly. */
    @GetMapping
    public List<Movie> getLikes(@PathVariable String userId) {
        List<Long> movieIds = userLikeRepository.findByUserId(userId).stream()
                .map(UserLike::getMovieId)
                .collect(Collectors.toList());
        return movieRepository.findAllById(movieIds);
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<Void> like(@PathVariable String userId, @PathVariable Long movieId) {
        if (userLikeRepository.findByUserIdAndMovieId(userId, movieId).isEmpty()) {
            userLikeRepository.save(new UserLike(userId, movieId));
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<Void> unlike(@PathVariable String userId, @PathVariable Long movieId) {
        userLikeRepository.deleteByUserIdAndMovieId(userId, movieId);
        return ResponseEntity.ok().build();
    }
}
