"""
Caches the trained HybridRecommender to disk so restarting the ML service
doesn't mean retraining from the raw CSVs every time.

The cache is invalidated automatically if movies.csv, ratings.csv,
links.csv, or tags.csv change (checked via modification time), so editing
or re-downloading the dataset always retrains correctly on the next start.
"""

import os
import pickle

from recommender import HybridRecommender, DATA_DIR

CACHE_PATH = os.path.join(DATA_DIR, "model_cache.pkl")
SOURCE_FILES = ["movies.csv", "ratings.csv", "links.csv", "tags.csv"]


def _source_mtime():
    """Latest modification time across all source data files — used to
    detect if the cache is stale."""
    latest = 0
    for f in SOURCE_FILES:
        path = os.path.join(DATA_DIR, f)
        if os.path.exists(path):
            latest = max(latest, os.path.getmtime(path))
    return latest


def load_or_build():
    """Returns a ready-to-use HybridRecommender, from cache if valid,
    otherwise by training from scratch (and caching the result)."""
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, "rb") as f:
                cached = pickle.load(f)
            if cached.get("source_mtime") == _source_mtime():
                print("Loaded trained recommender from cache — skipped retraining.")
                return cached["model"]
            else:
                print("Dataset has changed since the cache was built — retraining.")
        except Exception as e:
            print(f"Could not load model cache ({e}) — retraining from scratch.")

    print("Training recommender from raw MovieLens data (this only happens once)...")
    model = HybridRecommender()

    try:
        with open(CACHE_PATH, "wb") as f:
            pickle.dump({"model": model, "source_mtime": _source_mtime()}, f)
        print(f"Cached trained model to {CACHE_PATH} — future restarts will be fast.")
    except Exception as e:
        print(f"Warning: could not write model cache ({e}). Will retrain next restart too.")

    return model
