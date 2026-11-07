"use client";

/*
 * The /app page's only script: nav state on scroll, scroll reveals (when the
 * browser lacks CSS scroll-driven animations), counting numbers, pausing demos
 * that are off screen, and the pop-up showcase tabs. Renders nothing.
 */
import { useEffect } from "react";

export default function AppMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".mv");
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    // Nav: solid frosted bar once the page has scrolled.
    const nav = root.querySelector<HTMLElement>("[data-nav]");
    const onScroll = () => nav?.toggleAttribute("data-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // Reveal on scroll. Modern browsers do this in CSS (animation-timeline);
    // everywhere else, fade sections in as they enter the viewport.
    if (!reduce && !CSS.supports("animation-timeline: view()")) {
      root.classList.add("mv--io");
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
      );
      root.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // Demos only animate while visible: keeps scrolling smooth and saves battery.
    const live = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("is-paused", !e.isIntersecting);
      },
      { rootMargin: "120px 0px" },
    );
    root.querySelectorAll("[data-demo]").forEach((el) => live.observe(el));
    cleanups.push(() => live.disconnect());

    // Count numbers up the first time they appear.
    if (!reduce) {
      const counters = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            counters.unobserve(e.target);
            const el = e.target as HTMLElement;
            const target = Number(el.dataset.count);
            if (!target) continue;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / 1400);
              el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
              if (p < 1) requestAnimationFrame(tick);
            };
            el.textContent = "0";
            requestAnimationFrame(tick);
          }
        },
        { threshold: 0.6 },
      );
      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => counters.observe(el));
      cleanups.push(() => counters.disconnect());
    }

    // Tabs (pop-up showcase): click, arrow keys, Home/End.
    root.querySelectorAll<HTMLElement>("[data-tabs]").forEach((box) => {
      const tabs = Array.from(box.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
      const select = (tab: HTMLButtonElement, focus = false) => {
        for (const t of tabs) {
          const on = t === tab;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          const panel = document.getElementById(t.getAttribute("aria-controls") ?? "");
          if (panel) panel.hidden = !on;
        }
        if (focus) tab.focus();
        tab.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
      };
      const onClick = (e: Event) => {
        const tab = (e.target as HTMLElement).closest<HTMLButtonElement>('[role="tab"]');
        if (tab) select(tab);
      };
      const onKey = (e: KeyboardEvent) => {
        const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
        if (i < 0) return;
        const next =
          e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length]
          : e.key === "ArrowLeft" ? tabs[(i - 1 + tabs.length) % tabs.length]
          : e.key === "Home" ? tabs[0]
          : e.key === "End" ? tabs[tabs.length - 1]
          : null;
        if (!next) return;
        e.preventDefault();
        select(next, true);
      };
      box.addEventListener("click", onClick);
      box.addEventListener("keydown", onKey);
      cleanups.push(() => {
        box.removeEventListener("click", onClick);
        box.removeEventListener("keydown", onKey);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
