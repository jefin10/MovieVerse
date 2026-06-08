import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MovieVerse",
    short_name: "MovieVerse",
    description:
      "Discover movies. Browse the catalog, search titles, and download the app for swipe discovery and mood AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait",
    categories: ["entertainment", "movies"],
    icons: [
      {
        src: "/MVV.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/MVV.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
