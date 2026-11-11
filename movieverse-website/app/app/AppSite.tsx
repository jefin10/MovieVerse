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
import { MoodCard, RoomCard, SwipePanel, TonightPanel, WatchlistCard } from "./Panels";
import { Icon, LogoMark, Sprites } from "./Sprites";
import { POSTERS, tmdb } from "./films";

export const APK_URL = "/download/movieverse.apk";
const A = "/app-ovo";

const GENRES = ["Drama", "Sci-Fi", "Thriller", "Comedy", "Romance", "Animation", "Mystery", "Adventure"];
const ROW_1 = [POSTERS.interstellar, POSTERS.spiritedAway, POSTERS.matrix, POSTERS.up, POSTERS.whiplash, POSTERS.joker, POSTERS.budapest];
const ROW_2 = [POSTERS.inception, POSTERS.toyStory, POSTERS.darkKnight, POSTERS.wallE, POSTERS.bladeRunner, POSTERS.spiritedAway, POSTERS.up];
const SLIDES = [POSTERS.interstellar, POSTERS.budapest, POSTERS.spiritedAway, POSTERS.whiplash, POSTERS.inception, POSTERS.up];

const TABS: { icon: string; strong: string; rest: string; demo: ReactNode }[] = [
  { icon: "icon-connect.svg", strong: "Swipe and save ", rest: "your next favourite", demo: <SwipeDemo /> },
  { icon: "icon-01b.svg", strong: "Say how you feel ", rest: "and get picks", demo: <MoodDemo /> },
  { icon: "icon-zap.svg", strong: "Watch together ", rest: "with a room code", demo: <RoomDemo /> },
  { icon: "icon-share.svg", strong: "Get tonight’s pick ", rest: "every evening", demo: <PickDemo /> },
];

const face = (g: "men" | "women", n: number) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;

