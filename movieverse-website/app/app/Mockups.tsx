/*
 * Generated app mockups for the /app page. Every screen here is rebuilt in
 * HTML/CSS from the real app (MovieVerseApp) — same layout, colours and copy —
 * at a fixed 300px screen width. Phones are resized with CSS `zoom`.
 *
 * Animation lives in app.css. Each demo sets its loop length in --d, and the
 * pieces inside are timed as percentages of that loop, so they stay in sync.
 */
import type { CSSProperties, ReactNode } from "react";
import { Icon, LogoMark, Poster, type IconName } from "./Sprites";
import { BACKDROPS, tmdb, type Film } from "./films";

/** Lets inline styles carry CSS custom properties. */
const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/* ── Building blocks ─────────────────────────────────────────────────────── */

export function Phone({
  children,
  label,
  className,
  time = "9:41",
}: {
  children: ReactNode;
  label: string;
  className?: string;
  time?: string;
}) {
  return (
    <div className={`mv-phone${className ? ` ${className}` : ""}`} role="img" aria-label={label}>
      <div className="mv-phone__screen" aria-hidden="true">
        <div className="mv-sb">
          <span>{time}</span>
          <span className="mv-sb__icons">
            <svg width="16" height="11" viewBox="0 0 16 11">
              <rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" />
              <rect x="4.3" y="5" width="3" height="6" rx="1" fill="currentColor" />
              <rect x="8.6" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" />
              <rect x="12.9" y="0" width="3" height="11" rx="1" fill="currentColor" />
            </svg>
            <Icon name="globe" size={12} className="mv-sb__net" />
            <svg width="24" height="12" viewBox="0 0 24 12">
              <rect x=".5" y=".5" width="20" height="11" rx="3" fill="none" stroke="currentColor" opacity=".45" />
              <rect x="2" y="2" width="15" height="8" rx="1.8" fill="currentColor" />
              <rect x="21.5" y="4" width="1.8" height="4" rx=".8" fill="currentColor" opacity=".45" />
            </svg>
          </span>
        </div>
        {children}
      </div>
      <span className="mv-phone__island" />
      <span className="mv-phone__side mv-phone__side--a" />
      <span className="mv-phone__side mv-phone__side--b" />
    </div>
  );
}

/** A tap ripple, centred on its parent, fired at --at into the loop. */
const Tap = ({ at }: { at: string }) => <i className="mv-tap" style={v({ "--at": at })} />;

/** Text that types itself out, one character at a time. */
function Typed({ text, start, step = 0.09 }: { text: string; start: number; step?: number }) {
  return (
    <span className="mv-typed">
      {Array.from(text).map((ch, i) => (
        <span key={i} className="mv-ch" style={v({ "--at": `${(start + i * step).toFixed(2)}s` })}>
          {ch === " " ? " " : ch}
        </span>
      ))}
      <i className="mv-caret" />
    </span>
  );
}

const TABS: { key: string; label: string; icon: IconName; center?: boolean }[] = [
  { key: "home", label: "Home", icon: "home" },
  { key: "watchlist", label: "Watchlist", icon: "bookmark" },
  { key: "swipe", label: "Swipe", icon: "layers", center: true },
  { key: "mood", label: "Mood", icon: "smile" },
  { key: "profile", label: "Profile", icon: "user" },
];

/** The app's floating frosted-glass dock, with Swipe as the raised centre button. */
function TabBar({ active, taps }: { active?: string; taps?: Record<string, string> }) {
  return (
    <div className="mv-dock">
      {TABS.map((t) => (
        <span
          key={t.key}
          className={`mv-tab mv-tab--${t.key}${t.center ? " mv-tab--center" : ""}${active === t.key ? " is-on" : ""}`}
        >
          {t.center ? (
            <span className="mv-tab__fab">
              <Icon name={t.icon} size={19} />
              {taps?.[t.key] ? <Tap at={taps[t.key]} /> : null}
            </span>
          ) : (
            <Icon name={t.icon} size={18} />
          )}
          <span className="mv-tab__l">{t.label}</span>
          {!t.center && taps?.[t.key] ? <Tap at={taps[t.key]} /> : null}
        </span>
      ))}
    </div>
  );
}

