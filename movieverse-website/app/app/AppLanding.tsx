"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { DECK, MOODS, POSTER_ROWS } from "./app-data";
import { MoodArt, ProjectorArt, SwipeArt, TasteArt, WatchlistArt } from "./Illustrations";
import { DetailScreen, HomeScreen, MoodScreen, Phone, poster, SwipeScreen, WatchlistScreen } from "./Phone";

const APK_URL = "https://github.com/jefin10/movieverse/releases/latest/download/movieverse.apk";
const REEL = "/app-media/cinema-reel.mp4";
const REEL_POSTER = "/app-media/cinema-reel.jpg";

const STEPS: { kicker: string; title: ReactNode; body: string; art: ReactNode; screen: ReactNode }[] = [
  {
    kicker: "Swipe",
    title: (
      <>
        Decide with <em>your thumb.</em>
      </>
    ),
    body: "One poster at a time. Swipe right and it lands in your watchlist; swipe left and it's gone. No endless scrolling, no forty open tabs.",
    art: <SwipeArt />,
    screen: <SwipeScreen />,
  },
  {
    kicker: "Mood",
    title: (
      <>
        Say how you <em>feel.</em>
      </>
    ),
    body: "Type a feeling in your own words. A small language model reads it, picks the genre that fits, and pulls the best films that match.",
    art: <MoodArt />,
    screen: <MoodScreen moodIndex={1} />,
  },
  {
    kicker: "For you",
    title: (
      <>
        It learns <em>your taste.</em>
      </>
    ),
    body: "Rate what you've watched. MovieVerse weighs genre, director, cast and rating to surface the films closest to the ones you loved.",
    art: <TasteArt />,
    screen: <HomeScreen />,
  },
  {
    kicker: "Watchlist",
    title: (
      <>
        Keep the <em>good ones.</em>
      </>
    ),
    body: "Everything you swipe right on waits in one tidy list, tied to your account, ready for movie night.",
    art: <WatchlistArt />,
    screen: <WatchlistScreen />,
  },
];

const STATS = [
  { value: 661, label: "films in the catalog" },
  { value: 21, label: "genres to explore" },
  { value: 16, label: "moods the AI can match" },
  { value: 0, label: "passwords to remember" },
];

const FAQS = [
  {
    q: "Is MovieVerse free?",
    a: "Yes. Download the APK and use every feature at no cost.",
  },
  {
    q: "Do I need a password?",
    a: "No. Enter your email and we send you a 6-digit code. New here? The same code starts your account, and you just pick a username.",
  },
  {
    q: "How does the mood AI work?",
    a: "A lightweight language model trained on mood phrases predicts a genre from what you type. MovieVerse then shows the top-rated films in that genre.",
  },
  {
    q: "Is it on iPhone?",
    a: "The app is Android only for now. The web catalog works in any modern browser.",
  },
  {
    q: "Where does the movie data come from?",
    a: "Our own catalog of films, with poster artwork from TMDB.",
  },
];

