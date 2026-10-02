"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReduced } from "@/lib/gsap";

/** 404: un filo teso che si spezza al centro e oscilla appeso ai due capi. */
export default function FiloSpezzato() {
  const root = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (prefersReduced()) {
        gsap.set(q("[data-l]"), { rotation: 78, svgOrigin: "80 120" });
        gsap.set(q("[data-r]"), { rotation: -78, svgOrigin: "920 120" });
        return;
      }
      gsap.set(q("[data-snap]"), { autoAlpha: 0, scale: 0.4, svgOrigin: "500 120" });
      const tl = gsap.timeline({ delay: 0.4 });
      // tensione: il filo vibra
      tl.to(q("[data-l], [data-r]"), { y: -2, duration: 0.05, repeat: 9, yoyo: true, ease: "none" })
        .set(q("[data-whole]"), { autoAlpha: 0 })
        .set(q("[data-l], [data-r]"), { autoAlpha: 1, y: 0 })
        .to(q("[data-snap]"), { autoAlpha: 1, scale: 1, duration: 0.12 }, "<")
        .to(q("[data-snap]"), { autoAlpha: 0, scale: 1.6, duration: 0.4 })
        // i due capi cadono e oscillano
        .to(q("[data-l]"), { rotation: 78, svgOrigin: "80 120", duration: 2.2, ease: "elastic.out(1.1, 0.28)" }, "<-0.35")
        .to(q("[data-r]"), { rotation: -78, svgOrigin: "920 120", duration: 2.4, ease: "elastic.out(1.1, 0.3)" }, "<0.05")
        .add(() => {
          gsap.to(q("[data-l]"), { rotation: 74, svgOrigin: "80 120", duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
          gsap.to(q("[data-r]"), { rotation: -82, svgOrigin: "920 120", duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
        });
    },
    { scope: root },
  );
  return (
    <svg ref={root} viewBox="0 0 1000 560" className="w-full max-w-4xl" aria-hidden="true">
      <g fill="var(--grafite)">
        <rect x="64" y="104" width="32" height="32" rx="4" />
        <rect x="904" y="104" width="32" height="32" rx="4" />
      </g>
      <g fill="none" stroke="var(--filo)" strokeWidth="4" strokeLinecap="round">
        <path data-whole d="M80 120 L920 120" />
        <g data-l style={{ visibility: "hidden" }}>
          <path d="M80 120 L494 120" />
          <path d="M494 120 l10 -6 M494 120 l12 3 M494 120 l9 8" strokeWidth="1.6" />
        </g>
        <g data-r style={{ visibility: "hidden" }}>
          <path d="M920 120 L506 120" />
          <path d="M506 120 l-10 -7 M506 120 l-12 2 M506 120 l-8 9" strokeWidth="1.6" />
        </g>
      </g>
      <g data-snap fill="none" stroke="var(--grafite)" strokeWidth="2" strokeLinecap="round">
        <path d="M500 92 V74 M520 100 l14 -12 M480 100 l-14 -12 M528 120 h18 M472 120 h-18 M520 140 l14 12 M480 140 l-14 12" />
      </g>
    </svg>
  );
}
