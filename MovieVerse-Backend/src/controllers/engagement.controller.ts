import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { broadcast, isConnected } from '../realtime/rooms.js';
import { notify } from '../services/notification.service.js';
import { syncMovieProviders } from '../services/provider.service.js';
import { tasteMatch } from '../services/taste.service.js';
import { tmdbService } from '../services/tmdb.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sample } from '../utils/sample.js';
import { movieInclude, posterUrl, serializeMovie } from '../utils/serializeMovie.js';

const LOGO_BASE = 'https://image.tmdb.org/t/p/w92';
const PROVIDER_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const ROOM_HOURS = 24;
const ROOM_DECK_SIZE = 40;
const ROOM_MAX_MEMBERS = 6;
// No 0/O or 1/I/L: people read these codes out to each other.
const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw ApiError.badRequest('Invalid request', result.error.flatten());
  return result.data;
}

const idParam = (raw: unknown) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw ApiError.badRequest('Invalid id');
  return id;
};

const logo = (path: string) => (path ? `${LOGO_BASE}${path}` : '');

// ── Swipes ────────────────────────────────────────────────────────────

const swipeSchema = z.object({ movie_id: z.number().int().positive(), liked: z.boolean() });

// POST /api/swipes — saved in one step with the watchlist add, and safe to replay
// from a phone's offline queue.
export const swipe = asyncHandler(async (req, res) => {
  const { movie_id: movieId, liked } = parse(swipeSchema, req.body);
  const userId = req.user!.id;
  const movie = await prisma.movie.findUnique({ where: { id: movieId }, select: { id: true } });
  if (!movie) throw ApiError.notFound('Movie not found');

  await prisma.$transaction(async (tx) => {
    await tx.swipe.upsert({
      where: { userId_movieId: { userId, movieId } },
      update: { liked },
      create: { userId, movieId, liked },
    });
    if (liked && !(await tx.watchlist.findFirst({ where: { userId, movieId } }))) {
      await tx.watchlist.create({ data: { userId, movieId } });
    }
  });
  res.json({ message: 'Saved' });
});

// ── First-run setup ───────────────────────────────────────────────────

// Films most people have an opinion on, across genres, so a few taps say a lot.
const STARTER_TITLES = [
  'The Dark Knight', 'Inception', 'Toy Story', 'The Godfather', 'Titanic', 'Interstellar',
  'Pulp Fiction', 'Up', 'The Matrix', 'Joker', 'The Shining', 'Coco',
  'Fight Club', 'Gladiator', 'The Truman Show', 'Whiplash', 'Get Out', 'Die Hard',
  'Goodfellas', 'The Grand Budapest Hotel', 'Se7en', 'Casablanca', 'Groundhog Day', 'Blade Runner 2049',
];

// GET /api/onboarding/movies
export const starterMovies = asyncHandler(async (_req, res) => {
  const movies = await prisma.movie.findMany({
    where: { title: { in: STARTER_TITLES } },
    select: { id: true, title: true, posterUrl: true },
  });
  const order = new Map(STARTER_TITLES.map((t, i) => [t, i]));
  res.json(
    movies
      .filter((m) => m.posterUrl)
      .sort((a, b) => order.get(a.title)! - order.get(b.title)!)
      .map((m) => ({ id: m.id, title: m.title, poster_url: posterUrl(m.posterUrl) })),
  );
});

const favoritesSchema = z.object({ movie_ids: z.array(z.number().int().positive()).min(1).max(50) });

// POST /api/onboarding/favorites — films they already love teach their taste, but
// they've seen them, so unlike a swipe these stay off the watchlist.
export const saveFavorites = asyncHandler(async (req, res) => {
  const { movie_ids: ids } = parse(favoritesSchema, req.body);
  const known = await prisma.movie.findMany({ where: { id: { in: ids } }, select: { id: true } });
  await prisma.swipe.createMany({
    data: known.map((m) => ({ userId: req.user!.id, movieId: m.id, liked: true })),
    skipDuplicates: true,
  });
  res.json({ message: 'Saved' });
});

// ── Where to watch ────────────────────────────────────────────────────

