/*
 * The /app page: a structural clone of the "Submit" Webflow template (home v1).
 * Markup, class names and grid ids follow the template so ovo.css applies
 * unchanged; the copy, app screens and posters are MovieVerse's.
 * Behaviour (menu, tabs, sliders, FAQ, fitted screens): OvoMotion.tsx.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { DetailDemo, HeroDemo, MoodDemo, PickDemo, RoomDemo, SwipeDemo } from "./Mockups";
import OvoMotion from "./OvoMotion";
import { Icon, LogoMark, Sprites } from "./Sprites";

const APK_URL = "https://github.com/jefin10/movieverse/releases/latest/download/movieverse.apk";
const A = "/app-ovo";
const TMDB = (path: string, size = "w342") => `https://image.tmdb.org/t/p/${size}${path}`;

const P = {
  interstellar: "/l33oR0mnvf20avWyIMxW02EtQxn.jpg",
  inception: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
  darkKnight: "/oOv2oUXcAaNXakRqUPxYq5lJURz.jpg",
  coco: "/wSJHuSD7ojzoXifWjOAjxV7UpEL.jpg",
  whiplash: "/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg",
  up: "/hGGC9gKo7CFE3fW07RA587e5kol.jpg",
  budapest: "/xHDynIimfsgj0ZOs0j5ma8v1vmM.jpg",
  bladeRunner: "/bMdSmfI0qwpAkvhAL7sqpjmwgf4.jpg",
  matrix: "/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
  insideOut: "/j29ekbcLpBvxnGk6LjdTc2EI5SA.jpg",
  toyStory: "/3Rfvhy1Nl6sSGJwyjb0QiZzZYlB.jpg",
  joker: "/rlay2M5QYvi6igbGcFjq8jxeusY.jpg",
};

const GENRES = ["Drama", "Sci-Fi", "Thriller", "Comedy", "Romance", "Animation", "Mystery", "Adventure"];
const ROW_1 = [P.interstellar, P.coco, P.matrix, P.up, P.whiplash, P.joker, P.budapest];
const ROW_2 = [P.inception, P.toyStory, P.darkKnight, P.insideOut, P.bladeRunner, P.coco, P.up];
const SLIDES = [P.interstellar, P.budapest, P.coco, P.whiplash, P.inception, P.up];

const TABS: { icon: string; strong: string; rest: string; demo: ReactNode }[] = [
  { icon: "icon-connect.svg", strong: "Swipe and save ", rest: "your next favourite", demo: <SwipeDemo /> },
  { icon: "icon-01b.svg", strong: "Say how you feel ", rest: "and get picks", demo: <MoodDemo /> },
  { icon: "icon-zap.svg", strong: "Watch together ", rest: "with a room code", demo: <RoomDemo /> },
  { icon: "icon-share.svg", strong: "Get tonight’s pick ", rest: "every evening", demo: <PickDemo /> },
];

/* Placeholder reviews: replace with real ones before launch. */
const REVIEWS = [
  {
    quote:
      "“MovieVerse has changed how we pick a film. A few swipes and the watchlist is full, and the mood picks are scarily good. Movie night starts in minutes now, not an hour.”",
    img: "user-01.jpg",
    name: "Emily Chen",
  },
  {
    quote:
      "“Watch Together ended the endless ‘what do you want to watch?’ in our flat. Everyone swipes on their own phone and we only see the films we all liked.”",
    img: "user-03.jpg",
    name: "Sarah Thompson",
  },
  {
    quote:
      "“Tonight’s pick is the best notification on my phone. One film, chosen for my taste, and a ping when something on my watchlist lands on my services.”",
    img: "user-02.jpg",
    name: "Alex Rodriguez",
  },
];
const SLIDE_ORDER = [0, 1, 2, 0, 1, 2, 0];

