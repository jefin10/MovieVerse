import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import AppSite from "./AppSite";
import "./ovo.css";
import "./mockups.css";

// Poppins is the app's font, used by the phone mockups. The page itself uses
// the template's Inter and DM Sans (loaded in AppSite).
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mv-sans",
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
    <div className={poppins.variable}>
      <AppSite />
    </div>
  );
}
