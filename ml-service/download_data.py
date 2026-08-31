"""
Downloads the configured MovieLens dataset and extracts it into
ml-service/data/. The default is a GitHub-hosted mirror of the MovieLens
ml-latest-small archive so hosted builders are not dependent on the expired
TLS certificate currently served by files.grouplens.org. Set
MOVIELENS_DATA_URL to use another compatible dataset.

The default dataset includes movies.csv, ratings.csv, links.csv, and tags.csv.
The links.csv mapping is required for this project's poster/overview
enrichment (see MovieEnrichmentService on the backend).

The full ml-20m dataset can be selected with MOVIELENS_DATA_URL, but it is not
recommended for low-memory hosting because training requires substantially
more memory and build time.

Run this once before starting the ML service for the first time:
    python download_data.py

Source: https://grouplens.org/datasets/movielens/
Citation: F. Maxwell Harper and Joseph A. Konstan. 2015. The MovieLens
Datasets: History and Context. ACM Transactions on Interactive Intelligent
Systems (TiiS) 5, 4: 19:1-19:19.
"""

import os
import urllib.request
import zipfile
import shutil
import urllib.parse

DATA_URL = os.environ.get(
    "MOVIELENS_DATA_URL",
    "https://github.com/smanihwr/ml-latest-small/archive/refs/heads/master.zip",
)
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ZIP_NAME = os.path.basename(urllib.parse.urlparse(DATA_URL).path) or "movielens.zip"
ZIP_PATH = os.path.join(DATA_DIR, ZIP_NAME)

REQUIRED_FILES = ["movies.csv", "ratings.csv", "links.csv", "tags.csv"]


def already_downloaded():
    return all(os.path.exists(os.path.join(DATA_DIR, f)) for f in REQUIRED_FILES)


def find_and_move_required_files(search_root):
    """
    GroupLens zips have historically extracted into a folder matching the
    dataset name (e.g. ml-20m/), but that's not guaranteed to stay stable —
    so search for the required files instead of hardcoding a path, and move
    each one up into data/ directly.
    """
    found = {}
    for root, _, files in os.walk(search_root):
        for f in files:
            if f in REQUIRED_FILES and f not in found:
                found[f] = os.path.join(root, f)

    missing = [f for f in REQUIRED_FILES if f not in found]
    if missing:
        raise RuntimeError(
            f"Extracted the zip but couldn't find: {missing}. "
            f"The dataset's internal structure may have changed — check "
            f"{search_root} manually."
        )

    for name, src in found.items():
        shutil.move(src, os.path.join(DATA_DIR, name))


def main():
    if already_downloaded():
        print("MovieLens data already present in ml-service/data/ — skipping download.")
        return

    os.makedirs(DATA_DIR, exist_ok=True)

    if os.path.exists(ZIP_PATH):
        print(f"Found an existing {os.path.basename(ZIP_PATH)} in ml-service/data/ — skipping download, extracting it directly.")
    else:
        print(f"Downloading MovieLens dataset from {DATA_URL} ...")
        try:
            urllib.request.urlretrieve(DATA_URL, ZIP_PATH)
        except Exception as e:
            print(f"\nDataset download failed: {e}")
            print(
                "\nThis may be a network or certificate issue rather than a problem with "
                "the dataset. To retry with a manually downloaded archive —\n"
                f"  1. Open this URL in your browser: {DATA_URL}\n"
                f"  2. Save the file as exactly: {ZIP_PATH}\n"
                "  3. Run this script again — it will detect the file and extract it directly."
            )
            raise SystemExit(1)
        print("Download complete.")

    print("Extracting...")

    extract_tmp = os.path.join(DATA_DIR, "_extract_tmp")
    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        zf.extractall(extract_tmp)

    find_and_move_required_files(extract_tmp)

    shutil.rmtree(extract_tmp, ignore_errors=True)
    os.remove(ZIP_PATH)

    print("Done. movies.csv, ratings.csv, links.csv, tags.csv are in ml-service/data/")
    print("Note: the ML service's first startup will take longer than usual — it's")
    print("training TF-IDF + SVD models over the configured MovieLens dataset.")


if __name__ == "__main__":
    main()