/** Plays a video only while it's on screen, and never under reduced motion. */
function Reel({ className }: { className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className={className} src={REEL} poster={REEL_POSTER} muted loop playsInline preload="metadata" aria-hidden />;
}

function Marquee({ reverse = false, items }: { reverse?: boolean; items: { title: string; poster: string }[] }) {
  return (
    <div className={`marquee${reverse ? " marquee-rev" : ""}`} aria-hidden>
      <div className="marquee-track">
        {[...items, ...items].map((m, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${m.title}-${i}`} src={poster(m.poster)} alt="" decoding="async" draggable={false} />
        ))}
      </div>
    </div>
  );
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / 1400, 1);
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return <span ref={ref}>{shown}</span>;
}

/** The real swipe interaction, on real catalog movies. */
function SwipeDemo() {
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [drag, setDrag] = useState({ x: 0, active: false });
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const startX = useRef(0);
  const movie = DECK[index % DECK.length];
  const next = DECK[(index + 1) % DECK.length];

  const commit = useCallback(
    (dir: "left" | "right") => {
      if (leaving) return;
      setLeaving(dir);
      window.setTimeout(() => {
        if (dir === "right") setSaved((s) => [...s, DECK[index % DECK.length].title]);
        setIndex((i) => i + 1);
        setLeaving(null);
        setDrag({ x: 0, active: false });
      }, 280);
    },
    [index, leaving],
  );

  const x = leaving === "right" ? 620 : leaving === "left" ? -620 : drag.x;
  const strength = Math.min(Math.abs(x) / 110, 1);

  return (
    <div className="demo-swipe">
      <div className="demo-deck">
        <div className="demo-card demo-card-next" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster(next.poster, "w500")} alt="" draggable={false} />
        </div>
        <div
          key={index}
          className={`demo-card${drag.active ? " is-drag" : ""}`}
          style={{ transform: `translateX(${x}px) rotate(${x * 0.05}deg)` }}
          onPointerDown={(e) => {
            startX.current = e.clientX;
            setDrag({ x: 0, active: true });
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag.active) setDrag({ x: e.clientX - startX.current, active: true });
          }}
          onPointerUp={() => {
            if (Math.abs(drag.x) > 90) commit(drag.x > 0 ? "right" : "left");
            else setDrag({ x: 0, active: false });
          }}
          onPointerCancel={() => setDrag({ x: 0, active: false })}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster(movie.poster, "w500")} alt={`${movie.title} poster`} draggable={false} />
          <span className="demo-stamp demo-stamp-yes" style={{ opacity: x > 0 ? strength : 0 }}>
            Watchlist
          </span>
          <span className="demo-stamp demo-stamp-no" style={{ opacity: x < 0 ? strength : 0 }}>
            Pass
          </span>
          <div className="demo-card-info">
            <b>{movie.title}</b>
            <span>
              {movie.genres.join(" · ")} &nbsp;·&nbsp; IMDb {movie.imdb}
            </span>
          </div>
        </div>
      </div>
      <div className="demo-actions">
        <button type="button" className="glass icon-btn" aria-label="Pass" onClick={() => commit("left")}>
          ✕
        </button>
        <p className="demo-count" aria-live="polite">
          <b>{saved.length}</b> saved
        </p>
        <button type="button" className="icon-btn icon-btn-solid" aria-label="Add to watchlist" onClick={() => commit("right")}>
          ♥
        </button>
      </div>
    </div>
  );
}

function MoodDemo() {
  const [active, setActive] = useState(0);
  const mood = MOODS[active];
  return (
    <div className="demo-mood">
      <div className="demo-mood-chips" role="tablist" aria-label="Moods">
        {MOODS.map((m, i) => (
          <button
            key={m.genre}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`glass chip${i === active ? " is-on" : ""}`}
            onClick={() => setActive(i)}
          >
            {m.prompt}
          </button>
        ))}
      </div>
      <p className="demo-mood-result">
        <span>That sounds like</span> <b key={mood.genre}>{mood.genre}</b>
      </p>
      <div className="demo-mood-grid" key={mood.genre}>
        {mood.picks.slice(0, 6).map((m, i) => (
          <figure key={m.title} style={{ animationDelay: `${i * 60}ms` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster(m.poster)} alt="" loading="lazy" />
            <figcaption>
              {m.title}
              <span>★ {m.imdb}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />
  </svg>
);

export default function AppLanding() {
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [navOpen, setNavOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Real refraction needs an SVG filter in backdrop-filter, which only Chromium draws.
    const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands ?? [];
    if (brands.some((b) => b.brand === "Chromium")) root.classList.add("has-refract");

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            reveal.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    const steps = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveStep(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && steps.observe(el));

    return () => {
      reveal.disconnect();
      steps.disconnect();
    };
  }, []);

  // The hero phone leans toward the pointer.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
        hero.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
      });
    };
    hero.addEventListener("pointermove", onMove);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="mv" ref={rootRef}>
      {/* Bends whatever is behind liquid-glass surfaces. */}
      <svg className="mv-defs" aria-hidden>
        <filter id="mv-refract" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.014" numOctaves="2" seed="4" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="44" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="mv-grain" aria-hidden />

      <header className="nav-wrap">
        <nav className={`nav glass glass-refract${navOpen ? " is-open" : ""}`} aria-label="Main">
          <Link href="/" className="nav-brand" onClick={closeNav}>
            <Image src="/MVV.png" alt="" width={28} height={28} />
            MovieVerse
          </Link>
          <div className="nav-links">
            <a href="#features" onClick={closeNav}>Features</a>
            <a href="#try" onClick={closeNav}>Try it</a>
            <a href="#faq" onClick={closeNav}>FAQ</a>
            <Link href="/website" onClick={closeNav}>Browse</Link>
          </div>
          <a href={APK_URL} className="btn btn-solid btn-sm nav-cta" target="_blank" rel="noopener noreferrer">
            Download
          </a>
          <button
            type="button"
            className="nav-toggle"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" ref={heroRef}>
          <Reel className="hero-video" />
          <div className="hero-veil" aria-hidden />
          <svg className="hero-orbits" viewBox="0 0 800 800" fill="none" aria-hidden>
            <circle cx="400" cy="400" r="290" />
            <circle cx="400" cy="400" r="386" />
            <circle className="hero-dot hero-dot-a" cx="400" cy="110" r="4" />
            <circle className="hero-dot hero-dot-b" cx="400" cy="14" r="3" />
          </svg>

          <div className="hero-copy">
            <p className="kicker hero-in" style={{ animationDelay: "60ms" }}>The MovieVerse app for Android</p>
            <h1>
              <span className="hero-in" style={{ animationDelay: "120ms" }}>Stop scrolling.</span>
              <span className="hero-in hero-serif" style={{ animationDelay: "220ms" }}>Start watching.</span>
            </h1>
            <p className="hero-sub hero-in" style={{ animationDelay: "320ms" }}>
              Swipe through films, tell it your mood, and let your taste pick tonight&apos;s movie.
            </p>
            <div className="hero-cta hero-in" style={{ animationDelay: "420ms" }}>
              <a href={APK_URL} className="btn btn-solid" target="_blank" rel="noopener noreferrer">
                <DownloadIcon /> Download APK
              </a>
              <Link href="/website" className="btn glass">Browse on the web</Link>
            </div>
          </div>

          <div className="hero-stage hero-in" style={{ animationDelay: "280ms" }}>
            <Phone className="phone-hero">
              <SwipeScreen />
            </Phone>
            <div className="float glass glass-refract float-a">
              <span className="float-icon">♥</span>
              <div>
                <b>Added to watchlist</b>
                <small>{DECK[0].title}</small>
              </div>
            </div>
            <div className="float glass glass-refract float-b">
              <small>&ldquo;I want to be scared&rdquo;</small>
              <b>Horror · {MOODS[1].count} films</b>
            </div>
            <div className="float glass glass-refract float-c">
              <span className="float-rating">★ {DECK[1].imdb}</span>
              <small>{DECK[1].title}</small>
            </div>
          </div>
        </section>

        <section className="wall" aria-label="Films in the catalog">
          <Marquee items={POSTER_ROWS[0]} />
          <Marquee items={POSTER_ROWS[1]} reverse />
        </section>

        <section id="features" className="steps">
          <div className="section-head" data-reveal>
            <p className="kicker">How it works</p>
            <h2>
              Four ways to find <em>the one.</em>
            </h2>
          </div>
          <div className="steps-grid">
            <div className="steps-sticky">
              <div className="steps-halo" aria-hidden />
              <Phone className="phone-steps">
                {STEPS.map((step, i) => (
                  <div key={step.kicker} className={`steps-screen${activeStep === i ? " is-on" : ""}`}>
                    {step.screen}
                  </div>
                ))}
              </Phone>
              <div className="steps-dots" aria-hidden>
                {STEPS.map((step, i) => (
                  <i key={step.kicker} className={activeStep === i ? "is-on" : ""} />
                ))}
              </div>
            </div>
            <div className="steps-list">
              {STEPS.map((step, i) => (
                <article
                  key={step.kicker}
                  className={`step${activeStep === i ? " is-on" : ""}`}
                  data-step={i}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                >
                  <div className="step-art glass">{step.art}</div>
                  <p className="kicker">
                    0{i + 1} — {step.kicker}
                  </p>
                  <h3>{step.title}</h3>
                  <p className="step-body">{step.body}</p>
                  <Phone className="phone-inline">{step.screen}</Phone>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cinema" aria-label="Your next favourite">
          <Reel className="cinema-video" />
          <div className="cinema-mask" aria-hidden>
            <span>YOUR NEXT</span>
            <span>FAVOURITE</span>
          </div>
          <p className="cinema-tag">is one swipe away.</p>
        </section>

        <section id="try" className="try">
          <div className="section-head" data-reveal>
            <p className="kicker">Try it right here</p>
            <h2>
              Go on, <em>give it a swipe.</em>
            </h2>
            <p className="section-sub">These are real films from the MovieVerse catalog. Drag the card, or use the buttons.</p>
          </div>
          <div className="try-grid">
            <div className="try-panel glass glass-panel" data-reveal>
              <SwipeDemo />
            </div>
            <div className="try-panel glass glass-panel" data-reveal>
              <h3 className="try-title">What are you in the mood for?</h3>
              <MoodDemo />
            </div>
          </div>
        </section>

        <section className="gallery" aria-label="App screens">
          <div className="section-head" data-reveal>
            <p className="kicker">Every screen</p>
            <h2>
              Black, white and <em>nothing in the way.</em>
            </h2>
          </div>
          <div className="gallery-stage" data-reveal>
            <Phone className="gallery-phone g-1"><WatchlistScreen /></Phone>
            <Phone className="gallery-phone g-2"><MoodScreen moodIndex={3} /></Phone>
            <Phone className="gallery-phone g-3"><HomeScreen /></Phone>
            <Phone className="gallery-phone g-4"><DetailScreen /></Phone>
            <Phone className="gallery-phone g-5"><SwipeScreen auto={false} /></Phone>
          </div>
        </section>

        <section className="stats" aria-label="MovieVerse in numbers">
          {STATS.map((s) => (
            <div key={s.label} className="stat glass" data-reveal>
              <strong>
                <CountUp value={s.value} />
              </strong>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        <section id="faq" className="faq">
          <div className="section-head" data-reveal>
            <p className="kicker">Questions</p>
            <h2>
              Good to <em>know.</em>
            </h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div key={f.q} className={`faq-item glass${openFaq === i ? " is-open" : ""}`}>
                <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <i aria-hidden />
                </button>
                <div className="faq-answer">
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="cta">
          <ProjectorArt />
          <div className="cta-card glass glass-refract" data-reveal>
            <h2>
              Tonight&apos;s movie is <em>waiting.</em>
            </h2>
            <p>Free. Android. Sign in with a code and start swiping.</p>
            <a href={APK_URL} className="btn btn-solid" target="_blank" rel="noopener noreferrer">
              <DownloadIcon /> Download APK
            </a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-row">
          <Link href="/" className="nav-brand">
            <Image src="/MVV.png" alt="" width={24} height={24} />
            MovieVerse
          </Link>
          <div className="foot-links">
            <Link href="/">Home</Link>
            <Link href="/website">Browse</Link>
            <Link href="/privacy">Privacy</Link>
            <a href={APK_URL} target="_blank" rel="noopener noreferrer">Download</a>
          </div>
        </div>
        <p className="foot-note">Poster artwork from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </footer>
    </div>
  );
}
