# MovieVerse-Backend

Express + Prisma + TypeScript port of the Django backend. The AI/ML lives in a
separate Flask service (`../MovieverseAI/server`); this backend proxies to it.

## Stack
- Express 4, TypeScript (ESM), Prisma (PostgreSQL)
- JWT auth (httpOnly cookie + Bearer), bcrypt
- helmet, cors, morgan, zod, nodemailer (OTP reset), axios (TMDB + AI)

## Structure
```
prisma/schema.prisma     # models ported from Django
src/
  config/    env, prisma client
  middleware/ auth (JWT), error handler
  routes/    auth, movies, watchlist, ratings, recommendations, web, ai
  controllers/  one per route group (auth implemented; rest are TODO stubs)
  services/  tmdb, ai (Flask proxy)
  utils/     apiError, asyncHandler, serializeMovie
  app.ts server.ts
```

## Getting started
```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate         # or: prisma db pull  (adopt existing DB)
npm run dev
```

## Docker
```bash
docker compose up --build       # db + ai (flask) + backend
```

## Smoke test
With the dev server running and `db` up:
```bash
pwsh -File scripts/smoke-test.ps1
```

## Status
Fully implemented and smoke-tested end-to-end against Postgres + the Flask AI
service: auth (register/login/logout/check-username/validate-session/getEmail
and the full OTP reset flow), movies (Trending/Tinder/search/fetchMovieInfo/
poster/random-trailers), watchlist, ratings, recommendations (stored, from
ratings, temp-add), the public website catalog/search/detail, and the AI mood +
liked/disliked endpoints (which proxy to `../MovieverseAI/server`, with an
in-process signature-scoring fallback when the AI service is offline).
Endpoint paths mirror the original Django API.
