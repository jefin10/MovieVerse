"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/lib/api";

function getPoster(url?: string) {
  if (!url) return "https://via.placeholder.com/500x750/161616/e5e5e5?text=MovieVerse";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://image.tmdb.org/t/p/w500${url}`;
}

type MovieDetail = Awaited<ReturnType<typeof fetchMovieDetails>>;

export default function MovieDetailsPage() {
  const params = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchMovieDetails(params.id);
        setMovie(data);
      } catch {
        setError("Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [params.id]);

  if (loading) {
    return <div className="movieverse-shell py-10 text-zinc-300">Loading movie details...</div>;
  }

  if (!movie || error) {
    return (
      <div className="movieverse-shell py-10">
        <p className="rounded-xl border border-red-400/40 bg-red-900/30 p-3 text-red-100">{error || "Movie not found."}</p>
        <Link href="/browse" className="mt-4 inline-block text-orange-300 hover:text-orange-200">Back to catalog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <main className="movieverse-shell">
        <Link href="/browse" className="mb-5 inline-block text-sm text-orange-300 hover:text-orange-200">← Back to catalog</Link>

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur md:grid-cols-[320px_1fr]">
          <img src={getPoster(movie.poster_url)} alt={movie.title} className="h-[470px] w-full rounded-2xl object-cover" />

          <div>
            <h1 className="movieverse-title text-5xl text-white">{movie.title}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              {movie.release_date || "Unknown date"}
              {movie.director ? ` • Directed by ${movie.director}` : ""}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(movie.genres || []).map((genre) => (
                <span key={genre} className="rounded-full border border-orange-400/40 bg-orange-500/15 px-3 py-1 text-xs text-orange-100">
                  {genre}
                </span>
              ))}
            </div>

            <p className="mt-6 leading-7 text-zinc-200">{movie.movie_info || movie.description || "No description available."}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-zinc-400">TMDB Rating</p>
                <p className="mt-1 text-xl font-bold text-white">{movie.tmdb_vote_average ?? "N/A"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-zinc-400">IMDb Rating</p>
                <p className="mt-1 text-xl font-bold text-white">{movie.imdb_rating ?? "N/A"}</p>
              </div>
            </div>

            {movie.trailer_url ? (
              <a
                href={movie.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Watch Trailer
              </a>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
