import Link from "next/link";

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 15, 2026";

  const sections = [
    {
      anchor: "overview",
      title: "1. Overview",
      body: (
        <>
          <p>
            At <strong>MovieVerse</strong>, your privacy is fundamental to how we
            build our platform. This policy explains what information we collect
            when you use the MovieVerse website, download the Android APK, or
            interact with any of our services — and how we protect it.
          </p>
          <p>
            MovieVerse is a movie discovery platform that combines a web
            catalog, a mobile app with swipe-based discovery, mood-driven AI
            recommendations, and syncable watchlists. We believe in keeping
            things transparent: this document spells out every data point we
            touch and why.
          </p>
        </>
      ),
    },
    {
      anchor: "information-we-collect",
      title: "2. Information We Collect",
      body: (
        <>
          <h4 className="privacy-sub">2.1 Account Information</h4>
          <p>
            When you create a MovieVerse account, we collect your <strong>email
            address</strong>, a <strong>display name</strong>, and an
            encrypted password hash. We never store your plain-text password.
            You may optionally provide a profile picture, which is stored
            securely and only displayed publicly if you choose.
          </p>

          <h4 className="privacy-sub">2.2 Usage & Mood Data</h4>
          <p>
            To power features like mood-based recommendations, we record the
            mood profiles you select (e.g., happy, sad, romantic, action),
            your swipe decisions on movie cards, and the movies you add to your
            watchlist. This data builds a taste profile that makes our
            recommendations better for you over time. None of this data is
            sold to advertisers.
          </p>

          <h4 className="privacy-sub">2.3 Device & Technical Data</h4>
          <p>
            When you use MovieVerse — whether on the web or through the Android
            app — we may automatically collect non-personal technical data
            such as your device type, operating system version, browser type,
            screen resolution, IP address, and approximate location derived
            from your IP. This helps us debug issues, improve performance, and
            understand which features people use most.
          </p>

          <h4 className="privacy-sub">2.4 Cookies & Local Storage</h4>
          <p>
            The MovieVerse website uses essential cookies and browser local
            storage to maintain your session, remember your preferences, and
            keep your watchlist synced. We do not use third-party tracking
            cookies, analytics trackers, or advertising pixels. If we ever
            add analytics in the future, we will update this policy and ask
            for your consent first.
          </p>

          <h4 className="privacy-sub">2.5 TMDB Data</h4>
          <p>
            Movie metadata, posters, ratings, cast information, and trailers
            displayed on MovieVerse are synced from{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Movie Database (TMDB)
            </a>
            . When you browse our catalog, no personally identifiable
            information is shared with TMDB. MovieVerse is an independent
            platform and is not affiliated with or endorsed by TMDB.
          </p>
        </>
      ),
    },
    {
      anchor: "how-we-use-data",
      title: "3. How We Use Your Data",
      body: (
        <>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li>
              <strong>Account Management</strong> — Authenticate your identity,
              sync your watchlists and taste profile across devices, and let
              you access your saved movies from anywhere.
            </li>
            <li>
              <strong>Mood & Taste Recommendations</strong> — Our lightweight
              machine-learning model uses your mood selections and swipe
              history to rank movies from the catalog that match your current
              vibe.
            </li>
            <li>
              <strong>Service Improvement</strong> — Aggregate usage patterns
              help us identify bugs, optimize loading times, and decide which
              features to build next.
            </li>
            <li>
              <strong>Security & Abuse Prevention</strong> — Technical data like
              IP addresses helps us detect and prevent fraudulent activity,
              scraping, and abuse of our API.
            </li>
            <li>
              <strong>Communication</strong> — We may email you about critical
              account updates, security notices, or major product changes. We
              do not send marketing emails, and you will never receive spam
              from MovieVerse.
            </li>
          </ul>
        </>
      ),
    },
    {
      anchor: "data-storage",
      title: "4. Data Storage & Security",
      body: (
        <>
          <p>
            All user data is stored on secure servers with encryption at rest
            and in transit (TLS 1.3+). Passwords are hashed using bcrypt with
            a unique per-user salt. API endpoints that handle personal data
            require authentication tokens and are protected by rate limiting.
          </p>
          <p>
            We retain your account data for as long as your account is active.
            If you delete your account, all associated personal data — including
            your watchlist, taste profile, swipe history, and mood records —
            is permanently deleted from our servers within 30 days. Anonymized,
            aggregated usage metrics may be retained indefinitely for
            analytical purposes.
          </p>
          <p>
            The MovieVerse backend is built on FastAPI with PostgreSQL for
            persistent storage. Database backups are encrypted and retained for
            7 days for disaster recovery. Access to production databases is
            restricted to authorized maintainers over secure, audited
            connections.
          </p>
        </>
      ),
    },
    {
      anchor: "data-sharing",
      title: "5. Data Sharing & Third Parties",
      body: (
        <>
          <p>
            <strong>We do not sell your data.</strong> We do not share your
            personal information with advertisers, data brokers, or analytics
            companies. Here is the complete list of third-party services that
            may touch your data:
          </p>
          <ul>
            <li>
              <strong>TMDB API</strong> — Only non-personal metadata requests
              are sent to TMDB to fetch movie posters, ratings, cast, and
              trailers. No user identifiers are transmitted.
            </li>
            <li>
              <strong>Hosting & Infrastructure</strong> — Our servers are
              hosted on cloud infrastructure providers (e.g., Hetzner,
              Railway, or similar). These providers have industry-standard
              security certifications.
            </li>
            <li>
              <strong>Legal Obligations</strong> — We may disclose information
              if required by law, subpoena, or court order. We will notify
              affected users unless legally prohibited from doing so.
            </li>
          </ul>
        </>
      ),
    },
    {
      anchor: "your-rights",
      title: "6. Your Rights & Choices",
      body: (
        <>
          <p>
            Depending on where you live, you may have specific rights under
            data protection laws such as the GDPR (EU/UK), CCPA (California),
            or similar regulations. These rights include:
          </p>
          <ul>
            <li>
              <strong>Access</strong> — Request a copy of all personal data
              we hold about you.
            </li>
            <li>
              <strong>Correction</strong> — Update inaccurate or incomplete
              personal information tied to your account.
            </li>
            <li>
              <strong>Deletion</strong> — Request deletion of your account
              and all associated personal data.
            </li>
            <li>
              <strong>Portability</strong> — Receive your data in a
              structured, machine-readable format.
            </li>
            <li>
              <strong>Opt-Out</strong> — You can browse the MovieVerse catalog
              without an account. Creating an account is entirely optional.
            </li>
          </ul>
          <p>
            To exercise any of these rights, email us at{" "}
            <a href="mailto:privacy@movieverse.jefin.xyz" className="privacy-link-inline">
              privacy@movieverse.jefin.xyz
            </a>
            . We will respond within 30 days and may ask you to verify your
            identity before processing your request.
          </p>
        </>
      ),
    },
    {
      anchor: "children",
      title: "7. Children's Privacy",
      body: (
        <>
          <p>
            MovieVerse is not directed at children under the age of 13. We do
            not knowingly collect personal information from children under 13.
            If you are a parent or guardian and believe your child has provided
            us with personal data, please contact us immediately. Upon
            verification, we will delete the data from our systems.
          </p>
          <p>
            The MovieVerse app and website display movie metadata, posters,
            and trailers that are sourced from TMDB. While we do not host
            explicit content, some movie posters or trailers may contain
            imagery intended for mature audiences. We display age ratings
            and content descriptors where available.
          </p>
        </>
      ),
    },
    {
      anchor: "apk-distribution",
      title: "8. APK Distribution & Permissions",
      body: (
        <>
          <p>
            The MovieVerse Android app is distributed as an APK file directly
            from our GitHub Releases page. It is not currently available on
            the Google Play Store. When you install the APK, Android may
            request the following permissions:
          </p>
          <ul>
            <li>
              <strong>Internet Access</strong> — Required to fetch movie
              metadata from our backend API and TMDB.
            </li>
            <li>
              <strong>Storage (optional)</strong> — May be used to cache
              poster images for offline browsing. You can deny this
              permission and continue using the app.
            </li>
          </ul>
          <p>
            The APK does not request access to your contacts, camera,
            microphone, location, SMS, or any other sensitive device
            features. You can verify this by inspecting the AndroidManifest
            in the source code, which is open-source and available on{" "}
            <a
              href="https://github.com/jefin10/MovieVerse"
              target="_blank"
              rel="noopener noreferrer"
              className="privacy-link-inline"
            >
              GitHub
            </a>
            .
          </p>
        </>
      ),
    },
    {
      anchor: "open-source",
      title: "9. Open Source Transparency",
      body: (
        <>
          <p>
            The MovieVerse backend, website, and Android app are fully
            open-source under the MIT license. You can inspect every line of
            code — including how we handle authentication, store passwords,
            process mood data, and make API calls — at our{" "}
            <a
              href="https://github.com/jefin10/MovieVerse"
              target="_blank"
              rel="noopener noreferrer"
              className="privacy-link-inline"
            >
              GitHub repository
            </a>
            .
          </p>
          <p>
            We believe that transparency is the best privacy policy. By
            keeping our code open, we allow anyone to verify that we handle
            data exactly as described in this document. If you find a
            discrepancy, please{" "}
            <a
              href="https://github.com/jefin10/MovieVerse/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="privacy-link-inline"
            >
              open an issue
            </a>{" "}
            or email us.
          </p>
        </>
      ),
    },
    {
      anchor: "changes",
      title: "10. Changes to This Policy",
      body: (
        <>
          <p>
            We may update this privacy policy from time to time. When we do,
            we will revise the &ldquo;Last Updated&rdquo; date at the top of
            this page and, for material changes, notify registered users via
            email. We encourage you to review this policy periodically to
            stay informed about how we protect your data.
          </p>
          <p>
            Continued use of MovieVerse after a policy update constitutes
            your acceptance of the revised terms. If you disagree with any
            changes, you may delete your account at any time.
          </p>
        </>
      ),
    },
    {
      anchor: "contact",
      title: "11. Contact Us",
      body: (
        <>
          <p>
            If you have questions, concerns, or feedback about this privacy
            policy or how MovieVerse handles your data, reach out to us:
          </p>
          <div className="privacy-contact-card">
            <div className="privacy-contact-row">
              <span className="privacy-contact-label">Email</span>
              <a href="mailto:privacy@movieverse.jefin.xyz" className="privacy-link-inline">
                privacy@movieverse.jefin.xyz
              </a>
            </div>
            <div className="privacy-contact-row">
              <span className="privacy-contact-label">GitHub</span>
              <a
                href="https://github.com/jefin10/MovieVerse"
                target="_blank"
                rel="noopener noreferrer"
                className="privacy-link-inline"
              >
                github.com/jefin10/MovieVerse
              </a>
            </div>
            <div className="privacy-contact-row">
              <span className="privacy-contact-label">Website</span>
              <span className="text-zinc-300">movieverse.jefin.xyz</span>
            </div>
          </div>
          <p>
            We read every message and typically respond within 2–3 business
            days. For urgent security concerns, please include
            &ldquo;SECURITY&rdquo; in your subject line for priority handling.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <main className="movieverse-shell">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="movieverse-title text-5xl text-white">
              Privacy Policy
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              ← Home
            </Link>
            <Link
              href="/browse"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Browse Movies
            </Link>
          </div>
        </header>

        {/* Last Updated */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
          <p className="text-zinc-400 text-sm">
            <strong className="text-white">Last Updated:</strong>{" "}
            {lastUpdated}
          </p>
          <p className="text-zinc-500 text-sm mt-1">
            This policy applies to all MovieVerse services: the web catalog at{" "}
            <span className="text-zinc-300">movieverse.jefin.xyz</span>, the
            Android APK, and our backend API.
          </p>
        </div>

        {/* Table of Contents */}
        <nav
          className="mb-10 rounded-2xl border border-white/10 bg-zinc-900/50 p-6"
          aria-label="Privacy policy table of contents"
        >
          <h2 className="text-white text-lg font-semibold mb-4">
            Contents
          </h2>
          <ol className="grid gap-2 sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.anchor}>
                <a
                  href={`#${section.anchor}`}
                  className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <span className="text-zinc-600 text-xs font-mono min-w-[1.25rem]">
                    {sections.indexOf(section) + 1 < 10
                      ? `0${sections.indexOf(section) + 1}`
                      : sections.indexOf(section) + 1}
                  </span>
                  {section.title.replace(/^\d+\.\s*/, "")}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Policy Sections */}
        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <section
              key={section.anchor}
              id={section.anchor}
              className="scroll-mt-28"
            >
              <h2 className="movieverse-title text-3xl text-white mb-4 border-b border-white/10 pb-3">
                {section.title}
              </h2>
              <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed space-y-4">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        {/* Final Note */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 text-center">
          <p className="text-zinc-400 text-sm">
            Thank you for trusting MovieVerse with your movie nights. We take
            that trust seriously.
          </p>
          <p className="text-zinc-600 text-xs mt-2">
            MovieVerse is an independent, open-source project. Not affiliated
            with TMDB or any movie studio.
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-white/10 flex flex-wrap justify-between gap-4 text-sm text-zinc-600">
          <p>
            &copy; {new Date().getFullYear()} MovieVerse. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/browse" className="hover:text-white transition-colors">
              Browse
            </Link>
            <Link href="/privacy" className="text-white transition-colors">
              Privacy
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}