function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="mv-ph">
      <span className="mv-ph__back">
        <Icon name="arrow-left" size={18} />
      </span>
      <span className="mv-ph__t">{title}</span>
      <span className="mv-ph__r">{right}</span>
    </div>
  );
}

export function Toast({
  title,
  body,
  poster,
  icon,
  className,
}: {
  title: string;
  body: string;
  poster?: Film;
  icon?: IconName;
  className?: string;
}) {
  return (
    <div className={`mv-toast${className ? ` ${className}` : ""}`}>
      {poster !== undefined ? (
        <Poster film={poster} className="mv-toast__img" />
      ) : (
        <span className="mv-toast__icon">
          <Icon name={icon ?? "bell"} size={18} />
        </span>
      )}
      <span className="mv-toast__txt">
        <b>{title}</b>
        <small>{body}</small>
      </span>
    </div>
  );
}

/* ── Screens ─────────────────────────────────────────────────────────────── */

/** Home tab. With `typing`, the Other/Custom box opens and a mood is typed. */
function HomeScreen({ typing }: { typing?: { text: string; start: number; tapOther: string; tapGo: string } }) {
  return (
    <div className="mv-home">
      <div className="mv-home__head">
        <div>
          <p className="mv-home__greet">Good Evening,</p>
          <p className="mv-home__name">jefin</p>
        </div>
        <div className="mv-home__btns">
          <span className="mv-roundbtn">
            <Icon name="bell" size={16} />
            <b className="mv-badge">2</b>
          </span>
          <span className="mv-roundbtn">
            <Icon name="user" size={17} />
          </span>
        </div>
      </div>
      <div className="mv-search">
        <span>Search Movies Here</span>
        <Icon name="search" size={15} />
      </div>
      <div className="mv-moodbox">
        <p className="mv-moodbox__t">How are you feeling today?</p>
        <p className="mv-moodbox__s">Get movies personalized for your mood</p>
        <div className="mv-moodbox__grid">
          <span className="mv-moodbox__btn">I’m feeling Happy</span>
          <span className="mv-moodbox__btn mv-moodbox__btn--light">I’m feeling Sad</span>
          <span className="mv-moodbox__btn mv-moodbox__btn--light">I’m feeling Love</span>
          <span className="mv-moodbox__btn">I’m feeling Empty</span>
        </div>
        <div className="mv-other">
          <span className="mv-other__btn">
            Other/Custom
            {typing ? <Tap at={typing.tapOther} /> : null}
          </span>
          <span className="mv-other__field">
            <span className="mv-other__input">{typing ? <Typed text={typing.text} start={typing.start} /> : null}</span>
            <span className="mv-other__go">
              Go <Icon name="chevron-right" size={12} />
              {typing ? <Tap at={typing.tapGo} /> : null}
            </span>
          </span>
        </div>
      </div>
      <div className="mv-duo">
        <span className="mv-duo__card mv-duo__card--light">
          <Icon name="users" size={16} />
          <b>Watch Together</b>
          <small>Swipe with friends</small>
        </span>
        <span className="mv-duo__card">
          <Icon name="heart" size={16} />
          <b>Friends</b>
          <small>Your taste match</small>
        </span>
      </div>
      <p className="mv-sec">TRENDING NOW</p>
      <div className="mv-row">
        {(["darkKnight", "interstellar", "budapest", "inception"] as const).map((p) => (
          <Poster key={p} film={p} className="mv-row__item" />
        ))}
      </div>
    </div>
  );
}

const MOOD_TILES = [
  { v: "lifeboat", t: "Lifeboat" },
  { v: "coco", t: "Coco" },
  { v: "up", t: "Up" },
  { v: "steps39", t: "The 39 Steps" },
  { v: "whiplash", t: "Whiplash" },
  { v: "inception", t: "Inception" },
];

