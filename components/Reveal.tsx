"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Reveal a maschera (clip-path dal basso) con leggero zoom-out del contenuto. */
export default function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const inner = root.current!.firstElementChild;
        gsap.fromTo(root.current, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "sarta", scrollTrigger: { trigger: root.current, start: "top 85%", once: true } });
        gsap.fromTo(inner, { scale: 1.2 }, { scale: 1, duration: 1.4, ease: "ago", scrollTrigger: { trigger: root.current, start: "top 85%", once: true } });
      });
    },
    { scope: root },
  );
  return (
    <div ref={root} className={`overflow-hidden ${className ?? ""}`}>
      {children}
    </div>
  );
}
