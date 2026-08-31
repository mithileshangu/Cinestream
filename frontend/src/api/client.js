import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 })

export async function fetchAllMovies() {
  const { data } = await client.get('/api/movies')
  return data
}

export async function fetchTrending() {
  const { data } = await client.get('/api/movies/trending')
  return data
}

export async function fetchByGenre(genre) {
  const { data } = await client.get(`/api/movies/genre/${encodeURIComponent(genre)}`)
  return data
}

export async function fetchTopRated(limit = 20) {
  const { data } = await client.get('/api/movies/top-rated', { params: { limit } })
  return data
}

export async function searchMovies(query) {
  const { data } = await client.get('/api/movies/search', { params: { q: query } })
  return data
}

export async function fetchMovie(id) {
  const { data } = await client.get(`/api/movies/${id}`)
  return data
}

export async function fetchSimilar(movieId, topN = 8) {
  const { data } = await client.get(`/api/recommendations/movie/${movieId}`, { params: { topN } })
  return data
}

export async function fetchForProfile(likedIds, topN = 8) {
  const { data } = await client.get('/api/recommendations/profile', {
    params: { likedIds: likedIds.join(','), topN },
  })
  return data
}

// --- Lite endpoints for the standalone Recommender page — no TMDB posters,
// just plain title/genre/rating data straight from the ML service. ---

export async function searchMoviesLite(query) {
  const { data } = await client.get('/api/movies/search/lite', { params: { q: query } })
  return data
}

export async function fetchSimilarLite(movieId, topN = 10) {
  const { data } = await client.get(`/api/recommendations/lite/movie/${movieId}`, { params: { topN } })
  return data
}

export async function fetchUserLikes(userId) {
  const { data } = await client.get(`/api/users/${userId}/likes`)
  return data
}

export async function likeMovie(userId, movieId) {
  await client.post(`/api/users/${userId}/likes/${movieId}`)
}

export async function unlikeMovie(userId, movieId) {
  await client.delete(`/api/users/${userId}/likes/${movieId}`)
}
