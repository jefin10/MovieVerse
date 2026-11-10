/*
 * The animated app panels on /app: three feature cards and the two large
 * panels beside "Swiping made easier" and "Movie night just got easier".
 * Each panel loops one short story in CSS (panels.css). `data-demo` lets
 * OvoMotion pause it while it is off screen.
 */
import type { CSSProperties } from "react";
import { POSTERS, tmdb, type Film } from "./films";
import { Icon } from "./Sprites";

const vars = (o: Record<string, string | number>) => o as CSSProperties;

/* eslint-disable @next/next/no-img-element */

function Row({ film, title, sub, rating, className = "" }: { film: Film; title: string; sub: string; rating: string; className?: string }) {
  return (
    <div className={`mvx-row pn-row ${className}`}>
      <img src={tmdb(POSTERS[film], "w92")} alt="" className="pn-row__img" />
      <div className="mvx-row__txt">
        <b>{title}</b>
        <small>{sub}</small>
      </div>
      <div className="mvx-row__end">★ {rating}</div>
    </div>
  );
}

/** Rolling number: shows each value in turn, driven by the panel's keyframes. */
function Roll({ values, className }: { values: string[]; className: string }) {
  return (
    <span className="pn-roll">
      <span className={`pn-roll__in ${className}`}>
        {values.map((v) => (
          <i key={v}>{v}</i>
        ))}
      </span>
    </span>
  );
}

/** Feature card 1: a swiped poster drops into the watchlist. */
export function WatchlistCard() {
  return (
    <div className="mvx-sheet mvx-cardui pn pn-wl" data-demo>
      <div className="mvx-sheet__label">
        <span>⌄ Your watchlist</span>
        <span>
          <Roll values={["12", "13"]} className="pn-wl__count" /> films
        </span>
      </div>
      <div className="pn-list">
        <Row film="interstellar" title="Interstellar" sub="Added just now" rating="8.6" className="pn-wl__new" />
        <Row film="darkKnight" title="The Dark Knight" sub="Added yesterday" rating="9.0" />
        <Row film="spiritedAway" title="Spirited Away" sub="Last week" rating="8.6" />
      </div>
    </div>
  );
}

const MOODS = ["Happy", "Romantic", "Adventurous", "Lonely"];
const MOOD_SHELF: Film[] = ["interstellar", "inception", "up", "budapest", "matrix"];

