import { useEffect, useState } from 'react'

export default function HeroCarousel({ movies, onSelect }) {
  const [index, setIndex] = useState(0)
  const movie = movies[index]

  useEffect(() => {
    if (movies.length < 2) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % movies.length)
    }, 7000)
    return () => clearInterval(id)
  }, [movies.length])

  if (!movie) return null

  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''

  return (
    <section className="hero" id="home">
      <div
        className="hero-backdrop"
        style={{ backgroundImage: movie.backdropPath ? `url(${movie.backdropPath})` : 'none' }}
      >
        <div className="hero-gradient" />
      </div>

      <div className="hero-content">
        <div className="hero-genres">
          {(movie.genres || []).map((g) => (
            <span key={g} className="hero-genre">{g}</span>
          ))}
        </div>

        <h1 className="hero-title">{movie.title}</h1>

        <div className="hero-meta">
          {typeof movie.voteAverage === 'number' && (
            <span className="rating-badge">★ {movie.voteAverage.toFixed(1)}</span>
          )}
          {year && <span className="meta-chip">{year}</span>}
        </div>

        <p className="hero-overview">{movie.overview}</p>

        <div className="hero-actions">
          <button className="btn btn-play" onClick={() => onSelect(movie)}>
            ▶ Watch Now
          </button>
          <button className="btn btn-info" onClick={() => onSelect(movie)}>
            More Info
          </button>
        </div>
      </div>

      {movies.length > 1 && (
        <>
          <div className="hero-controls">
            <span className="hero-counter">{index + 1} / {movies.length}</span>
            <button
              className="hero-arrow"
              aria-label="Previous"
              onClick={() => setIndex((i) => (i - 1 + movies.length) % movies.length)}
            >
              ←
            </button>
            <button
              className="hero-arrow"
              aria-label="Next"
              onClick={() => setIndex((i) => (i + 1) % movies.length)}
            >
              →
            </button>
          </div>

          <div className="hero-dots">
            {movies.map((m, i) => (
              <button
                key={m.id}
                className={`hero-dot ${i === index ? 'active' : ''}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
