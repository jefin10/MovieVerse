/*
 * Animated illustrations for the /app page: the hero's orbit and starfield,
 * the three "how it works" scenes and the closing poster carousel.
 * Flat, minimal, and only in the app's palette. Motion is in app.css.
 */
import type { CSSProperties } from "react";
import { Icon, Poster } from "./Sprites";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/* Deterministic pseudo-random numbers, so the server always renders the same stars. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(42);
const STARS = Array.from({ length: 46 }, () => ({
  x: +(rand() * 100).toFixed(2),
  y: +(rand() * 100).toFixed(2),
  s: +(rand() * 1.6 + 0.6).toFixed(2),
  t: +(rand() * 6).toFixed(2),
}));

export function HeroBackdrop() {
  return (
    <div className="mv-hero__bg" aria-hidden="true">
      <span className="mv-glow mv-glow--a" />
      <span className="mv-glow mv-glow--b" />
      <div className="mv-starfield">
        {STARS.map((st, i) => (
          <i key={i} style={v({ left: `${st.x}%`, top: `${st.y}%`, "--s": `${st.s}px`, "--t": `${st.t}s` })} />
        ))}
      </div>
      <svg className="mv-orbit" viewBox="0 0 800 800">
        <g className="mv-orbit__r mv-orbit__r--1">
          <circle cx="400" cy="400" r="200" className="mv-orbit__line" />
          <circle cx="600" cy="400" r="5" fill="#fff" />
        </g>
        <g className="mv-orbit__r mv-orbit__r--2">
          <circle cx="400" cy="400" r="285" className="mv-orbit__line mv-orbit__line--dash" />
          <circle cx="400" cy="115" r="11" fill="url(#mvg-gold)" />
          <ellipse cx="400" cy="115" rx="20" ry="5" fill="none" stroke="#fff" strokeOpacity=".7" transform="rotate(-18 400 115)" />
        </g>
        <g className="mv-orbit__r mv-orbit__r--3">
          <circle cx="400" cy="400" r="375" className="mv-orbit__line" />
          <circle cx="25" cy="400" r="4" fill="#ffd700" />
          <circle cx="775" cy="400" r="3" fill="#fff" />
        </g>
      </svg>
    </div>
  );
}

/** Small posters drifting around the hero phone (wide screens only). */
export function HeroTiles() {
  const tiles = [
    { v: 4, c: "a" },
    { v: 9, c: "b" },
    { v: 6, c: "c" },
    { v: 1, c: "d" },
  ];
  return (
    <div className="mv-hero__tiles" aria-hidden="true">
      {tiles.map((t) => (
        <Poster key={t.c} v={t.v} className={`mv-tile3d mv-tile3d--${t.c}`} />
      ))}
      <span className="mv-chip mv-chip--rating">
        <Icon name="star" size={13} fill /> 8.6
      </span>
      <span className="mv-chip mv-chip--match">
        <b>92%</b> taste match
      </span>
      <span className="mv-chip mv-chip--room">S8FUYB</span>
    </div>
  );
}

/* ── How it works ────────────────────────────────────────────────────────── */

export function StepCode() {
  return (
    <div className="mv-step-art mv-step-art--code" aria-hidden="true">
      <span className="mv-env">
        <span className="mv-env__letter">
          <i />
          <i />
        </span>
        <span className="mv-env__body" />
        <span className="mv-env__flap" />
      </span>
      <span className="mv-step-art__boxes">
        {Array.from("481927").map((d, i) => (
          <b key={i} style={v({ "--i": i })}>
            {d}
          </b>
        ))}
      </span>
    </div>
  );
}

export function StepTaste() {
  const chips = ["Drama", "Sci-Fi", "Comedy", "Romance", "Thriller", "Animation"];
  return (
    <div className="mv-step-art mv-step-art--taste" aria-hidden="true">
      {chips.map((c, i) => (
        <span key={c} className="mv-gchip" style={v({ "--i": i })}>
          {c}
        </span>
      ))}
    </div>
  );
}

export function StepSwipe() {
  return (
    <div className="mv-step-art mv-step-art--swipe" aria-hidden="true">
      <span className="mv-mini mv-mini--back">
        <Poster v={8} />
      </span>
      <span className="mv-mini mv-mini--front">
        <Poster v={0} />
      </span>
      <span className="mv-step-art__bm">
        <Icon name="bookmark" size={22} />
      </span>
      <span className="mv-step-art__heart">
        <Icon name="heart" size={16} fill />
      </span>
    </div>
  );
}

/* ── Closing carousel: posters on a slowly turning ring ──────────────────── */

export function PosterRing() {
  const n = 12;
  return (
    <div className="mv-ring3d" aria-hidden="true">
      <div className="mv-ring3d__spin" style={v({ "--n": n })}>
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className="mv-ring3d__item" style={v({ "--i": i })}>
            <Poster v={i} />
          </span>
        ))}
      </div>
    </div>
  );
}
