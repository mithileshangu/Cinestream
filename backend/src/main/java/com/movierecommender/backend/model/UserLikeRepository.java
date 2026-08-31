package com.movierecommender.backend.model;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserLikeRepository extends JpaRepository<UserLike, Long> {
    List<UserLike> findByUserId(String userId);
    Optional<UserLike> findByUserIdAndMovieId(String userId, Long movieId);
    void deleteByUserIdAndMovieId(String userId, Long movieId);
}