// GET /api/movie/:movieId/providers
export const movieProviders = asyncHandler(async (req, res) => {
  const movieId = idParam(req.params.movieId);
  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) throw ApiError.notFound('Movie not found');

  const stale = !movie.providersSyncedAt || Date.now() - movie.providersSyncedAt.getTime() > PROVIDER_MAX_AGE_MS;
  if (stale && tmdbService.enabled()) {
    // Old data beats no data, so a TMDB hiccup shouldn't fail the page.
    await syncMovieProviders(movie).catch((e) => console.error('[providers]', e.message));
  }

  const me = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { region: true, providers: { select: { providerId: true } } },
  });
  const region = me?.region ?? 'IN';
  const mine = new Set(me?.providers.map((p) => p.providerId));
  const rows = await prisma.movieProvider.findMany({ where: { movieId, region }, include: { provider: true } });
  const shape = (kind: string) =>
    rows
      .filter((r) => r.kind === kind)
      .map((r) => ({ id: r.providerId, name: r.provider.name, logo_url: logo(r.provider.logoPath), mine: mine.has(r.providerId) }))
      .sort((a, b) => Number(b.mine) - Number(a.mine));

  res.json({
    region,
    link: rows[0]?.link ?? '',
    stream: shape('flatrate'),
    rent: shape('rent'),
    buy: shape('buy'),
    available: tmdbService.enabled() || rows.length > 0,
  });
});

// GET /api/providers — the services a person can choose from in their country.
export const listProviders = asyncHandler(async (req, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { region: true } });
  const region = me?.region ?? 'IN';
  if (tmdbService.enabled()) {
    try {
      const { results = [] } = await tmdbService.listProviders(region);
      const top = [...results].sort((a, b) => (a.display_priority ?? 99) - (b.display_priority ?? 99)).slice(0, 24);
      await Promise.all(
        top.map((p) =>
          prisma.watchProvider.upsert({
            where: { id: p.provider_id },
            update: { name: p.provider_name, logoPath: p.logo_path ?? '' },
            create: { id: p.provider_id, name: p.provider_name, logoPath: p.logo_path ?? '' },
          }),
        ),
      );
      return res.json(top.map((p) => ({ id: p.provider_id, name: p.provider_name, logo_url: logo(p.logo_path ?? '') })));
    } catch (e) {
      console.error('[providers]', (e as Error).message);
    }
  }
  const stored = await prisma.watchProvider.findMany({ orderBy: { name: 'asc' } });
  res.json(stored.map((p) => ({ id: p.id, name: p.name, logo_url: logo(p.logoPath) })));
});

// ── Preferences ───────────────────────────────────────────────────────

const preferencesShape = async (userId: number) => {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      region: true,
      dailyPickEnabled: true,
      providerAlertsEnabled: true,
      socialAlertsEnabled: true,
      providers: { select: { providerId: true } },
    },
  });
  if (!me) throw ApiError.notFound('User not found');
  return {
    region: me.region,
    regions: env.providerRegions,
    daily_pick: me.dailyPickEnabled,
    provider_alerts: me.providerAlertsEnabled,
    social_alerts: me.socialAlertsEnabled,
    providers: me.providers.map((p) => p.providerId),
  };
};

export const getPreferences = asyncHandler(async (req, res) => {
  res.json(await preferencesShape(req.user!.id));
});

const preferencesSchema = z.object({
  region: z.string().optional(),
  daily_pick: z.boolean().optional(),
  provider_alerts: z.boolean().optional(),
  social_alerts: z.boolean().optional(),
  providers: z.array(z.number().int().positive()).max(50).optional(),
});

// PATCH /api/preferences
export const updatePreferences = asyncHandler(async (req, res) => {
  const body = parse(preferencesSchema, req.body);
  const userId = req.user!.id;
  if (body.region && !env.providerRegions.includes(body.region)) throw ApiError.badRequest('Unsupported region');

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        region: body.region,
        dailyPickEnabled: body.daily_pick,
        providerAlertsEnabled: body.provider_alerts,
        socialAlertsEnabled: body.social_alerts,
      },
    });
    if (body.providers) {
      const known = await tx.watchProvider.findMany({ where: { id: { in: body.providers } }, select: { id: true } });
      await tx.userProvider.deleteMany({ where: { userId } });
      await tx.userProvider.createMany({ data: known.map((p) => ({ userId, providerId: p.id })) });
    }
  });
  res.json(await preferencesShape(userId));
});

