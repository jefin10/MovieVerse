"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/lib/api";
import { getPoster } from "@/app/website/website-data";
import "./movie-detail.css";

const APK_URL =
  "https://github.com/jefin10/MovieVerse/releases/download/v1.0.0/movieverse.apk";

type MovieDetail = Awaited<ReturnType<typeof fetchMovieDetails>>;

function splitTitle(title: string) {
  const parts = title.split(" ");
  if (parts.length <= 1) return { accent: title, rest: "" };
  return { accent: parts[0], rest: parts.slice(1).join(" ") };
}

function getRating(movie: MovieDetail) {
  return movie.tmdb_vote_average ?? movie.imdb_rating ?? 0;
}

export default function MovieDetailsPage() {
  const params = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [navOpen, setNavOpen] = useState(false);

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

  useEffect(() => {
    if (!navOpen) return;
    const close = () => setNavOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [navOpen]);

  const closeNav = () => setNavOpen(false);
  const poster = movie ? getPoster(movie.poster_url) : "";
  const rating = movie ? getRating(movie) : 0;
  const titleParts = movie ? splitTitle(movie.title) : { accent: "", rest: "" };
  const cast = movie ? [movie.star1, movie.star2].filter(Boolean).join(", ") : "";
  const synopsis = movie?.movie_info || movie?.description || "No description available.";

  return (
    <div className="md-page">
      <header className={`md-nav${navOpen ? " is-open" : ""}`}>
        <Link href="/website" className="md-nav-brand" onClick={closeNav}>
          MOVIEVERSE
        </Link>

        <div className="md-nav-glass">
          <button
            type="button"
            className="md-nav-menu-btn"
            aria-expanded={navOpen}
            aria-controls="md-nav-links"
            onClick={() => setNavOpen((v) => !v)}
          >
            Menu
          </button>
          <nav
            id="md-nav-links"
            className="md-nav-links"
            aria-label="Movie detail"
            onClick={closeNav}
          >
            <Link href="/website">Website</Link>
            <Link href="/website#browse">Browse</Link>
            <Link href="/app">App</Link>
          </nav>
          <Link href="/app" className="md-nav-cta" onClick={closeNav}>
            Get App
          </Link>
        </div>
      </header>

      {movie && (
        <div className="md-backdrop" aria-hidden>
          <img src={poster} alt="" className="md-backdrop-image" />
          <div className="md-backdrop-shade" />
        </div>
      )}

      <main className="md-main">
        {loading && (
          <div className="md-state">
            <div className="md-loader" aria-hidden />
            <p>Loading movie details...</p>
          </div>
        )}

        {!loading && (error || !movie) && (
          <div className="md-state">
            <p className="md-state-error">{error || "Movie not found."}</p>
            <Link href="/website#browse" className="md-btn md-btn--glass">
              ← Back to catalog
            </Link>
          </div>
        )}

        {!loading && movie && (
          <section className="md-layout">
            <div className="md-poster-wrap">
              <img src={poster} alt={movie.title} className="md-poster" />
            </div>

            <div className="md-info">
              <p className="md-kicker">Movie details</p>

              <h1 className="md-title">
                <span className="md-title-accent">{titleParts.accent}</span>
                {titleParts.rest ? ` ${titleParts.rest}` : ""}
              </h1>

              <div className="md-meta">
                {rating > 0 && (
                  <span className="md-meta-rating">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                    </svg>
                    {rating.toFixed(1)}
                  </span>
                )}
                {movie.release_date && (
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    {movie.release_date.slice(0, 4)}
                  </span>
                )}
                {movie.director && <span>Directed by {movie.director}</span>}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="md-genres">
                  {movie.genres.map((genre) => (
                    <span key={genre} className="md-genre">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <p className="md-synopsis">{synopsis}</p>

              <div className="md-stats">
                {cast && (
                  <div className="md-stat">
                    <p className="md-stat-label">Cast</p>
                    <p className="md-stat-value">{cast}</p>
                  </div>
                )}
                {rating > 0 && (
                  <div className="md-stat">
                    <p className="md-stat-label">Rating</p>
                    <p className="md-stat-value md-stat-value--rating">{rating.toFixed(1)}</p>
                  </div>
                )}
                {movie.trailer_name && (
                  <div className="md-stat">
                    <p className="md-stat-label">Trailer</p>
                    <p className="md-stat-value">{movie.trailer_name}</p>
                  </div>
                )}
              </div>

              <div className="md-actions">
                {movie.trailer_url && (
                  <a
                    href={movie.trailer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md-btn md-btn--primary"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Trailer
                  </a>
                )}
                <Link href="/website#browse" className="md-btn md-btn--glass">
                  ← Back to catalog
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="md-footer">
        <div className="md-footer-top">
          <div>
            <p className="md-footer-brand">MOVIEVERSE</p>
            <p className="md-footer-tagline">Discover movies. Swipe. Watch.</p>
          </div>
          <div className="md-footer-links">
            <Link href="/">Home</Link>
            <Link href="/website">Website</Link>
            <Link href="/app">App</Link>
            <Link href="/browse">Catalog</Link>
            <Link href="/privacy">Privacy</Link>
            <a href={APK_URL} target="_blank" rel="noopener noreferrer">
              Download APK
            </a>
          </div>
        </div>
        <p className="md-footer-copy">&copy; {new Date().getFullYear()} MovieVerse. All rights reserved.</p>
      </footer>
    </div>
  );
}
