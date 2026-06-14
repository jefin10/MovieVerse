import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how MovieVerse collects, uses, and protects your personal data. Our privacy policy covers data handling for the Android app, web catalog, and mood-based AI recommendations.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | MovieVerse",
    description:
      "Learn how MovieVerse collects, uses, and protects your personal data across the app and web platform.",
    url: "/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}