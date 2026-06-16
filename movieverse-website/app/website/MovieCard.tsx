"use client";

import Link from "next/link";
import type { WebMovie } from "./website-data";

type MovieCardProps = {
  movie: WebMovie;
  priority?: boolean;
};

export default function MovieCard({ movie }: MovieCardProps) {
  const ratingLabel = movie.rating > 0 ? movie.rating.toFixed(1) : "—";

  return (
    <article className="web-movie-card">
      <Link href={`/movie/${movie.id}`} className="web-movie-card-link">
        <div className="web-movie-card-media">
          <img src={movie.poster} alt={movie.title} className="web-movie-card-image" loading="lazy" />

          <div className="web-movie-card-overlay" aria-hidden>
            <div className="web-movie-card-actions">
              <span className="web-movie-icon-btn" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
              <span className="web-movie-icon-btn" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
              </span>
            </div>

            <span className="web-movie-card-rating">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
              </svg>
              {ratingLabel}
            </span>

            <span className="web-movie-play" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>

            <div className="web-movie-card-meta">
              <h3>{movie.title}</h3>
              <p>{movie.year}</p>
              {movie.genres.length > 0 && (
                <div className="web-movie-card-genres">
                  {movie.genres.slice(0, 2).map((genre) => (
                    <span key={genre}>{genre}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <span className="web-movie-card-rating web-movie-card-rating--idle">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
            </svg>
            {ratingLabel}
          </span>
        </div>
      </Link>
    </article>
  );
}
