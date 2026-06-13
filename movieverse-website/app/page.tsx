import { Cormorant_Garamond } from "next/font/google";
import LandingExperience from "./landing/LandingExperience";
import "./landing/landing.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-landing-display",
});

export default function Home() {
  return (
    <div className={`${display.variable} min-h-[100dvh] bg-[#050505]`}>
      <LandingExperience />
    </div>
  );
}
