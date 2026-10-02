"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

/** Titolo che entra lettera per lettera da una maschera di riga (SplitText). */
export default function SplitTitle({
  as: Tag = "h1",
  children,
  className,
  id,
  delay = 0.2,
}: {
  as?: "h1" | "h2";
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}) {
  const root = useRef<HTMLHeadingElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(root.current, { type: "lines,chars", mask: "lines", linesClass: "split-line" });
        gsap.from(split.chars, { yPercent: 110, duration: 1, stagger: 0.022, ease: "ago", delay });
        return () => split.revert();
      });
    },
    { scope: root },
  );
  if (Tag === "h2")
    return (
      <h2 ref={root} id={id} className={className}>
        {children}
      </h2>
    );
  return (
    <h1 ref={root} id={id} className={className}>
      {children}
    </h1>
  );
}
