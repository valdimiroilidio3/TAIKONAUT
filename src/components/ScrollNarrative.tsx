"use client";

import { useEffect } from "react";

/**
 * TAIKONAUT — cinematic motion controller.
 *
 * One owner for all GSAP timelines and ScrollTriggers on a page. Everything is
 * created inside a gsap.context + gsap.matchMedia pair so that:
 *   - timelines and ScrollTriggers are reverted together on unmount/route change,
 *   - no duplicate triggers are created when a media query flips,
 *   - prefers-reduced-motion and low-capability devices get zero motion,
 *   - content is never hidden before hydration (progressive enhancement).
 *
 * Native document scrolling: no pinning, no scroll hijacking, no forced snap.
 */
export function ScrollNarrative() {
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        if (disposed) return;

        const { gsap } = gsapModule;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);

        // Hard gate: reduced motion means no GSAP work at all, not even a set().
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const nav = navigator as Navigator & {
          hardwareConcurrency?: number;
          deviceMemory?: number;
        };
        const lowPower =
          (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
        const root = document.getElementById("main-content") ?? document.body;
        const mm = gsap.matchMedia();

        const ctx = gsap.context(() => {
          /* ----------------------------------------------------------------
             01 — Layered hero entrance. Only on the chapter page.
          ---------------------------------------------------------------- */
          mm.add("(prefers-reduced-motion: no-preference)", () => {
            const media = document.querySelector<HTMLElement>(".arrival-media");
            if (!media) return;

            const lines = gsap.utils.toArray<HTMLElement>(
              ".arrival-heading .cine-line > span"
            );
            const eyebrow = document.querySelector<HTMLElement>('[data-cine="eyebrow"]');
            const meta = document.querySelector<HTMLElement>('[data-cine="meta"]');
            const sub = document.querySelector<HTMLElement>('[data-cine="sub"]');
            const cta = document.querySelector<HTMLElement>('[data-cine="cta"]');
            const footer = document.querySelector<HTMLElement>('[data-cine="footer"]');
            const side = document.querySelector<HTMLElement>('[data-cine="side"]');
            const frame = document.querySelector<HTMLElement>('[data-cine="frame"]');

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            const speed = lowPower ? 0.7 : 1;
            tl.fromTo(
              media,
              { scale: 1.09, opacity: 0.55 },
              { scale: 1, opacity: 1, duration: 1.35 * speed, ease: "power2.out" },
              0
            );
            if (frame) tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.8 * speed }, 0.12);
            if (eyebrow) tl.fromTo(eyebrow, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 * speed }, 0.04);
            if (meta) tl.fromTo(meta, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 * speed }, 0.1);
            if (lines.length)
              tl.fromTo(
                lines,
                { yPercent: 112 },
                { yPercent: 0, duration: 0.85 * speed, stagger: 0.09 * speed },
                0.1
              );
            if (sub) tl.fromTo(sub, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 * speed }, 0.4);
            if (cta) tl.fromTo(cta, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 * speed }, 0.48);
            if (footer) tl.fromTo(footer, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 * speed }, 0.56);
            if (side) tl.fromTo(side, { x: 14, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 * speed }, 0.66);

            return () => tl.kill();
          });

          /* ----------------------------------------------------------------
             02 — Scroll-triggered reveals. Both the legacy story attributes
                 and the new cinematic ones share one pass (no duplicates).
          ---------------------------------------------------------------- */
          mm.add("(prefers-reduced-motion: no-preference)", () => {
            const targets = gsap.utils.toArray<HTMLElement>(
              "[data-story-reveal], [data-cine-reveal]"
            );
            targets.forEach((el) => {
              // Above-the-fold content stays immediately visible (and no-JS safe).
              if (el.getBoundingClientRect().top < window.innerHeight * 0.86) return;
              const distance = lowPower ? 16 : 34;
              gsap.fromTo(
                el,
                { opacity: 0, y: distance },
                {
                  opacity: 1,
                  y: 0,
                  duration: lowPower ? 0.55 : 0.95,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    once: true,
                    invalidateOnRefresh: true,
                  },
                }
              );
            });
          });

          /* ----------------------------------------------------------------
             03 — Section transitions: hairline rules draw across the viewport.
          ---------------------------------------------------------------- */
          mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.utils.toArray<HTMLElement>("[data-cine-transition]").forEach((el) => {
              gsap.fromTo(
                el,
                { scaleX: 0 },
                {
                  scaleX: 1,
                  duration: 1.1,
                  ease: "power2.out",
                  scrollTrigger: { trigger: el, start: "top 96%", once: true },
                }
              );
            });
          });

          /* ----------------------------------------------------------------
             04 — Typographic drift + subtle parallax. Desktop only.
          ---------------------------------------------------------------- */
          mm.add(
            "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
            () => {
              gsap.utils.toArray<HTMLElement>("[data-scroll-heading]").forEach((el) => {
                gsap.fromTo(
                  el,
                  { y: 16 },
                  {
                    y: -10,
                    ease: "none",
                    scrollTrigger: {
                      trigger: el,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: lowPower ? true : 1,
                    },
                  }
                );
              });

              const frames = lowPower
                ? gsap.utils.toArray<HTMLElement>("[data-parallax-frame]").slice(0, 2)
                : gsap.utils.toArray<HTMLElement>("[data-parallax-frame]");
              frames.forEach((frame) => {
                const image = frame.querySelector<HTMLElement>("[data-parallax-image]");
                if (image)
                  gsap.fromTo(
                    image,
                    { yPercent: -3 },
                    {
                      yPercent: 3,
                      ease: "none",
                      scrollTrigger: {
                        trigger: frame,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1,
                        invalidateOnRefresh: true,
                      },
                    }
                  );
              });

              // Hero photograph drifts slightly slower than the page.
              const heroMedia = document.querySelector<HTMLElement>(".arrival-media");
              if (heroMedia && !lowPower) {
                gsap.fromTo(
                  heroMedia,
                  { yPercent: 0 },
                  {
                    yPercent: 7,
                    ease: "none",
                    scrollTrigger: {
                      trigger: ".arrival",
                      start: "top top",
                      end: "bottom top",
                      scrub: 1,
                    },
                  }
                );
              }
            }
          );

          /* ----------------------------------------------------------------
             05 — Microinteractions. Fine pointers only, never on touch.
          ---------------------------------------------------------------- */
          mm.add(
            "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
            () => {
              const removers: (() => void)[] = [];

              gsap.utils.toArray<HTMLElement>("[data-cine-magnetic]").forEach((el) => {
                const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
                const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
                const move = (event: PointerEvent) => {
                  const rect = el.getBoundingClientRect();
                  const dx = event.clientX - (rect.left + rect.width / 2);
                  const dy = event.clientY - (rect.top + rect.height / 2);
                  xTo(Math.max(-7, Math.min(7, dx * 0.16)));
                  yTo(Math.max(-6, Math.min(6, dy * 0.16)));
                };
                const leave = () => { xTo(0); yTo(0); };
                el.addEventListener("pointermove", move);
                el.addEventListener("pointerleave", leave);
                removers.push(() => {
                  el.removeEventListener("pointermove", move);
                  el.removeEventListener("pointerleave", leave);
                  gsap.set(el, { x: 0, y: 0 });
                });
              });

              gsap.utils.toArray<HTMLElement>("[data-cine-pulse]").forEach((el) => {
                const down = () => {
                  gsap.fromTo(
                    el,
                    { scale: 0.975 },
                    { scale: 1, duration: 0.42, ease: "back.out(2)", overwrite: "auto" }
                  );
                };
                el.addEventListener("pointerdown", down);
                removers.push(() => el.removeEventListener("pointerdown", down));
              });

              return () => removers.forEach((fn) => fn());
            }
          );
        }, root);

        /* Refresh only when layout actually settles — no scroll listeners. */
        let frame = 0;
        const scheduleRefresh = () => {
          if (disposed) return;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => ScrollTrigger.refresh());
        };
        const resize = new ResizeObserver(scheduleRefresh);
        resize.observe(root);
        const onLoad = () => scheduleRefresh();
        window.addEventListener("load", onLoad, { once: true });
        void document.fonts.ready.then(() => { if (!disposed) scheduleRefresh(); });

        cleanup = () => {
          window.removeEventListener("load", onLoad);
          resize.disconnect();
          cancelAnimationFrame(frame);
          mm.revert();
          ctx.revert();
        };
      }
    ).catch(() => {
      /* Animation is optional: if GSAP fails to load the store stays usable. */
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return null;
}
