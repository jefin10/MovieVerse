"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PhoneMockup from "./PhoneMockup";

const APK_URL =
  "https://github.com/jefin10/MovieVerse/releases/download/v1.0.0/movieverse.apk";

const DESKTOP_MQ = "(min-width: 900px)";

const SCROLL_FEATURES = [
  {
    title: "Curated home feed",
    body: "See trending titles, fresh picks, and quick search — all on a clean black canvas built for movie nights.",
    image: "/app-screens/home.jpg",
    side: "left" as const,
  },
  {
    title: "Swipe to discover",
    body: "Tinder-style cards help you say yes or no fast. Build taste without endless scrolling.",
    image: "/app-screens/discover.jpg",
    side: "right" as const,
  },
  {
    title: "Mood-based AI",
    body: "Tell MovieVerse how you feel and get genre-matched recommendations powered by lightweight ML.",
    image: "/app-screens/mood.jpg",
    side: "left" as const,
  },
  {
    title: "Rich movie details",
    body: "Posters, trailers, cast, ratings, and synopses — everything you need before you press play.",
    image: "/app-screens/details.jpg",
    side: "right" as const,
  },
  {
    title: "Personal watchlist",
    body: "Save films for later and keep your queue synced when you are signed in.",
    image: "/app-screens/watchlist.jpg",
    side: "left" as const,
  },
];

const WHY_US = [
  {
    stat: "10k+",
    title: "Movies in the catalog",
    body: "Thousands of titles synced from TMDB — posters, ratings, cast, and trailers ready when you need a pick.",
  },
  {
    stat: "5",
    title: "Mood profiles, instant matches",
    body: "Happy, sad, romantic, or action — tell MovieVerse how you feel and get genre-matched recommendations in seconds.",
  },
  {
    stat: "2",
    title: "App + web, one universe",
    body: "Swipe on Android or browse the full catalog on the web. Same taste profile, same watchlists when you're signed in.",
  },
  {
    stat: "100%",
    title: "Free to discover",
    body: "No subscription to browse, swipe, or get mood-based picks. Download the APK and start exploring tonight.",
  },
];

const FAQS = [
  {
    q: "Is MovieVerse free?",
    a: "Yes. Download the APK and browse the catalog at no cost. Core discovery features are free to use.",
  },
  {
    q: "Do I need an account?",
    a: "You can explore without signing in. Create an account to save watchlists, rate movies, and sync picks.",
  },
  {
    q: "How does mood AI work?",
    a: "Pick a mood and MovieVerse predicts matching genres, then ranks movies from the catalog using your taste profile.",
  },
  {
    q: "Android only?",
    a: "The mobile app is Android (APK) today. The web catalog works on any modern browser.",
  },
  {
    q: "Where does movie data come from?",
    a: "Metadata and posters are synced from TMDB and stored in our backend for fast, reliable browsing.",
  },
];