function MoodResults({ genre }: { genre: string }) {
  return (
    <div className="mv-moodres">
      <p className="mv-moodres__t">
        You’re in the mood for <em>{genre}</em>
      </p>
      <p className="mv-moodres__s">Here are our suggestions</p>
      <div className="mv-moodres__grid">
        {MOOD_TILES.map((m, i) => (
          <span key={m.t} className="mv-tile" style={v({ "--i": i })}>
            <Poster film={m.v as Film} className="mv-tile__img" />
            <span className="mv-tile__name">{m.t}</span>
          </span>
        ))}
      </div>
      <span className="mv-changemood">Change Mood</span>
    </div>
  );
}

const MOODS: { label: string; icon: IconName }[] = [
  { label: "I’m feeling Happy", icon: "smile" },
  { label: "I’m feeling Sad", icon: "frown" },
  { label: "I’m feeling Romantic", icon: "heart" },
  { label: "I’m feeling Lonely", icon: "user" },
  { label: "I’m feeling Adventurous", icon: "compass" },
  { label: "I’m feeling Bad", icon: "cloud-lightning" },
];

function MoodPicker({ typing }: { typing: { text: string; start: number; tapOther: string; tapGo: string } }) {
  return (
    <div className="mv-moodpick">
      <p className="mv-moodpick__t">How are you feeling today?</p>
      <p className="mv-moodpick__s">Get movies personalized for your mood</p>
      <div className="mv-moodpick__grid">
        {MOODS.map((m, i) => (
          <span key={m.label} className={`mv-moodbtn${i % 2 ? " mv-moodbtn--light" : ""}`}>
            <Icon name={m.icon} size={15} />
            {m.label.replace("I’m feeling ", "")}
          </span>
        ))}
      </div>
      <div className="mv-other mv-other--big">
        <span className="mv-other__btn">
          Other/Custom
          <Tap at={typing.tapOther} />
        </span>
        <span className="mv-other__field">
          <span className="mv-other__input">
            <Typed text={typing.text} start={typing.start} />
          </span>
          <span className="mv-other__go">
            Go <Icon name="chevron-right" size={12} />
            <Tap at={typing.tapGo} />
          </span>
        </span>
      </div>
    </div>
  );
}

const DECK = [
  {
    v: "interstellar",
    t: "Interstellar",
    d: "The adventures of a group of explorers who make use of a newly discovered wormhole…",
    imdb: "8.6",
    ours: "9.1",
    g: "Adventure · Drama · Sci-Fi",
  },
  {
    v: "darkKnight",
    t: "The Dark Knight",
    d: "Batman raises the stakes in his war on crime…",
    imdb: "9.0",
    ours: "8.8",
    g: "Action · Crime · Drama",
  },
  {
    v: "coco",
    t: "Coco",
    d: "Despite his family’s generations-old ban on music, Miguel dreams…",
    imdb: "8.4",
    ours: "8.7",
    g: "Animation · Adventure · Family",
  },
];

function SwipeCard({ card, slot, drag }: { card: (typeof DECK)[number]; slot: "a" | "b" | "c"; drag?: boolean }) {
  return (
    <div className={`mv-card mv-card--${slot}`}>
      <Poster film={card.v as Film} className="mv-card__img" />
      <div className="mv-card__ov">
        <p className="mv-card__t">{card.t}</p>
        <p className="mv-card__d">{card.d}</p>
        <p className="mv-card__r">
          <span>IMDB: {card.imdb}</span>
          <span>Our Rating: {card.ours}</span>
        </p>
        <p className="mv-card__g">{card.g}</p>
      </div>
      <span className="mv-card__lbl mv-card__lbl--like">Add to Watchlist</span>
      <span className="mv-card__lbl mv-card__lbl--nope">REJECT</span>
      {drag ? <i className="mv-drag" /> : null}
    </div>
  );
}

function SwipeScreen({ popup = true }: { popup?: boolean }) {
  return (
    <div className="mv-swipe">
      <div className="mv-swipe__head">
        <p className="mv-swipe__t">Feel a Match?</p>
        <p className="mv-swipe__s">
          Swipe right <Icon name="arrow-right" size={15} />
          <span className="mv-swipe__chip">My services</span>
        </p>
      </div>
      <div className="mv-deck">
        <SwipeCard card={DECK[2]} slot="c" />
        <SwipeCard card={DECK[1]} slot="b" drag />
        <SwipeCard card={DECK[0]} slot="a" drag />
      </div>
      {popup ? (
        <div className="mv-popup">
          <Icon name="check-circle" size={17} className="mv-popup__ic" />
          Added Interstellar to watchlist
        </div>
      ) : null}
    </div>
  );
}

