// The device frame and the app's real screens, drawn in code so they stay sharp
// at any size. All sizes inside the screen use cqw, so a screen scales with its phone.
import type { ReactNode } from "react";
import { DECK, MOODS, TMDB } from "./app-data";

export const poster = (path: string, size: "w185" | "w342" | "w500" = "w342") => `${TMDB}/${size}${path}`;

type Tab = "home" | "watchlist" | "tinder" | "mood";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: "home",
    label: "Home",
    icon: <path d="M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3z" />,
  },
  {
    id: "watchlist",
    label: "Watchlist",
    icon: <path d="M6 3h12v18l-6-4.5L6 21z" />,
  },
  {
    id: "tinder",
    label: "Tinder",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.5-4.5" />
      </>
    ),
  },
  {
    id: "mood",
    label: "Mood",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 14.5s1.2 2 3.5 2 3.5-2 3.5-2M9 9.5h.01M15 9.5h.01" />
      </>
    ),
  },
];

function TabBar({ active }: { active: Tab }) {
  return (
    <div className="ps-tabs">
      {TABS.map((t) => (
        <div key={t.id} className={`ps-tab${t.id === active ? " is-on" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {t.icon}
          </svg>
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function PosterImg({ path, alt, size }: { path: string; alt: string; size?: "w185" | "w342" | "w500" }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={poster(path, size)} alt={alt} loading="lazy" draggable={false} />;
}

function Row({ title, items }: { title: string; items: { title: string; poster: string }[] }) {
  return (
    <div className="ps-row">
      <div className="ps-row-head">
        <b>{title}</b>
        <i>›</i>
      </div>
      <div className="ps-row-items">
        {items.map((m) => (
          <figure key={m.title}>
            <PosterImg path={m.poster} alt="" size="w185" />
            <figcaption>{m.title}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function HomeScreen() {
  return (
    <div className="ps ps-home">
      <div className="ps-scroll">
        <div className="ps-greet">
          <div>
            <small>Good Evening,</small>
            <strong>Movie lover</strong>
          </div>
          <span className="ps-avatar" />
        </div>
        <div className="ps-search">
          <span>Search movies</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.5-4.5" />
          </svg>
        </div>
        <div className="ps-moodcard">
          <b>How are you feeling today?</b>
          <small>Get movies personalized for your mood</small>
          <div className="ps-moodgrid">
            <span>I&apos;m feeling Happy</span>
            <span className="is-on">I&apos;m feeling Sad</span>
            <span className="is-on">I&apos;m feeling Love</span>
            <span>I&apos;m feeling Empty</span>
          </div>
        </div>
        <Row title="TOP PICKS FOR YOU" items={DECK.slice(0, 3)} />
        <Row title="TRENDING NOW" items={DECK.slice(3, 6)} />
      </div>
      <TabBar active="home" />
    </div>
  );
}

export function SwipeScreen({ auto = true }: { auto?: boolean }) {
  const cards = DECK.slice(0, 4);
  return (
    <div className={`ps ps-swipe${auto ? " is-auto" : ""}`}>
      <div className="ps-swipe-head">
        <h4>Feel a Match?</h4>
        <small>Swipe right</small>
      </div>
      <div className="ps-deck">
        {[...cards].reverse().map((m, i) => (
          <article key={m.title} className={`ps-card ps-card-${cards.length - i}`}>
            <PosterImg path={m.poster} alt="" />
            <span className="ps-stamp ps-stamp-like">Watchlist</span>
            <span className="ps-stamp ps-stamp-nope">Pass</span>
            <div className="ps-card-info">
              <b>{m.title}</b>
              <p>{m.description}</p>
              <div className="ps-card-meta">
                <span>IMDB: {m.imdb}</span>
                <span>Our Rating: N/A</span>
              </div>
              <em>{m.genres.join(" · ")}</em>
            </div>
          </article>
        ))}
      </div>
      <TabBar active="tinder" />
    </div>
  );
}

export function MoodScreen({ moodIndex = 0 }: { moodIndex?: number }) {
  const mood = MOODS[moodIndex];
  return (
    <div className="ps ps-mood">
      <div className="ps-scroll">
        <h4>
          You&apos;re in the mood for
          <br />
          {mood.genre}
        </h4>
        <small>Here are our suggestions</small>
        <div className="ps-moodposters">
          {mood.picks.slice(0, 6).map((m) => (
            <figure key={m.title}>
              <PosterImg path={m.poster} alt="" size="w185" />
              <figcaption>{m.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <TabBar active="mood" />
    </div>
  );
}

export function WatchlistScreen() {
  return (
    <div className="ps ps-watch">
      <div className="ps-scroll">
        <div className="ps-watch-head">
          <h4>Your Watchlist</h4>
          <span className="ps-avatar ps-refresh">↻</span>
        </div>
        {DECK.slice(1, 5).map((m, i) => (
          <div key={m.title} className="ps-watch-row" style={{ animationDelay: `${i * 0.14}s` }}>
            <PosterImg path={m.poster} alt="" size="w185" />
            <div>
              <b>{m.title}</b>
              <small>Genre: {m.genres.slice(0, 2).join(", ")}</small>
              <p>{m.description}</p>
            </div>
          </div>
        ))}
        <div className="ps-watch-end">End of your watchlist</div>
      </div>
      <TabBar active="watchlist" />
    </div>
  );
}

export function DetailScreen() {
  const m = DECK[1];
  return (
    <div className="ps ps-detail">
      <div className="ps-detail-hero">
        <PosterImg path={m.poster} alt="" size="w500" />
      </div>
      <div className="ps-detail-body">
        <div className="ps-detail-title">
          <h4>{m.title}</h4>
          <span>★ {m.imdb}</span>
        </div>
        <small>Directed by {m.director}</small>
        <div className="ps-chips">
          {m.genres.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
        <div className="ps-detail-actions">
          <span>＋<br />Add to Watchlist</span>
          <span>▷<br />Watch Trailer</span>
        </div>
        <b>Overview</b>
        <p>{m.description}</p>
      </div>
    </div>
  );
}

export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`phone ${className}`.trim()}>
      <span className="phone-key phone-key-a" aria-hidden />
      <span className="phone-key phone-key-b" aria-hidden />
      <div className="phone-body">
        <div className="phone-screen">
          <div className="ps-status" aria-hidden>
            <span>9:41</span>
            <i className="ps-hole" />
            <span>5G ▮</span>
          </div>
          {children}
          <i className="phone-glare" aria-hidden />
        </div>
      </div>
    </div>
  );
}
