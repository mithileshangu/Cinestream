import { useEffect, useMemo, useState, useCallback } from 'react'
import Navbar from './components/Navbar.jsx'
import HeroCarousel from './components/HeroCarousel.jsx'
import MovieRow from './components/MovieRow.jsx'
import MovieModal from './components/MovieModal.jsx'
import RecommenderPage from './components/RecommenderPage.jsx'
import {
  fetchTrending,
  fetchByGenre,
  fetchForProfile,
  searchMovies,
  fetchTopRated,
  fetchUserLikes,
  likeMovie,
  unlikeMovie,
} from './api/client.js'
import { getUserId } from './api/userId.js'
import { movies as demoMovies } from './data/mockMovies.js'

// MovieLens's real genre labels (not TMDB's — e.g. "Sci-Fi" not "Science Fiction").
const GENRE_ROWS = ['Action', 'Comedy', 'Sci-Fi','Drama', 'Thriller']

export default function App() {
  const [page, setPage] = useState('browse') // 'browse' | 'recommender'
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  const [trending, setTrending] = useState([])
  const [genreRows, setGenreRows] = useState({})
  const [recommended, setRecommended] = useState([])
  const [topRated, setTopRated] = useState([])
  const [usingDemoData, setUsingDemoData] = useState(false)
  const [loading, setLoading] = useState(true)

  const [likedMovies, setLikedMovies] = useState([]) // full Movie objects
  const likedIds = useMemo(() => new Set(likedMovies.map((m) => m.id)), [likedMovies])
  const userId = useMemo(() => getUserId(), [])

  const loadRecommendations = useCallback(
    async (seedIds, trendingFallback) => {
      if (seedIds.length === 0) {
        // No likes yet — fall back to trending-based seeds, same as before.
        try {
          const recs = await fetchForProfile(trendingFallback.slice(0, 3).map((m) => m.id))
          setRecommended(recs)
        } catch {
          setRecommended(trendingFallback.slice(3, 11))
        }
        return
      }
      try {
        const recs = await fetchForProfile(seedIds)
        setRecommended(recs)
      } catch {
        setRecommended(trendingFallback.slice(0, 8))
      }
    },
    []
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const trendingData = await fetchTrending()
        if (cancelled) return
        if (!trendingData || trendingData.length === 0) throw new Error('Empty catalog')

        setTrending(trendingData)
        setUsingDemoData(false)

        const genreResults = {}
        await Promise.all(
          GENRE_ROWS.map(async (g) => {
            try {
              genreResults[g] = await fetchByGenre(g)
            } catch {
              genreResults[g] = []
            }
          })
        )
        if (!cancelled) setGenreRows(genreResults)
        
        try {
          const topRatedData = await fetchTopRated(20)
          if (!cancelled) setTopRated(topRatedData)
        } catch {
          if (!cancelled) setTopRated([])
        }

        // Load real likes for this browser, then base recommendations on them.
        let likes = []
        try {
          likes = await fetchUserLikes(userId)
        } catch {
          likes = []
        }
        if (!cancelled) setLikedMovies(likes)

        await loadRecommendations(
          likes.map((m) => m.id),
          trendingData
        )
      } catch {
        if (cancelled) return
        setUsingDemoData(true)
        setTrending(demoMovies.slice(0, 8))
        setRecommended([...demoMovies].sort(() => 0.5 - Math.random()).slice(0, 8))
        setGenreRows({
          Action: demoMovies.filter((m) => m.genres.includes('Action')),
          'Sci-Fi': demoMovies.filter((m) => m.genres.includes('Sci-Fi')),
          Thriller: demoMovies.filter((m) => m.genres.includes('Thriller')),
        })
        setTopRated([...demoMovies].sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 8))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId, loadRecommendations])

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }
    let cancelled = false
    const timeout = setTimeout(async () => {
      try {
        const results = usingDemoData
          ? demoMovies.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
          : await searchMovies(query)
        if (!cancelled) setSearchResults(results)
      } catch {
        if (!cancelled) setSearchResults([])
      }
    }, 350)
    return () => { cancelled = true; clearTimeout(timeout) }
  }, [query, usingDemoData])

  const featured = useMemo(() => trending.slice(0, 5), [trending])
  const fullCatalog = useMemo(
    () => [...trending, ...Object.values(genreRows).flat(), ...recommended, ...likedMovies],
    [trending, genreRows, recommended, likedMovies]
  )

  // Toggling a like updates the backend, updates local state, and
  // immediately re-runs recommendations so "Recommended For You" reacts
  // to what you just did — this is the actual personalization loop.
  async function handleToggleLike(movieId) {
    if (usingDemoData) return // no backend to persist to in demo mode

    const isCurrentlyLiked = likedIds.has(movieId)
    let nextLiked
    if (isCurrentlyLiked) {
      await unlikeMovie(userId, movieId).catch(() => {})
      nextLiked = likedMovies.filter((m) => m.id !== movieId)
    } else {
      await likeMovie(userId, movieId).catch(() => {})
      const movieObj = fullCatalog.find((m) => m.id === movieId)
      nextLiked = movieObj ? [...likedMovies, movieObj] : likedMovies
    }
    setLikedMovies(nextLiked)
    loadRecommendations(nextLiked.map((m) => m.id), trending)
  }

  if (loading) {
    return (
      <div className="app">
        <Navbar onSearch={setQuery} page={page} onNavigatePage={setPage} />
        <div className="loading-screen">Loading movies…</div>
      </div>
    )
  }

  return (
    <div className="app">
      <Navbar onSearch={setQuery} page={page} onNavigatePage={setPage} />

      {page === 'recommender' ? (
        <RecommenderPage />
      ) : (
        <>
          {usingDemoData && (
            <div className="demo-banner">
              Showing demo data — backend or ML service isn't reachable. See BUILD_LOG.md to get
              the full stack running.
            </div>
          )}

          {!searchResults && <HeroCarousel movies={featured} onSelect={setSelected} />}

          <main className="rows-container">
            {searchResults ? (
              <MovieRow
                id="search-results"
                title={`Results for "${query}"`}
                movies={searchResults}
                onSelect={setSelected}
                likedIds={likedIds}
                onToggleLike={handleToggleLike}
              />
            ) : (
              <>
                <MovieRow
                  id="movies"
                  title="Trending Now"
                  movies={trending}
                  onSelect={setSelected}
                  likedIds={likedIds}
                  onToggleLike={handleToggleLike}
                />
                <MovieRow
                  id="recommended"
                  title={
                    likedMovies.length > 0
                      ? 'Recommended For You'
                      : 'Recommended (like a movie to personalize)'
                  }
                  movies={recommended}
                  onSelect={setSelected}
                  likedIds={likedIds}
                  onToggleLike={handleToggleLike}
                />
                <MovieRow
                  id="top-rated"
                  title="Top Rated"
                  movies={topRated}
                  onSelect={setSelected}
                  likedIds={likedIds}
                  onToggleLike={handleToggleLike}
                />
                {likedMovies.length > 0 && (
                  <MovieRow
                    id="liked"
                    title="Your Likes"
                    movies={likedMovies}
                    onSelect={setSelected}
                    likedIds={likedIds}
                    onToggleLike={handleToggleLike}
                  />
                )}
                {Object.entries(genreRows).map(([genre, list]) => (
                  <MovieRow
                    key={genre}
                    id="genres"
                    title={genre}
                    movies={list}
                    onSelect={setSelected}
                    likedIds={likedIds}
                    onToggleLike={handleToggleLike}
                  />
                ))}
              </>
            )}
          </main>

          <footer className="app-footer">
            <span>CineStream — portfolio project by Mithilesh A</span>
          </footer>
        </>
      )}

      {selected && (
        <MovieModal
          movie={selected}
          onClose={() => setSelected(null)}
          onSelect={setSelected}
          fallbackCatalog={fullCatalog}
          likedIds={likedIds}
          onToggleLike={handleToggleLike}
        />
      )}
    </div>
  )
}
