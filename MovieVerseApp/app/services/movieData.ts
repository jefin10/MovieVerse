import api from '../auth/api';
import { fetchWithCache, invalidateCache } from './cache';

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

export const getTinderMovies = async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}): Promise<AppMovie[]> => {
  return fetchWithCache<AppMovie[]>({
    key: DATA_CACHE_KEYS.tinder,
    ttlMs: CACHE_TTL.tinder,
    forceRefresh,
    fetcher: async () => {
      const response = await api.get('api/TinderMovies/');
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
      const response = await api.get('api/watchlist/', {
        params: { username },
      });

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
        const response = await api.get('api/recommendations/from-ratings/', {
          params: { username },
        });

        const recommendations = response?.data?.recommendations;
        const items = Array.isArray(recommendations) ? (recommendations as AppMovie[]) : [];
        return items.map(normalizeMovie);
      } catch {
        const fallbackResponse = await api.post('api/recommendations/', { username });
        const fallbackItems = Array.isArray(fallbackResponse.data)
          ? (fallbackResponse.data as AppMovie[])
          : [];
        return fallbackItems.map(normalizeMovie);
      }
    },
  });
};

export const prefetchTabData = async (username: string): Promise<void> => {
  await Promise.allSettled([
    getTrendingMovies({ forceRefresh: true }),
    getRecommendations(username, { forceRefresh: true }),
    getWatchlist(username, { forceRefresh: true }),
    getTinderMovies({ forceRefresh: true }),
  ]);
};

export const invalidateWatchlistCache = async (username: string): Promise<void> => {
  await invalidateCache(DATA_CACHE_KEYS.watchlist(username));
};
