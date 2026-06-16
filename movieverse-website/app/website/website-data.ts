import type { Movie } from "@/lib/api";

export type WebMovie = {
  id: number;
  title: string;
  poster: string;
  rating: number;
  year: string;
  genres: string[];
  synopsis: string;
};

export type FeaturedSlide = {
  id: string;
  title: string;
  accentWord: string;
  poster: string;
  rating: number;
  year: number;
  runtime: string;
  genres: string[];
  synopsis: string;
};

export const FEATURED_SLIDES: FeaturedSlide[] = [
  {
    id: "obsession",
    title: "Obsession",
    accentWord: "Obsession",
    poster: "/landing-movies/obsession.jpg",
    rating: 8.4,
    year: 2024,
    runtime: "1h 58min",
    genres: ["Thriller", "Drama"],
    synopsis:
      "A dangerous fixation pulls two strangers into a web of secrets, desire, and consequences neither can escape.",
  },
  {
    id: "peaky-blinders",
    title: "Peaky Blinders",
    accentWord: "Peaky",
    poster: "/landing-movies/peaky blinder.jpg",
    rating: 8.8,
    year: 2024,
    runtime: "58min",
    genres: ["Crime", "Drama"],
    synopsis:
      "A notorious Birmingham gang rises through the underworld with razor-sharp style, loyalty, and ruthless ambition.",
  },
  {
    id: "project-hail-mary",
    title: "Project Hail Mary",
    accentWord: "Project",
    poster: "/landing-movies/project hailmary.jpg",
    rating: 8.6,
    year: 2025,
    runtime: "2h 35min",
    genres: ["Sci-Fi", "Adventure"],
    synopsis:
      "An astronaut alone in deep space must solve an impossible problem to save Earth — and find an unexpected ally.",
  },
];

export const BROWSE_GENRES = [
  "All",
  "Action",
  "Drama",
  "Thriller",
  "Sci-Fi",
  "Romance",
  "Adventure",
  "Crime",
  "Comedy",
  "Horror",
] as const;

export type BrowseGenre = (typeof BROWSE_GENRES)[number];

export function getPoster(url?: string) {
  if (!url) return "https://via.placeholder.com/400x600/0d0d0d/ffffff?text=No+Poster";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://image.tmdb.org/t/p/w500${url}`;
}

export function getMovieRating(movie: Movie) {
  return movie.tmdb_vote_average ?? movie.imdb_rating ?? 0;
}

export function toWebMovie(movie: Movie): WebMovie {
  return {
    id: movie.id,
    title: movie.title,
    poster: getPoster(movie.poster_url),
    rating: getMovieRating(movie),
    year: movie.release_date?.slice(0, 4) ?? "—",
    genres: movie.genres ?? [],
    synopsis:
      movie.description?.trim().slice(0, 200) ||
      "Explore this title on MovieVerse — posters, ratings, cast, and more.",
  };
}

export function sortByRating(movies: Movie[]) {
  return [...movies].sort((a, b) => getMovieRating(b) - getMovieRating(a));
}
