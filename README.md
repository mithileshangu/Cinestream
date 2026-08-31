# 🎬 CineStream

**CineStream** is a Netflix-style movie browser powered by a **hybrid recommendation system**.

It combines:
- **Collaborative filtering** using real MovieLens user ratings
- **Content-based filtering** using movie genres and user tags
- **TMDB** for poster, backdrop, and overview data

TMDB is used only for presentation/enrichment — it does **not** determine the recommendations.

## 🌐 Live Demo

🚀 **[Launch CineStream](https://moviestream-frontend.onrender.com/)**

> Hosted on Render. The free instance may take a few seconds to wake up after inactivity.

---

## ✨ Features

- 🎯 **Hybrid recommendations** — SVD collaborative filtering + TF-IDF content similarity
- 🍿 **Netflix-style UI** — hero carousel, movie rows, search, and movie details
- ❤️ **Personalized recommendations** — recommendations update from movies you like
- 🔍 **Standalone recommender** — search a movie and view similar titles directly
- 🖼️ **Lazy TMDB enrichment** — poster and overview data is fetched only when needed and cached
- ⚡ **Model caching** — the ML service caches the trained model to reduce startup time
- 🐳 **Docker support** — all three services can be run with Docker Compose

---

## 🧠 How Recommendations Work

```text
User searches or likes a movie
            │
            ▼
     Spring Boot Backend
            │
            ▼
      Python ML Service
            │
      ┌─────┴─────┐
      ▼           ▼
 Content       Collaborative
 Similarity      Filtering
 TF-IDF           SVD
      └─────┬─────┘
            ▼
       Hybrid Ranking
            │
            ▼
     Movie IDs returned
            │
            ▼
   TMDB poster/overview
      added and cached
            │
            ▼
    Recommendations shown
```

The system uses MovieLens as the recommendation data source and TMDB only to enrich the movies displayed in the application.

### Data Sources

- **MovieLens** — user ratings, movie metadata, tags, and TMDB links
- **TMDB** — posters, backdrops, and overview text

MovieLens's `links.csv` connects MovieLens movie IDs with TMDB IDs.

---

## 🏗️ Architecture

```text
┌──────────────┐       REST       ┌────────────────┐       REST       ┌─────────────────┐
│    React     │ ───────────────▶ │  Spring Boot   │ ───────────────▶ │  Python Flask   │
│   Frontend   │ ◀─────────────── │    Backend     │ ◀─────────────── │   ML Service    │
└──────────────┘                  └───────┬────────┘                  └─────────────────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  TMDB API   │
                                   │ Enrichment  │
                                   └─────────────┘
```

- **Frontend:** React application for browsing and interacting with movies.
- **Backend:** Spring Boot API that connects the frontend, ML service, and TMDB.
- **ML service:** Flask service responsible for recommendation logic and MovieLens data.
- **TMDB:** Provides visual/movie description data only.

---

## 🖥️ Screenshots

### Home
![CineStream Home](docs/screenshots/Home.png)

### Search
![Search Results](docs/screenshots/Search.png)

### Movie Details
![Movie Details](docs/screenshots/MovieDetails.png)

### Recommender
![Recommender Page](docs/screenshots/Recommender.png)

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Axios

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- H2

### Machine Learning
- Python
- Flask
- pandas
- scikit-learn
- TF-IDF
- Truncated SVD
- Cosine similarity
- MovieLens dataset

### External API
- TMDB API

### Deployment
- Docker
- Docker Compose
- Render

---

## 📁 Project Structure

```text
movie-recommender/
├── ml-service/
│   ├── app.py
│   ├── recommender.py
│   ├── model_cache.py
│   ├── download_data.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── data/
│
├── backend/
│   ├── src/main/java/com/movierecommender/backend/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── model/
│   │   ├── dto/
│   │   └── config/
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application-local.properties
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   └── data/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── render.yaml
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Java 17+
- Maven
- Node.js 18+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/movie-recommender.git
cd movie-recommender
```

### 2. Download MovieLens data

```bash
cd ml-service
python download_data.py
```

The dataset is downloaded into `ml-service/data/`.

### 3. Configure TMDB

Create:

```text
backend/src/main/resources/application-local.properties
```

Add:

```properties
tmdb.api.key=YOUR_KEY_HERE
```

Keep this file out of Git. It should remain in `.gitignore`.

### 4. Start the ML service

```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

Runs on:

```text
http://localhost:5001
```

### 5. Start the backend

From the `backend` directory:

**Windows PowerShell**
```powershell
$env:SPRING_PROFILES_ACTIVE="local"
mvn spring-boot:run
```

**macOS/Linux**
```bash
export SPRING_PROFILES_ACTIVE=local
mvn spring-boot:run
```

Runs on:

```text
http://localhost:8080
```

### 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on:

```text
http://localhost:5173
```

---

## 🐳 Docker

Make sure Docker Desktop is installed.

```bash
docker-compose up --build
```

Then open:

```text
http://localhost:3000
```

The Docker setup runs the ML service, backend, and frontend together.

---

## 📡 API Overview

### Movies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/movies/trending?limit=` | Popular movies |
| GET | `/api/movies/top-rated?limit=` | Top-rated movies |
| GET | `/api/movies/genre/{genre}` | Movies by genre |
| GET | `/api/movies/search?q=` | Search movies |
| GET | `/api/movies/{id}` | Get movie details |

### Recommendations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/recommendations/movie/{id}?topN=` | Similar movies |
| GET | `/api/recommendations/profile?likedIds=1,2,3&topN=` | Personalized recommendations |

### Likes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users/{userId}/likes` | Get liked movies |
| POST | `/api/users/{userId}/likes/{movieId}` | Like a movie |
| DELETE | `/api/users/{userId}/likes/{movieId}` | Unlike a movie |

---

## 🔄 Model Cache

The ML service stores its trained model in:

```text
ml-service/data/model_cache.pkl
```

To force retraining:

```bash
cd ml-service
rm data/model_cache.pkl
python app.py
```

On Windows:

```powershell
del data\model_cache.pkl
python app.py
```

---

## 📄 License & Dataset

This project is released under the **MIT License**. See [LICENSE](./LICENSE).

The project uses the **MovieLens dataset** by GroupLens. Refer to the dataset's terms before redistributing or reusing the dataset.

---

## 👨‍💻 Author

**Mithilesh A**

Software Developer

---

⭐ If you find CineStream useful, consider giving the repository a star.

**CineStream — a Netflix-style movie browser powered by a hybrid recommendation system.**
