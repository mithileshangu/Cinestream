"""
Hybrid movie recommendation engine backed by a MovieLens dataset.

Combines:
  1. Content-based filtering: TF-IDF over each movie's genres + any
     user-applied tags, cosine similarity computed on demand.
  2. Collaborative filtering: item latent factors from the real
     user-rating matrix via truncated SVD, cosine similarity computed on
     demand — this is genuine collaborative filtering on real user
     behavior, not a popularity proxy.

IMPORTANT — why similarity is computed on demand, not precomputed:
At this scale (27,278 movies), a full pairwise similarity matrix between
every movie and every other movie would be roughly 27,278 x 27,278 numbers
— about 6GB of RAM for a single matrix, and expensive to compute even
once. That was fine for a few hundred test movies; it doesn't scale to
the real dataset. Instead, this only ever computes similarity for the ONE
movie being queried against the rest — a single row, not the whole grid —
which is the standard approach for item-item similarity at this size.

Training (loading the CSVs, building the TF-IDF matrix, fitting the SVD model)
still takes real time on a cold start, so the trained artifacts are cached to
disk (see model_cache.py) and reloaded instantly on subsequent restarts unless
the source data changes.
"""

import os
import re
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from scipy.sparse import csr_matrix

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def _normalize(arr):
    arr = np.asarray(arr, dtype=float)
    rng = arr.max() - arr.min()
    if rng == 0:
        return np.zeros_like(arr)
    return (arr - arr.min()) / rng


