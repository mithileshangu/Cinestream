import { useEffect, useState } from 'react'
import { fetchSimilar } from '../api/client.js'
import MovieCard from './MovieCard.jsx'

export default function MovieModal({ movie, onClose, onSelect, fallbackCatalog, likedIds, onToggleLike }) {
  const [similar, setSimilar] = useState([])
  const [loadingSimilar, setLoadingSimilar] = useState(true)
  const [similarError, setSimilarError] = useState(false)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    if (!movie) return
    let cancelled = false
    setLoadingSimilar(true)
    setSimilarError(false)

    fetchSimilar(movie.id)
      .then((data) => {
        if (!cancelled) setSimilar(data.slice(0, 6))
      })
      .catch(() => {
        if (cancelled) return
        setSimilarError(true)
        // Fallback: genre-overlap similarity computed client-side from
        // whatever catalog is already loaded, so the UI still shows
        // something useful if the ML service isn't running yet.
        const fallback = (fallbackCatalog || [])
          .filter((m) => m.id !== movie.id)
          .map((m) => ({
            ...m,
            overlap: (m.genres || []).filter((g) => (movie.genres || []).includes(g)).length,
          }))
          .filter((m) => m.overlap > 0)
          .sort((a, b) => b.overlap - a.overlap)
          .slice(0, 6)
        setSimilar(fallback)
      })
      .finally(() => {
        if (!cancelled) setLoadingSimilar(false)
      })

    return () => { cancelled = true }
  }, [movie, fallbackCatalog])

  if (!movie) return null

  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div
          className="modal-backdrop"
          style={{ backgroundImage: movie.backdropPath ? `url(${movie.backdropPath})` : 'none' }}
        >
          <div className="modal-backdrop-gradient" />
        </div>

        <div className="modal-body">
          <h2 className="modal-title">{movie.title}</h2>

          <div className="hero-meta">
            {typeof movie.voteAverage === 'number' && (
              <span className="rating-badge">★ {movie.voteAverage.toFixed(1)}</span>
            )}
            {year && <span className="meta-chip">{year}</span>}
          </div>

          <div className="hero-genres">
            {(movie.genres || []).map((g) => (
              <span key={g} className="hero-genre">{g}</span>
            ))}
          </div>

          <p className="modal-overview">{movie.overview}</p>

          <div className="modal-actions">
            <button className="btn btn-play">▶ Watch Now</button>
            {onToggleLike && (
              <button
                className={`btn btn-like ${likedIds?.has(movie.id) ? 'liked' : ''}`}
                onClick={() => onToggleLike(movie.id)}
              >
                {likedIds?.has(movie.id) ? '♥ Liked' : '♡ Like'}
              </button>
            )}
          </div>

          <div className="modal-similar">
            <h3>More Like This</h3>
            {similarError && (
              <p className="status-note">
                Recommendation engine unreachable — showing genre-based matches instead.
              </p>
            )}
            {loadingSimilar ? (
              <p className="status-note">Finding similar movies…</p>
            ) : similar.length === 0 ? (
              <p className="status-note">No similar movies found.</p>
            ) : (
              <div className="modal-similar-grid">
                {similar.map((m) => (
                  <MovieCard
                    key={m.id}
                    movie={m}
                    onSelect={onSelect}
                    isLiked={likedIds?.has(m.id)}
                    onToggleLike={onToggleLike}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
