<div align="center">
  <img src="media/MVV.png" alt="MovieVerse logo" width="140" />

  <h1>MovieVerse</h1>
  <p><strong>Discover what to watch next with AI mood intelligence, swipe-native discovery, and personalized ranking.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/build-passing-2EA043?style=for-the-badge" alt="Build Status" />
    <img src="https://img.shields.io/badge/license-MIT-0A7E3F?style=for-the-badge" alt="License" />
    <img src="https://img.shields.io/github/languages/top/jefin10/MovieVerse?style=for-the-badge" alt="Top Language" />
    <img src="https://img.shields.io/github/last-commit/jefin10/MovieVerse?style=for-the-badge" alt="Last Commit" />
  </p>

  <h2>Demo</h2>

  
  <p>
    <a href="https://movieverse.jefin.xyz"><strong>View Live Demo →</strong></a>
  </p>

  <p>
    Website: <a href="https://movieverse.jefin.xyz">movieverse.jefin.xyz</a> •
    Backend API: <a href="https://movieversebackend.jefin.xyz">movieversebackend.jefin.xyz</a> •
    Mobile APK: <a href="https://github.com/jefin10/MovieVerse/releases/download/v1.0.0/movieverse.apk">Download</a>
  </p>

  <p>
    <img src="media/Screenshot_20260418-215929_MovieVerseApp.jpg" alt="MovieVerse home feed screenshot" width="19%" />
    <img src="media/Screenshot_20260418-215936_MovieVerseApp.jpg" alt="MovieVerse mood discovery screenshot" width="19%" />
    <img src="media/Screenshot_20260418-215951_MovieVerseApp.jpg" alt="MovieVerse movie details screenshot" width="19%" />
    <img src="media/Screenshot_20260418-220332_MovieVerseApp.jpg" alt="MovieVerse watchlist screenshot" width="19%" />
  </p>
</div>

## About
MovieVerse helps users decide what to watch faster with AI mood recommendations, swipe-based discovery, and personalized ranking. It combines a public web catalog for quick browsing with a mobile app for full authenticated features.

## Tech Stack
| Technology | Why It Was Chosen |
| --- | --- |
| React Native + Expo | Fast cross-platform mobile development with type safety. |
| Next.js  | Responsive, SEO-friendly web catalog with quick UI iteration. |
| Django 5.2 + DRF | Secure, scalable REST API with mature backend tooling. |
| PostgreSQL | Reliable relational storage for users, ratings, and watchlists. |
| scikit-learn +  Naive Bayes | Lightweight and fast mood-to-genre prediction pipeline. |
| Cosine Similarity | Powers content-based and rating-based recommendation ranking. |
| Docker + Nginx + AWS EC2 | Reproducible deployment with HTTPS and reverse proxying. |
| AsyncStorage + Browser Cache | Improves perceived performance with local caching. |
| TMDB API | Supplies rich movie metadata and posters. |

## Key Features
- 🎯 Accelerate discovery with hybrid recommendations that blend ratings, content similarity, and mood classification.
- 😊 Translate mood text into genre-aware picks using TF-IDF plus Multinomial Naive Bayes.
- 👉 Swipe through movies Tinder-style and add to watchlist instantly with haptic and visual feedback.
- 🔐 Secure accounts with registration, login, logout, CSRF protection, and OTP-based password recovery.
- ⭐ Learn user taste continuously through 1-5 star ratings that improve recommendation quality over time.
- ⚡ Optimize latency using dual-layer caching, request deduplication, and stale-while-revalidate behavior.
- 🌐 Serve both audiences with a public web catalog and a fully personalized mobile application.
- 🐳 Deploy reliably through Dockerized services, PostgreSQL persistence, and HTTPS-ready infrastructure.

## Getting Started
### Prerequisites
~~~text
Node.js 20+
npm 10+
Python 3.11+
Docker + Docker Compose
Expo Go (for mobile testing)
~~~

### Installation
1. Clone the repository.
~~~bash
git clone https://github.com/jefin10/MovieVerse.git
cd MovieVerse
~~~

2. Start backend services.
~~~bash
cd MovieVerseBackend
cp .env.example .env
docker compose up --build -d
cd ..
~~~

3. Run web app.
~~~bash
cd movieverse-website
npm install
npm run dev
~~~

4. Run mobile app.
~~~bash
cd ../MovieVerseApp
npm install
npx expo start
~~~

## Usage
### Example 1: Get AI mood-based recommendations
~~~bash
curl -X POST "https://movieversebackend.jefin.xyz/ai/recommend/" \
  -H "Content-Type: application/json" \
  -d '{"mood":"I want something emotional but uplifting"}'
~~~

### Example 2: Use cached movie fetching on mobile
~~~typescript
import axios from "axios";
import { fetchWithCache } from "../app/services/cache";

const api = axios.create({
  baseURL: "https://movieversebackend.jefin.xyz",
  withCredentials: true,
});

export async function getTrendingMovies() {
  return fetchWithCache({
    key: "trending:v1",
    ttlMs: 5 * 60 * 1000,
    staleIfError: true,
    fetcher: async () => {
      const { data } = await api.get("/api/Trending/");
      return data;
    },
  });
}
~~~

## Architecture
~~~text
MovieVerse/
├─ MovieVerseApp/        # Expo + React Native client (auth, swipe, mood, watchlist)
├─ movieverse-website/   # Next.js web catalog for public browsing
├─ MovieVerseBackend/    # Django API, PostgreSQL integration, Docker deployment files
│  └─ backend/           # Django apps: api, users, ai, and project settings
├─ MovieverseAI/         # Model training scripts, datasets, and feature generation
└─ media/                # README assets (logo and screenshots)
~~~

## Roadmap
- ✅ Ship mobile authentication flow with OTP-based password recovery.
- ✅ Launch mood-to-genre recommendation endpoint in production.
- ✅ Build custom PanResponder swiper with duplicate prevention.
- ✅ Release public web catalog with pagination and search.
- 🔲 Add social watchlists and collaborative list sharing.
- 🔲 Introduce observability dashboards for recommendation quality and API latency.

## Contributing
1. Fork the repository and clone your fork locally.
2. Create a feature branch, commit focused changes, and push.
3. Open a pull request with context, screenshots, and test notes.

## License + Contact
License: MIT

GitHub: https://github.com/jefin10

LinkedIn: https://www.linkedin.com/in/jefin10/

Built for production-grade movie discovery across web and mobile.
