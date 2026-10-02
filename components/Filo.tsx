"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReduced } from "@/lib/gsap";

/**
 * Il filo che attraversa il sito: un'unica linea rossa sottile, fissa allo schermo,
 * che si "tira" seguendo l'avanzamento della pagina.
 */
export default function Filo() {
  const path = useRef<SVGPathElement>(null);

  useGSAP(() => {
    if (prefersReduced()) {
      gsap.set(path.current, { drawSVG: "0% 100%" });
      return;
    }
    gsap.set(path.current, { drawSVG: "0% 0%" });
    const tween = gsap.to(path.current, { drawSVG: "0% 100%", ease: "none", paused: true });
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => tween.progress(s.progress),
      onRefresh: (s) => tween.progress(s.progress),
    });
  });

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[45] h-svh w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        ref={path}
        d="M-2 6 C 20 2, 30 14, 18 26 S 4 48, 30 52 S 92 40, 96 62 S 70 90, 50 88 S 8 96, 4 104"
        fill="none"
        stroke="var(--filo)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        className="opacity-25 md:opacity-40"
      />
    </svg>
  );
}
