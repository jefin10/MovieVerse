"use client";

/*
 * Behaviour for the /app clone, standing in for Webflow's script: mobile menu,
 * tabs, FAQ accordion, the two sliders, scroll fade-ins (fallback), fitting app
 * screens into the template's photo slots, and pausing off-screen demos.
 */
import { useEffect } from "react";

export default function OvoMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".ovo");
    if (!root) return;
    const off: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | Window, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
      el.addEventListener(type, fn as EventListener);
      off.push(() => el.removeEventListener(type, fn as EventListener));
    };

    // Mobile menu.
    const nav = root.querySelector<HTMLElement>("[data-ovo-nav]");
    const menu = root.querySelector<HTMLElement>("[data-ovo-menu]");
    if (nav && menu) on(menu, "click", () => nav.classList.toggle("is-open"));

    // Fit app screens into their slots: zoom to the slot width, fill its height.
    const fit = (el: HTMLElement) => {
      const z = el.clientWidth / 300;
      if (!z) return;
      el.style.setProperty("--fz", String(z));
      el.style.setProperty("--sh", `${el.clientHeight / z}px`);
    };
    const ro = new ResizeObserver((entries) => entries.forEach((e) => fit(e.target as HTMLElement)));
    root.querySelectorAll<HTMLElement>("[data-fit]").forEach((el) => {
      fit(el);
      ro.observe(el);
    });
    off.push(() => ro.disconnect());

    // Tabs.
    root.querySelectorAll<HTMLElement>("[data-ovo-tabs]").forEach((box) => {
      const links = Array.from(box.querySelectorAll<HTMLElement>(".w-tab-link"));
      const panes = Array.from(box.querySelectorAll<HTMLElement>(".w-tab-pane"));
      const select = (i: number) => {
        links.forEach((l, j) => {
          l.classList.toggle("w--current", i === j);
          l.setAttribute("aria-selected", String(i === j));
        });
        panes.forEach((p, j) => p.classList.toggle("w--tab-active", i === j));
      };
      links.forEach((l, i) => {
        on(l, "click", () => select(i));
        on(l, "keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            select(i);
          }
        });
      });
    });

    // FAQ accordion.
    root.querySelectorAll<HTMLElement>("[data-ovo-faq]").forEach((item) => {
      const head = item.querySelector<HTMLElement>(".ease-faq-title-holder");
      const body = item.querySelector<HTMLElement>(".ease-faq-answer-holder");
      if (!head || !body) return;
      const toggle = () => {
        const open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        head.setAttribute("aria-expanded", String(open));
        body.style.height = open ? `${body.scrollHeight}px` : "0px";
      };
      on(item, "click", toggle);
      on(head, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });

    // Slider helper: move every slide so slide `i` sits at the start.
    const goTo = (slides: HTMLElement[], i: number) => {
      const x = slides[i].offsetLeft - slides[0].offsetLeft;
      slides.forEach((s) => (s.style.transform = `translateX(${-x}px)`));
    };

    // Poster slider in the bento grid: autoplay every 3s.
    root.querySelectorAll<HTMLElement>("[data-ovo-autoslider]").forEach((slider) => {
      const slides = Array.from(slider.querySelectorAll<HTMLElement>(".w-slide"));
      let i = 0;
      const t = window.setInterval(() => {
        i = (i + 1) % slides.length;
        goTo(slides, i);
      }, 3000);
      off.push(() => window.clearInterval(t));
    });

    // Testimonials: arrow buttons.
    root.querySelectorAll<HTMLElement>("[data-ovo-slider]").forEach((slider) => {
      const slides = Array.from(slider.querySelectorAll<HTMLElement>(".w-slide"));
      let i = 0;
      const prev = slider.querySelector<HTMLElement>("[data-ovo-prev]");
      const next = slider.querySelector<HTMLElement>("[data-ovo-next]");
      if (prev) on(prev, "click", () => goTo(slides, (i = Math.max(0, i - 1))));
      if (next) on(next, "click", () => goTo(slides, (i = Math.min(slides.length - 1, i + 1))));
    });

    // Scroll fade-ins where CSS scroll timelines are missing.
    if (!CSS.supports("animation-timeline: view()")) {
      root.classList.add("ovo--io");
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.15 },
      );
      root.querySelectorAll(".fade-in-on-scroll").forEach((el) => io.observe(el));
      off.push(() => io.disconnect());
    }

    // App demos only animate while on screen.
    const live = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("demo-paused", !e.isIntersecting)),
      { rootMargin: "100px" },
    );
    root.querySelectorAll("[data-demo]").forEach((el) => live.observe(el));
    off.push(() => live.disconnect());

    return () => off.forEach((fn) => fn());
  }, []);

  return null;
}
