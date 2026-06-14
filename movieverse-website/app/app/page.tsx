import type { Metadata } from "next";
import AppLanding from "./AppLanding";
import "./app.css";

export const metadata: Metadata = {
  title: "MovieVerse App — Swipe, Mood AI & Watchlists",
  description:
    "Download MovieVerse for swipe discovery, mood-based recommendations, watchlists, and personalized movie picks.",
  alternates: { canonical: "/app" },
};

export default function AppPage() {
  return <AppLanding />;
}