const POSTS = [
  {
    img: "/landing-movies/project hailmary.jpg",
    date: "Sci-Fi · 2026",
    title: "Project Hail Mary",
    text: "A lone astronaut wakes up light-years from home with one job: save Earth. Pure, hopeful science fiction.",
  },
  {
    img: "/landing-movies/peaky blinder.jpg",
    date: "Crime · Drama",
    title: "Peaky Blinders",
    text: "Razor caps, smoke and ambition. The Shelby family rises through post-war Birmingham.",
  },
  {
    img: "/landing-movies/obsession.jpg",
    date: "Thriller · 2026",
    title: "Obsession",
    text: "A dangerous fixation pulls two strangers into a web of secrets, desire and consequences neither can escape.",
  },
];

const FAQS = [
  { q: "Is MovieVerse free?", a: "Yes. Every feature in the app is free, and you can browse the catalog on the web without an account." },
  { q: "Do I need a password?", a: "No. Enter your email and type the 6-digit code we send you, or continue with Google." },
  { q: "How do mood picks work?", a: "A small AI model turns what you type into a genre, then MovieVerse picks the best-rated films in it." },
  {
    q: "How does Watch Together work?",
    a: "Start a room and share its 6-character code. Everyone swipes the same films on their own phone, and you only see the ones you all liked.",
  },
  { q: "Is there an iPhone app?", a: "Android for now. You can browse the full catalog on the web from any device." },
];

function Bare({ children }: { children: ReactNode }) {
  return (
    <div className="mv mvx-bare" data-fit>
      {children}
    </div>
  );
}

function Brand() {
  return (
    <span className="mvx-brand">
      <LogoMark size={30} />
      MovieVerse
    </span>
  );
}

