"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { introDone } from "./Intro";

/** Cap. 1 — La giacca che respira davanti al titolo gigante. */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add({ motion: "(prefers-reduced-motion: no-preference)", fine: MQ.fine }, (ctx) => {
        const { motion, fine } = ctx.conditions as { motion: boolean; fine: boolean };
        if (!motion) return;

        const split = SplitText.create(q("[data-title] > span"), { type: "lines,chars", mask: "lines", linesClass: "split-line", aria: "none" });
        gsap.set(split.chars, { yPercent: 110 });
        // la giacca resta sempre dipinta (è l'elemento LCP): entra solo con transform
        gsap.set(q("[data-jacket]"), { y: 40, scale: 0.96 });
        gsap.set(q("[data-meta]"), { autoAlpha: 0 });
        gsap.set(q("[data-stitch]"), { drawSVG: "0% 0%" });

        const enter = () => {
          const tl = gsap.timeline({ defaults: { ease: "ago" } });
          tl.to(split.chars, { yPercent: 0, duration: 1.1, stagger: { each: 0.025, from: "start" } })
            .to(q("[data-jacket]"), { y: 0, scale: 1, duration: 1.4 }, 0.15)
            .to(q("[data-meta]"), { autoAlpha: 1, duration: 0.6, stagger: 0.08 }, 0.6)
            .to(q("[data-stitch]"), { drawSVG: "0% 100%", duration: 1.2, ease: "power1.inOut" }, 0.9);
          // la giacca respira
          gsap.to(q("[data-breath]"), { scale: 1.022, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
          // la freccia si cuce in loop
          gsap.to(q("[data-stitch-arrow]"), { strokeDashoffset: -16, duration: 1.2, ease: "none", repeat: -1 });
        };
        if (introDone()) enter();
        else window.addEventListener("ordito:intro-done", enter, { once: true });

        // uscita: il titolo scende più lento della giacca
        gsap.to(q("[data-title]"), {
          yPercent: 18,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(q("[data-scroll-cue]"), {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "20% top", scrub: true },
        });

        // inclinazione prospettica al cursore (solo desktop)
        let onMove: ((e: PointerEvent) => void) | undefined;
        if (fine) {
          const rx = gsap.quickTo(q("[data-tilt]"), "rotationX", { duration: 0.9, ease: "power3" });
          const ry = gsap.quickTo(q("[data-tilt]"), "rotationY", { duration: 0.9, ease: "power3" });
          onMove = (e: PointerEvent) => {
            const x = e.clientX / innerWidth - 0.5;
            const y = e.clientY / innerHeight - 0.5;
            ry(x * 16);
            rx(-y * 10);
          };
          root.current!.addEventListener("pointermove", onMove);
        }

        return () => {
          window.removeEventListener("ordito:intro-done", enter);
          if (onMove) root.current?.removeEventListener("pointermove", onMove);
          split.revert();
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="hero-title" className="crocini relative grid h-svh min-h-[560px] place-items-center overflow-hidden">
      <h1
        id="hero-title"
        aria-label="Ogni capo inizia da un filo"
        data-title
        className="pointer-events-none absolute inset-x-0 top-[17%] z-0 select-none text-center font-display uppercase leading-[0.86] tracking-[-0.01em] text-grafite md:top-[12%]"
      >
        <span className="block text-[19vw]">Ogni capo</span>
        <span className="block text-[11.6vw] md:mt-[1vw]">inizia da un filo</span>
      </h1>

      <div className="relative z-10 [perspective:1100px]" data-tilt-wrap>
        <div data-tilt className="[transform-style:preserve-3d]">
          <div data-jacket>
            <div data-breath className="will-change-transform">
              <Image
                src="/media/jacket-cut.webp"
                alt="Giacca tecnica ORDITO in nylon ripstop nero, imbottita, con cappuccio e zip, vista frontale"
                width={1200}
                height={1607}
                priority
                sizes="(max-width: 768px) 76vw, 40vh"
                className="mt-[10svh] h-[62svh] w-auto max-w-[86vw] object-contain drop-shadow-[0_30px_40px_rgba(20,20,20,0.18)] md:mt-[8svh] md:h-[74svh]"
              />
            </div>
          </div>
        </div>
      </div>

      <p data-meta className="tag absolute left-4 top-[calc(50%-1rem)] z-10 hidden max-w-[12rem] text-gesso-ink md:left-10 md:block">
        ORD-JKT-01
        <br />
        320 g/m² / Nylon ripstop
      </p>
      <p data-meta className="tag absolute right-12 top-[calc(50%-1rem)] z-10 hidden text-right text-gesso-ink md:block">
        7 componenti
        <br />
        214 cuciture
      </p>

      <div data-scroll-cue className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-8">
        <span data-meta className="tag text-grafite">
          Scorri per aprirla
        </span>
        <svg aria-hidden="true" width="24" height="56" viewBox="0 0 24 56" fill="none">
          <path data-stitch d="M12 2 V48" stroke="var(--grafite)" strokeOpacity="0.25" strokeWidth="1" />
          <path
            data-stitch-arrow
            d="M12 2 V48"
            stroke="var(--filo)"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
          <path data-stitch d="M5 41 L12 50 L19 41" stroke="var(--filo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
