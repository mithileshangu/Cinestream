import { useState } from 'react'
import { searchMoviesLite, fetchSimilarLite } from '../api/client.js'

export default function RecommenderPage() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [error, setError] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    setSelected(null)
    setRecommendations(null)
    try {
      const results = await searchMoviesLite(query)
      setSearchResults(results)
    } catch {
      setError('Could not reach the recommendation engine. Is the backend running?')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  async function handleSelect(movie) {
    setSelected(movie)
    setLoadingRecs(true)
    setError(null)
    try {
      const recs = await fetchSimilarLite(movie.id, 10)
      setRecommendations(recs)
    } catch {
      setError('Could not load recommendations.')
      setRecommendations([])
    } finally {
      setLoadingRecs(false)
    }
  }

  return (
    <div className="recommender-page">
      <div className="recommender-intro">
        <h1>Movie Recommender</h1>
        <p className="dim">
          Search for a movie you know, and see what the hybrid recommendation model — real
          collaborative filtering on ~100,000 ratings, blended with content-based genre/tag
          similarity — thinks is most alike. No posters here on purpose: this page is about the
          algorithm's output, not the browsing experience.
        </p>
      </div>

      <form className="recommender-search" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search for a movie title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-play" disabled={searching}>
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="status-note error">{error}</p>}

      <div className="recommender-columns">
        <div className="recommender-column">
          <h2>Results</h2>
          {searchResults.length === 0 && !searching && (
            <p className="status-note">Search for a movie to get started.</p>
          )}
          <ul className="plain-movie-list">
            {searchResults.map((m) => (
              <li key={m.id}>
                <button
                  className={`plain-movie-item ${selected?.id === m.id ? 'active' : ''}`}
                  onClick={() => handleSelect(m)}
                >
                  <span className="plain-movie-title">{m.title}</span>
                  <span className="plain-movie-meta">
                    {(m.genres || []).join(', ')}
                    {typeof m.ratingMean === 'number' && ` · ★ ${m.ratingMean.toFixed(1)} (${m.ratingCount} ratings)`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="recommender-column">
          <h2>{selected ? `Similar to "${selected.title}"` : 'Recommendations'}</h2>
          {!selected && <p className="status-note">Pick a movie from the results to see similar titles.</p>}
          {loadingRecs && <p className="status-note">Computing recommendations…</p>}
          {recommendations && recommendations.length === 0 && !loadingRecs && (
            <p className="status-note">No recommendations found for this movie.</p>
          )}
          {recommendations && recommendations.length > 0 && (
            <ol className="plain-movie-list numbered">
              {recommendations.map((m) => (
                <li key={m.id}>
                  <div className="plain-movie-item static">
                    <span className="plain-movie-title">{m.title}</span>
                    <span className="plain-movie-meta">
                      {(m.genres || []).join(', ')}
                      {typeof m.score === 'number' && ` · ${(m.score * 100).toFixed(0)}% match`}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