export default function AppSite() {
  return (
    <div className="ovo" id="top">
      {/* Inter and DM Sans, the template's fonts. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        precedence="default"
      />
      <Sprites />

      <div role="banner" className="navbar w-nav" data-collapse="medium" data-ovo-nav>
        <div className="container navbar-container">
          <div className="navbar-holder">
            <div className="navbar-container">
              <div className="brand-holder">
                <Link href="/" className="brand w-nav-brand" aria-label="MovieVerse home">
                  <Brand />
                </Link>
              </div>
              <nav role="navigation" className="nav-menu w-nav-menu">
                <div className="nav-menu-link-holder">
                  <div className="nav-menu-link-container">
                    <div className="nav-links">
                      <a href="#top" className="nav-link w-nav-link w--current">
                        Home
                      </a>
                      <a href="#Features" className="nav-link w-nav-link">
                        Features
                      </a>
                      <a href="#Experience" className="nav-link w-nav-link">
                        Experience
                      </a>
                      <Link href="/website" className="nav-link w-nav-link">
                        Browse
                      </Link>
                      <a href="#Faq" className="nav-link w-nav-link">
                        FAQ
                      </a>
                      <Link href="/privacy" className="nav-link w-nav-link">
                        Privacy
                      </Link>
                    </div>
                  </div>
                </div>
              </nav>
              <div className="menu-cart-holder">
                <button type="button" className="menu-button w-nav-button" aria-label="Menu" data-ovo-menu>
                  <div className="w-icon-nav-menu"></div>
                </button>
                <div className="nav-menu-button-holder">
                  <a href={APK_URL} className="button navbar-button w-button">
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section hero-section">
        <div className="container">
          <div className="hero-section-holder">
            <div className="hero-section-container">
              <div className="animate-on-load-01">
                <div className="hero-section-news-holder">
                  <a href={APK_URL} className="hero-section-news-container w-inline-block">
                    <div>Free on Android — Download now -&gt;</div>
                  </a>
                </div>
              </div>
              <div className="animate-on-load-02">
                <div className="hero-text-holder-2">
                  <h1 className="gradient-title">Let Your Taste Pick Tonight’s Film</h1>
                </div>
              </div>
              <div className="animate-on-load-03">
                <div className="hero-paragraph-holder-2">
                  <p>Swipe through films, say how you feel, and match picks with friends, all in one easy app.</p>
                </div>
              </div>
              <div className="animate-on-load-04">
                <div className="hero-button-wrapper">
                  <a href={APK_URL} className="button w-button">
                    Get started
                  </a>
                  <Link href="/website" className="button outline w-button">
                    Browse films
                  </Link>
                </div>
              </div>
            </div>
            <div className="hero-section-app-holder-2">
              <div className="hero-section-app-holder">
                <div className="hero-section-app-container-02">
                  <div className="hero-section-phone-holder-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${A}/hand.webp`} loading="eager" alt="" className="hero-section-phone-image" />
                    <div className="hero-section-phone-screenshot-holder-2">
                      <Bare>
                        <HeroDemo />
                      </Bare>
                    </div>
                    <div className="phone-fadeout"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-background-holder">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${A}/bg-gradient.jpg`} alt="" loading="eager" className="hero-background" />
            </div>
          </div>
        </div>
      </div>

      <div className="trusted-by">
        <div className="center-text">
          <div className="fade-in-on-scroll">
            <p>661 films across 21 genres, ready to swipe</p>
          </div>
        </div>
        <div className="fade-in-on-scroll">
          <div className="company-logo-holder">
            {[0, 1].map((copy) => (
              <div key={copy} className="company-logo-container" aria-hidden={copy === 1}>
                {GENRES.map((g) => (
                  <div key={g} className="company-logo-wrapper">
                    <span className="mvx-wordmark">
                      <Icon name="film" size={24} />
                      {g}
                    </span>
                  </div>
                ))}
              </div>
            ))}
            <div className="graident-for-logos"></div>
            <div className="graident-for-logos right"></div>
          </div>
        </div>
      </div>

      <div id="Features" className="section">
        <div className="container">
          <div className="title-holder">
            <div className="fade-in-on-scroll">
              <div className="features-title-holder">
                <h1 className="gradient-title">Powerful Features just for you</h1>
              </div>
            </div>
            <div className="fade-in-on-scroll">
              <div className="fetaures-paragraph-holder">
                <p>MovieVerse brings together everything you need to stop scrolling and start watching.</p>
              </div>
            </div>
          </div>
          <div className="featured-cards-holder">
            <div className="features-card-container">
              <div id="w-node-_4dc2c976-4e44-b16b-3ec6-b9cd880112cb-28fde124" className="features-card-image-holder">
                <div className="features-card-image-container-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={`${A}/bg-gradient-card.jpg`} alt="" className="featured-card-background-iamge-2" />
                  <div className="mvx-sheet mvx-cardui">
                    <div className="mvx-sheet__label">
                      <span>⌄ Your watchlist</span>
                      <span>+</span>
                    </div>
                    <div className="mvx-row">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={TMDB(P.interstellar, "w92")} alt="" />
                      <div className="mvx-row__txt">
                        <b>Interstellar</b>
                        <small>Added tonight</small>
                      </div>
                      <div className="mvx-row__end">
                        <span className="mvx-gold">★ 8.6</span>
                        <small>Sci-Fi</small>
                      </div>
                    </div>
                  </div>
                  <div className="card-gradient"></div>
                </div>
                <div className="card-title-center-holder">
                  <div className="card-title-2">Keep Every Pick in One Watchlist</div>
                  <p className="grey-text">Swipe right on a film and it lands in your watchlist, ready for movie night.</p>
                </div>
              </div>
              <div id="w-node-_4dc2c976-4e44-b16b-3ec6-b9cd880112d5-28fde124" className="features-card-image-holder">
                <div className="features-card-image-container-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={`${A}/bg-gradient-card.jpg`} alt="" className="featured-card-background-iamge-2" />
                  <div className="mvx-sheet mvx-cardui">
                    <div className="mvx-sheet__label">
                      <span>How are you feeling?</span>
                    </div>
                    <div className="mvx-moods">
                      <span className="mvx-mood">Happy</span>
                      <span className="mvx-mood mvx-mood--on">Romantic</span>
                      <span className="mvx-mood mvx-mood--on">Adventurous</span>
                      <span className="mvx-mood">Lonely</span>
                    </div>
                  </div>
                  <div className="card-gradient"></div>
                </div>
                <div className="card-title-center-holder">
                  <div className="card-title-2">Movies That Match Your Mood</div>
                  <p className="grey-text">Tap a mood or type one in your own words, and get a shelf of films that fit.</p>
                </div>
              </div>
              <div id="w-node-_4dc2c976-4e44-b16b-3ec6-b9cd880112df-28fde124" className="features-card-image-holder">
                <div className="features-card-image-container-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={`${A}/bg-gradient-card.jpg`} alt="" className="featured-card-background-iamge-2" />
                  <div className="mvx-sheet mvx-cardui">
                    <div className="mvx-tiles">
                      <span className="mvx-tile">
                        <span className="mvx-tile__ic" style={{ background: "#f4f19c" }}>
                          <Icon name="users" size={16} />
                        </span>
                        Watch Together
                      </span>
                      <span className="mvx-tile">
                        <span className="mvx-tile__ic" style={{ background: "#b9e3d2" }}>
                          <Icon name="heart" size={16} />
                        </span>
                        Taste match
                      </span>
                      <span className="mvx-tile">
                        <span className="mvx-tile__ic" style={{ background: "#d6c7f2" }}>
                          <Icon name="bell" size={16} />
                        </span>
                        Tonight’s pick
                      </span>
                    </div>
                  </div>
                  <div className="card-gradient"></div>
                </div>
                <div className="card-title-center-holder">
                  <div className="card-title-2">Pick Together with Your Friends</div>
                  <p className="grey-text">Share a room code, swipe the same deck, and only see the films you all liked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="section-center-text">
            <div className="section-title l">
              <div className="fade-in-on-scroll">
                <h2 className="fading-title">MovieVerse&#x27;s Power Features</h2>
              </div>
            </div>
            <div className="section-paragraph">
              <div className="fade-in-on-scroll">
                <p>Swiping, mood picks and streaming alerts work together, so tonight’s film is never more than a few taps away.</p>
              </div>
            </div>
          </div>
          <div className="deploying-app-section-holder">
            <div className="deploying-app-section-container">
              <div className="deploying-app-content">
                <div className="deploying-app-title-holder">
                  <h2 className="fading-title">Swiping made easier and faster</h2>
                </div>
                <div className="deploying-app-paragraph-holder">
                  <p>One poster at a time. Swipe right to keep it, left to skip it, and your picks get sharper with every swipe.</p>
                </div>
                <Link href="/website" className="w-inline-block">
                  <div className="deploying-app-link-holder">
                    <div>Browse the catalog</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${A}/arrow.svg`} loading="lazy" alt="" className="arrow-right" />
                  </div>
                </Link>
                <div className="stats-holder">
                  <div className="stats-container">
                    <div className="accent-text">661</div>
                    <div className="grey-paragraph">Films in the catalog, with ratings, trailers and cast.</div>
                  </div>
                  <div className="stats-container">
                    <div className="accent-text">21</div>
                    <div className="grey-paragraph">Genres to explore, from Film-Noir to Sci-Fi.</div>
                  </div>
                </div>
              </div>
              <div id="w-node-_32c0496d-8d2c-291f-6ce3-19118476436a-28fde124" className="deploying-app-images-holder">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${A}/bg-gradient.jpg`} alt="" loading="lazy" className="deploying-app-bg" />
                <div className="deploying-app-screenshot-holder">
                  <div className="deploying-app-screenshot mvx-sheet">
                    <div className="mvx-sheet__label">
                      <span>Your watchlist</span>
                      <span>Sort ⌄</span>
                    </div>
                    <div className="mvx-sheet__label">
                      <span>Today</span>
                    </div>
                    {[
                      { p: P.interstellar, t: "Interstellar", g: "Adventure · Sci-Fi", r: "8.6" },
                      { p: P.darkKnight, t: "The Dark Knight", g: "Action · Crime", r: "9.0" },
                    ].map((m) => (
                      <div key={m.t} className="mvx-row">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={TMDB(m.p, "w92")} alt="" />
                        <div className="mvx-row__txt">
                          <b>{m.t}</b>
                          <small>{m.g}</small>
                        </div>
                        <div className="mvx-row__end mvx-gold">★ {m.r}</div>
                      </div>
                    ))}
                    <div className="mvx-sheet__label">
                      <span>Last week</span>
                    </div>
                    {[
                      { p: P.coco, t: "Coco", g: "Animation · Family", r: "8.4" },
                      { p: P.whiplash, t: "Whiplash", g: "Drama · Music", r: "8.5" },
                    ].map((m) => (
                      <div key={m.t} className="mvx-row">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={TMDB(m.p, "w92")} alt="" />
                        <div className="mvx-row__txt">
                          <b>{m.t}</b>
                          <small>{m.g}</small>
                        </div>
                        <div className="mvx-row__end mvx-gold">★ {m.r}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="deploying-app-section-container second">
              <div id="w-node-_32c0496d-8d2c-291f-6ce3-19118476436f-28fde124" className="deploying-app-images-holder">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${A}/bg-gradient.jpg`} alt="" loading="lazy" className="deploying-app-bg" />
                <div className="deploying-app-screenshot-holder">
                  <div className="deploying-app-screenshot mvx-sheet">
                    <div className="mvx-sheet__label">
                      <span>⌄ Tonight’s pick</span>
                      <span>+</span>
                    </div>
                    <div className="mvx-row">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={TMDB(P.inception, "w92")} alt="" />
                      <div className="mvx-row__txt">
                        <b>Inception</b>
                        <small>Picked for your taste</small>
                      </div>
                      <div className="mvx-row__end">
                        <span className="mvx-gold">★ 8.8</span>
                        <small>7:30 pm</small>
                      </div>
                    </div>
                    <div className="mvx-toast">
                      <span className="mvx-toast__ic">
                        <Icon name="tv" size={15} />
                      </span>
                      <span>
                        <b>Now on your services!</b>
                        <small>Coco just arrived on a service you pay for</small>
                      </span>
                    </div>
                    <div className="mvx-sheet__label">
                      <span>⌄ Where to watch</span>
                    </div>
                    <div className="mvx-table">
                      <span>Country</span>
                      <span>Stream</span>
                      <span>Rent</span>
                      <span>India</span>
                      <span>✓</span>
                      <span>✓</span>
                      <span>United States</span>
                      <span>✓</span>
                      <span>—</span>
                      <span>United Kingdom</span>
                      <span>—</span>
                      <span>✓</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="deploying-app-content">
                <div className="deploying-app-title-holder">
                  <h2 className="fading-title">Movie night just got easier</h2>
                </div>
                <div className="deploying-app-paragraph-holder">
                  <p>Every evening MovieVerse picks one film for your taste, and tells you where it’s streaming in your country.</p>
                </div>
                <a href={APK_URL} className="w-inline-block">
                  <div className="deploying-app-link-holder">
                    <div>Get the app</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${A}/arrow.svg`} loading="lazy" alt="" className="arrow-right" />
                  </div>
                </a>
                <div className="gradient-line"></div>
                <div className="deploying-app-points">
                  <div id="w-node-_32c0496d-8d2c-291f-6ce3-191184764381-28fde124" className="deploying-app-points-holder">
                    <div className="deploying-app-points-icon-holder">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${A}/icon-01.svg`} loading="lazy" alt="" className="deploying-app-points-icon" />
                    </div>
                    <div className="deploying-app-point">
                      <span className="deploying-color">Tonight’s pick. </span>One film chosen for you every evening at 7:30.
                    </div>
                  </div>
                  <div id="w-node-_32c0496d-8d2c-291f-6ce3-191184764388-28fde124" className="deploying-app-points-holder">
                    <div className="deploying-app-points-icon-holder">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${A}/icon-03.svg`} loading="lazy" alt="" className="deploying-app-points-icon" />
                    </div>
                    <div className="deploying-app-point">
                      <span className="deploying-color">Streaming alerts. </span>Know when your watchlist reaches a service you pay
                      for.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="Experience" className="section">
        <div className="container">
          <div className="title-holder xl-padding">
            <div className="fade-in-on-scroll">
              <h1 className="title-2">Seamless Experience</h1>
            </div>
            <div className="fade-in-on-scroll">
              <div className="fetaures-paragraph-holder">
                <p>Every part of MovieVerse is built to get you from “what should we watch?” to pressing play.</p>
              </div>
            </div>
          </div>
          <div className="tab-holder">
            <div className="tab-container">
              <div className="w-tabs" data-ovo-tabs>
                <div className="tabs-menu w-tab-menu" role="tablist">
                  {TABS.map((t, i) => (
                    <a
                      key={t.strong}
                      role="tab"
                      tabIndex={0}
                      aria-selected={i === 0}
                      className={`tab-link-second w-inline-block w-tab-link${i === 0 ? " w--current" : ""}`}
                    >
                      <div className="tab-link-holder">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img loading="lazy" src={`${A}/${t.icon}`} alt="" className="tab-link-icon" />
                        <div className="tab-link-text">
                          <span className="light-color">{t.strong}</span>
                          {t.rest}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="tabs-content w-tab-content">
                  {TABS.map((t, i) => (
                    <div key={t.strong} role="tabpanel" className={`tab-pane-tab-1 w-tab-pane${i === 0 ? " w--tab-active" : ""}`}>
                      <div className="tab-pane-holder tab-pane-tab-1">
                        <div className="mvx-pane">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`${A}/bg-gradient.jpg`} alt="" className="mvx-pane__bg" />
                          <div className="mv mvx-pane__phone">{t.demo}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="Get-Started" className="section">
        <div className="container">
          <div className="title-holder">
            <div className="fade-in-on-scroll">
              <div className="title-wrapper">
                <h1 className="title-2">Start Your Movie Night Today</h1>
              </div>
            </div>
            <div className="fade-in-on-scroll">
              <div className="fetaures-paragraph-holder">
                <p>Ready to stop scrolling and start watching? Look no further than MovieVerse.</p>
              </div>
            </div>
          </div>
          <div className="best-things-holder">
            <div className="best-things-container">
              <div className="best-things-grid">
                <div id="w-node-_33408e2a-4b0e-6d31-71fa-6e9c17437431-28fde124" className="fade-in-on-scroll">
                  <div id="w-node-_33408e2a-4b0e-6d31-71fa-6e9c17437432-28fde124" className="best-thing-box-holder">
                    <div className="best-things-logo-image mvx-logo-tile">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${A}/bg-gradient-card.jpg`} alt="" />
                      <LogoMark size={120} />
                    </div>
                  </div>
                </div>
                <div id="w-node-_33408e2a-4b0e-6d31-71fa-6e9c17437434-28fde124" className="fade-in-on-scroll">
                  <div id="w-node-_33408e2a-4b0e-6d31-71fa-6e9c17437435-28fde124" className="best-thing-box-holder">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img loading="lazy" src={`${A}/icon-02.svg`} alt="" className="best-thing-icon" />
                  </div>
                </div>
                <div id="w-node-_33408e2a-4b0e-6d31-71fa-6e9c17437437-28fde124" className="fade-in-on-scroll">
                  <div id="w-node-_33408e2a-4b0e-6d31-71fa-6e9c17437438-28fde124" className="best-thing-box-holder">
                    <div className="best-thing-slider-holder">
                      <div className="slider slide w-slider" data-ovo-autoslider>
                        <div className="mask w-slider-mask">
                          {SLIDES.map((p, i) => (
                            <div key={i} className="slide w-slide">
                              <div className="slide-image-holder">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={TMDB(p)} alt="" loading="lazy" className="slide-image mvx-poster" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>Hand-picked catalog</div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="w-node-_33408e2a-4b0e-6d31-71fa-6e9c17437455-28fde124" className="fade-in-on-scroll">
                <div id="w-node-_33408e2a-4b0e-6d31-71fa-6e9c17437456-28fde124" className="best-thing-box-holder">
                  <div className="best-thing-app-holder">
                    <div className="hand-image-holder">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img loading="lazy" src={`${A}/phone-border.png`} alt="" className="hand-image" />
                      <div className="screen-image-holder">
                        <Bare>
                          <DetailDemo />
                        </Bare>
                      </div>
                    </div>
                    <div className="showcase-text">On your phone and on the web</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="best-things-footer-grid">
              <div id="w-node-_33408e2a-4b0e-6d31-71fa-6e9c1743745f-28fde124" className="logos">
                {[
                  { row: ROW_1, cls: "_01" },
                  { row: ROW_2, cls: "_02" },
                ].map(({ row, cls }) => (
                  <div key={cls} className="logo-interection-container">
                    {[0, 1].map((copy) => (
                      <div key={copy} className={`logo-interection-wrapper ${cls}`} aria-hidden={copy === 1}>
                        {row.map((p, i) => (
                          <div key={i} className="logo-interection-logo-holder">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={TMDB(p, "w154")} loading="lazy" alt="" className="logo-interection-logo" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
                <div className="showcase-text-normal">A film for every mood</div>
              </div>
              <div id="w-node-_33408e2a-4b0e-6d31-71fa-6e9c174374a0-28fde124" className="best-thing-box-holder">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" src={`${A}/best-thing.jpg`} loading="lazy" className="background-image-2" />
                <div className="showcase-text">Made for movie night</div>
                <div className="overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section overflow-hidden">
        <div className="container">
          <div className="section-center-text">
            <div className="section-title xl">
              <div className="fade-in-on-scroll">
                <h2 className="fading-title">Voices of Movie Night, Testimonials</h2>
              </div>
            </div>
            <div className="section-paragraph">
              <div className="fade-in-on-scroll">
                <p>Discover what movie fans are saying about MovieVerse. (Placeholder reviews: replace before launch.)</p>
              </div>
            </div>
          </div>
          <div className="testimonal-slider w-slider" data-ovo-slider>
            <div className="testimonal-mask w-slider-mask">
              {SLIDE_ORDER.map((r, i) => (
                <div key={i} className="testimonal-slide w-slide">
                  <div className="testimonial-text">{REVIEWS[r].quote}</div>
                  <div className="testimonal-info">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${A}/${REVIEWS[r].img}`} loading="lazy" alt="" className="user-image" />
                    <div className="testimonial-info-text">
                      <div className="user-name">{REVIEWS[r].name}</div>
                      <div className="user-job-position">Placeholder review</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="left-arrow w-slider-arrow-left" aria-label="Previous review" data-ovo-prev>
              <div className="arrow-holder">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${A}/arrow-left.svg`} loading="lazy" alt="" className="arrow-icon" />
              </div>
            </button>
            <button type="button" className="right-arrow w-slider-arrow-right" aria-label="Next review" data-ovo-next>
              <div className="arrow-holder">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${A}/arrow-right.svg`} loading="lazy" alt="" className="arrow-icon right-side" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="section-center-text">
            <div className="section-title xl">
              <div className="fade-in-on-scroll">
                <h2 className="fading-title">Insights &amp; Inspiration Explore Our Picks</h2>
              </div>
            </div>
            <div className="section-paragraph">
              <div className="fade-in-on-scroll">
                <p>Dive into films worth your evening, from new arrivals to the stories everyone is talking about.</p>
              </div>
            </div>
          </div>
          <div className="blog-grid-3x-holder">
            <div className="blog-grid-twos-wrapper w-dyn-list">
              <div role="list" className="blog-grid-3x w-dyn-items">
                {POSTS.map((b) => (
                  <div key={b.title} role="listitem" className="blog-grid-twos-item w-dyn-item">
                    <Link href="/website" className="blog-item w-inline-block">
                      <div className="blog-grid-3x-image-holder">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.img} loading="lazy" alt="" className="blog-grid-2x-image" />
                      </div>
                      <div className="content">
                        <div className="blog-date">{b.date}</div>
                        <div className="blog-title-holder">
                          <div className="blog-grid-2x-title">{b.title}</div>
                        </div>
                        <p>{b.text}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="Faq" className="section">
        <div className="container">
          <div className="section-center-text">
            <div className="section-title xl">
              <div className="fade-in-on-scroll">
                <h2 className="fading-title">Your Queries Answered: FAQs</h2>
              </div>
            </div>
            <div className="section-paragraph">
              <div className="fade-in-on-scroll">
                <p>Find answers to common questions about MovieVerse and movie night in general.</p>
              </div>
            </div>
          </div>
          <div className="faq-holder">
            {FAQS.map((f) => (
              <div key={f.q} className="ease-faq-container-01" data-ovo-faq>
                <div className="ease-faq">
                  <div className="ease-faq-title-holder" role="button" tabIndex={0} aria-expanded="false">
                    <div className="ease-faq-title">{f.q}</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${A}/faq-icon.svg`} loading="lazy" alt="" className="ease-faq-icon" />
                  </div>
                  <div className="ease-faq-answer-holder">
                    <div className="ease-faq-answer">{f.a}</div>
                  </div>
                </div>
                <div className="ease-faq-bg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section overflow-hidden">
        <div className="container">
          <div className="cta-container">
            <div className="cta-form-holder">
              <div className="cta-heading-holder">
                <div className="cta-heading-wrapper">
                  <div className="cta-heading fading-title">Get Started with MovieVerse</div>
                </div>
                <div className="cta-paragraph-holder">
                  <p>Ready for better movie nights? Get MovieVerse today and let your taste pick tonight’s film.</p>
                </div>
              </div>
              <div className="form-block w-form">
                <form action={APK_URL} method="get" className="form-holder">
                  <div className="form">
                    <input className="text-field w-input" maxLength={256} placeholder="Enter email here" type="email" aria-label="Email" />
                    <input type="submit" className="submit-button w-button" value="Get Started" />
                  </div>
                </form>
              </div>
            </div>
            <div className="cta-app-wrapper">
              <div className="hero-section-app-container-ct">
                <div className="hero-section-phone-holder">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${A}/iphone-14-pro.png`} loading="lazy" alt="" className="hero-section-phone-image" />
                  <div className="hero-section-phone-screenshot-holder">
                    <Bare>
                      <SwipeDemo />
                    </Bare>
                  </div>
                </div>
                <div className="card-image-on-app-holder">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/landing-movies/project hailmary.jpg" loading="lazy" alt="" className="card-image-on-app-cta mvx-still" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="footer-wrapper">
            <Link href="/" className="footer-brand w-inline-block">
              <Brand />
              <div className="footer-heading">Transform Your Movie Nights with MovieVerse</div>
              <div className="footer-paragraph-holder">
                <p>Swipe, say your mood, and let your taste pick tonight’s film. Free on Android.</p>
              </div>
            </Link>
            <div className="footer-content">
              <div id="w-node-e92bf484-a605-4132-f141-4518468af7e2-468af7d9" className="footer-block">
                <div className="title-small">Main Pages</div>
                <div className="menu-link-wrapper">
                  <div className="menu-links-holder">
                    <Link href="/" className="grey-link">
                      Home
                    </Link>
                    <Link href="/app" className="grey-link w--current">
                      App
                    </Link>
                    <Link href="/website" className="grey-link">
                      Browse
                    </Link>
                    <Link href="/privacy" className="grey-link">
                      Privacy
                    </Link>
                  </div>
                  <div className="menu-links-holder">
                    <a href="#Features" className="grey-link">
                      Features
                    </a>
                    <a href="#Experience" className="grey-link">
                      Experience
                    </a>
                    <a href="#Faq" className="grey-link">
                      FAQ
                    </a>
                  </div>
                </div>
              </div>
              <div id="w-node-e92bf484-a605-4132-f141-4518468af7ef-468af7d9" className="footer-block">
                <div className="title-small">Get the app</div>
                <a href={APK_URL} className="footer-link">
                  Android APK
                </a>
                <Link href="/website" className="footer-link">
                  Web catalog
                </Link>
              </div>
              <div id="w-node-e92bf484-a605-4132-f141-4518468af7fa-468af7d9" className="footer-block">
                <div className="title-small">Source</div>
                <a href="https://github.com/jefin10/MovieVerse" target="_blank" rel="noopener noreferrer" className="footer-link">
                  GitHub
                </a>
                <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="footer-link">
                  TMDB
                </a>
              </div>
            </div>
          </div>
          <div className="footer-divider">
            <div className="footer-copyright-holder">
              <div className="footer-copyright-center">
                Created by{" "}
                <a href="https://github.com/jefin10" target="_blank" rel="noopener noreferrer" className="white-link">
                  JEFIN
                </a>
              </div>
            </div>
            <div className="footer-copyright-holder">
              <div className="footer-copyright-center">
                Movie data from{" "}
                <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="white-link">
                  TMDB
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OvoMotion />
    </div>
  );
}
