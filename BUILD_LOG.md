# Build Log

Internal notes on the architecture and deployment constraints. For the setup
story, see `README.md`.

## Current architecture

1. The React/Vite frontend provides the Netflix-style browser and standalone
   recommender page.
2. The Spring Boot backend is the only API consumed by the frontend. It
   orchestrates the ML service, TMDB enrichment, and anonymous likes.
3. The Flask ML service loads MovieLens data, trains the hybrid content +
   collaborative recommender, and serves movie and recommendation endpoints.
4. TMDB supplies poster, backdrop, and overview data only. MovieLens supplies
   the catalog and real user-rating signal.

## Deployment profile

The default dataset is `ml-latest-small`, selected because it contains real
ratings, tags, movie metadata, and `links.csv` while keeping Docker builds and
runtime memory practical for a free Render service. Set
`MOVIELENS_DATA_URL` to a compatible larger dataset only when the ML service
has enough resources.

The ML Docker image downloads the configured dataset and trains the model
during the image build. The generated data and cache are intentionally not
stored in GitHub. This avoids repository size limits and avoids retraining
after a Render service restarts.

## Known limitations

- MovieLens benchmark data is historical, so newer movies may not appear in
  the rating catalog.
- The ML service trains during the Docker build. The default small dataset is
  intended for low-memory hosting; the full 20M dataset needs more resources.
- TMDB enrichment is lazy and only eagerly primes the most-rated movies.
- Anonymous likes are tied to browser local storage and the backend's H2
  database. They are not durable across backend restarts.
- The lite recommender page exposes similarity scores, not probabilities.

## Publishing checklist

1. Confirm `zipFile.zip`, dataset CSVs, and model cache files are not tracked.
2. Keep `backend/src/main/resources/application-local.properties` local and
   ignored. Configure `TMDB_API_KEY` as a Render secret.
3. Create the three Render services from `render.yaml`.
4. Confirm the frontend's `VITE_API_BASE_URL` points to the backend service.