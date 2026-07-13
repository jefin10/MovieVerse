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

const PROD_API_BASE = "https://movieversebackend.jefin.xyz";
const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? PROD_API_BASE;
// In production always talk to the HTTPS backend; never ship a localhost/http
// override (e.g. from a stray .env.local) to the deployed site.
const API_BASE =
  process.env.NODE_ENV === "production" && !configuredApiBase.startsWith("https://")
    ? PROD_API_BASE
    : configuredApiBase;

// In-memory cache keyed by request path. It lives in the module (browser JS)
// scope, so it SURVIVES client-side navigation between sections, but is wiped on
// a full page reload or a new tab (fresh JS context). Net effect:
//   • navigate to another section and come back → served from cache (no re-fetch)
//   • manual refresh (F5) / open in a new tab      → fetched fresh
// Only reads marked "force-cache" are cached; "no-store" (search) always fetches.
const memoryCache = new Map<string, unknown>();
const inFlight = new Map<string, Promise<unknown>>();

async function request<T>(path: string, cache: RequestCache = "no-store"): Promise<T> {
  const useCache = cache === "force-cache";

  if (useCache) {
    const cached = memoryCache.get(path);
    if (cached !== undefined) return cached as T;
    const pending = inFlight.get(path);
    if (pending) return pending as Promise<T>;
  }

  const promise = (async () => {
    // Always hit the network with no-store; caching is handled explicitly above
    // so behavior is deterministic and not dependent on backend cache headers.
    const response = await fetch(`${API_BASE}/${path}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`API ${response.status}: ${path}`);
    }
    const data = (await response.json()) as T;
    if (useCache) memoryCache.set(path, data);
    return data;
  })();

  if (!useCache) return promise;

  inFlight.set(path, promise);
  try {
    return (await promise) as T;
  } finally {
    inFlight.delete(path);
  }
}

export async function fetchCatalog(page: number = 1, pageSize: number = 24): Promise<PaginatedResponse> {
  // Use force-cache for catalog to improve performance
  return request<PaginatedResponse>(`api/web/catalog/?page=${page}&page_size=${pageSize}`, "force-cache");
}

export async function fetchCatalogByGenre(genre: string, page: number = 1, pageSize: number = 48): Promise<PaginatedResponse> {
  const encoded = encodeURIComponent(genre);
  return request<PaginatedResponse>(`api/web/catalog/?page=${page}&page_size=${pageSize}&genre=${encoded}`, "force-cache");
}

export async function searchCatalog(query: string, page: number = 1, pageSize: number = 24): Promise<PaginatedResponse> {
  if (!query.trim()) {
    return fetchCatalog(page, pageSize);
  }
  const encoded = encodeURIComponent(query.trim());
  return request<PaginatedResponse>(`api/web/search/${encoded}/?page=${page}&page_size=${pageSize}`, "no-store");
}

export async function fetchMovieDetails(movieId: string): Promise<Movie & { movie_info?: string }> {
  const encoded = encodeURIComponent(movieId);
  return request<Movie & { movie_info?: string }>(`api/web/movie/${encoded}/`, "force-cache");
}