/* ── Hero: the main flow on a loop ───────────────────────────────────────── */

export function HeroDemo() {
  return (
    <div className="mv-demo mv-hx" data-demo style={v({ "--d": "18s" })}>
      <Phone
        className="mv-phone--hero"
        label="Animated preview of the MovieVerse app: typing a mood on the home screen, getting film picks, swiping a film into the watchlist, then a Tonight’s pick notification."
      >
        <div className="mv-layer mv-hx__home">
          <HomeScreen typing={{ text: "cozy, rainy night", start: 1.9, tapOther: "1.05s", tapGo: "3.85s" }} />
        </div>
        <div className="mv-layer mv-hx__mood">
          <MoodResults genre="Romance" />
        </div>
        <div className="mv-layer mv-hx__swipe">
          <SwipeScreen />
        </div>
        <TabBar taps={{ swipe: "7.6s" }} />
        <Toast className="mv-hx__toast" poster="interstellar" title="Tonight’s pick: Interstellar" body="Picked for your taste." />
      </Phone>
    </div>
  );
}

/* ── Feature demos ───────────────────────────────────────────────────────── */

export function SwipeDemo() {
  return (
    <div className="mv-demo mv-sw" data-demo style={v({ "--d": "9s" })}>
      <Phone label="Swiping: a film swiped right is added to the watchlist, the next is swiped left and skipped.">
        <div className="mv-layer">
          <SwipeScreen />
        </div>
        <TabBar active="swipe" />
      </Phone>
      <div className="mv-float mv-sw__count" aria-hidden="true">
        <Icon name="bookmark" size={18} />
        <span className="mv-flip">
          <b>12</b>
          <b>13</b>
        </span>
        <small>in watchlist</small>
      </div>
      <div className="mv-float mv-sw__heart" aria-hidden="true">
        <Icon name="heart" size={22} fill />
      </div>
    </div>
  );
}

export function MoodDemo() {
  return (
    <div className="mv-demo mv-md" data-demo style={v({ "--d": "10s" })}>
      <Phone label="Mood picks: typing ‘cozy, rainy night’ turns into Romance and a grid of films.">
        <div className="mv-layer mv-md__pick">
          <MoodPicker typing={{ text: "cozy, rainy night", start: 1.2, tapOther: "0.75s", tapGo: "3.1s" }} />
        </div>
        <div className="mv-layer mv-md__res">
          <MoodResults genre="Romance" />
        </div>
        <TabBar active="mood" />
      </Phone>
      <div className="mv-float mv-md__ai" aria-hidden="true">
        <span className="mv-md__words">“cozy, rainy night”</span>
        <span className="mv-md__spark">
          <Icon name="zap" size={14} fill />
        </span>
        <span className="mv-md__genre">Romance</span>
      </div>
    </div>
  );
}

const CONFETTI = [
  [-110, -150, 200], [100, -170, -160], [-150, -40, 120], [150, -60, -220], [-90, 120, 260], [120, 110, -120],
  [-40, -190, 90], [40, 170, -60], [-170, 60, 180], [170, 40, -200], [10, -120, 140], [-10, 140, -90],
];

function MatchModal({ poster, title }: { poster: Film; title: string }) {
  return (
    <div className="mv-match">
      <div className="mv-match__box">
        <p className="mv-match__t">It’s a match!</p>
        <Poster film={poster} className="mv-match__img" />
        <p className="mv-match__name">{title}</p>
        <p className="mv-match__sub">You all liked this one.</p>
        <span className="mv-match__btn">Keep swiping</span>
        <span className="mv-match__link">See details</span>
      </div>
      <div className="mv-confetti">
        {CONFETTI.map(([x, y, r], i) => (
          <i key={i} style={v({ "--x": `${x}px`, "--y": `${y}px`, "--r": `${r}deg` })} />
        ))}
      </div>
    </div>
  );
}

