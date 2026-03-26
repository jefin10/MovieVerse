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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://51.20.60.134:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}/${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchCatalog(): Promise<Movie[]> {
  return request<Movie[]>("api/web/catalog/");
}

export async function searchCatalog(query: string): Promise<Movie[]> {
  if (!query.trim()) {
    return fetchCatalog();
  }
  const encoded = encodeURIComponent(query.trim());
  return request<Movie[]>(`api/web/search/${encoded}/`);
}

export async function fetchMovieDetails(movieId: string): Promise<Movie & { movie_info?: string }> {
  const encoded = encodeURIComponent(movieId);
  return request<Movie & { movie_info?: string }>(`api/web/movie/${encoded}/`);
}
