"use client";

/*
 * The floating glass navbar shared by /website and /app: wordmark on the left,
 * a glass pill with links and one call to action on the right. Below 900px the
 * links fold into a "Menu" dropdown.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import "./site-nav.css";

export type SiteNavLink = { href: string; label: string };

export default function SiteNav({
  brandHref,
  links,
  cta,
  label,
}: {
  brandHref: string;
  links: SiteNavLink[];
  cta: SiteNavLink;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open]);

  const close = () => setOpen(false);
  // In-page anchors and external URLs stay plain links; site routes use Link.
  const isRoute = (href: string) => href.startsWith("/");

  return (
    <header className={`web-nav${open ? " is-open" : ""}`}>
      <Link href={brandHref} className="web-nav-brand" onClick={close}>
        MOVIEVERSE
      </Link>

      <div className="web-nav-glass">
        <button
          type="button"
          className="web-nav-menu-btn"
          aria-expanded={open}
          aria-controls="web-nav-links"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
        <nav id="web-nav-links" className="web-nav-links" aria-label={label} onClick={close}>
          {links.map((l) =>
            isRoute(l.href) ? (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ),
          )}
        </nav>
        {isRoute(cta.href) ? (
          <Link href={cta.href} className="web-nav-cta" onClick={close}>
            {cta.label}
          </Link>
        ) : (
          <a href={cta.href} className="web-nav-cta" onClick={close}>
            {cta.label}
          </a>
        )}
      </div>
    </header>
  );
}