export function RoomDemo() {
  return (
    <div className="mv-demo mv-rm" data-demo style={v({ "--d": "10s" })}>
      <Phone label="Watch Together: a room code is shared, friends join and swipe, and ‘It’s a match!’ appears for a film everyone liked.">
        <div className="mv-layer mv-layer--full">
          <div className="mv-room">
            <PageHeader
              title="Watch Together"
              right={
                <span className="mv-pill">
                  ♥ <span className="mv-flip mv-flip--sm"><b>0</b><b>1</b></span>
                </span>
              }
            />
            <div className="mv-room__code">
              <span>
                <b className="mv-room__letters">
                  {Array.from("S8FUYB").map((c, i) => (
                    <span key={i} style={v({ "--i": i })}>
                      {c}
                    </span>
                  ))}
                </b>
                <small className="mv-room__meta mv-room__meta--a">Waiting for a friend. Tap to share the code.</small>
                <small className="mv-room__meta mv-room__meta--b">jefin 6/20 · sam 5/20 · alex 4/20</small>
              </span>
              <Icon name="share-2" size={17} />
            </div>
            <div className="mv-deck mv-deck--room">
              <SwipeCard card={DECK[1]} slot="c" />
              <SwipeCard card={DECK[2]} slot="b" />
              <SwipeCard card={DECK[0]} slot="a" drag />
            </div>
          </div>
          <MatchModal poster="interstellar" title="Interstellar" />
        </div>
      </Phone>
      <div className="mv-float mv-rm__join mv-rm__join--1" aria-hidden="true">
        <span className="mv-av">S</span> sam joined
      </div>
      <div className="mv-float mv-rm__join mv-rm__join--2" aria-hidden="true">
        <span className="mv-av mv-av--gold">A</span> alex joined
      </div>
    </div>
  );
}

const FRIENDS = [
  { n: "sam_watches", common: 24, score: 92 },
  { n: "alex.k", common: 17, score: 78 },
  { n: "meera", common: 9, score: 64 },
];

function Ring({ to }: { to: number }) {
  return (
    <svg className="mv-ring" viewBox="0 0 36 36" style={v({ "--to": to })} aria-hidden="true">
      <circle cx="18" cy="18" r="16" />
      <circle cx="18" cy="18" r="16" pathLength="100" />
    </svg>
  );
}

export function FriendsDemo() {
  return (
    <div className="mv-demo mv-fr" data-demo style={v({ "--d": "9s" })}>
      <Phone label="Friends: each friend shows a taste-match score, and their recent ratings appear below.">
        <div className="mv-layer mv-layer--full">
          <div className="mv-friends">
            <PageHeader title="Friends" />
            <div className="mv-input">Find people by username</div>
            <p className="mv-friends__sec">Following (3)</p>
            {FRIENDS.map((f, i) => (
              <div key={f.n} className="mv-frow" style={v({ "--i": i })}>
                <span className="mv-av mv-av--lg">
                  {f.n[0].toUpperCase()}
                  <Ring to={f.score} />
                </span>
                <span className="mv-frow__txt">
                  <b>{f.n}</b>
                  <small>{f.common} movies in common</small>
                </span>
                <span className="mv-count" style={v({ "--to": f.score })} data-value={`${f.score}%`} />
              </div>
            ))}
            <p className="mv-friends__sec">Recent ratings</p>
            <div className="mv-frow mv-frow--rate" style={v({ "--i": 3 })}>
              <Poster film="whiplash" className="mv-frow__thumb" />
              <span className="mv-frow__txt">
                <b>Whiplash</b>
                <small>
                  sam_watches gave it <span className="mv-gold">★★★★★</span>
                </small>
                <small className="mv-dim">2h ago</small>
              </span>
            </div>
          </div>
        </div>
      </Phone>
      <div className="mv-float mv-fr__venn" aria-hidden="true">
        <span className="mv-fr__c mv-fr__c--a">You</span>
        <span className="mv-fr__c mv-fr__c--b">sam</span>
        <b className="mv-fr__pct">92%</b>
      </div>
    </div>
  );
}

