import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import AppSite, { APK_URL } from "./AppSite";
import "./ovo.css";
import "./mockups.css";
import "./panels.css";

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
    title: "MovieVerse | Let your taste pick tonight’s film",
    description: "Swipe. Say your mood. Watch together. Free on Android.",
    url: "/app",
  },
};

export default function AppPage() {
  return (
    <div className={poppins.variable}>
      {/* Outside .ovo so the template's scoped CSS can't restyle it. */}
      <SiteNav
        brandHref="/app"
        label="App"
        links={[
          { href: "#Features", label: "Features" },
          { href: "#Experience", label: "Experience" },
          { href: "#Faq", label: "FAQ" },
          { href: "/website", label: "Browse" },
        ]}
        cta={{ href: APK_URL, label: "Download" }}
      />
      <AppSite />
    </div>
  );
}