// ── Friends and taste match ───────────────────────────────────────────

const findUser = async (username: unknown) => {
  const user = await prisma.user.findUnique({
    where: { username: String(username) },
    select: { id: true, username: true, socialAlertsEnabled: true, isActive: true },
  });
  if (!user || !user.isActive) throw ApiError.notFound('User not found');
  return user;
};

// GET /api/users?q= — never searches or returns email addresses.
export const searchUsers = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (q.length < 2) return res.json([]);
  const me = req.user!.id;
  const users = await prisma.user.findMany({
    where: { username: { contains: q, mode: 'insensitive' }, isActive: true, id: { not: me } },
    select: { username: true, followers: { where: { followerId: me }, select: { followerId: true } } },
    take: 20,
    orderBy: { username: 'asc' },
  });
  res.json(users.map((u) => ({ username: u.username, is_following: u.followers.length > 0 })));
});

// GET /api/users/:username — profile, taste match and recent ratings.
export const userProfile = asyncHandler(async (req, res) => {
  const me = req.user!.id;
  const user = await findUser(req.params.username);
  const [followers, following, iFollow, match, ratings] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    prisma.follow.findUnique({ where: { followerId_followingId: { followerId: me, followingId: user.id } } }),
    user.id === me ? null : tasteMatch(me, user.id),
    prisma.rating.findMany({
      where: { userId: user.id },
      include: { movie: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ]);
  const bothLiked = match?.bothLiked.length
    ? await prisma.movie.findMany({ where: { id: { in: match.bothLiked.slice(0, 10) } } })
    : [];
  const brief = (m: { id: number; title: string; posterUrl: string }) => ({ id: m.id, title: m.title, poster_url: posterUrl(m.posterUrl) });
  res.json({
    username: user.username,
    is_me: user.id === me,
    is_following: !!iFollow,
    followers,
    following,
    match: match ? { score: match.score, shared: match.shared } : null,
    both_liked: bothLiked.map(brief),
    ratings: ratings.map((r) => ({ ...brief(r.movie), rating: r.rating })),
  });
});

// POST /api/follow/:username
export const follow = asyncHandler(async (req, res) => {
  const me = req.user!;
  const target = await findUser(req.params.username);
  if (target.id === me.id) throw ApiError.badRequest("You can't follow yourself.");
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: me.id, followingId: target.id } },
    update: {},
    create: { followerId: me.id, followingId: target.id },
  });
  if (target.socialAlertsEnabled) {
    const match = await tasteMatch(target.id, me.id);
    await notify({
      userId: target.id,
      type: 'follow',
      title: `${me.username} followed you`,
      body: match.score !== null ? `You're a ${match.score}% taste match.` : 'See what they’re watching.',
      data: { username: me.username },
      dedupeKey: `follow:${me.id}`,
    });
  }
  res.json({ message: 'Following' });
});

// DELETE /api/follow/:username
export const unfollow = asyncHandler(async (req, res) => {
  const target = await findUser(req.params.username);
  await prisma.follow.deleteMany({ where: { followerId: req.user!.id, followingId: target.id } });
  res.json({ message: 'Unfollowed' });
});

