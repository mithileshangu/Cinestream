// Shaped to match TMDB's /movie/popular, /movie/{id}, /discover/movie response fields
// (title, overview, poster_path, backdrop_path, vote_average, release_date, genres, runtime)
// so swapping mock data for real fetch() calls later requires no component changes —
// see src/api/tmdb.js once a TMDB_API_KEY is available.

const PLACEHOLDER_POSTER = (title, bg = '18181f', fg = 'e63950') =>
  `https://placehold.co/500x750/${bg}/${fg}?text=${encodeURIComponent(title)}&font=roboto`

const PLACEHOLDER_BACKDROP = (title, bg = '0c0c12', fg = '2a2a35') =>
  `https://placehold.co/1600x900/${bg}/${fg}?text=${encodeURIComponent(title)}&font=roboto`

export const GENRES = [
  'Action', 'Adventure', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller', 'Fantasy', 'Animation',
]

export const movies = [
  {
    id: 1,
    title: 'Horizon Protocol',
    overview:
      'A rogue AI engineer races against a shadowy corporation to stop an algorithm that predicts — and causes — global market collapse.',
    genres: ['Sci-Fi', 'Thriller'],
    posterPath: PLACEHOLDER_POSTER('Horizon Protocol'),
    backdropPath: PLACEHOLDER_BACKDROP('Horizon Protocol'),
    voteAverage: 7.8,
    releaseDate: '2026-02-14',
    runtime: 128,
    quality: 'HD',
    featured: true,
  },
  {
    id: 2,
    title: 'Ashfall',
    overview:
      'When a dormant supervolcano awakens without warning, a small mountain town has six hours to evacuate before everything they know is buried.',
    genres: ['Drama', 'Thriller'],
    posterPath: PLACEHOLDER_POSTER('Ashfall'),
    backdropPath: PLACEHOLDER_BACKDROP('Ashfall'),
    voteAverage: 7.2,
    releaseDate: '2025-11-02',
    runtime: 141,
    quality: '1080P',
    featured: true,
  },
  {
    id: 3,
    title: 'The Cartographer',
    overview:
      'An expedition mapmaker discovers her charts are somehow redrawing the coastline itself — and something in the deep ocean is following the new lines.',
    genres: ['Fantasy', 'Adventure'],
    posterPath: PLACEHOLDER_POSTER('The Cartographer'),
    backdropPath: PLACEHOLDER_BACKDROP('The Cartographer'),
    voteAverage: 8.1,
    releaseDate: '2026-01-09',
    runtime: 116,
    quality: 'HD',
    featured: true,
  },
  {
    id: 4,
    title: 'Nightshift Diner',
    overview:
      'Six strangers stuck in a 24-hour diner during a blackout slowly realize none of them ended up there by accident.',
    genres: ['Thriller', 'Drama'],
    posterPath: PLACEHOLDER_POSTER('Nightshift Diner'),
    backdropPath: PLACEHOLDER_BACKDROP('Nightshift Diner'),
    voteAverage: 7.5,
    releaseDate: '2025-09-20',
    runtime: 102,
    quality: '1080P',
  },
  {
    id: 5,
    title: 'Paper Moons',
    overview:
      'A washed-up origami artist agrees to teach one final class — and finds his last student folding shapes that shouldn\u2019t be possible.',
    genres: ['Drama', 'Fantasy'],
    posterPath: PLACEHOLDER_POSTER('Paper Moons'),
    backdropPath: PLACEHOLDER_BACKDROP('Paper Moons'),
    voteAverage: 8.4,
    releaseDate: '2025-12-05',
    runtime: 98,
    quality: 'HD',
  },
  {
    id: 6,
    title: 'Redline Circuit',
    overview:
      'A disgraced street racer gets one shot at redemption: survive an underground circuit built by the people who ended her career.',
    genres: ['Action', 'Thriller'],
    posterPath: PLACEHOLDER_POSTER('Redline Circuit'),
    backdropPath: PLACEHOLDER_BACKDROP('Redline Circuit'),
    voteAverage: 6.9,
    releaseDate: '2026-03-01',
    runtime: 110,
    quality: 'CAM',
  },
  {
    id: 7,
    title: 'Glasswing',
    overview:
      'A translator hired for a routine diplomatic summit begins decoding messages that were never meant to be sent by a human.',
    genres: ['Sci-Fi', 'Drama'],
    posterPath: PLACEHOLDER_POSTER('Glasswing'),
    backdropPath: PLACEHOLDER_BACKDROP('Glasswing'),
    voteAverage: 8.0,
    releaseDate: '2025-10-11',
    runtime: 124,
    quality: 'HD',
  },
  {
    id: 8,
    title: 'The Understudy',
    overview:
      'A theater understudy finally gets her big break — right as the lead actress she replaced starts appearing in the audience every night.',
    genres: ['Thriller', 'Drama'],
    posterPath: PLACEHOLDER_POSTER('The Understudy'),
    backdropPath: PLACEHOLDER_BACKDROP('The Understudy'),
    voteAverage: 7.6,
    releaseDate: '2026-01-22',
    runtime: 107,
    quality: '1080P',
  },
  {
    id: 9,
    title: 'Comet Kids',
    overview:
      'Four kids build a treehouse observatory to track a comet — and accidentally discover it\u2019s slowing down to say hello.',
    genres: ['Animation', 'Adventure', 'Comedy'],
    posterPath: PLACEHOLDER_POSTER('Comet Kids'),
    backdropPath: PLACEHOLDER_BACKDROP('Comet Kids'),
    voteAverage: 8.6,
    releaseDate: '2025-07-18',
    runtime: 94,
    quality: 'HD',
  },
  {
    id: 10,
    title: 'Low Tide',
    overview:
      'Two estranged sisters return to their childhood coastal town to sell their late father\u2019s boat — and find out why he never sold it himself.',
    genres: ['Drama'],
    posterPath: PLACEHOLDER_POSTER('Low Tide'),
    backdropPath: PLACEHOLDER_BACKDROP('Low Tide'),
    voteAverage: 7.9,
    releaseDate: '2025-08-30',
    runtime: 112,
    quality: '1080P',
  },
  {
    id: 11,
    title: 'Static & Bone',
    overview:
      'A radio DJ broadcasting from an abandoned station starts receiving requests from listeners who stopped existing decades ago.',
    genres: ['Thriller', 'Fantasy'],
    posterPath: PLACEHOLDER_POSTER('Static & Bone'),
    backdropPath: PLACEHOLDER_BACKDROP('Static & Bone'),
    voteAverage: 7.3,
    releaseDate: '2025-10-31',
    runtime: 99,
    quality: 'CAM',
  },
  {
    id: 12,
    title: 'Field Notes',
    overview:
      'A burned-out wildlife biologist takes a solo posting to a remote research station — and finds someone else\u2019s field notes describing her exact routine, written years before she arrived.',
    genres: ['Thriller', 'Sci-Fi'],
    posterPath: PLACEHOLDER_POSTER('Field Notes'),
    backdropPath: PLACEHOLDER_BACKDROP('Field Notes'),
    voteAverage: 8.2,
    releaseDate: '2026-02-27',
    runtime: 119,
    quality: 'HD',
  },
]

export function getFeatured() {
  return movies.filter((m) => m.featured)
}

export function getByGenre(genre) {
  return movies.filter((m) => m.genres.includes(genre))
}

export function getById(id) {
  return movies.find((m) => m.id === Number(id))
}

// Placeholder "similar movies" logic until the real Python recommender is wired in —
// matches on shared genres, same shape the real /api/recommendations/movie/{id}
// endpoint will return (see BUILD_LOG.md).
export function getSimilar(id, limit = 6) {
  const source = getById(id)
  if (!source) return []
  return movies
    .filter((m) => m.id !== source.id)
    .map((m) => ({
      ...m,
      matchScore: m.genres.filter((g) => source.genres.includes(g)).length,
    }))
    .filter((m) => m.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
}
