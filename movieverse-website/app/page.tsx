export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <main className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="movieverse-title text-7xl sm:text-8xl text-white mb-4">
            MovieVerse
          </h1>
          <p className="text-zinc-400 text-lg">
            Discover movies. Swipe. Watch.
          </p>
        </div>

        {/* Temporary: Browse Movies button hidden */}
        <div className="grid gap-6">
          {/**
           * <Link
           *   href="/browse"
           *   className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white p-10 transition hover:border-white/40 hover:scale-105"
           * >
           *   <div className="relative z-10">
           *     <h2 className="movieverse-title text-4xl text-black mb-3">
           *       Browse Movies
           *     </h2>
           *     <p className="text-zinc-700 text-base">
           *       Explore our complete movie catalog without signing in
           *     </p>
           *   </div>
           * </Link>
           */}

          {/* Download App Button */}
          <a
            href="https://github.com/jefin10/MovieVerse/releases/download/v1.0.0/movieverse.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block w-full max-w-xl mx-auto overflow-hidden rounded-3xl border border-white/20 bg-black px-10 py-12 transition hover:border-white/40 hover:scale-105"
          >
            <div className="relative z-10">
              <h2 className="movieverse-title text-4xl text-white mb-3">
                Download App
              </h2>
              <p className="text-zinc-400 text-base">
                Get personalized recommendations and mood-based discovery
              </p>
            </div>
          </a>
        </div>

        {/* Footer Note */}
        <p className="text-center text-zinc-600 text-sm mt-12">
          Full experience in mobile app
        </p>
      </main>
    </div>
  );
}
