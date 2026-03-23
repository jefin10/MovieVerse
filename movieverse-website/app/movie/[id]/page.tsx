"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/lib/api";

function getPoster(url?: string) {
  if (!url) return "https://via.placeholder.com/500x750/0d0d0d/ffffff?text=No+Poster";
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Loading movie details...</p>
      </div>
    );
  }

  if (!movie || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Movie not found."}</p>
          <Link href="/browse" className="text-white hover:text-zinc-300">
            ← Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <main className="movieverse-shell">
        {/* Back Button */}
        <Link 
          href="/browse" 
          className="inline-block mb-6 text-white hover:text-zinc-300 transition"
        >
          ← Back to catalog
        </Link>

        {/* Movie Details */}
        <section className="grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Poster */}
          <div>
            <img 
              src={getPoster(movie.poster_url)} 
              alt={movie.title} 
              className="w-full rounded-2xl border border-white/10"
            />
          </div>

          {/* Info */}
          <div>
            <h1 className="movieverse-title text-5xl sm:text-6xl text-white mb-3">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap gap-3 text-sm text-zinc-500 mb-6">
              {movie.release_date && (
                <span>{movie.release_date.slice(0, 4)}</span>
              )}
              {movie.director && (
                <span>• Directed by {movie.director}</span>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <span 
                    key={genre} 
                    className="rounded-full border border-white/20 bg-zinc-900 px-4 py-1.5 text-xs text-white"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-zinc-300 leading-relaxed mb-8">
              {movie.movie_info || movie.description || "No description available."}
            </p>

            {/* Ratings */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {movie.imdb_rating && (
                <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-zinc-500 text-sm mb-1">IMDb Rating</p>
                  <p className="text-white text-2xl font-bold">
                    {movie.imdb_rating.toFixed(1)}
                  </p>
                </div>
              )}
              {movie.tmdb_vote_average && (
                <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-zinc-500 text-sm mb-1">TMDB Rating</p>
                  <p className="text-white text-2xl font-bold">
                    {movie.tmdb_vote_average.toFixed(1)}
                  </p>
                </div>
              )}
            </div>

            {/* Cast */}
            {(movie.star1 || movie.star2) && (
              <div className="mb-8">
                <p className="text-zinc-500 text-sm mb-2">Cast</p>
                <p className="text-white">
                  {[movie.star1, movie.star2].filter(Boolean).join(", ")}
                </p>
              </div>
            )}

            {/* Trailer Button */}
            {movie.trailer_url && (
              <a
                href={movie.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Watch Trailer
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
