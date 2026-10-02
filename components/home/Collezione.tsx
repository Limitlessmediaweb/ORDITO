"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { CAPI } from "@/lib/capi";
import CapoCard from "@/components/CapoCard";

/** Cap. 5 — Collezione: sei capi in scroll orizzontale. */
export default function Collezione() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = q("[data-track]")[0] as HTMLElement;
        const dist = () => track.scrollWidth - innerWidth;
        gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${dist()}`,
            pin: q("[data-stage]")[0],
            scrub: 0.5,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        // il filo di cucitura sotto le card si "tira"
        gsap.fromTo(
          q("[data-seam]"),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true },
          },
        );
      });
      mm.add(MQ.reduced, () => {
        gsap.set(q("[data-track]"), { x: 0 });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="collezione" aria-labelledby="collezione-title" className="relative">
      <div data-stage className="relative flex h-svh flex-col justify-center overflow-hidden motion-reduce:h-auto motion-reduce:py-24">
        <header className="px-4 pt-16 md:absolute md:left-10 md:top-24 md:px-0 md:pt-0">
          <p className="tag text-filo">Cap. 05</p>
          <h2 id="collezione-title" className="mt-2 font-display text-4xl uppercase leading-none md:text-6xl">
            Collezione
          </h2>
          <p className="tag mt-2 text-gesso-ink">6 capi · prezzi dimostrativi</p>
        </header>

        <ul
          data-track
          className="mt-6 flex w-max items-end gap-6 px-4 will-change-transform motion-reduce:w-full motion-reduce:flex-wrap md:mt-0 md:gap-12 md:pl-[34vw] md:pr-[12vw]"
        >
          {CAPI.map((c, i) => (
            <li key={c.slug} className="w-[74vw] shrink-0 md:w-[min(28vw,48svh)]">
              <CapoCard capo={c} eager={i < 2} />
            </li>
          ))}
        </ul>
        <span data-seam aria-hidden="true" className="absolute bottom-8 left-0 h-px w-full origin-left border-t border-dashed border-filo md:bottom-10" />
      </div>
    </section>
  );
}
