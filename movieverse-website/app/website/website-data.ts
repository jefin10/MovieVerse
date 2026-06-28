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
    rating: 7.6,
    year: 2026,
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
    rating: 7.0,
    year: 2026,
    runtime: "1h 52min",
    genres: ["Crime", "Drama"],
    synopsis:
      "Amid the 1940 Birmingham Blitz, Tommy Shelby is drawn out of isolation to crush a Nazi counterfeiting plot and save his son in one last, bloody showdown.",
  },
  {
    id: "project-hail-mary",
    title: "Project Hail Mary",
    accentWord: "Project",
    poster: "/landing-movies/project hailmary.jpg",
    rating: 8.2,
    year: 2026,
    runtime: "2h 36min",
    genres: ["Sci-Fi", "Adventure"],
    synopsis:
      "An amnesiac astronaut wakes alone aboard an interstellar spacecraft and must solve an impossible problem — with an unexpected alien ally — to save Earth from extinction.",
  },
];

// Temporary, hand-curated detail records for the featured titles that are not yet
// in the backend catalog. Keyed by the slug used in the /movie/[id] route.
export type TempMovie = {
  id: string;
  title: string;
  poster: string;
  rating: number;
  releaseDate: string;
  runtime: string;
  genres: string[];
  synopsis: string;
  director: string;
  cast: string[];
  trailerUrl?: string;
  trailerName?: string;
};

export const TEMP_MOVIES: Record<string, TempMovie> = {
  obsession: {
    id: "obsession",
    title: "Obsession",
    poster: "/landing-movies/obsession.jpg",
    rating: 7.6,
    releaseDate: "2026-01-01",
    runtime: "1h 58min",
    genres: ["Thriller", "Drama"],
    synopsis:
      "A dangerous fixation pulls two strangers into a web of secrets, desire, and consequences neither can escape. As the line between love and control blurs, an ordinary life spirals into a tense psychological game with no easy way out.",
    director: "",
    cast: [],
    trailerUrl: "https://www.youtube.com/results?search_query=Obsession+2026+movie+trailer",
    trailerName: "Obsession — Official Trailer",
  },
  "peaky-blinders": {
    id: "peaky-blinders",
    title: "Peaky Blinders: The Immortal Man",
    poster: "/landing-movies/peaky blinder.jpg",
    rating: 7.0,
    releaseDate: "2026-03-20",
    runtime: "1h 52min",
    genres: ["Crime", "Drama"],
    synopsis:
      "Set during the 1940 Birmingham Blitz, Tommy Shelby is lured out of self-imposed isolation when a Nazi plot to flood Britain with counterfeit currency threatens the country — and his son Duke, now leading the Peaky Blinders. A muddy, bloody, big-screen send-off for Tommy Shelby and the gang.",
    director: "Tom Harper",
    cast: ["Cillian Murphy", "Barry Keoghan"],
    trailerUrl: "https://www.youtube.com/results?search_query=Peaky+Blinders+The+Immortal+Man+trailer",
    trailerName: "Peaky Blinders: The Immortal Man — Official Trailer",
  },
  "project-hail-mary": {
    id: "project-hail-mary",
    title: "Project Hail Mary",
    poster: "/landing-movies/project hailmary.jpg",
    rating: 8.2,
    releaseDate: "2026-03-20",
    runtime: "2h 36min",
    genres: ["Sci-Fi", "Adventure"],
    synopsis:
      "Ryland Grace wakes from a coma aboard the interstellar spacecraft Hail Mary with no memory of who he is — the sole survivor of a last-ditch mission to stop a stellar catastrophe that threatens all life on Earth. With the help of an unexpected alien ally, he must use science, ingenuity and hope to save two worlds.",
    director: "Phil Lord & Christopher Miller",
    cast: ["Ryan Gosling", "Sandra Hüller"],
    trailerUrl: "https://www.youtube.com/results?search_query=Project+Hail+Mary+official+trailer",
    trailerName: "Project Hail Mary — Official Trailer",
  },
};

export function getTempMovie(id: string): TempMovie | undefined {
  return TEMP_MOVIES[id];
}

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
  // Pass through absolute URLs and local public paths (e.g. /landing-movies/...).
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
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
