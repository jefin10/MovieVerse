import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import AppLanding from "./AppLanding";
import "./app.css";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-mv-serif",
});

export const metadata: Metadata = {
  title: "MovieVerse App — Swipe, Mood AI & Watchlists",
  description:
    "Download MovieVerse for swipe discovery, mood-based recommendations, watchlists, and personalized movie picks.",
  alternates: { canonical: "/app" },
};

export default function AppPage() {
  return (
    <div className={serif.variable}>
      <AppLanding />
    </div>
  );
}