// GET /api/friends — who you follow, with taste match, plus their latest ratings.
export const friends = asyncHandler(async (req, res) => {
  const me = req.user!.id;
  const following = await prisma.follow.findMany({
    where: { followerId: me },
    select: { following: { select: { id: true, username: true } } },
  });
  const followerCount = await prisma.follow.count({ where: { followingId: me } });
  const ids = following.map((f) => f.following.id);
  const people = await Promise.all(
    following.map(async ({ following: u }) => {
      const match = await tasteMatch(me, u.id);
      return { username: u.username, score: match.score, shared: match.shared };
    }),
  );
  const activity = await prisma.rating.findMany({
    where: { userId: { in: ids } },
    include: { movie: true, user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  res.json({
    followers: followerCount,
    following: people.sort((a, b) => (b.score ?? -1) - (a.score ?? -1)),
    activity: activity.map((r) => ({
      username: r.user.username,
      movie_id: r.movieId,
      title: r.movie.title,
      poster_url: posterUrl(r.movie.posterUrl),
      rating: r.rating,
      at: r.createdAt,
    })),
  });
});

// ── Notifications ─────────────────────────────────────────────────────

export const listNotifications = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  res.json({
    unread,
    items: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      image_url: n.imageUrl,
      data: n.data,
      read: n.readAt !== null,
      at: n.createdAt,
    })),
  });
});

// POST /api/notifications/read — body { id } for one, or nothing for all.
export const markNotificationsRead = asyncHandler(async (req, res) => {
  const id = req.body?.id ? idParam(req.body.id) : undefined;
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, readAt: null, ...(id ? { id } : {}) },
    data: { readAt: new Date() },
  });
  res.json({ message: 'Done' });
});

const pushTokenSchema = z.object({ token: z.string().min(10).max(255), platform: z.string().max(20).optional() });

// POST /api/push-tokens — a device belongs to whoever signed in on it last.
export const registerPushToken = asyncHandler(async (req, res) => {
  const { token, platform = '' } = parse(pushTokenSchema, req.body);
  await prisma.pushToken.upsert({
    where: { token },
    update: { userId: req.user!.id, platform },
    create: { token, userId: req.user!.id, platform },
  });
  res.json({ message: 'Registered' });
});

// DELETE /api/push-tokens — called at logout so the old account stops notifying this phone.
export const removePushToken = asyncHandler(async (req, res) => {
  const { token } = parse(pushTokenSchema, req.body);
  await prisma.pushToken.deleteMany({ where: { token, userId: req.user!.id } });
  res.json({ message: 'Removed' });
});

// ── Watch Together ────────────────────────────────────────────────────

const roomCode = () => Array.from({ length: 6 }, () => ROOM_ALPHABET[crypto.randomInt(ROOM_ALPHABET.length)]).join('');

const loadRoom = async (rawCode: unknown) => {
  const room = await prisma.room.findUnique({
    where: { code: String(rawCode).toUpperCase() },
    include: { members: { include: { user: { select: { id: true, username: true } } } } },
  });
  if (!room || room.expiresAt <= new Date()) throw ApiError.notFound('That room code has expired or doesn’t exist.');
  return room;
};

async function roomState(room: Awaited<ReturnType<typeof loadRoom>>, userId: number) {
  const [movies, swipes, saved] = await Promise.all([
    prisma.movie.findMany({ where: { id: { in: room.deck } }, include: movieInclude }),
    prisma.roomSwipe.findMany({ where: { roomId: room.id } }),
    prisma.roomMatch.findMany({ where: { roomId: room.id }, orderBy: { matchedAt: 'asc' } }),
  ]);
  const byId = new Map(movies.map((m) => [m.id, m]));
  const memberIds = room.members.map((m) => m.userId);
  const likes = new Map<number, Set<number>>();
  for (const s of swipes) {
    if (!s.liked) continue;
    if (!likes.has(s.movieId)) likes.set(s.movieId, new Set());
    likes.get(s.movieId)!.add(s.userId);
  }
  // Saved matches stay matches when someone joins later. Rooms from before
  // matches were saved fall back to "everyone in the room liked it".
  const live = memberIds.length < 2 ? [] : room.deck.filter((id) => memberIds.every((m) => likes.get(id)?.has(m)));
  const matches = [...new Set([...saved.map((m) => m.movieId), ...live])];

  return {
    code: room.code,
    expires_at: room.expiresAt,
    is_host: room.hostId === userId,
    deck_size: room.deck.length,
    members: room.members.map((m) => ({
      username: m.user.username,
      swiped: swipes.filter((s) => s.userId === m.userId).length,
    })),
    deck: room.deck.flatMap((id) => (byId.has(id) ? [serializeMovie(byId.get(id)!)] : [])),
    my_swipes: swipes.filter((s) => s.userId === userId).map((s) => s.movieId),
    matches: matches.flatMap((id) => (byId.has(id) ? [serializeMovie(byId.get(id)!)] : [])),
  };
}

