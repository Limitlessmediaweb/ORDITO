"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Scheda tecnica: le righe si tracciano come linee di quota, i valori si "decodificano". */
export default function SchedaTecnica({ righe, codice }: { righe: [string, string][]; codice: string }) {
  const root = useRef<HTMLDListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-rule]"), { scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(q("[data-k], [data-v]"), { autoAlpha: 0 });
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 80%", once: true } });
        q("[data-row]").forEach((row, i) => {
          const v = row.querySelector<HTMLElement>("[data-v]")!;
          tl.to(row.querySelector("[data-rule]"), { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, i * 0.08)
            .to(row.querySelector("[data-k]"), { autoAlpha: 1, duration: 0.3 }, i * 0.08 + 0.2)
            .to(v, { autoAlpha: 1, duration: 0.01 }, i * 0.08 + 0.25)
            .to(
              v,
              { scrambleText: { text: v.dataset.text!, chars: "0123456789×/·-ABCDEFGHIJKLMNOPQRSTUVWXYZ", speed: 0.6 }, duration: 0.7 },
              i * 0.08 + 0.25,
            );
        });
      });
    },
    { scope: root },
  );

  return (
    <dl ref={root} aria-label={`Scheda tecnica ${codice}`} className="w-full">
      {righe.map(([k, v]) => (
        <div key={k} data-row className="relative grid grid-cols-[8rem_1fr] gap-4 py-3 md:grid-cols-[11rem_1fr]">
          <span data-rule aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-grafite/30" />
          <dt data-k className="tag text-gesso-ink">
            {k}
          </dt>
          <dd data-v data-text={v} className="font-mono text-sm">
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
