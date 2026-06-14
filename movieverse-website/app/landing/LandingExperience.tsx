"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const LETTERS = ["M", "O", "V", "I", "E"] as const;

const LETTER_VIDEOS: Record<(typeof LETTERS)[number], string> = {
  M: "/videos/no-way-home-spider-man-no-way-home.mp4",
  O: "/videos/oppenheimer.mp4",
  V: "/videos/vekna.mp4",
  I: "/videos/Inception.mp4",
  E: "/videos/eee.mp4",
};


const PANEL_W_FRAC = 0.38;
const EDGE_GAP = 28; 

export default function LandingExperience() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [panelLeft, setPanelLeft] = useState(0);
  const [panelWidth, setPanelWidth] = useState(0);
  const [shifts, setShifts] = useState<number[]>([0, 0, 0, 0, 0]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);

 
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

    for (let i = idx - 1; i >= 0; i--) {
      const anchorRight = i === idx - 1
        ? pLeft - EDGE_GAP           // first left letter: clear the panel
        : pos[i + 1] - hws[i + 1] - LETTER_GAP; // subsequent: clear the previous letter

      pos[i] = Math.max(hws[i] + 12, anchorRight - hws[i]);
    }
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
          Movie<span>Verse</span>
        </div>
        <Link href="/app" className="landing-nav-link">
          View App
        </Link>
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

  

      <div className="landing-grain" aria-hidden />
    </div>
  );
}
