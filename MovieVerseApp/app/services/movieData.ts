import api from '../auth/api';
import { Image as ExpoImage } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithCache, invalidateCache, peekCache, writeCache } from './cache';
import { dropQueued, sendOrQueue } from './outbox';

export interface AppMovie {
  id: number;
  title: string;
  description?: string;
  poster_url?: string;
  genres?: string[];
  [key: string]: unknown;
}

export interface WatchlistItem {
  id: number;
  movie_id: number;
  title: string;
  poster_url: string | null;
  genres?: string[];
  description?: string;
  added_on?: string;
  [key: string]: unknown;
}

const CACHE_TTL = {
  trending: 2 * 60 * 1000,
  recommendations: 3 * 60 * 1000,
  watchlist: 60 * 1000,
  tinder: 90 * 1000,
};

const buildTmdbPosterUrl = (posterPath: string, size: 'w500' | 'original' = 'w500'): string => {
  return `https://image.tmdb.org/t/p/${size}${posterPath.startsWith('/') ? posterPath : `/${posterPath}`}`;
};

const ensurePosterUrl = (url?: string | null): string => {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return buildTmdbPosterUrl(url, 'w500');
};

const normalizeMovie = (movie: AppMovie): AppMovie => ({
  ...movie,
  poster_url: ensurePosterUrl(movie.poster_url),
});

const normalizeWatchlistItem = (item: WatchlistItem): WatchlistItem => ({
  ...item,
  poster_url: item.poster_url ? ensurePosterUrl(item.poster_url) : null,
});

export const DATA_CACHE_KEYS = {
  trending: 'home:trending',
  tinder: 'tinder:movies',
  recommendations: (username: string) => `home:recommendations:${username}`,
  watchlist: (username: string) => `watchlist:${username}`,
};

export const getTrendingMovies = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}): Promise<AppMovie[]> => {
  return fetchWithCache<AppMovie[]>({
    key: DATA_CACHE_KEYS.trending,
    ttlMs: CACHE_TTL.trending,
    forceRefresh,
    fetcher: async () => {
      const response = await api.get('api/Trending/');
      const items = Array.isArray(response.data) ? (response.data as AppMovie[]) : [];
      return items.map(normalizeMovie);
    },
  });
};

export const getTinderMovies = async (
  { forceRefresh = false, onlyMine = false }: { forceRefresh?: boolean; onlyMine?: boolean } = {},
): Promise<AppMovie[]> => {
  return fetchWithCache<AppMovie[]>({
    key: onlyMine ? `${DATA_CACHE_KEYS.tinder}:mine` : DATA_CACHE_KEYS.tinder,
    ttlMs: CACHE_TTL.tinder,
    forceRefresh,
    fetcher: async () => {
      const response = await api.get('api/TinderMovies/', { params: onlyMine ? { only_mine: 1 } : {} });
      const items = Array.isArray(response.data) ? (response.data as AppMovie[]) : [];
      return items.map(normalizeMovie);
    },
  });
};

export const getWatchlist = async (
  username: string,
  { forceRefresh = false }: { forceRefresh?: boolean } = {}
): Promise<WatchlistItem[]> => {
  return fetchWithCache<WatchlistItem[]>({
    key: DATA_CACHE_KEYS.watchlist(username),
    ttlMs: CACHE_TTL.watchlist,
    forceRefresh,
    fetcher: async () => {
      const response = await api.get('api/watchlist/');

      const items = Array.isArray(response.data) ? (response.data as WatchlistItem[]) : [];
      return items.map(normalizeWatchlistItem);
    },
  });
};

export const getRecommendations = async (
  username: string,
  { forceRefresh = false }: { forceRefresh?: boolean } = {}
): Promise<AppMovie[]> => {
  return fetchWithCache<AppMovie[]>({
    key: DATA_CACHE_KEYS.recommendations(username),
    ttlMs: CACHE_TTL.recommendations,
    forceRefresh,
    fetcher: async () => {
      try {
        const response = await api.get('api/recommendations/from-ratings/');

        const recommendations = response?.data?.recommendations;
        const items = Array.isArray(recommendations) ? (recommendations as AppMovie[]) : [];
        return items.map(normalizeMovie);
      } catch {
        const fallbackResponse = await api.post('api/recommendations/', {});
        const fallbackItems = Array.isArray(fallbackResponse.data)
          ? (fallbackResponse.data as AppMovie[])
          : [];
        return fallbackItems.map(normalizeMovie);
      }
    },
  });
};

