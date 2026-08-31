FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Download the configured MovieLens dataset at build time so the service does
# not depend on a writable filesystem or a cold-start download.
RUN python download_data.py

# Pre-train and cache the model at build time. The default small dataset keeps
# this compatible with low-memory hosting; the full dataset needs more RAM.
RUN python -c "from model_cache import load_or_build; load_or_build()"

EXPOSE 5001

# Long timeout on first-ever request just in case the cache needs rebuilding
# for any reason (e.g. dataset changed after image build).
CMD ["sh", "-c", "gunicorn -b 0.0.0.0:${PORT:-5001} app:app --timeout 180"]
