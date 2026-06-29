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

## Status
Auth (register/login/logout) is wired end-to-end as the reference. All other
controllers return `501` with a TODO marker — port logic from the Django
`api/views.py` and `users/views.py`. Endpoint paths mirror the originals.