export const prefetchTabData = async (username: string): Promise<void> => {
  const [, , watchlist] = await Promise.allSettled([
    getTrendingMovies({ forceRefresh: true }),
    getRecommendations(username, { forceRefresh: true }),
    getWatchlist(username, { forceRefresh: true }),
    getTinderMovies({ forceRefresh: true }),
  ]);
  if (watchlist.status === 'fulfilled') void saveWatchlistForOffline(watchlist.value);
};

/** Re-reads everything after reconnecting, so screens show what the queue just sent. */
export const refreshOfflineData = async (): Promise<void> => {
  const username = await AsyncStorage.getItem('username');
  if (username) await prefetchTabData(username);
};

const DETAILS_TTL = 7 * 24 * 60 * 60 * 1000;

export const getMovieDetails = (movieId: number | string) =>
  fetchWithCache<any>({
    key: `movie:${movieId}:details`,
    ttlMs: DETAILS_TTL,
    fetcher: async () => (await api.get(`api/fetchMovieInfo/${movieId}`)).data,
  });

/** Keeps each watchlist movie's page and poster on the phone, ready for no signal. */
export const saveWatchlistForOffline = async (items: WatchlistItem[]): Promise<void> => {
  const posters = items.map((i) => i.poster_url).filter(Boolean) as string[];
  if (posters.length) await ExpoImage.prefetch(posters, 'disk').catch(() => false);
  for (const item of items) {
    if (item.movie_id > 0) await getMovieDetails(item.movie_id).catch(() => null);
  }
};

// Offline-added watchlist rows have no server id yet, so they get a negative one.
const isLocalId = (id: number) => id < 0;

export const addToWatchlistSafe = async (username: string, movie: AppMovie): Promise<number | null> => {
  const { queued, data } = await sendOrQueue({ method: 'post', url: 'api/watchlist/add/', body: { movie_id: movie.id } });
  const key = DATA_CACHE_KEYS.watchlist(username);
  if (!queued) {
    await invalidateCache(key);
    return data?.id ?? null;
  }
  const id = -movie.id;
  const current = (await peekCache<WatchlistItem[]>(key)) ?? [];
  if (!current.some((i) => i.movie_id === movie.id)) {
    const row: WatchlistItem = { ...movie, id, movie_id: movie.id, poster_url: movie.poster_url ?? null, added_on: new Date().toISOString() };
    await writeCache(key, [row, ...current], CACHE_TTL.watchlist);
  }
  return id;
};

export const removeFromWatchlistSafe = async (username: string, item: { id: number; movie_id?: number }): Promise<void> => {
  const key = DATA_CACHE_KEYS.watchlist(username);
  if (isLocalId(item.id)) {
    const movieId = -item.id;
    await dropQueued((q) => q.url === 'api/watchlist/add/' && q.body?.movie_id === movieId);
    await dropQueued((q) => q.url === 'api/swipes/' && q.body?.movie_id === movieId);
  } else {
    await sendOrQueue({ method: 'delete', url: `api/watchlist/remove/${item.id}/` });
  }
  const current = (await peekCache<WatchlistItem[]>(key)) ?? [];
  await writeCache(key, current.filter((i) => i.id !== item.id), CACHE_TTL.watchlist);
};

/** Saves a swipe; a right swipe also adds to the watchlist on the server. */
export const recordSwipe = async (username: string | null, movie: AppMovie, liked: boolean): Promise<void> => {
  const { queued } = await sendOrQueue({ method: 'post', url: 'api/swipes/', body: { movie_id: movie.id, liked } });
  for (const key of [DATA_CACHE_KEYS.tinder, `${DATA_CACHE_KEYS.tinder}:mine`]) {
    const deck = await peekCache<AppMovie[]>(key);
    if (deck) await writeCache(key, deck.filter((m) => m.id !== movie.id), CACHE_TTL.tinder);
  }
  if (!username) return;
  await invalidateCache(DATA_CACHE_KEYS.recommendations(username)).catch(() => {});
  const watchlistKey = DATA_CACHE_KEYS.watchlist(username);
  if (!liked) return;
  if (!queued) {
    await invalidateCache(watchlistKey);
    return;
  }
  const current = (await peekCache<WatchlistItem[]>(watchlistKey)) ?? [];
  if (!current.some((i) => i.movie_id === movie.id)) {
    const row: WatchlistItem = { ...movie, id: -movie.id, movie_id: movie.id, poster_url: movie.poster_url ?? null, added_on: new Date().toISOString() };
    await writeCache(watchlistKey, [row, ...current], CACHE_TTL.watchlist);
  }
};

export const invalidateWatchlistCache = async (username: string): Promise<void> => {
  await invalidateCache(DATA_CACHE_KEYS.watchlist(username));
};