/** Feature card 2: tap a mood, get a shelf of films. */
export function MoodCard() {
  return (
    <div className="mvx-sheet mvx-cardui pn pn-md" data-demo>
      <div className="pn-view">
        <div className="pn-track pn-md__track">
          <div className="pn-page">
            <div className="mvx-sheet__label">
              <span>How are you feeling?</span>
            </div>
            <div className="mvx-moods">
              {MOODS.map((m) => (
                <span key={m} className={`mvx-mood${m === "Adventurous" ? " pn-md__pick" : ""}`}>
                  {m}
                  {m === "Adventurous" ? <span className="pn-tap" /> : null}
                </span>
              ))}
            </div>
          </div>
          <div className="pn-page">
            <div className="mvx-sheet__label">
              <span>Adventurous picks</span>
              <span>24 films</span>
            </div>
            <div className="pn-shelf">
              {MOOD_SHELF.map((f, i) => (
                <img key={f} src={tmdb(POSTERS[f], "w154")} alt="" style={vars({ "--i": i })} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ROOM = ["You", "sam", "alex", "meera"];

/** Feature card 3: friends join a room, then everyone matches on a film. */
export function RoomCard() {
  return (
    <div className="mvx-sheet mvx-cardui pn pn-rm" data-demo>
      <div className="pn-view">
        <div className="pn-track pn-rm__track">
          <div className="pn-page">
            <div className="mvx-sheet__label">
              <span>Watch Together</span>
              <span className="pn-code">Room 4821</span>
            </div>
            <div className="pn-avatars">
              {ROOM.map((n, i) => (
                <span key={n} className="pn-av" style={vars({ "--i": i })}>
                  <b>{n[0].toUpperCase()}</b>
                  <small>{n}</small>
                </span>
              ))}
            </div>
            <div className="pn-rm__status">
              <span className="pn-dots">
                <i />
                <i />
                <i />
              </span>
              4 friends swiping the same deck
            </div>
          </div>
          <div className="pn-page pn-rm__match">
            <img src={tmdb(POSTERS.budapest, "w154")} alt="" />
            <div>
              <b>It’s a match!</b>
              <small>All 4 of you liked The Grand Budapest Hotel</small>
              <span className="pn-stack">
                {ROOM.map((n) => (
                  <i key={n}>{n[0].toUpperCase()}</i>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DECK: { film: Film; title: string; genres: string }[] = [
  { film: "interstellar", title: "Interstellar", genres: "Adventure · Sci-Fi" },
  { film: "joker", title: "Joker", genres: "Crime · Thriller" },
  { film: "inception", title: "Inception", genres: "Action · Sci-Fi" },
];

/** "Swiping made easier": save, skip, save, and the saves land in the watchlist. */
export function SwipePanel() {
  return (
    <div className="deploying-app-screenshot mvx-sheet pn pn-sw" data-demo>
      <div className="mvx-sheet__label">
        <span>Discover</span>
        <span>Swipe right to save</span>
      </div>
      <div className="pn-deck">
        {DECK.map((c, i) => (
          <div key={c.film} className={`pn-card pn-card--${i}`}>
            <img src={tmdb(POSTERS[c.film], "w342")} alt="" />
            <span className="pn-card__meta">
              <b>{c.title}</b>
              <small>{c.genres}</small>
            </span>
            <span className={`pn-stamp ${i === 1 ? "pn-stamp--skip" : "pn-stamp--save"}`}>{i === 1 ? "Skip" : "Save"}</span>
          </div>
        ))}
      </div>
      <div className="mvx-sheet__label">
        <span>Your watchlist</span>
        <span>
          <Roll values={["12", "13", "14"]} className="pn-sw__count" /> films
        </span>
      </div>
      <div className="pn-list pn-sw__list">
        <Row film="inception" title="Inception" sub="Added just now" rating="8.8" className="pn-sw__new2" />
        <Row film="interstellar" title="Interstellar" sub="Added just now" rating="8.6" className="pn-sw__new1" />
        <Row film="darkKnight" title="The Dark Knight" sub="Yesterday" rating="9.0" />
        <Row film="spiritedAway" title="Spirited Away" sub="Last week" rating="8.6" />
      </div>
    </div>
  );
}

const WHERE: [string, boolean, boolean][] = [
  ["India", true, true],
  ["United States", true, false],
  ["United Kingdom", false, true],
];

/** "Movie night just got easier": tonight's pick arrives at 7:30. */
export function TonightPanel() {
  return (
    <div className="deploying-app-screenshot mvx-sheet pn pn-tn" data-demo>
      <div className="mvx-sheet__label">
        <span>⌄ Tonight’s pick</span>
        <Roll values={["7:29 pm", "7:30 pm"]} className="pn-tn__clock" />
      </div>
      <div className="mvx-row pn-tn__pick">
        <img src={tmdb(POSTERS.inception, "w92")} alt="" />
        <div className="mvx-row__txt">
          <b>Inception</b>
          <small>Picked for your taste</small>
          <span className="pn-bar">
            <i />
          </span>
        </div>
        <div className="mvx-row__end">
          ★ 8.8
          <small>94% match</small>
        </div>
      </div>
      <div className="mvx-toast pn-tn__toast">
        <span className="mvx-toast__ic">
          <Icon name="tv" size={15} />
        </span>
        <span>
          <b>Now on your services!</b>
          <small>Spirited Away just arrived on a service you pay for</small>
        </span>
      </div>
      <div className="mvx-sheet__label">
        <span>⌄ Where to watch</span>
      </div>
      <div className="mvx-table">
        <span>Country</span>
        <span>Stream</span>
        <span>Rent</span>
        {WHERE.map(([country, stream, rent], r) =>
          [country, stream, rent].map((cell, c) => (
            <span key={`${r}-${c}`} className="pn-cell" style={vars({ "--r": r })}>
              {typeof cell === "string" ? cell : <span className={cell ? "pn-check" : "pn-no"}>{cell ? "✓" : "✕"}</span>}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