function Notif({ n, title, body, poster }: { n: number; title: string; body: string; poster: Film }) {
  return (
    <div className={`mv-notif mv-notif--${n}`}>
      <span className="mv-notif__app">
        <LogoMark size={16} /> MovieVerse <small>· now</small>
      </span>
      <span className="mv-notif__row">
        <span className="mv-notif__txt">
          <b>{title}</b>
          <small>{body}</small>
        </span>
        <Poster film={poster} className="mv-notif__img" />
      </span>
    </div>
  );
}

export function PickDemo() {
  return (
    <div className="mv-demo mv-pk" data-demo style={v({ "--d": "9s" })}>
      <Phone time="" label="Tonight’s pick: a notification arrives in the evening with one film chosen for you, then another says a watchlist film reached your streaming services.">
        <div className="mv-layer mv-layer--full mv-layer--top">
          <div className="mv-lock">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mv-lock__wall" src={tmdb(BACKDROPS.interstellar, "w780")} alt="" loading="lazy" />
            <p className="mv-lock__date">Saturday, 8 November</p>
            <p className="mv-lock__time">7:30</p>
            <div className="mv-lock__stack">
              <Notif n={2} title="Now on your services" body="Coco just arrived on a service you pay for." poster="coco" />
              <Notif n={1} title="Tonight’s pick: Interstellar" body="Picked for your taste." poster="interstellar" />
            </div>
            <div className="mv-lock__dock">
              <span />
              <span />
            </div>
          </div>
        </div>
      </Phone>
      <div className="mv-float mv-pk__sky" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle className="mv-pk__sun" cx="60" cy="62" r="18" fill="url(#mvg-gold)" />
          <g className="mv-pk__moon">
            <circle cx="60" cy="62" r="17" fill="#f2f2f2" />
            <circle cx="68" cy="56" r="15" fill="#0a0a0a" />
          </g>
          <g className="mv-pk__stars" fill="#fff">
            <circle cx="22" cy="30" r="1.6" />
            <circle cx="96" cy="24" r="1.2" />
            <circle cx="100" cy="70" r="1.4" />
            <circle cx="30" cy="84" r="1" />
          </g>
          <line x1="10" y1="92" x2="110" y2="92" stroke="#fff" strokeOpacity=".25" />
        </svg>
      </div>
    </div>
  );
}

