export type Movie = {
  id: number;
  title: string;
  description?: string;
  poster_url?: string;
  release_date?: string;
  imdb_rating?: number;
  tmdb_vote_average?: number;
  genres?: string[];
  director?: string;
  star1?: string;
  star2?: string;
  trailer_url?: string;
  trailer_name?: string;
};

export type PaginatedResponse = {
  results: Movie[];
  page: number;
  page_size: number;
  total_movies: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://movieversebackend.jefin.xyz";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}/${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchCatalog(page: number = 1, pageSize: number = 24): Promise<PaginatedResponse> {
  return request<PaginatedResponse>(`api/web/catalog/?page=${page}&page_size=${pageSize}`);
}

export async function searchCatalog(query: string, page: number = 1, pageSize: number = 24): Promise<PaginatedResponse> {
  if (!query.trim()) {
    return fetchCatalog(page, pageSize);
  }
  const encoded = encodeURIComponent(query.trim());
  return request<PaginatedResponse>(`api/web/search/${encoded}/?page=${page}&page_size=${pageSize}`);
}

export async function fetchMovieDetails(movieId: string): Promise<Movie & { movie_info?: string }> {
  const encoded = encodeURIComponent(movieId);
  return request<Movie & { movie_info?: string }>(`api/web/movie/${encoded}/`);
}
