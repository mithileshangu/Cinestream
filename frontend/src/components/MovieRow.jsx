import { useRef } from 'react'
import MovieCard from './MovieCard.jsx'

export default function MovieRow({ title, movies, onSelect, id, likedIds, onToggleLike }) {
  const trackRef = useRef(null)

  function scroll(dir) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  if (!movies || movies.length === 0) return null

  return (
    <section className="movie-row" id={id}>
      <div className="movie-row-head">
        <h2>{title}</h2>
        <div className="row-arrows">
          <button aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)}>‹</button>
          <button aria-label={`Scroll ${title} right`} onClick={() => scroll(1)}>›</button>
        </div>
      </div>
      <div className="movie-row-track" ref={trackRef}>
        {movies.map((m) => (
          <MovieCard
            key={m.id}
            movie={m}
            onSelect={onSelect}
            isLiked={likedIds?.has(m.id)}
            onToggleLike={onToggleLike}
          />
        ))}
      </div>
    </section>
  )
}
