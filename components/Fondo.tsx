"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { setTone, resetTone } from "@/lib/tone";

/**
 * Fondo globale: le sezioni sono trasparenti, il passaggio cemento → grafite
 * è un velo fisso la cui opacità segue lo scroll (solo opacity, niente repaint di layout).
 * Imposta anche html[data-tone] per header, badge e cursore.
 */
export default function Fondo() {
  const velo = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const zones = gsap.utils.toArray<HTMLElement>("[data-tone='dark']");
      gsap.set(velo.current, { opacity: 0 });
      resetTone();

      zones.forEach((el, i) => {
        // data-velo="off": la zona ha già un fondo pieno, cambia solo il tono di header e cursore
        if (el.dataset.velo !== "off")
          gsap
          .timeline({
            scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 15%", scrub: true },
          })
          .fromTo(velo.current, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "none", immediateRender: false })
          .to(velo.current, { opacity: 1, duration: 0.64, ease: "none" })
          .to(velo.current, { opacity: 0, duration: 0.18, ease: "none" });
        ScrollTrigger.create({
          trigger: el,
          start: "top 6%",
          end: "bottom 6%",
          onToggle: (s) => setTone(`zona-${i}`, s.isActive),
        });
      });
      return () => resetTone();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return <div ref={velo} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-grafite opacity-0" />;
}