// POST /api/rooms
export const createRoom = asyncHandler(async (req, res) => {
  const pool = await prisma.movie.findMany({ orderBy: { popularity: 'desc' }, select: { id: true }, take: 300 });
  if (!pool.length) throw ApiError.notFound('No movies in the catalog yet.');
  const deck = sample(pool, ROOM_DECK_SIZE).map((m) => m.id);
  const expiresAt = new Date(Date.now() + ROOM_HOURS * 60 * 60 * 1000);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = roomCode();
    if (await prisma.room.findUnique({ where: { code } })) continue;
    await prisma.room.create({
      data: { code, hostId: req.user!.id, deck, expiresAt, members: { create: { userId: req.user!.id } } },
    });
    return res.status(201).json(await roomState(await loadRoom(code), req.user!.id));
  }
  throw new ApiError(503, 'Could not create a room. Please try again.');
});

// POST /api/rooms/:code/join
export const joinRoom = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const room = await loadRoom(req.params.code);
  if (!room.members.some((m) => m.userId === userId)) {
    if (room.members.length >= ROOM_MAX_MEMBERS) throw ApiError.badRequest('That room is full.');
    await prisma.roomMember.create({ data: { roomId: room.id, userId } });
    broadcast(room.id, { type: 'member_joined', username: req.user!.username });
  }
  res.json(await roomState(await loadRoom(req.params.code), userId));
});

const memberRoom = async (rawCode: unknown, userId: number) => {
  const room = await loadRoom(rawCode);
  if (!room.members.some((m) => m.userId === userId)) throw ApiError.forbidden();
  return room;
};

// GET /api/rooms/:code — also how a reconnecting client catches up.
export const getRoom = asyncHandler(async (req, res) => {
  const room = await memberRoom(req.params.code, req.user!.id);
  res.json(await roomState(room, req.user!.id));
});

// POST /api/rooms/:code/swipes
export const roomSwipe = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { movie_id: movieId, liked } = parse(swipeSchema, req.body);
  const room = await memberRoom(req.params.code, userId);
  if (!room.deck.includes(movieId)) throw ApiError.badRequest('That movie isn’t in this room.');

  const key = { roomId_userId_movieId: { roomId: room.id, userId, movieId } };
  const before = await prisma.roomSwipe.findUnique({ where: key });
  await prisma.roomSwipe.upsert({
    where: key,
    update: { liked },
    create: { roomId: room.id, userId, movieId, liked },
  });
  broadcast(room.id, { type: 'progress' });

  let matched = false;
  if (liked && !before?.liked && room.members.length >= 2) {
    const likes = await prisma.roomSwipe.count({ where: { roomId: room.id, movieId, liked: true } });
    // Saving the match is what claims it: if two final likes race, only one
    // insert wins, so the match is announced once.
    const claimed =
      likes === room.members.length &&
      (await prisma.roomMatch
        .create({ data: { roomId: room.id, movieId } })
        .then(() => true)
        .catch((err) => {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return false;
          throw err;
        }));
    if (claimed) {
      matched = true;
      const movie = await prisma.movie.findUnique({ where: { id: movieId }, include: movieInclude });
      broadcast(room.id, { type: 'match', movie: serializeMovie(movie!) });
      // People still in the room see it live; everyone else gets a notification.
      for (const member of room.members) {
        if (isConnected(room.id, member.userId) || member.userId === userId) continue;
        await notify({
          userId: member.userId,
          type: 'room_match',
          title: `It's a match: ${movie!.title}`,
          body: 'Everyone in your Watch Together room liked it.',
          imageUrl: posterUrl(movie!.posterUrl),
          data: { movieId, roomCode: room.code },
          dedupeKey: `room:${room.id}:${movieId}`,
        });
      }
    }
  }
  res.json({ matched });
});