function FeaturePhone({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="app-phone app-phone--feature">
      <div className="app-phone-shell">
        <div className="app-phone-notch" aria-hidden />
        <div className="app-phone-screen">
          {SCROLL_FEATURES.map((feature, i) => (
            <Image
              key={feature.image}
              src={feature.image}
              alt={feature.title}
              fill
              sizes="280px"
              className={`app-phone-slide${activeIndex === i ? " is-visible" : ""}`}
              priority={i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AppLanding() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const nodes = stepRefs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length) {
          const idx = nodes.indexOf(visible[0].target as HTMLElement);
          if (idx >= 0) setActiveFeature(idx);
          return;
        }

        const mid = window.innerHeight * 0.5;
        let closest = 0;
        let closestDist = Infinity;
        nodes.forEach((node, idx) => {
          const rect = node.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const dist = Math.abs(center - mid);
          if (dist < closestDist) {
            closestDist = dist;
            closest = idx;
          }
        });
        setActiveFeature(closest);
      },
      { root: null, rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isDesktop]);

  useEffect(() => {
    if (!navOpen) return;
    const close = () => setNavOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [navOpen]);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="app-page">
      <header className={`app-nav${navOpen ? " is-open" : ""}`}>
        <Link href="/" className="app-nav-brand" onClick={closeNav}>
          MOVIEVERSE
        </Link>

        <div className="app-nav-glass">
          <button
            type="button"
            className="app-nav-menu-btn"
            aria-expanded={navOpen}
            aria-controls="app-nav-links"
            onClick={() => setNavOpen((v) => !v)}
          >
            Menu
          </button>
          <nav
            id="app-nav-links"
            className="app-nav-links"
            aria-label="App page"
            onClick={closeNav}
          >
            <a href="#">Home</a>
            <a href="#features">Features</a>
            <a href="#better">Why us</a>
            <a href="#faq">Faq</a>
          </nav>
          <Link href="/browse" className="app-nav-cta" onClick={closeNav}>
            Website
          </Link>
        </div>
      </header>

      <section className="app-hero">
        <div className="app-hero-rings" aria-hidden />
        <div className="app-hero-inner">
          <h1 className="app-hero-title">
            Navigate your <span>movies</span>
            <br />
            with precision
          </h1>
          <p className="app-hero-copy">
            MovieVerse is your pocket guide for what to watch next — swipe discovery,
            mood AI, watchlists, and a catalog that stays in sync with the web.
          </p>
          <div className="app-store-row">
            <a
              href="#"
              className="app-store-btn"
              aria-label="Coming soon on Google Play"
            >
              Play Store
            </a>
            <a
              href={APK_URL}
              className="app-store-btn app-store-btn--ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Here
            </a>
          </div>
        </div>
      </section>

      <section className="app-showcase">
        <p className="app-kicker">Inside the app</p>
        <h2 className="app-section-title">Built for how you actually pick movies</h2>
      </section>

      <section className="app-features" id="features">
        <p className="app-features-watermark" aria-hidden>
          features
        </p>

        {/* Desktop: sticky phone + scroll-synced features */}
        <div className="app-features-desktop">
          <div className="app-features-track">
            <div className="app-features-phone-pin">
              <FeaturePhone activeIndex={activeFeature} />
            </div>

            {SCROLL_FEATURES.map((feature, i) => (
              <article
                key={feature.title}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={`app-feature-step app-feature-step--${feature.side} app-feature-step--row-${
                  i + 1
                }${activeFeature === i ? " is-active" : ""}`}
              >
                <span className="app-feature-index">0{i + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Mobile: simple stacked cards, no scroll animation */}
        <div className="app-features-mobile">
          <div className="app-features-mobile-head">
            <p className="app-kicker">Features</p>
            <h2 className="app-section-title">Everything in one app</h2>
          </div>
          <ul className="app-features-mobile-list">
            {SCROLL_FEATURES.map((feature, i) => (
              <li key={feature.title}>
                <article className="app-feature-card">
                  <PhoneMockup
                    src={feature.image}
                    alt={feature.title}
                    priority={i === 0}
                    className="app-feature-card-phone"
                  />
                  <div className="app-feature-card-copy">
                    <span className="app-feature-index">0{i + 1}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.body}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="app-why" id="better">
        <div className="app-why-track">
          <div className="app-why-pin">
            <p className="app-kicker">Why us</p>
            <h2 className="app-why-title">Designed for how you pick movies</h2>
          </div>

          <div className="app-why-steps">
            {WHY_US.map((item) => (
              <article key={item.title} className="app-why-step">
                <span className="app-why-stat">{item.stat}</span>
                <div className="app-why-step-body">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="app-faq" id="faq">
        <div className="app-faq-head">
          <p className="app-kicker">FAQ</p>
          <h2 className="app-section-title">Questions, answered</h2>
        </div>
        <div className="app-faq-list">
          {FAQS.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q} className={`app-faq-item${open ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="app-faq-trigger"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}
                >
                  {item.q}
                  <span aria-hidden>{open ? "−" : "+"}</span>
                </button>
                <div className="app-faq-panel">
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="app-footer">
        <div className="app-footer-top">
          <div>
            <p className="app-footer-brand">MOVIEVERSE</p>
            <p className="app-footer-tagline">Discover movies. Swipe. Watch.</p>
          </div>
          <div className="app-footer-links">
            <Link href="/">Home</Link>
            <Link href="/browse">Browse</Link>
            <Link href="/privacy">Privacy</Link>
            <a href={APK_URL} target="_blank" rel="noopener noreferrer">
              Download APK
            </a>
          </div>
        </div>
        <p className="app-footer-copy">© {new Date().getFullYear()} MovieVerse. All rights reserved.</p>
      </footer>
    </div>
  );
}
