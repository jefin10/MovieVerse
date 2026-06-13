"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const APP_URL =
  "https://github.com/jefin10/MovieVerse/releases/download/v1.0.0/movieverse.apk";
const LETTERS = ["M", "O", "V", "I", "E"] as const;

const LETTER_VIDEOS: Record<(typeof LETTERS)[number], string> = {
  M: "/videos/no-way-home-spider-man-no-way-home.mp4",
  O: "/videos/oppenheimer.mp4",
  V: "/videos/vekna.mp4",
  I: "/videos/Inception.mp4",
  E: "/videos/eee.mp4",
};

// Panel covers 38 % of the viewport, centered on the hovered letter's
// natural position.  Letters on the left are pushed left of the panel;
// letters on the right are pushed right — clamped so nothing exits the screen.
const PANEL_W_FRAC = 0.38;
const EDGE_GAP = 28; // px breathing room between panel edge and letter edge

export default function LandingExperience() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [panelLeft, setPanelLeft] = useState(0);
  const [panelWidth, setPanelWidth] = useState(0);
  const [shifts, setShifts] = useState<number[]>([0, 0, 0, 0, 0]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);

  /**
   * Core layout engine.
   *
   * Places letters so they NEVER overlap each other or the video panel.
   * Works by cascading outward from the panel edge:
   *   1. Hovered letter  → center on panel center.
   *   2. Adjacent letter → just outside panel edge.
   *   3. Each further letter → just outside the previous letter.
   *
   * Uses offsetLeft (layout geometry, ignores CSS transforms) so the
   * natural positions are always correct even while letters are animating.
   */
  const compute = useCallback((idx: number) => {
    const titleEl = titleRef.current;
    const hovEl   = letterRefs.current[idx];
    if (!titleEl || !hovEl || typeof window === "undefined") return;

    const vw = window.innerWidth;
    const PW = vw * PANEL_W_FRAC;
    const titleRect = titleEl.getBoundingClientRect();

    const hws = letterRefs.current.map(el => (el ? el.offsetWidth / 2 : 0));
    const nats = letterRefs.current.map(
      (el, i) => el ? titleRect.left + el.offsetLeft + hws[i] : 0,
    );

    // Panel centered on the hovered letter, clamped to viewport
    const pLeft   = Math.max(0, Math.min(nats[idx] - PW / 2, vw - PW));
    const pRight  = pLeft + PW;
    const pCenter = pLeft + PW / 2;

    const LETTER_GAP = 20; // min gap between letter edges after spreading
    const pos: number[] = new Array(5).fill(0);

    // 1. Hovered letter → panel center
    pos[idx] = pCenter;

    // 2. Left letters: place each one to the left of the previous
    for (let i = idx - 1; i >= 0; i--) {
      const anchorRight = i === idx - 1
        ? pLeft - EDGE_GAP           // first left letter: clear the panel
        : pos[i + 1] - hws[i + 1] - LETTER_GAP; // subsequent: clear the previous letter

      pos[i] = Math.max(hws[i] + 12, anchorRight - hws[i]);
    }

    // 3. Right letters: place each one to the right of the previous
    for (let i = idx + 1; i < 5; i++) {
      const anchorLeft = i === idx + 1
        ? pRight + EDGE_GAP
        : pos[i - 1] + hws[i - 1] + LETTER_GAP;

      pos[i] = Math.min(vw - hws[i] - 12, anchorLeft + hws[i]);
    }

    setPanelLeft(pLeft);
    setPanelWidth(PW);
    setShifts(pos.map((p, i) => p - nats[i]));
  }, []);

  const activate = useCallback(
    (idx: number) => {
      setActiveIndex(idx);
      compute(idx);
    },
    [compute],
  );

  const deactivate = useCallback(() => {
    setActiveIndex(null);
    setShifts([0, 0, 0, 0, 0]);
    videoRef.current?.pause();
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;

    const video = videoRef.current;
    if (!video) return;

    const src = LETTER_VIDEOS[LETTERS[activeIndex]];
    if (video.getAttribute("src") !== src) {
      video.src = src;
    }

    video.currentTime = 0;
    void video.load();
    void video.play().catch(() => undefined);
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onResize = () => compute(activeIndex);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, compute]);

  const isActive = activeIndex !== null;

  return (
    <div className={`landing-shell${isActive ? " is-active" : ""}`}>

      {/* Video panel — z-index 1, always behind letters (z-index 10) */}
      <div
        className={`landing-video-panel${isActive ? " is-active" : ""}`}
        style={{ left: panelLeft, width: panelWidth }}
        aria-hidden
      >
        <video
          ref={videoRef}
          src={LETTER_VIDEOS.M}
          muted
          loop
          playsInline
          preload="metadata"
          className="landing-video"
        />
        <div className="landing-video-vignette" />
      </div>

      <header className="landing-nav">
        <Link href="/browse" className="landing-nav-link">View Website</Link>
        <div className="landing-brand" aria-label="MovieVerse">
          <span className="landing-brand-main">Movie</span>
          <span className="landing-brand-sub">Verse</span>
        </div>
        <a
          href={APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="landing-nav-link"
        >
          View App
        </a>
      </header>

      <main className="landing-hero">
        <h1
          ref={titleRef}
          className="landing-title"
          aria-label="Movie"
          onMouseLeave={deactivate}
        >
          {LETTERS.map((letter, i) => (
            <span
              key={letter}
              ref={(el) => { letterRefs.current[i] = el; }}
              className={`landing-letter${activeIndex === i ? " is-hovered" : ""}`}
              style={{ transform: `translateX(${shifts[i]}px)` }}
              onMouseEnter={() => activate(i)}
              onFocus={() => activate(i)}
              onBlur={deactivate}
              onTouchStart={() => activate(i)}
              onTouchEnd={deactivate}
              tabIndex={0}
              role="button"
              aria-label={`Hover ${letter}`}
            >
              {letter}
            </span>
          ))}
        </h1>
      </main>

      <p className="landing-hint">Hover each letter</p>

      <footer className="landing-footer">
        Your story, our lens — MovieVerse brings every frame to life on screen
      </footer>

      <div className="landing-grain" aria-hidden />
    </div>
  );
}
