"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { fetchCatalog, Movie, searchCatalog } from "@/lib/api";

function getPoster(url?: string) {
  if (!url) return "https://via.placeholder.com/400x600/0d0d0d/ffffff?text=No+Poster";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://image.tmdb.org/t/p/w500${url}`;
}

export default function BrowsePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchCatalog();
        setMovies(data);
      } catch (e) {
        setError("Could not load movie catalog. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const onSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      // If empty search, reload catalog
      try {
        setLoading(true);
        setError("");
        const data = await fetchCatalog();
        setMovies(data);
      } catch {
        setError("Failed to load catalog.");
      } finally {
        setLoading(false);
      }
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const data = await searchCatalog(query);
      setMovies(data);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <main className="movieverse-shell">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="movieverse-title text-5xl text-white">Browse Movies</h1>
          </div>
          <Link 
            href="/" 
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            ← Back Home
          </Link>
        </header>

        {/* Search Bar */}
        <form onSubmit={onSearch} className="mb-8 flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies..."
            className="flex-1 rounded-2xl border border-white/20 bg-zinc-900 px-5 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-white/40"
          />
          <button 
            type="submit" 
            className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Search
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <p className="text-zinc-500 text-center py-12">Loading movies...</p>
        )}

        {/* Movies Grid */}
        {!loading && movies.length > 0 && (
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition hover:border-white/30 hover:scale-105"
              >
                <img 
                  src={getPoster(movie.poster_url)} 
                  alt={movie.title} 
                  className="h-64 w-full object-cover"
                />
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-white">
                    {movie.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {movie.release_date?.slice(0, 4) || "Unknown"}
                  </p>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* No Results */}
        {!loading && movies.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No movies found</p>
          </div>
        )}
      </main>
    </div>
  );
}
