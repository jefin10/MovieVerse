/*
 * The /app page. Light, airy layout: a phone flanked by posters over a giant
 * faded wordmark, stat cards, a genre strip, phone-and-text splits, cascading
 * how-it-works cards, plans, reviews and a tilted-phone call to action.
 * The phones run the generated app mockups (Mockups.tsx, mockups.css).
 * Page layout and motion: site.css. Behaviour: AppMotion.tsx.
 */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import AppMotion from "./AppMotion";
import { HeroDemo, MomentMatch, MoodDemo, SwipeDemo } from "./Mockups";
import { Icon, LogoMark, Sprites } from "./Sprites";

const APK_URL = "https://github.com/jefin10/movieverse/releases/latest/download/movieverse.apk";
const TMDB = "https://image.tmdb.org/t/p/w500";
const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/* Real catalog posters (served by TMDB, as on the rest of the site). */
const HERO_POSTERS = [
  { slot: "l2", title: "Coco", path: "/wSJHuSD7ojzoXifWjOAjxV7UpEL.jpg" },
  { slot: "l1", title: "The Dark Knight", path: "/oOv2oUXcAaNXakRqUPxYq5lJURz.jpg" },
  { slot: "r1", title: "Interstellar", path: "/l33oR0mnvf20avWyIMxW02EtQxn.jpg" },
  { slot: "r2", title: "The Grand Budapest Hotel", path: "/xHDynIimfsgj0ZOs0j5ma8v1vmM.jpg" },
];

const GENRES = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Drama", "Family", "Fantasy", "Film-Noir", "History",
  "Horror", "Music", "Musical", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western",
];

const FEATURES = [
  "Swipe to build your watchlist",
  "Mood picks from your own words",
  "Watch Together with a room code",
  "Taste match with friends",
  "Tonight’s pick, every evening",
  "Where to watch, in your country",
];

const STEPS = [
  { n: "#01", title: "Sign in", text: "Enter your email and type the 6-digit code we send. No password to remember, or use Google." },
  { n: "#02", title: "Pick your taste", text: "Choose the genres you love and the streaming services you pay for. It takes under a minute." },
  { n: "#03", title: "Start swiping", text: "Swipe right to keep, left to skip. Every swipe sharpens tonight’s pick and your mood matches." },
];

const PLANS: { name: string; blurb: string; price?: string; cta: ReactNode; items: string[]; featured?: boolean }[] = [
  {
    name: "On the web",
    blurb: "Browse the whole catalog from any browser. Nothing to install, no account needed.",
    cta: (
      <Link href="/website" className="ao-btn">
        Browse films
      </Link>
    ),
    items: ["Full movie catalog", "Search and genres", "Trailers and movie pages"],
  },
  {
    name: "In the app",
    blurb: "Everything that picks tonight’s film for you, free on Android.",
    price: "₹0",
    cta: (
      <a href={APK_URL} className="ao-btn" rel="noopener">
        Download
      </a>
    ),
    items: ["Swipe and watchlist", "Mood picks", "Watch Together", "Friends and taste match", "Tonight’s pick and streaming alerts"],
    featured: true,
  },
];

/* Placeholder reviews: replace with real ones before launch. */
const REVIEWS = [
  { name: "Reviewer name", handle: "@placeholder", quote: "Placeholder review. A short line about finding a film in minutes goes here." },
  { name: "Reviewer name", handle: "@placeholder", quote: "Placeholder review. A line about Watch Together with friends goes here." },
  { name: "Reviewer name", handle: "@placeholder", quote: "Placeholder review. A line about how good the mood picks are goes here." },
];

function LoopButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="ao-loopbtn" aria-label={label}>
      <span className="ao-loopbtn__track" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i}>{label} –</span>
        ))}
      </span>
    </a>
  );
}

function Stars() {
  return (
    <span className="ao-stars" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" size={15} fill />
      ))}
    </span>
  );
}

