import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { posterUrl } from '../utils/serializeMovie.js';
import { notify } from './notification.service.js';
import { syncMovieProviders } from './provider.service.js';
import { buildForUser } from './recommendation.service.js';
import { tmdbService } from './tmdb.service.js';

const TICK_MS = 10 * 60 * 1000;
const USERS_PER_TICK = 100;
const MOVIES_PER_TICK = 25;
const PROVIDER_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const todayKey = (now: Date) => `daily:${now.toISOString().slice(0, 10)}`;

/** The first candidate they haven't been offered before, preferring their own services. */
async function chooseDailyPick(user: { id: number; region: string; providers: { providerId: number }[] }) {
  const past = await prisma.notification.findMany({
    where: { userId: user.id, type: 'daily_pick' },
    select: { data: true },
    orderBy: { createdAt: 'desc' },
    take: 60,
  });
  const offered = new Set(past.map((n) => (n.data as { movieId?: number }).movieId));
  const onlyProviders = user.providers.map((p) => p.providerId);

  const lists = [
    onlyProviders.length ? await buildForUser(user.id, 20, { onlyProviders, region: user.region }) : [],
    await buildForUser(user.id, 20),
  ];
  for (const list of lists) {
    const pick = list.find((m) => !offered.has(m.id));
    if (pick) return { movieId: pick.id, personal: true };
  }
  // No taste data yet: something highly rated gets them started.
  const fallback = await prisma.movie.findFirst({
    where: { id: { notIn: [...offered].filter((x): x is number => typeof x === 'number') } },
    orderBy: { imdbRating: 'desc' },
    select: { id: true },
  });
  return fallback ? { movieId: fallback.id, personal: false } : null;
}

/** Safe to run at any time: the dedupe key means a restart can't send it twice. */
export async function sendDailyPicks(now = new Date()) {
  if (now.getUTCHours() < env.dailyPickHourUtc) return 0;
  const dedupeKey = todayKey(now);
  const users = await prisma.user.findMany({
    where: { isActive: true, dailyPickEnabled: true, notifications: { none: { dedupeKey } } },
    select: { id: true, region: true, providers: { select: { providerId: true } } },
    take: USERS_PER_TICK,
  });
  let sent = 0;
  for (const user of users) {
    const pick = await chooseDailyPick(user);
    if (!pick) continue;
    const movie = await prisma.movie.findUnique({ where: { id: pick.movieId } });
    if (!movie) continue;
    const where = await prisma.movieProvider.findFirst({
      where: {
        movieId: movie.id,
        region: user.region,
        kind: 'flatrate',
        providerId: { in: user.providers.map((p) => p.providerId) },
      },
      include: { provider: true },
    });
    const why = pick.personal ? 'Picked for your taste.' : 'One of the highest-rated films we have.';
    const ok = await notify({
      userId: user.id,
      type: 'daily_pick',
      title: `Tonight's pick: ${movie.title}`,
      body: where ? `${why} Streaming on ${where.provider.name}.` : why,
      imageUrl: posterUrl(movie.posterUrl),
      data: { movieId: movie.id },
      dedupeKey,
    });
    if (ok) sent += 1;
  }
  return sent;
}

export async function syncProviders(now = new Date()) {
  if (!tmdbService.enabled()) return 0;
  const movies = await prisma.movie.findMany({
    where: {
      OR: [{ providersSyncedAt: null }, { providersSyncedAt: { lt: new Date(now.getTime() - PROVIDER_MAX_AGE_MS) } }],
    },
    orderBy: { providersSyncedAt: { sort: 'asc', nulls: 'first' } },
    take: MOVIES_PER_TICK,
  });
  let done = 0;
  for (const movie of movies) {
    try {
      await syncMovieProviders(movie);
      done += 1;
    } catch (err) {
      console.error(`[providers] ${movie.title}:`, (err as Error).message);
    }
  }
  return done;
}

let timer: NodeJS.Timeout | undefined;

async function tick() {
  await prisma.room.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch((e) => console.error('[rooms]', e.message));
  await syncProviders().catch((e) => console.error('[providers]', e.message));
  await sendDailyPicks().catch((e) => console.error('[daily-pick]', e.message));
}

export function startScheduler() {
  void tick();
  timer = setInterval(() => void tick(), TICK_MS);
  timer.unref();
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
}
