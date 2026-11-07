# MovieVerse-Backend

Express + Prisma + TypeScript port of the Django backend. The AI/ML lives in a
separate Flask service (`../MovieverseAI/server`); this backend proxies to it.

## Stack
- Express 4, TypeScript (ESM), Prisma (PostgreSQL)
- Email OTP sign-in (no passwords), JWT sessions (httpOnly cookie + Bearer), bcrypt for code hashes
- helmet, cors, morgan, zod, nodemailer (sign-in codes), axios (TMDB + AI)

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

## Sign-in
`POST /api/auth/send-otp {email}` emails a 6-digit code. `POST /api/auth/verify-otp
{email, otp}` returns a session token, or `needs_username` + `signup_token` for a
new email, which `POST /api/auth/complete-signup {username, signup_token}` turns
into an account.

`OTP_ESCAPE_CODE`, when set, is a code that works for **any email**, so anyone
holding it can sign in as anyone. It is a stopgap while mail is being set up:
unset it to turn it off. Each use is logged as `[auth] escape code used`.

## Engagement features
- **Swipes** (`POST /api/swipes`) feed recommendations along with ratings and the
  watchlist. Dislikes lower the score of similar movies.
- **Where to watch** comes from TMDB/JustWatch and needs a TMDB key. A background job
  refreshes up to 25 movies every 10 minutes and alerts people whose watchlist movie
  reaches a service they pay for.
- **Tonight's Pick** goes out daily after `DAILY_PICK_HOUR_UTC`. A unique key on each
  notification means restarts can't send duplicates.
- **Friends** (`/api/follow`, `/api/friends`, `/api/users`) with a 0-100 taste match.
- **Watch Together** (`/api/rooms`, live events on `/ws/rooms`). Connections are held
  in memory, so run one API instance, and the HTTPS proxy must forward WebSocket
  upgrades (nginx: `proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";`).
- **Push** goes through Expo. Everything also lands in the in-app inbox, which works
  without any push setup.

Tests: `npm test`.

## Catalog
`npm run db:ingest` loads `prisma/data/movies.json` (661 movies with genres).
Safe to re-run; it never touches user ratings. In a container: `docker compose exec backend npm run db:ingest:prod`.

## Production
`deploy/deploy.sh user@host path/to/key.pem [--ingest]` builds the images here and
runs them on the server; see the top of that script. Settings are in `.env` on the
server; `deploy/env.production.example` lists them.

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
service: auth (send-otp/verify-otp/complete-signup/logout/check-username/
validate-session/getEmail), movies (Trending/Tinder/search/fetchMovieInfo/
poster/random-trailers), watchlist, ratings, recommendations (stored, from
ratings, temp-add), the public website catalog/search/detail, and the AI mood +
liked/disliked endpoints (which proxy to `../MovieverseAI/server`, with an
in-process signature-scoring fallback when the AI service is offline).
Endpoint paths mirror the original Django API.
