/*
 * The /app marketing page. Mostly pictures, very little text: every screen is a
 * generated mockup (Mockups.tsx) and every illustration is inline SVG/CSS
 * (Art.tsx). Styles and motion: app.css. Behaviour: AppMotion.tsx.
 */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import AppMotion from "./AppMotion";
import { HeroBackdrop, HeroTiles, PosterRing, StepCode, StepSwipe, StepTaste } from "./Art";
import {
  DetailDemo,
  FriendsDemo,
  HeroDemo,
  MomentCode,
  MomentConfirm,
  MomentMatch,
  MomentOffline,
  MomentRating,
  MomentSheet,
  MomentToast,
  MoodDemo,
  PickDemo,
  RoomDemo,
  SwipeDemo,
} from "./Mockups";
import { Icon, LogoMark, Sprites, type IconName } from "./Sprites";

const APK_URL = "https://github.com/jefin10/movieverse/releases/latest/download/movieverse.apk";

const FEATURES: { id: string; icon: IconName; kicker: string; title: ReactNode; line: string; demo: ReactNode }[] = [
  {
    id: "swipe",
    icon: "layers",
    kicker: "Swipe",
    title: (
      <>
        Right to keep.
        <br />
        Left to skip.
      </>
    ),
    line: "Your watchlist fills itself while you decide.",
    demo: <SwipeDemo />,
  },
  {
    id: "mood",
    icon: "smile",
    kicker: "Mood",
    title: (
      <>
        Say how
        <br />
        you feel.
      </>
    ),
    line: "Type a mood in your own words. Get a shelf of films that fit.",
    demo: <MoodDemo />,
  },
  {
    id: "together",
    icon: "users",
    kicker: "Watch Together",
    title: (
      <>
        Swipe as
        <br />
        a group.
      </>
    ),
    line: "Share a code. Only the films you all like make the cut.",
    demo: <RoomDemo />,
  },
  {
    id: "friends",
    icon: "heart",
    kicker: "Friends",
    title: (
      <>
        Find your
        <br />
        taste twin.
      </>
    ),
    line: "A match score for everyone you follow.",
    demo: <FriendsDemo />,
  },
  {
    id: "tonight",
    icon: "moon",
    kicker: "Tonight’s pick",
    title: (
      <>
        One good pick
        <br />
        a night.
      </>
    ),
    line: "Plus a ping when your watchlist reaches your services.",
    demo: <PickDemo />,
  },
  {
    id: "details",
    icon: "star",
    kicker: "Details",
    title: (
      <>
        Rate it. See
        <br />
        where it streams.
      </>
    ),
    line: "Trailer, ratings and where to watch, in one place.",
    demo: <DetailDemo />,
  },
];

const STEPS: { title: string; line: string; art: ReactNode }[] = [
  { title: "Sign in with a code", line: "No passwords. Just your email.", art: <StepCode /> },
  { title: "Pick what you love", line: "Genres, and the services you pay for.", art: <StepTaste /> },
  { title: "Start swiping", line: "Picks get sharper with every swipe.", art: <StepSwipe /> },
];

const MOMENTS: { id: string; label: string; icon: IconName; line: string; demo: ReactNode }[] = [
  { id: "toast", label: "Notification", icon: "bell", line: "Slides in when something new happens.", demo: <MomentToast /> },
  { id: "match", label: "Match", icon: "heart", line: "Pops when everyone in the room likes a film.", demo: <MomentMatch /> },
  { id: "confirm", label: "Confirm", icon: "trash-2", line: "Asks before anything leaves your list.", demo: <MomentConfirm /> },
  { id: "rating", label: "Rating", icon: "star", line: "Five taps, and your picks get sharper.", demo: <MomentRating /> },
  { id: "offline", label: "Offline", icon: "wifi-off", line: "Keeps working offline, then syncs.", demo: <MomentOffline /> },
  { id: "code", label: "Sign-in", icon: "mail", line: "A 6-digit code instead of a password.", demo: <MomentCode /> },
  { id: "sheet", label: "Sheet", icon: "log-out", line: "Bottom sheets for the big decisions.", demo: <MomentSheet /> },
];

/* Placeholder reviews: replace with real ones before launch. */
const REVIEWS = [
  { initial: "A", name: "Reviewer name", meta: "Placeholder · City", quote: "Placeholder review. A short line about finding a film fast goes here." },
  { initial: "B", name: "Reviewer name", meta: "Placeholder · City", quote: "Placeholder review. A line about Watch Together with friends goes here." },
  { initial: "C", name: "Reviewer name", meta: "Placeholder · City", quote: "Placeholder review. A line about the mood picks goes here." },
];

