import type { Metadata } from "next";
import { Bricolage_Grotesque, Poppins, Stick_No_Bills } from "next/font/google";
import AppSite from "./AppSite";
import "./mockups.css";
import "./site.css";

// The app's own fonts: Poppins for text, Stick No Bills for the wordmark.
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mv-sans",
  display: "swap",
});

// Bold display face for the page headings.
const display = Bricolage_Grotesque({
  weight: ["700", "800"],
  subsets: ["latin"],
  variable: "--font-ao-display",
  display: "swap",
});

const wordmark = Stick_No_Bills({
  weight: ["600"],
  subsets: ["latin"],
  variable: "--font-mv-logo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The App",
  description:
    "MovieVerse picks tonight’s film from your swipes, your mood and your friends. Swipe to build a watchlist, get mood picks, and match films with friends in Watch Together.",
  alternates: { canonical: "/app" },
  openGraph: {
    title: "MovieVerse — Let your taste pick tonight’s film",
    description: "Swipe. Say your mood. Watch together. Free on Android.",
    url: "/app",
  },
};

export default function AppPage() {
  return (
    <div className={`${poppins.variable} ${display.variable} ${wordmark.variable}`}>
      <AppSite />
    </div>
  );
}
