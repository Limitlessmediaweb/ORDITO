"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Testo "cucito" riga per riga: una linea rossa tratteggiata scorre sotto e la riga compare. */
export default function Cucito({ righe, className }: { righe: string[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        q("[data-riga]").forEach((r) => {
          const dash = r.querySelector("[data-dash]");
          const txt = r.querySelector("[data-txt]");
          const tl = gsap.timeline({ scrollTrigger: { trigger: r, start: "top 82%", end: "top 50%", scrub: 0.6 } });
          tl.fromTo(dash, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0).fromTo(
            txt,
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 },
            0.05,
          );
        });
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} className={className}>
      {righe.map((r, i) => (
        <p key={i} data-riga className="relative mb-[0.35em] pb-[0.12em]">
          <span data-txt className="block">
            {r}
          </span>
          <span data-dash aria-hidden="true" className="absolute bottom-0 left-0 h-0 w-full origin-left border-t-[3px] border-dashed border-filo" />
        </p>
      ))}
    </div>
  );
}
