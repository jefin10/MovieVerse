import type { Movie, Genre } from '@prisma/client';

type MovieWithGenres = Movie & { genres?: Genre[] };

/** Mirrors Django MovieSerializer output shape for client compatibility. */
export function serializeMovie(m: MovieWithGenres) {
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
    poster_url: m.posterUrl,
    backdrop_url: m.backdropUrl,
    genres: m.genres?.map((g) => g.name) ?? [],
    imdb_rating: m.imdbRating,
    our_rating: m.ourRating,
    tmdb_vote_average: m.tmdbVoteAverage,
    vote_count: m.voteCount,
    runtime: m.runtime,
    tagline: m.tagline,
    trailer_url: m.trailerUrl,
  };
}
