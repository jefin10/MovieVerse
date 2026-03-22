"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { fetchCatalog, Movie, searchCatalog } from "@/lib/api";

function getPoster(url?: string) {
  if (!url) return "https://via.placeholder.com/400x600/161616/e5e5e5?text=MovieVerse";
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
        setError("Could not load movie catalog. Check backend URL.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const onSearch = async (event: FormEvent) => {
    event.preventDefault();
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
        <header className="mb-7 flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-orange-300">MovieVerse Web</p>
            <h1 className="movieverse-title text-5xl text-white">Catalog</h1>
          </div>
          <Link href="/" className="rounded-full border border-white/25 px-4 py-2 text-sm text-white transition hover:border-orange-300 hover:text-orange-200">
            Back to Landing
          </Link>
        </header>

        <form onSubmit={onSearch} className="mb-6 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by movie title"
            className="w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-orange-500/40 placeholder:text-zinc-500 focus:ring"
          />
          <button type="submit" className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">
            Search
          </button>
        </form>

        {error ? <p className="mb-5 rounded-xl border border-red-400/50 bg-red-900/30 p-3 text-sm text-red-100">{error}</p> : null}
        {loading ? <p className="text-zinc-300">Loading catalog...</p> : null}

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111]/80 transition hover:border-orange-300"
            >
              <img src={getPoster(movie.poster_url)} alt={movie.title} className="h-56 w-full object-cover transition duration-300 group-hover:scale-105" />
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold text-white">{movie.title}</p>
                <p className="mt-1 text-xs text-zinc-400">{movie.release_date?.slice(0, 4) || "Unknown"}</p>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
