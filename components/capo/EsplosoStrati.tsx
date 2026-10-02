"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

/**
 * Esploso corto 2.5D per i capi senza sequenza video: gli strati (fronte, tessuto, retro)
 * si separano in profondità con la prospettiva mentre si scorre.
 */
export default function EsplosoStrati({ strati, nome }: { strati: { label: string; img: string }[]; nome: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const { desktop, mobile } = ctx.conditions as { desktop: boolean; mobile: boolean };
        if (!desktop && !mobile) return;
        const layers = q("[data-strato]");
        const n = layers.length;
        gsap.set(q("[data-strato-label]"), { autoAlpha: 0, x: -10 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=180%", pin: q("[data-stage]")[0], scrub: 0.6 },
        });
        tl.fromTo(q("[data-scene]"), { rotationY: 0, rotationX: 0 }, { rotationY: desktop ? -32 : -24, rotationX: 12, duration: 1 }, 0);
        layers.forEach((l, i) => {
          const depth = (i - (n - 1) / 2) * (desktop ? 220 : 140);
          tl.fromTo(l, { z: 0, x: 0 }, { z: -depth, x: (desktop ? 70 : 30) * i, duration: 1 }, 0);
        });
        tl.to(q("[data-strato-label]"), { autoAlpha: 1, x: 0, stagger: 0.1, duration: 0.3 }, 0.5);
        tl.to({}, { duration: 0.3 });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label={`Esploso di ${nome}`} className="relative">
      <div data-stage className="flex h-svh items-center justify-center overflow-hidden [perspective:1400px] motion-reduce:h-auto motion-reduce:py-20">
        <div data-scene className="relative aspect-[3/4] h-[58svh] [transform-style:preserve-3d] motion-reduce:h-auto motion-reduce:w-64">
          {strati.map((s, i) => (
            <figure key={s.label} data-strato className="absolute inset-0 shadow-[0_30px_60px_rgb(20_20_20/0.18)]" style={{ zIndex: strati.length - i }}>
              <Image src={s.img} alt={`${nome}: ${s.label.toLowerCase()}`} fill sizes="40vh" className="object-cover" />
              <figcaption data-strato-label className="tag absolute -top-7 left-0 whitespace-nowrap">
                <span className="text-filo">0{i + 1}</span> {s.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
