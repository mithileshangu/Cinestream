"""
Flask microservice wrapping the MovieLens-backed hybrid recommender.
Loads the full dataset once (from cache if available — see model_cache.py).
"""

import os
from flask import Flask, jsonify, request
from model_cache import load_or_build

app = Flask(__name__)

_model = None


def get_model():
    global _model
    if _model is None:
        _model = load_or_build()
        print("Recommender ready.")
    return _model


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/movies", methods=["GET"])
def movies():
    limit = int(request.args.get("limit", 100))
    offset = int(request.args.get("offset", 0))
    return jsonify(get_model().list_movies(limit=limit, offset=offset))


@app.route("/movies/top-rated", methods=["GET"])
def top_rated():
    limit = int(request.args.get("limit", 200))
    return jsonify(get_model().top_rated(limit=limit))


@app.route("/movies/most-rated", methods=["GET"])
def most_rated():
    limit = int(request.args.get("limit", 200))
    return jsonify(get_model().most_rated(limit=limit))


@app.route("/movies/search", methods=["GET"])
def search():
    q = request.args.get("q", "")
    return jsonify(get_model().search(q))


@app.route("/movies/genre/<genre>", methods=["GET"])
def by_genre(genre):
    return jsonify(get_model().by_genre(genre))


@app.route("/movies/<int:movie_id>", methods=["GET"])
def get_movie(movie_id):
    movie = get_model().get_movie(movie_id)
    if movie is None:
        return jsonify({"error": "not found"}), 404
    return jsonify(movie)


@app.route("/recommend/movie/<int:movie_id>", methods=["GET"])
def recommend_by_movie(movie_id):
    top_n = int(request.args.get("top_n", 10))
    results = get_model().recommend(movie_id, top_n=top_n)
    return jsonify({"movieId": movie_id, "recommendations": results})


@app.route("/recommend/profile", methods=["GET"])
def recommend_by_profile():
    liked_raw = request.args.get("likedIds", "")
    liked_ids = [int(x) for x in liked_raw.split(",") if x.strip().isdigit()]
    top_n = int(request.args.get("top_n", 10))
    results = get_model().recommend_for_profile(liked_ids, top_n=top_n)
    return jsonify({"likedIds": liked_ids, "recommendations": results})


if __name__ == "__main__":
    get_model()  # load/train at startup, not on first request
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