function Alert({
  title,
  body,
  buttons,
  className,
  tapAt,
}: {
  title: string;
  body: string;
  buttons: string[];
  className?: string;
  tapAt?: string;
}) {
  return (
    <div className={`mv-alert${className ? ` ${className}` : ""}`}>
      <div className="mv-alert__box">
        <p className="mv-alert__t">{title}</p>
        <p className="mv-alert__b">{body}</p>
        <div className="mv-alert__btns">
          {buttons.map((b, i) => (
            <span key={b} className={`mv-alert__btn${i === buttons.length - 1 ? " mv-alert__btn--ok" : ""}`}>
              {b}
              {tapAt && i === buttons.length - 1 ? <Tap at={tapAt} /> : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stars({ tapAt }: { tapAt?: string }) {
  return (
    <span className="mv-stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="mv-star" style={v({ "--i": i })}>
          <Icon name="star" size={22} fill />
          {tapAt && i === 4 ? <Tap at={tapAt} /> : null}
        </span>
      ))}
    </span>
  );
}

function DetailScreen() {
  return (
    <div className="mv-detail">
      <div className="mv-detail__hero">
        <Poster film="interstellar" className="mv-detail__img" size="w500" />
        <span className="mv-detail__fab mv-detail__fab--l">
          <Icon name="arrow-left" size={16} />
        </span>
        <span className="mv-detail__fab mv-detail__fab--r">
          <Icon name="share-2" size={15} />
        </span>
      </div>
      <div className="mv-detail__body">
        <p className="mv-detail__t">Interstellar</p>
        <p className="mv-detail__meta">
          Christopher Nolan · <span className="mv-gold">★ 8.6</span>
        </p>
        <p className="mv-detail__g">Adventure · Drama · Sci-Fi</p>
        <div className="mv-detail__btns">
          <span className="mv-abtn mv-abtn--play">
            <Icon name="play" size={13} fill /> Watch Trailer
          </span>
          <span className="mv-abtn mv-abtn--add">
            <span className="mv-abtn__a">
              <Icon name="plus" size={13} /> Add to Watchlist
            </span>
            <span className="mv-abtn__b">
              <Icon name="check" size={13} /> In Watchlist
            </span>
            <Tap at="1.1s" />
          </span>
        </div>
        <p className="mv-detail__q">How would you rate this movie?</p>
        <Stars tapAt="3.85s" />
        <p className="mv-detail__sec">Where to watch</p>
        <div className="mv-wtw">
          <span className="mv-wtw__tile mv-wtw__tile--gold" />
          <span className="mv-wtw__tile mv-wtw__tile--white" />
          <span className="mv-wtw__tile" />
          <small>Stream · Rent</small>
        </div>
      </div>
      <div className="mv-popup mv-popup--detail">
        <Icon name="check-circle" size={17} className="mv-popup__ic" />
        Added to watchlist
      </div>
      <Alert className="mv-dt__alert" title="Thank You!" body="Your rating has been submitted." buttons={["OK"]} />
    </div>
  );
}

export function DetailDemo() {
  return (
    <div className="mv-demo mv-dt" data-demo style={v({ "--d": "10s" })}>
      <Phone label="Movie details: adding Interstellar to the watchlist, rating it five stars, and the ‘Thank You!’ confirmation.">
        <div className="mv-layer mv-layer--full">
          <DetailScreen />
        </div>
      </Phone>
      <div className="mv-float mv-dt__burst" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <i key={i} style={v({ "--a": `${i * 60}deg` })} />
        ))}
        <Icon name="star" size={26} fill />
      </div>
    </div>
  );
}

/* ── “Small moments” showcase: one mini phone per popup ─────────────────── */

function DimHome() {
  return (
    <div className="mv-layer">
      <HomeScreen />
    </div>
  );
}

const WATCHLIST = [
  { v: "inception", t: "Inception", g: "Action · Sci-Fi" },
  { v: "darkKnight", t: "The Dark Knight", g: "Action · Crime" },
  { v: "up", t: "Up", g: "Animation · Comedy" },
  { v: "whiplash", t: "Whiplash", g: "Drama · Music" },
];

export function MomentToast() {
  return (
    <div className="mv-demo mv-mo mv-mo--toast" data-demo style={v({ "--d": "5s" })}>
      <Phone label="In-app notification sliding down from the top of the screen.">
        <DimHome />
        <TabBar active="home" />
        <Toast className="mv-mo__toast" icon="users" title="sam started following you" body="Tap to see your taste match." />
      </Phone>
    </div>
  );
}

export function MomentMatch() {
  return (
    <div className="mv-demo mv-mo mv-mo--match" data-demo style={v({ "--d": "6s" })}>
      <Phone label="‘It’s a match!’ pop-up scaling in with confetti.">
        <div className="mv-layer mv-layer--full">
          <MatchModal poster="budapest" title="The Grand Budapest Hotel" />
        </div>
      </Phone>
    </div>
  );
}

export function MomentConfirm() {
  return (
    <div className="mv-demo mv-mo mv-mo--confirm" data-demo style={v({ "--d": "6.5s" })}>
      <Phone label="Remove from watchlist: a confirmation dialog scales in, Remove is tapped and the film leaves the list.">
        <div className="mv-layer">
          <div className="mv-wl">
            <p className="mv-wl__t">Your Watchlist</p>
            {WATCHLIST.map((w, i) => (
              <div key={w.t} className={`mv-wl__row mv-wl__row--${i}`}>
                <Poster film={w.v as Film} className="mv-wl__img" />
                <span className="mv-wl__txt">
                  <b>{w.t}</b>
                  <small>{w.g}</small>
                </span>
                <Icon name="trash-2" size={15} />
              </div>
            ))}
          </div>
        </div>
        <TabBar active="watchlist" />
        <div className="mv-layer mv-layer--full mv-mo__alertwrap">
          <Alert title="Remove from Watchlist" body="Remove Inception from your watchlist?" buttons={["Cancel", "Remove"]} tapAt="3.1s" />
        </div>
      </Phone>
    </div>
  );
}

