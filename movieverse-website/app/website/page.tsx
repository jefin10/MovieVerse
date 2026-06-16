import type { Metadata } from "next";
import WebsiteExperience from "./WebsiteExperience";
import "./website.css";

export const metadata: Metadata = {
  title: "MovieVerse — Browse Movies & Discover What to Watch",
  description:
    "Explore trending titles, browse the catalog, and find your next movie night pick on MovieVerse.",
  alternates: { canonical: "/website" },
};

export default function WebsitePage() {
  return <WebsiteExperience />;
}
