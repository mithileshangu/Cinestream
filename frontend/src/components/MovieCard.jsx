export default function MovieCard({ movie, onSelect, isLiked, onToggleLike }) {
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''

  return (
    <div className="movie-card">
      <button className="movie-card-poster-btn" onClick={() => onSelect(movie)}>
        <div className="movie-card-poster-wrap">
          {movie.posterPath ? (
            <img
              className="movie-card-poster"
              src={movie.posterPath}
              alt={`${movie.title} poster`}
              loading="lazy"
            />
          ) : (
            <div className="movie-card-poster movie-card-poster-fallback">{movie.title}</div>
          )}
          <div className="movie-card-hover">
            {typeof movie.voteAverage === 'number' && (
              <span className="rating-badge small">★ {movie.voteAverage.toFixed(1)}</span>
            )}
          </div>
        </div>
      </button>
      {onToggleLike && (
        <button
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleLike(movie.id)
          }}
          aria-label={isLiked ? `Unlike ${movie.title}` : `Like ${movie.title}`}
          aria-pressed={isLiked}
        >
          {isLiked ? '♥' : '♡'}
        </button>
      )}
      <div className="movie-card-caption">
        <span className="movie-card-title">{movie.title}</span>
        <span className="movie-card-year">{year}</span>
      </div>
    </div>
  )
}
