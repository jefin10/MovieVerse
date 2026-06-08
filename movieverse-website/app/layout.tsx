import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const siteUrl = "https://movieverse.jefin.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MovieVerse — Discover Movies. Swipe. Watch.",
    template: "%s | MovieVerse",
  },
  description:
    "Browse thousands of movies, search the catalog, and find what to watch next. Get personalized recommendations and mood-based discovery in the MovieVerse app.",
  keywords: [
    "movies",
    "movie discovery",
    "watchlist",
    "film catalog",
    "movie recommendations",
    "mood-based movies",
    "MovieVerse",
  ],
  applicationName: "MovieVerse",
  authors: [{ name: "Jefin", url: "https://github.com/jefin10" }],
  creator: "Jefin",
  publisher: "MovieVerse",
  category: "entertainment",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "MovieVerse",
    title: "MovieVerse — Discover Movies. Swipe. Watch.",
    description:
      "Browse the movie catalog on web, or download the app for swipe discovery, mood AI, and personalized picks.",
    images: [
      {
        url: "/MVV.png",
        width: 512,
        height: 512,
        alt: "MovieVerse logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "MovieVerse — Discover Movies. Swipe. Watch.",
    description:
      "Browse movies on web. Download the app for swipe discovery and mood-based recommendations.",
    images: ["/MVV.png"],
  },
  icons: {
    icon: [{ url: "/MVV.png", type: "image/png" }],
    apple: [{ url: "/MVV.png", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "MovieVerse",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
