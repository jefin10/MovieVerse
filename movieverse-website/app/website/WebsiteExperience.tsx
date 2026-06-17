"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchCatalog, fetchCatalogByGenre, searchCatalog, type Movie } from "@/lib/api";
import MovieCard from "./MovieCard";
import SliderArrow from "./SliderArrow";
import {
  BROWSE_GENRES,
  FEATURED_SLIDES,
  sortByRating,
  toWebMovie,
  type BrowseGenre,
  type FeaturedSlide,
} from "./website-data";

const APK_URL =
  "https://github.com/jefin10/MovieVerse/releases/download/v1.0.0/movieverse.apk";

const HERO_INTERVAL_MS = 7000;

function splitFeaturedTitle(slide: FeaturedSlide) {
  const accent = slide.accentWord;
  if (!slide.title.startsWith(accent)) {
    return { accent: slide.title, rest: "" };
  }
  return { accent, rest: slide.title.slice(accent.length).trim() };
}

export default function WebsiteExperience() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<BrowseGenre>("All");
  const trendingRef = useRef<HTMLDivElement>(null);

  const trendingMovies = useMemo(
    () => sortByRating(movies).slice(0, 12).map(toWebMovie),
    [movies],
  );

  const browseMovies = useMemo(() => movies.map(toWebMovie), [movies]);

  const hero = FEATURED_SLIDES[heroIndex];
  const titleParts = splitFeaturedTitle(hero);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = query.trim()
          ? await searchCatalog(query, 1, 48)
          : genre !== "All"
            ? await fetchCatalogByGenre(genre, 1, 48)
            : await fetchCatalog(1, 48);
        if (!cancelled) {
          setMovies(data.results);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load movies. Make sure the backend is running.");
          setMovies([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const delay = query.trim() ? 350 : 0;
    const timer = window.setTimeout(load, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, genre]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % FEATURED_SLIDES.length);
    }, HERO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const close = () => setNavOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [navOpen]);

  const closeNav = () => setNavOpen(false);

  const shiftHero = (direction: -1 | 1) => {
    setHeroIndex((i) => (i + direction + FEATURED_SLIDES.length) % FEATURED_SLIDES.length);
  };

  const scrollTrending = (direction: "left" | "right") => {
    const track = trendingRef.current;
    if (!track) return;
    const amount = Math.max(track.clientWidth * 0.72, 280);
    track.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="web-page">
      <header className={`web-nav${navOpen ? " is-open" : ""}`}>
        <Link href="/website" className="web-nav-brand" onClick={closeNav}>
          MOVIEVERSE
        </Link>

        <div className="web-nav-glass">
          <button
            type="button"
            className="web-nav-menu-btn"
            aria-expanded={navOpen}
            aria-controls="web-nav-links"
            onClick={() => setNavOpen((v) => !v)}
          >
            Menu
          </button>
          <nav
            id="web-nav-links"
            className="web-nav-links"
            aria-label="Website"
            onClick={closeNav}
          >
            <a href="#home">Home</a>
            <a href="#trending">Trending</a>
            <a href="#browse">Browse</a>
            <a href="#download">Download</a>
          </nav>
          <Link href="/app" className="web-nav-cta" onClick={closeNav}>
            Get App
          </Link>
        </div>
      </header>

      {error && (
        <div className="web-error" role="alert">
          {error}
        </div>
      )}

      <section id="home" className="web-hero">
        {FEATURED_SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={`web-hero-bg${i === heroIndex ? " is-active" : ""}`}
            aria-hidden={i !== heroIndex}
          >
            <img src={slide.poster} alt="" className="web-hero-bg-image" />
            <div className="web-hero-bg-shade" />
          </div>
        ))}

        <SliderArrow
          direction="left"
          label="Previous featured title"
          onClick={() => shiftHero(-1)}
          className="web-slider-arrow--hero"
        />
        <SliderArrow
          direction="right"
          label="Next featured title"
          onClick={() => shiftHero(1)}
          className="web-slider-arrow--hero"
        />

        <div className="web-hero-content" key={hero.id}>
          <h1 className="web-hero-title">
            <span className="web-hero-title-accent">{titleParts.accent}</span>
            {titleParts.rest ? ` ${titleParts.rest}` : ""}
          </h1>

          <div className="web-hero-meta">
            <span>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
              </svg>
              {hero.rating.toFixed(1)}
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {hero.year}
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {hero.runtime}
            </span>
            {hero.genres.map((g) => (
              <span key={g} className="web-hero-genre">
                {g}
              </span>
            ))}
          </div>

          <p className="web-hero-copy">{hero.synopsis}</p>

          <div className="web-hero-actions">
            <a href="#browse" className="web-btn web-btn--primary">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Now
            </a>
            <a href="#browse" className="web-btn web-btn--glass">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 10v6M12 8h.01" />
              </svg>
              More Info
            </a>
          </div>
        </div>

        <div className="web-hero-dots" role="tablist" aria-label="Featured slides">
          {FEATURED_SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === heroIndex}
                aria-label={`Show ${slide.title}`}
                className={`web-hero-dot${i === heroIndex ? " is-active" : ""}`}
                onClick={() => setHeroIndex(i)}
            />
          ))}
        </div>
      </section>

      <section id="trending" className="web-trending">
        <div className="web-section-head">
          <span className="web-section-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 17l6-6 4 4 7-9" />
              <path d="M14 6h7v7" />
            </svg>
            Trending Now
          </span>
          <h2>What&apos;s Hot Right Now</h2>
        </div>

        <div className="web-trending-slider">
          <SliderArrow
            direction="left"
            label="Scroll trending left"
            onClick={() => scrollTrending("left")}
          />

          <div className="web-trending-track-wrap">
            <div className="web-trending-track" ref={trendingRef}>
              {loading && trendingMovies.length === 0 ? (
                <p className="web-section-loading">Loading trending titles...</p>
              ) : (
                trendingMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
              )}
            </div>
          </div>

          <SliderArrow
            direction="right"
            label="Scroll trending right"
            onClick={() => scrollTrending("right")}
          />
        </div>
      </section>

      <section id="browse" className="web-browse">
        <div className="web-browse-head">
          <div>
            <p className="web-kicker">Catalog</p>
            <h2>Browse Movies</h2>
          </div>
          <form
            className="web-search"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, genres..."
              aria-label="Search movies"
            />
          </form>
        </div>

        <div className="web-filters" role="tablist" aria-label="Filter by genre">
          {BROWSE_GENRES.map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={genre === g}
              className={`web-filter${genre === g ? " is-active" : ""}`}
              onClick={() => setGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>

        {loading && browseMovies.length === 0 ? (
          <p className="web-section-loading">Loading catalog...</p>
        ) : (
          <div className="web-browse-grid">
            {browseMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {!loading && browseMovies.length === 0 && (
          <p className="web-browse-empty">No movies match your search. Try another genre or keyword.</p>
        )}

        <div className="web-browse-more">
          <Link href="/browse" className="web-btn web-btn--glass">
            Open full catalog
          </Link>
        </div>
      </section>

      <section id="download" className="web-download">
        <div className="web-download-copy">
          <h2>Your Movie Adventure Starts Here!</h2>
          <p>
            Your favorite movies, your way — watch anytime, explore new releases, and take the
            cinema with you. Entertainment, fully reimagined.
          </p>
          <Link href="/app" className="web-download-link">
            Download Our App
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <a href={APK_URL} className="web-download-apk" target="_blank" rel="noopener noreferrer">
            Or grab the APK directly
          </a>
        </div>

        <div className="web-download-visual" aria-hidden>
          <Image
            src="/app-screens/discover.jpg"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="web-download-image"
          />
          <div className="web-download-image-fade" />
        </div>
      </section>

      <footer className="web-footer">
        <div className="web-footer-top">
          <div>
            <p className="web-footer-brand">MOVIEVERSE</p>
            <p className="web-footer-tagline">Discover movies. Swipe. Watch.</p>
          </div>
          <div className="web-footer-links">
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
        <p className="web-footer-copy">&copy; {new Date().getFullYear()} MovieVerse. All rights reserved.</p>
      </footer>
    </div>
  );
}