const REVIEWS = [
  {
    quote:
      "“A few swipes on Sunday and my watchlist was full for the whole week. The picks get better the more I use it, which I didn’t expect.”",
    img: face("women", 44),
    name: "Ananya Iyer",
    role: "Product designer, Bengaluru",
  },
  {
    quote:
      "“Watch Together ended the ‘what do you want to watch?’ fight in our flat. Everyone swipes on their own phone and we only see the films we all liked.”",
    img: face("men", 32),
    name: "Daniel Okafor",
    role: "Software engineer, London",
  },
  {
    quote:
      "“I typed ‘need a good cry’ into the mood box and got Up, Coco and Manchester by the Sea. It understood exactly what I meant.”",
    img: face("women", 68),
    name: "Sofia Marín",
    role: "Teacher, Valencia",
  },
  {
    quote:
      "“Tonight’s pick at 7:30 has become a small ritual. One film, no scrolling, and it’s usually something I’d never have found myself.”",
    img: face("men", 75),
    name: "Arjun Menon",
    role: "Medical student, Kochi",
  },
  {
    quote:
      "“The streaming alert is my favourite part. The day a film on my watchlist landed on Netflix, my phone told me. No more checking five apps.”",
    img: face("women", 12),
    name: "Hannah Becker",
    role: "Marketing lead, Berlin",
  },
  {
    quote:
      "“Clean, fast and free. I use the website to browse at work and the app to swipe on the train home. Both feel like the same product.”",
    img: face("men", 51),
    name: "Kenji Watanabe",
    role: "Photographer, Osaka",
  },
  {
    quote:
      "“Our film club uses a Watch Together room every Friday. Six people, one code, and we’re done choosing before the popcorn is ready.”",
    img: face("women", 90),
    name: "Priya Raghunathan",
    role: "Film club organiser, Chennai",
  },
];

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

      {/* Keeps the hero where the template's 70px in-flow navbar left it. */}
      <div className="mvx-navspace" aria-hidden="true" />

      <div className="section hero-section">
        <div className="container">
          <div className="hero-section-holder">
            <div className="hero-section-container">
              <div className="animate-on-load-01">
                <div className="hero-section-news-holder">
                  <a href={APK_URL} className="hero-section-news-container w-inline-block">
                    <div>Free on Android. Download now -&gt;</div>
                  </a>
                </div>
              </div>
              <div className="animate-on-load-02">
                <div className="hero-text-holder-2">
                  <h1 className="gradient-title">Let Your Taste Pick Tonight’s Film</h1>
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
            <p>579 hand-picked films across 17 genres, ready to swipe</p>
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
          </div>
          <div className="featured-cards-holder">
            <div className="features-card-container">
              <div id="w-node-_4dc2c976-4e44-b16b-3ec6-b9cd880112cb-28fde124" className="features-card-image-holder">
                <div className="features-card-image-container-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={`${A}/bg-gradient-card.jpg`} alt="" className="featured-card-background-iamge-2" />
                  <WatchlistCard />
                  <div className="card-gradient"></div>
                </div>
                <div className="card-title-center-holder">
                  <div className="card-title-2">Keep Every Pick in One Watchlist</div>
                </div>
              </div>
              <div id="w-node-_4dc2c976-4e44-b16b-3ec6-b9cd880112d5-28fde124" className="features-card-image-holder">
                <div className="features-card-image-container-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={`${A}/bg-gradient-card.jpg`} alt="" className="featured-card-background-iamge-2" />
                  <MoodCard />
                  <div className="card-gradient"></div>
                </div>
                <div className="card-title-center-holder">
                  <div className="card-title-2">Movies That Match Your Mood</div>
                </div>
              </div>
              <div id="w-node-_4dc2c976-4e44-b16b-3ec6-b9cd880112df-28fde124" className="features-card-image-holder">
                <div className="features-card-image-container-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={`${A}/bg-gradient-card.jpg`} alt="" className="featured-card-background-iamge-2" />
                  <RoomCard />
                  <div className="card-gradient"></div>
                </div>
                <div className="card-title-center-holder">
                  <div className="card-title-2">Pick Together with Your Friends</div>
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
          </div>
          <div className="deploying-app-section-holder">
            <div className="deploying-app-section-container">
              <div className="deploying-app-content">
                <div className="deploying-app-title-holder">
                  <h2 className="fading-title">Swiping made easier and faster</h2>
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
                    <div className="accent-text">579</div>
                    <div className="grey-paragraph">Films in the catalog, with ratings, trailers and cast.</div>
                  </div>
                  <div className="stats-container">
                    <div className="accent-text">17</div>
                    <div className="grey-paragraph">Genres to explore, from Animation to Western.</div>
                  </div>
                </div>
              </div>
              <div id="w-node-_32c0496d-8d2c-291f-6ce3-19118476436a-28fde124" className="deploying-app-images-holder">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${A}/bg-gradient.jpg`} alt="" loading="lazy" className="deploying-app-bg" />
                <div className="deploying-app-screenshot-holder">
                  <SwipePanel />
                </div>
              </div>
            </div>
            <div className="deploying-app-section-container second">
              <div id="w-node-_32c0496d-8d2c-291f-6ce3-19118476436f-28fde124" className="deploying-app-images-holder">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${A}/bg-gradient.jpg`} alt="" loading="lazy" className="deploying-app-bg" />
                <div className="deploying-app-screenshot-holder">
                  <TonightPanel />
                </div>
              </div>
              <div className="deploying-app-content">
                <div className="deploying-app-title-holder">
                  <h2 className="fading-title">Movie night just got easier</h2>
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
                                <img src={tmdb(p)} alt="" loading="lazy" className="slide-image mvx-poster" />
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
                            <img src={tmdb(p, "w154")} loading="lazy" alt="" className="logo-interection-logo" />
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
          </div>
          <div className="testimonal-slider w-slider" data-ovo-slider>
            <div className="testimonal-mask w-slider-mask">
              {REVIEWS.map((r) => (
                <div key={r.name} className="testimonal-slide w-slide">
                  <div className="testimonial-text">{r.quote}</div>
                  <div className="testimonal-info">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.img} loading="lazy" alt={r.name} className="user-image" />
                    <div className="testimonial-info-text">
                      <div className="user-name">{r.name}</div>
                      <div className="user-job-position">{r.role}</div>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mvx-footer">
        <div className="container">
          <div className="mvx-footer__grid">
            <div className="mvx-footer__brand">
              <Link href="/" aria-label="MovieVerse home">
                <Brand />
              </Link>
              <p>Swipe films, pick by mood and match with friends. Free on Android, browsable on any device.</p>
              <div className="mvx-footer__social">
                <a href="https://github.com/jefin10/MovieVerse" target="_blank" rel="noopener noreferrer" aria-label="MovieVerse on GitHub">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
                  </svg>
                </a>
                <a href={APK_URL} aria-label="Download the Android app">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />
                  </svg>
                </a>
              </div>
            </div>
            <nav className="mvx-footer__col" aria-label="Pages">
              <div className="mvx-footer__h">Pages</div>
              <Link href="/">Home</Link>
              <Link href="/app" aria-current="page">App</Link>
              <Link href="/website">Browse</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
            <nav className="mvx-footer__col" aria-label="On this page">
              <div className="mvx-footer__h">Explore</div>
              <a href="#Features">Features</a>
              <a href="#Experience">Experience</a>
              <a href="#Faq">FAQ</a>
            </nav>
            <nav className="mvx-footer__col" aria-label="Resources">
              <div className="mvx-footer__h">Resources</div>
              <a href={APK_URL}>Android APK</a>
              <a href="https://github.com/jefin10/MovieVerse" target="_blank" rel="noopener noreferrer">Source code</a>
              <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>
            </nav>
          </div>

          <div className="mvx-footer__bottom">
            <span>© {new Date().getFullYear()} MovieVerse. Built by{" "}
              <a href="https://github.com/jefin10" target="_blank" rel="noopener noreferrer">JEFIN</a>.
            </span>
            <span>
              Movie data from{" "}
              <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>. Not endorsed by TMDB.
            </span>
          </div>
        </div>
        <div className="mvx-footer__word" aria-hidden="true">MovieVerse</div>
      </footer>

      <OvoMotion />
    </div>
  );
}
