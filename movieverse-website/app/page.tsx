import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen py-8 sm:py-14">
      <main className="movieverse-shell">
        <header className="mb-10 rounded-3xl border border-white/10 bg-black/35 p-7 backdrop-blur md:p-10">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-orange-300">MovieVerse Platform</p>
          <h1 className="movieverse-title text-6xl leading-none text-white sm:text-7xl">MovieVerse</h1>
          <p className="mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Explore the full movie catalog on web, then continue with mood-based and swipe discovery inside the mobile app.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          <Link
            href="/browse"
            className="group rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/25 to-orange-900/25 p-8 transition hover:border-orange-400"
          >
            <p className="text-xs uppercase tracking-[0.15em] text-orange-200">Web Experience</p>
            <h2 className="movieverse-title mt-2 text-4xl text-white">View Website</h2>
            <p className="mt-3 text-zinc-200">Open the no-auth movie catalog, search titles, and view full movie details.</p>
          </Link>

          <a
            href="https://expo.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-3xl border border-white/15 bg-gradient-to-br from-zinc-800/60 to-zinc-900/80 p-8 transition hover:border-white/35"
          >
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-300">Mobile Experience</p>
            <h2 className="movieverse-title mt-2 text-4xl text-white">Install App</h2>
            <p className="mt-3 text-zinc-300">Install MovieVerse on your phone for personalized recommendations, mood mode, and Shorts trailers.</p>
          </a>
        </section>
      </main>
    </div>
  );
}
