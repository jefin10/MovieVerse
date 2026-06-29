import axios from 'axios';
import { env } from '../config/env.js';

// Thin TMDB client used as a fallback when a movie/poster is missing locally.
const client = axios.create({
  baseURL: env.tmdb.baseUrl,
  timeout: 10_000,
  headers: env.tmdb.bearer ? { Authorization: `Bearer ${env.tmdb.bearer}` } : {},
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
  imageUrl(path: string) {
    return path ? `${env.tmdb.imageBaseUrl}${path}` : '';
  },
  enabled() {
    return Boolean(env.tmdb.bearer || env.tmdb.apiKey);
  },
};