class HybridRecommender:
    def __init__(self, data_dir=None):
        data_dir = data_dir or DATA_DIR
        self.movies = pd.read_csv(os.path.join(data_dir, "movies.csv"))
        self.ratings = pd.read_csv(os.path.join(data_dir, "ratings.csv"))
        self.links = pd.read_csv(os.path.join(data_dir, "links.csv"))

        tags_path = os.path.join(data_dir, "tags.csv")
        self.tags = pd.read_csv(tags_path) if os.path.exists(tags_path) else None

        self.movie_id_to_idx = {mid: i for i, mid in enumerate(self.movies["movieId"])}
        self.idx_to_movie_id = {i: mid for mid, i in self.movie_id_to_idx.items()}

        self._build_content_model()
        self._build_collaborative_model()
        self._build_popularity()
        self._build_tmdb_lookup()

    # ---------- Content-based (genres + user tags) ----------
    def _build_content_model(self):
        genres_text = self.movies["genres"].fillna("").str.replace("|", " ", regex=False)

        tags_by_movie = {}
        if self.tags is not None:
            grouped = self.tags.groupby("movieId")["tag"].apply(
                lambda t: " ".join(str(x) for x in t)
            )
            tags_by_movie = grouped.to_dict()

        corpus = [
            genres_text.iloc[i] + " " + tags_by_movie.get(mid, "")
            for i, mid in enumerate(self.movies["movieId"])
        ]

        tfidf = TfidfVectorizer(stop_words="english", max_features=20000)
        # Kept as the raw movies x vocab matrix — NOT turned into a movies x
        # movies similarity matrix. See module docstring for why.
        self.tfidf_matrix = tfidf.fit_transform(corpus)

    # ---------- Collaborative (item latent factors via truncated SVD on real ratings) ----------
    def _build_collaborative_model(self):
        user_cat = self.ratings["userId"].astype("category")
        movie_cat = self.ratings["movieId"].astype("category")

        self.cf_movie_id_to_col = {
            mid: i for i, mid in enumerate(movie_cat.cat.categories)
        }

        matrix = csr_matrix(
            (self.ratings["rating"], (user_cat.cat.codes, movie_cat.cat.codes)),
            shape=(len(user_cat.cat.categories), len(movie_cat.cat.categories)),
        )

        n_components = min(50, matrix.shape[1] - 1)
        svd = TruncatedSVD(n_components=max(n_components, 1), random_state=42)
        # movies x latent_features — kept as-is, NOT expanded into a movies x
        # movies similarity matrix.
        self.item_factors = svd.fit_transform(matrix.T)

    def _build_popularity(self):
        counts = self.ratings.groupby("movieId")["rating"].count()
        means = self.ratings.groupby("movieId")["rating"].mean()
        self.rating_count = counts.to_dict()
        self.rating_mean = means.to_dict()

    def _build_tmdb_lookup(self):
        self.movie_id_to_tmdb_id = dict(
            zip(self.links["movieId"], self.links["tmdbId"])
        )

    def _tmdb_id(self, movie_id):
        val = self.movie_id_to_tmdb_id.get(movie_id)
        if val is None or pd.isna(val):
            return None
        return int(val)

    def _movie_payload(self, idx, score=None):
        row = self.movies.iloc[idx]
        movie_id = int(row["movieId"])
        payload = {
            "id": movie_id,
            "title": row["title"],
            "genres": row["genres"].split("|") if isinstance(row["genres"], str) else [],
            "tmdbId": self._tmdb_id(movie_id),
            "ratingCount": int(self.rating_count.get(movie_id, 0)),
            "ratingMean": round(float(self.rating_mean.get(movie_id, 0)), 2),
        }
        if score is not None:
            payload["score"] = round(float(score), 4)
        return payload

    # ---------- On-demand similarity (the actual fix) ----------
    def _content_scores_for(self, idx):
        """Cosine similarity of ONE movie against all movies — a single
        row, computed on demand. Never materializes the full grid."""
        query_vec = self.tfidf_matrix[idx]
        return cosine_similarity(query_vec, self.tfidf_matrix).flatten()

    def _cf_scores_for(self, movie_id):
        """Same idea for collaborative filtering — one row against all
        item latent factors, not a precomputed grid."""
        scores = np.zeros(len(self.movies))
        if movie_id not in self.cf_movie_id_to_col:
            return scores
        col = self.cf_movie_id_to_col[movie_id]
        query_vec = self.item_factors[col : col + 1]

        # Only movies present in the ratings data have latent factors —
        # build a small lookup once rather than looping per call.
        if not hasattr(self, "_cf_col_to_movie_idx"):
            self._cf_col_to_movie_idx = {
                col: self.movie_id_to_idx[mid]
                for mid, col in self.cf_movie_id_to_col.items()
                if mid in self.movie_id_to_idx
            }

        sims = cosine_similarity(query_vec, self.item_factors).flatten()
        for cf_col, movie_idx in self._cf_col_to_movie_idx.items():
            scores[movie_idx] = sims[cf_col]
        return scores

    # ---------- Public API ----------
    def get_movie(self, movie_id):
        if movie_id not in self.movie_id_to_idx:
            return None
        return self._movie_payload(self.movie_id_to_idx[movie_id])

    def list_movies(self, limit=100, offset=0):
        idxs = range(offset, min(offset + limit, len(self.movies)))
        return [self._movie_payload(i) for i in idxs]

    def top_rated(self, limit=200, min_ratings=20):
        """Movies with enough real ratings to be trustworthy, ranked by
        average rating. Used to pick which movies are worth eagerly
        enriching with TMDB poster data for browsing."""
        eligible = [
            mid for mid, count in self.rating_count.items() if count >= min_ratings
        ]
        eligible.sort(key=lambda mid: self.rating_mean.get(mid, 0), reverse=True)
        return [
            self._movie_payload(self.movie_id_to_idx[mid])
            for mid in eligible[:limit]
            if mid in self.movie_id_to_idx
        ]

    def most_rated(self, limit=200):
        """Movies with the most ratings — a real popularity signal from
        actual user behavior, used for the 'Trending' row."""
        ranked = sorted(self.rating_count.items(), key=lambda x: x[1], reverse=True)
        return [
            self._movie_payload(self.movie_id_to_idx[mid])
            for mid, _ in ranked[:limit]
            if mid in self.movie_id_to_idx
        ]

    def search(self, query, limit=20):
        # Normalize punctuation on both sides before matching — otherwise a
        # search for "spider man" never matches a title like "Spider-Man
        # (2002)", since a hyphen and a space aren't the same character to
        # a plain substring search.
        normalized_query = re.sub(r"[^a-z0-9]+", " ", query.lower()).strip()
        if not normalized_query:
            return []
        normalized_titles = self.movies["title"].str.lower().str.replace(
            r"[^a-z0-9]+", " ", regex=True
        )
        matches = self.movies[normalized_titles.str.contains(normalized_query, na=False, regex=False)]
        return [self._movie_payload(self.movie_id_to_idx[mid]) for mid in matches["movieId"].head(limit)]

    def by_genre(self, genre, limit=100):
        matches = self.movies[
            self.movies["genres"].str.contains(genre, case=False, na=False)
        ]
        return [self._movie_payload(self.movie_id_to_idx[mid]) for mid in matches["movieId"].head(limit)]

    def recommend(self, movie_id, top_n=10, content_weight=0.5):
        """Movies similar to one movie — content + collaborative hybrid,
        computed on demand for just this one movie (see class docstring)."""
        if movie_id not in self.movie_id_to_idx:
            return []

        idx = self.movie_id_to_idx[movie_id]
        content_scores = self._content_scores_for(idx)
        cf_scores = self._cf_scores_for(movie_id)

        hybrid = content_weight * _normalize(content_scores) + (1 - content_weight) * _normalize(cf_scores)
        ranked = np.argsort(hybrid)[::-1]
        ranked = [i for i in ranked if i != idx][:top_n]
        return [self._movie_payload(i, hybrid[i]) for i in ranked]

    def recommend_for_profile(self, liked_ids, top_n=10, content_weight=0.5):
        """Aggregate recommendations across a set of liked movies."""
        if not liked_ids:
            return []
        scores = {}
        for liked_id in liked_ids:
            for rec in self.recommend(liked_id, top_n=top_n * 3, content_weight=content_weight):
                scores[rec["id"]] = max(scores.get(rec["id"], 0), rec["score"])

        liked_set = set(liked_ids)
        ranked = sorted(
            (item for item in scores.items() if item[0] not in liked_set),
            key=lambda x: x[1],
            reverse=True,
        )[:top_n]
        return [
            self._movie_payload(self.movie_id_to_idx[mid], score)
            for mid, score in ranked
            if mid in self.movie_id_to_idx
        ]