const FAQS: { q: string; a: ReactNode }[] = [
  { q: "Is MovieVerse free?", a: "Yes. Every feature." },
  { q: "Is there an iPhone app?", a: "Android for now. You can browse the catalog on the web from any device." },
  { q: "Do I need a password?", a: "No. We email you a 6-digit code, or you can continue with Google." },
  { q: "How do mood picks work?", a: "A small AI model turns your words into a genre, then we pick the best-rated films in it." },
  {
    q: "How does Watch Together work?",
    a: "Start a room and share its 6-character code. Everyone swipes the same films on their own phone, and you only see the ones you all liked.",
  },
  { q: "Where does ‘where to watch’ come from?", a: "JustWatch, through TMDB, for India, the US and the UK." },
  {
    q: "What happens to my data?",
    a: (
      <>
        Read the <Link href="/privacy">privacy policy</Link>.
      </>
    ),
  },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mv-eyebrow">
      <span className="mv-eyebrow__dot" />
      {children}
    </p>
  );
}

export default function AppSite() {
  return (
    <div className="mv" id="top">
      <Sprites />
      <a className="mv-skip" href="#main">
        Skip to content
      </a>

      {/* 1 · Sticky nav */}
      <header className="mv-nav" data-nav>
        <div className="mv-wrap mv-nav__in">
          <Link href="/" className="mv-logo" aria-label="MovieVerse home">
            <LogoMark size={30} />
            <span className="mv-logo__word">MovieVerse</span>
          </Link>
          <nav className="mv-nav__links" aria-label="On this page">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#moments">Details</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="mv-nav__cta">
            <Link href="/website" className="mv-btn mv-btn--ghost mv-btn--sm mv-hide-sm">
              Browse
            </Link>
            <a href="#download" className="mv-btn mv-btn--solid mv-btn--sm">
              Get the app
            </a>
          </div>
        </div>
      </header>

      <main id="main">
        {/* 2 · Hero */}
        <section className="mv-hero" aria-labelledby="mv-hero-title">
          <HeroBackdrop />
          <div className="mv-wrap mv-hero__grid">
            <div className="mv-hero__copy">
              <p className="mv-pill mv-in" style={{ "--in": 0 } as CSSProperties}>
                <span className="mv-pill__dot" /> Free on Android
              </p>
              <h1 id="mv-hero-title" className="mv-in" style={{ "--in": 1 } as CSSProperties}>
                Let your taste pick <span className="mv-shine">tonight’s film.</span>
              </h1>
              <p className="mv-lede mv-in" style={{ "--in": 2 } as CSSProperties}>
                Swipe. Say your mood. Watch together.
              </p>
              <div className="mv-cta-row mv-in" style={{ "--in": 3 } as CSSProperties}>
                <a className="mv-btn mv-btn--solid mv-btn--lg" href={APK_URL} rel="noopener">
                  <Icon name="download" size={18} /> Download for Android
                </a>
                <Link className="mv-btn mv-btn--ghost mv-btn--lg" href="/website">
                  Browse films <Icon name="arrow-right" size={16} />
                </Link>
              </div>
            </div>
            <div className="mv-hero__stage mv-in" style={{ "--in": 2 } as CSSProperties}>
              <HeroTiles />
              <div className="mv-hero__float">
                <HeroDemo />
              </div>
            </div>
          </div>
          <a href="#stats" className="mv-scrollcue" aria-label="Scroll to learn more">
            <span />
          </a>
        </section>

        {/* 3 · Key numbers */}
        <section id="stats" className="mv-stats" aria-label="MovieVerse in numbers">
          <div className="mv-wrap mv-stats__row">
            {[
              { icon: "film" as IconName, n: 661, label: "films" },
              { icon: "sliders" as IconName, n: 21, label: "genres" },
              { icon: "tv" as IconName, n: 3, label: "countries for where to watch" },
              { icon: "lock" as IconName, n: 0, label: "passwords" },
            ].map((s) => (
              <div key={s.label} className="mv-stat" data-reveal>
                <span className="mv-stat__ic">
                  <Icon name={s.icon} size={18} />
                </span>
                <strong data-count={s.n}>{s.n}</strong>
                <span className="mv-stat__l">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4 · Features */}
        <section id="features" className="mv-section" aria-labelledby="mv-features-title">
          <div className="mv-wrap">
            <header className="mv-head" data-reveal>
              <Eyebrow>Features</Eyebrow>
              <h2 id="mv-features-title">
                Less scrolling.
                <br />
                More watching.
              </h2>
            </header>
            {FEATURES.map((f, i) => (
              <article key={f.id} id={`feature-${f.id}`} className={`mv-feature${i % 2 ? " mv-feature--flip" : ""}`}>
                <div className="mv-feature__copy" data-reveal>
                  <span className="mv-feature__num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mv-feature__kicker">
                    <Icon name={f.icon} size={15} /> {f.kicker}
                  </p>
                  <h3>{f.title}</h3>
                  <p className="mv-feature__line">{f.line}</p>
                </div>
                <div className="mv-feature__demo" data-reveal>
                  <span className="mv-feature__halo" aria-hidden="true" />
                  {f.demo}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 5 · How it works */}
        <section id="how" className="mv-section mv-how" aria-labelledby="mv-how-title">
          <div className="mv-wrap">
            <header className="mv-head mv-head--center" data-reveal>
              <Eyebrow>How it works</Eyebrow>
              <h2 id="mv-how-title">Three steps to movie night.</h2>
            </header>
            <ol className="mv-steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="mv-step" data-reveal data-demo>
                  <span className="mv-step__n" aria-hidden="true">
                    {i + 1}
                  </span>
                  {s.art}
                  <h3>{s.title}</h3>
                  <p>{s.line}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 6 · Popups & small moments */}
        <section id="moments" className="mv-section mv-moments" aria-labelledby="mv-moments-title">
          <div className="mv-wrap">
            <header className="mv-head mv-head--center" data-reveal>
              <Eyebrow>The small moments</Eyebrow>
              <h2 id="mv-moments-title">Every pop-up, polished.</h2>
            </header>
            <div className="mv-tabs-ui" data-tabs data-reveal>
              <div className="mv-tablist" role="tablist" aria-label="App pop-ups">
                {MOMENTS.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    id={`mv-tab-${m.id}`}
                    aria-controls={`mv-panel-${m.id}`}
                    aria-selected={i === 0}
                    tabIndex={i === 0 ? 0 : -1}
                    className="mv-tabbtn"
                  >
                    <Icon name={m.icon} size={15} />
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="mv-stage">
                {MOMENTS.map((m, i) => (
                  <div
                    key={m.id}
                    role="tabpanel"
                    id={`mv-panel-${m.id}`}
                    aria-labelledby={`mv-tab-${m.id}`}
                    className="mv-panel"
                    hidden={i !== 0}
                  >
                    {m.demo}
                    <p className="mv-panel__line">{m.line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7 · Testimonials (placeholders) */}
        <section className="mv-section mv-reviews" aria-labelledby="mv-reviews-title">
          <div className="mv-wrap">
            <header className="mv-head mv-head--center" data-reveal>
              <Eyebrow>Reviews</Eyebrow>
              <h2 id="mv-reviews-title">Loved on movie night.</h2>
            </header>
            <div className="mv-reviews__grid">
              {REVIEWS.map((r, i) => (
                <figure key={i} className="mv-review" data-reveal>
                  <span className="mv-review__tag">Placeholder</span>
                  <span className="mv-review__stars" aria-label="5 out of 5 stars">
                    ★★★★★
                  </span>
                  <blockquote>{r.quote}</blockquote>
                  <figcaption>
                    <span className="mv-av mv-av--md">{r.initial}</span>
                    <span>
                      <b>{r.name}</b>
                      <small>{r.meta}</small>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 8 · Pricing: the app has no plans; it's free (stated in the hero and FAQ). */}

        {/* 9 · FAQ */}
        <section id="faq" className="mv-section mv-faq" aria-labelledby="mv-faq-title">
          <div className="mv-wrap mv-faq__wrap">
            <header className="mv-head" data-reveal>
              <Eyebrow>FAQ</Eyebrow>
              <h2 id="mv-faq-title">Quick answers.</h2>
            </header>
            <div className="mv-faq__list" data-reveal>
              {FAQS.map((f) => (
                <details key={f.q} className="mv-qa" name="mv-faq">
                  <summary>
                    {f.q}
                    <span className="mv-qa__icon" aria-hidden="true">
                      <Icon name="plus" size={16} />
                    </span>
                  </summary>
                  <div className="mv-qa__a">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 10 · Final call to action */}
        <section id="download" className="mv-final" aria-labelledby="mv-final-title">
          <PosterRing />
          <div className="mv-wrap mv-final__in" data-reveal>
            <LogoMark size={56} className="mv-final__mark" />
            <h2 id="mv-final-title">
              Your next favourite is
              <br />
              <span className="mv-shine">one swipe away.</span>
            </h2>
            <div className="mv-badges">
              <a className="mv-badge-store mv-badge-store--live" href={APK_URL} rel="noopener">
                <Icon name="download" size={22} />
                <span>
                  <small>Download the</small>
                  <b>Android APK</b>
                </span>
              </a>
              <span className="mv-badge-store" aria-disabled="true" title="Store badge placeholder">
                <Icon name="play" size={20} />
                <span>
                  <small>Placeholder</small>
                  <b>Google Play</b>
                </span>
              </span>
              <span className="mv-badge-store" aria-disabled="true" title="Store badge placeholder">
                <Icon name="smartphone" size={20} />
                <span>
                  <small>Placeholder</small>
                  <b>App Store</b>
                </span>
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* 11 · Footer */}
      <footer className="mv-footer">
        <div className="mv-wrap mv-footer__in">
          <Link href="/" className="mv-logo" aria-label="MovieVerse home">
            <LogoMark size={26} />
            <span className="mv-logo__word">MovieVerse</span>
          </Link>
          <nav className="mv-footer__links" aria-label="Footer">
            <Link href="/">Home</Link>
            <Link href="/website">Browse</Link>
            <Link href="/privacy">Privacy</Link>
            <a href={APK_URL} rel="noopener">
              Download
            </a>
          </nav>
          <p className="mv-footer__fine">
            © {new Date().getFullYear()} MovieVerse · Uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </footer>

      <AppMotion />
    </div>
  );
}