export default function AppSite() {
  return (
    <div className="mv ao" id="top">
      <Sprites />
      <a className="ao-skip" href="#main">
        Skip to content
      </a>

      <header className="ao-nav" data-nav>
        <div className="ao-wrap ao-nav__in">
          <Link href="/" className="ao-logo" aria-label="MovieVerse home">
            <LogoMark size={28} tone="dark" />
            MovieVerse
          </Link>
          <nav className="ao-nav__links" aria-label="Main">
            <Link href="/">Home</Link>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <Link href="/website">Browse</Link>
          </nav>
          <LoopButton href="#download" label="Download now" />
        </div>
      </header>

      <main id="main">
        {/* Hero: phone flanked by posters, giant wordmark behind */}
        <section className="ao-hero" aria-label="MovieVerse app preview">
          <p className="ao-hero__word" aria-hidden="true">
            <span>MovieVerse</span>
            <span>MovieVerse</span>
          </p>
          <div className="ao-hero__stage">
            {HERO_POSTERS.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.slot}
                className={`ao-hero__poster ao-hero__poster--${p.slot}`}
                src={`${TMDB}${p.path}`}
                alt={`${p.title} poster`}
                width={500}
                height={750}
                fetchPriority="high"
              />
            ))}
            <div className="ao-hero__phone">
              <HeroDemo />
            </div>
          </div>
        </section>

        {/* Headline, stats, genre strip */}
        <section className="ao-intro">
          <div className="ao-wrap">
            <div className="ao-intro__head" data-reveal>
              <h1>Let your taste pick tonight’s film</h1>
              <p className="ao-lede">
                Swipe through films, say how you feel, and match picks with friends. MovieVerse turns it all into one good movie for
                tonight.
              </p>
            </div>
            <div className="ao-stats">
              <div className="ao-stat" data-reveal>
                <span className="ao-stat__ic">
                  <Icon name="film" size={18} />
                </span>
                <div className="ao-stat__row">
                  <strong>
                    +<span data-count="661">661</span>
                  </strong>
                  <span className="ao-stat__label">Films to discover</span>
                </div>
                <p>A hand-picked catalog of classics and modern favourites, with ratings, trailers and cast.</p>
              </div>
              <div className="ao-stat" data-reveal>
                <span className="ao-stat__ic">
                  <Icon name="lock" size={18} />
                </span>
                <div className="ao-stat__row">
                  <strong>
                    <span data-count="0">0</span>
                  </strong>
                  <span className="ao-stat__label">Passwords to remember</span>
                </div>
                <p>Sign in with a 6-digit code from your email, or continue with Google.</p>
              </div>
            </div>
            <p className="ao-strip__label">Genres to explore:</p>
          </div>
          <div className="ao-strip" aria-label="Genres in the catalog">
            <div className="ao-strip__track">
              {[0, 1].map((copy) => (
                <ul key={copy} className="ao-strip__set" aria-hidden={copy === 1}>
                  {GENRES.map((g) => (
                    <li key={g}>
                      <Icon name="film" size={20} />
                      {g}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        {/* Split 1: mood */}
        <section id="features" className="ao-split">
          <div className="ao-wrap ao-split__in">
            <div className="ao-split__media" data-reveal>
              <MoodDemo />
            </div>
            <div className="ao-split__copy" data-reveal>
              <h2>Movies that match your mood</h2>
              <p>
                Tap a mood or type one in your own words. A small AI model reads it and fills your screen with films that fit,
                from cozy rainy-night romances to edge-of-your-seat thrillers.
              </p>
              <a href={APK_URL} className="ao-btn" rel="noopener">
                Get the app
              </a>
            </div>
          </div>
        </section>

        {/* Split 2: feature checklist */}
        <section className="ao-split ao-split--flip">
          <div className="ao-wrap ao-split__in">
            <div className="ao-split__media" data-reveal>
              <SwipeDemo />
            </div>
            <div className="ao-split__copy" data-reveal>
              <h2>Everything for movie night</h2>
              <ul className="ao-checks">
                {FEATURES.map((f) => (
                  <li key={f}>
                    <span className="ao-checks__ic">
                      <Icon name="check" size={11} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/website" className="ao-btn">
                Browse films
              </Link>
            </div>
          </div>
        </section>

        {/* How it works: the cards cascade into a row as you scroll */}
        <section id="how" className="ao-how" aria-labelledby="ao-how-title">
          <div className="ao-how__sticky">
            <div className="ao-wrap">
              <h2 id="ao-how-title" data-reveal>
                How it works
              </h2>
              <ol className="ao-how__cards">
                {STEPS.map((s, i) => (
                  <li key={s.n} className="ao-step" style={v({ "--i": i })}>
                    <div className="ao-step__head">
                      <span className="ao-step__n">{s.n}</span>
                      <h3>{s.title}</h3>
                    </div>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Plans: both free */}
        <section className="ao-plans" aria-labelledby="ao-plans-title">
          <div className="ao-wrap">
            <h2 id="ao-plans-title" data-reveal>
              Our plans
            </h2>
            <div className="ao-plans__grid">
              {PLANS.map((p) => (
                <article key={p.name} className={`ao-plan${p.featured ? " ao-plan--featured" : ""}`} data-reveal>
                  <div className="ao-plan__inner">
                    <h3>{p.name}</h3>
                    <p>{p.blurb}</p>
                    {p.price ? (
                      <p className="ao-plan__price">
                        {p.price}
                        <small>/forever</small>
                      </p>
                    ) : null}
                    {p.cta}
                    <ul className="ao-checks ao-checks--sm">
                      {p.items.map((it) => (
                        <li key={it}>
                          <span className="ao-checks__ic">
                            <Icon name="check" size={11} />
                          </span>
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews (placeholders) */}
        <section className="ao-reviews" aria-labelledby="ao-reviews-title">
          <div className="ao-wrap">
            <h2 id="ao-reviews-title" data-reveal>
              What movie fans
              <br />
              say about us
            </h2>
            <div className="ao-reviews__grid">
              {REVIEWS.map((r, i) => (
                <figure key={i} className="ao-review" data-reveal>
                  <span className="ao-review__tag">Placeholder</span>
                  <Stars />
                  <blockquote>“{r.quote}”</blockquote>
                  <figcaption>
                    <span className="ao-review__av">{String.fromCharCode(65 + i)}</span>
                    <span>
                      <b>{r.name}</b>
                      <small>{r.handle}</small>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Final call to action with a tilted phone */}
        <section id="download" className="ao-final" aria-labelledby="ao-final-title">
          <div className="ao-wrap ao-final__in">
            <div className="ao-final__phone">
              <MomentMatch />
            </div>
            <h2 id="ao-final-title" data-reveal>
              Ready for movie night?
            </h2>
            <p className="ao-lede" data-reveal>
              Stop scrolling and start watching. Get the app and let your taste pick tonight’s film.
            </p>
            <div className="ao-final__ctas" data-reveal>
              <a href={APK_URL} className="ao-store" rel="noopener">
                <Icon name="download" size={18} />
                <span>
                  Download for
                  <br />
                  Android
                </span>
              </a>
              <Link href="/website" className="ao-store">
                <Icon name="globe" size={18} />
                <span>
                  Browse on
                  <br />
                  the web
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="ao-footer">
        <div className="ao-wrap ao-footer__in">
          <span>MovieVerse © {new Date().getFullYear()} · All rights reserved</span>
          <Link href="/privacy">Privacy</Link>
          <span>Uses the TMDB API but is not endorsed or certified by TMDB</span>
        </div>
      </footer>

      <AppMotion />
    </div>
  );
}
