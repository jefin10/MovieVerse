import type { Country, Genre, Language, Movie } from '@prisma/client';
import { env } from '../config/env.js';

/** Shared include so movie relations are always loaded for serialization. */
export const movieInclude = {
  genres: true,
  originalLanguage: true,
  spokenLanguages: true,
  originCountries: true,
  productionCountries: true,
} as const;

export type MovieWithRelations = Movie & {
  genres?: Genre[];
  originalLanguage?: Language | null;
  spokenLanguages?: Language[];
  originCountries?: Country[];
  productionCountries?: Country[];
};

function absolutePoster(posterUrl: string): string {
  if (!posterUrl) return '';
  if (posterUrl.startsWith('http://') || posterUrl.startsWith('https://')) return posterUrl;
  return `${env.tmdb.imageBaseUrl}${posterUrl}`;
}

/** Mirrors Django MovieSerializer. BigInt fields are cast to Number for JSON. */
export function serializeMovie(m: MovieWithRelations) {
  return {
    id: m.id,
    tmdb_id: m.tmdbId,
    title: m.title,
    original_title: m.originalTitle,
    description: m.description,
    release_date: m.releaseDate,
    director: m.director,
    star1: m.star1,
    star2: m.star2,
    poster_url: absolutePoster(m.posterUrl),
    backdrop_url: m.backdropUrl,
    genres: m.genres?.map((g) => g.name) ?? [],
    original_language: m.originalLanguage
      ? { code: m.originalLanguage.iso6391, name: m.originalLanguage.name || m.originalLanguage.englishName }
      : null,
    spoken_languages:
      m.spokenLanguages?.map((l) => ({ code: l.iso6391, name: l.name || l.englishName })) ?? [],
    origin_countries: m.originCountries?.map((c) => ({ code: c.iso31661, name: c.name })) ?? [],
    production_countries:
      m.productionCountries?.map((c) => ({ code: c.iso31661, name: c.name })) ?? [],
    imdb_rating: m.imdbRating,
    our_rating: m.ourRating,
    tmdb_vote_average: m.tmdbVoteAverage,
    vote_count: m.voteCount,
    runtime: m.runtime,
    status: m.status,
    tagline: m.tagline,
    homepage: m.homepage,
    imdb_id: m.imdbId,
    trailer_key: m.trailerKey,
    trailer_url: m.trailerUrl,
    trailer_name: m.trailerName,
    budget: Number(m.budget),
    revenue: Number(m.revenue),
  };
}

/** Light projection used by the website catalog grid. */
export function serializeCatalog(m: MovieWithRelations) {
  return {
    id: m.id,
    title: m.title,
    poster_url: m.posterUrl,
    release_date: m.releaseDate,
    imdb_rating: m.imdbRating,
    tmdb_vote_average: m.tmdbVoteAverage,
    genres: m.genres?.map((g) => g.name) ?? [],
  };
}
