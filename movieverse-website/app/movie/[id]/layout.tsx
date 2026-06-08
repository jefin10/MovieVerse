import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movie Details",
  description:
    "View movie details, ratings, genres, and trailers on MovieVerse.",
};

export default function MovieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
