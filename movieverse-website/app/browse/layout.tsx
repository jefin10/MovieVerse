import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Movies",
  description:
    "Explore the full MovieVerse catalog. Search movies, browse pages, and open any title for details and trailers.",
  alternates: {
    canonical: "/browse",
  },
  openGraph: {
    title: "Browse Movies | MovieVerse",
    description:
      "Explore the full MovieVerse catalog without signing in.",
    url: "/browse",
  },
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