export function MomentRating() {
  return (
    <div className="mv-demo mv-mo mv-mo--rating" data-demo style={v({ "--d": "6s" })}>
      <Phone label="Rating a film: five stars fill in, then a ‘Thank You!’ dialog appears.">
        <div className="mv-layer mv-layer--full">
          <div className="mv-rate">
            <Poster film="steps39" className="mv-rate__img" />
            <p className="mv-rate__t">The 39 Steps</p>
            <p className="mv-detail__q">How would you rate this movie?</p>
            <Stars tapAt="1.75s" />
          </div>
          <Alert title="Thank You!" body="Your rating has been submitted." buttons={["OK"]} />
        </div>
      </Phone>
    </div>
  );
}

export function MomentOffline() {
  return (
    <div className="mv-demo mv-mo mv-mo--offline" data-demo style={v({ "--d": "7s" })}>
      <Phone label="Offline banner: ‘You’re offline. Changes will sync later.’ then ‘Back online. Your changes are saved.’">
        <DimHome />
        <TabBar active="home" />
        <div className="mv-offline">
          <span className="mv-offline__bar mv-offline__bar--off">
            <Icon name="wifi-off" size={12} /> You’re offline. Changes will sync later.
          </span>
          <span className="mv-offline__bar mv-offline__bar--on">
            <Icon name="check" size={12} /> Back online. Your changes are saved.
          </span>
        </div>
      </Phone>
    </div>
  );
}

export function MomentCode() {
  return (
    <div className="mv-demo mv-mo mv-mo--code" data-demo style={v({ "--d": "6s" })}>
      <Phone label="Sign-in code: ‘Check your email’, then the six digits fill in one by one and turn green-checked.">
        <div className="mv-layer mv-layer--full">
          <div className="mv-otp">
            <span className="mv-otp__icon">
              <Icon name="mail" size={22} />
            </span>
            <p className="mv-otp__t">Check your email</p>
            <p className="mv-otp__s">Enter your 6-digit code</p>
            <div className="mv-otp__boxes">
              {Array.from("481927").map((d, i) => (
                <span key={i} className="mv-otp__box" style={v({ "--i": i })}>
                  <b>{d}</b>
                </span>
              ))}
            </div>
            <span className="mv-otp__ok">
              <Icon name="check" size={16} /> Signed in
            </span>
            <p className="mv-otp__hint">Can’t find it? Check your spam folder.</p>
          </div>
        </div>
      </Phone>
    </div>
  );
}

export function MomentSheet() {
  return (
    <div className="mv-demo mv-mo mv-mo--sheet" data-demo style={v({ "--d": "6s" })}>
      <Phone label="Bottom sheet sliding up to confirm signing out.">
        <div className="mv-layer mv-layer--full">
          <div className="mv-prof">
            <PageHeader title="Profile" />
            <span className="mv-av mv-av--xl">J</span>
            <p className="mv-prof__name">jefin</p>
            <div className="mv-prof__stats">
              <span><b>13</b>Watchlist</span>
              <span><b>42</b>Ratings</span>
              <span><b>8</b>Followers</span>
            </div>
            <div className="mv-prof__row mv-prof__row--danger">
              <Icon name="log-out" size={15} /> Sign out
            </div>
          </div>
          <div className="mv-sheet">
            <div className="mv-sheet__panel">
              <span className="mv-sheet__grab" />
              <p className="mv-sheet__t">Sign out of MovieVerse?</p>
              <span className="mv-sheet__btn mv-sheet__btn--danger">Sign out</span>
              <span className="mv-sheet__btn">
                Cancel
                <Tap at="4.1s" />
              </span>
            </div>
          </div>
        </div>
      </Phone>
    </div>
  );
}
