import axios from 'axios';
import { env } from '../config/env.js';

export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
  display_priority?: number;
}

export interface TmdbRegionProviders {
  link?: string;
  flatrate?: TmdbProvider[];
  rent?: TmdbProvider[];
  buy?: TmdbProvider[];
}

// Thin TMDB client used as a fallback when a movie/poster is missing locally.
const client = axios.create({
  baseURL: env.tmdb.baseUrl,
  timeout: 10_000,
  headers: env.tmdb.bearer ? { Authorization: `Bearer ${env.tmdb.bearer}` } : {},
  params: !env.tmdb.bearer && env.tmdb.apiKey ? { api_key: env.tmdb.apiKey } : {},
});

export const tmdbService = {
  async searchMovie(query: string) {
    const { data } = await client.get('/search/movie', { params: { query } });
    return data;
  },
  async getMovie(id: number) {
    const { data } = await client.get(`/movie/${id}`);
    return data;
  },
  async getCredits(id: number) {
    const { data } = await client.get(`/movie/${id}/credits`);
    return data as { crew?: { job?: string; name?: string }[]; cast?: { name?: string }[] };
  },
  /** Where a movie can be watched, per country. Data comes from JustWatch via TMDB. */
  async getWatchProviders(id: number) {
    const { data } = await client.get(`/movie/${id}/watch/providers`);
    return data as { results?: Record<string, TmdbRegionProviders> };
  },
  async listProviders(region: string) {
    const { data } = await client.get('/watch/providers/movie', { params: { watch_region: region } });
    return data as { results?: TmdbProvider[] };
  },
  imageUrl(path: string) {
    return path ? `${env.tmdb.imageBaseUrl}${path}` : '';
  },
  enabled() {
    return Boolean(env.tmdb.bearer || env.tmdb.apiKey);
  },
};
