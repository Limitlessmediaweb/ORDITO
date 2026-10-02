"use client";

import { useRef, useState } from "react";
import Logo from "@/components/Logo";
import { gsap, Flip, useGSAP, prefersReduced } from "@/lib/gsap";
import { useLenis } from "@/components/SmoothScroll";
import { holdInit, releaseInit, releaseAfterQuiet } from "@/lib/deferInit";

const KEY = "ordito:intro";
const WARP = 15; // fili d'ordito
const WEFT = 9; // passate di trama
const wx = (i: number) => 50 + (i - (WARP - 1) / 2) * 2.4;
const wy = (j: number) => 34 + j * 4;

export const introDone = () => typeof window !== "undefined" && Boolean((window as unknown as { __orditoIntro?: boolean }).__orditoIntro);

function finish() {
  if (introDone()) return;
  (window as unknown as { __orditoIntro?: boolean }).__orditoIntro = true;
  window.dispatchEvent(new Event("ordito:intro-done"));
}

/** Cap. 0 — Il filo entra, diventa ordito, si tesse, si stringe nel wordmark e apre il sipario. */
export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [gone, setGone] = useState(false);
  const lenis = useLenis();

  useGSAP(
    () => {
      const el = root.current;
      // già concluso (componente smontato): niente da fare se il contesto si riattiva
      if (!el) return;
      const headerLogo = document.querySelector<SVGSVGElement>("[data-header-logo]");
      let seen = false;
      try {
        seen = sessionStorage.getItem(KEY) === "1";
      } catch {}

      let held = false;
      const done = () => {
        if (held) {
          held = false;
          // le sezioni sotto la piega si preparano mentre si guarda l'hero
          releaseAfterQuiet();
        }
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {}
        gsap.set(headerLogo, { autoAlpha: 1 });
        lenis?.start();
        setGone(true);
        finish();
      };

      if (seen) {
        gsap.set(el, { display: "none" });
        done();
        return;
      }

      lenis?.stop();
      holdInit();
      held = true;
      // se il contesto viene rifatto (es. arriva Lenis) prima della fine, la coda non deve restare bloccata
      const release = () => {
        if (held) {
          held = false;
          releaseInit();
        }
      };
      gsap.set(headerLogo, { autoAlpha: 0 });
      const q = gsap.utils.selector(el);
      const logo = q("[data-intro-logo]")[0] as unknown as SVGSVGElement;

      if (prefersReduced()) {
        tlRef.current = gsap
          .timeline({ onComplete: done })
          .from(logo, { autoAlpha: 0, duration: 0.6 })
          .to(el, { autoAlpha: 0, duration: 0.6 }, "+=0.5");
        return release;
      }

      const tl = gsap.timeline({ onComplete: done, defaults: { ease: "sarta" } }).timeScale(1.2);
      tlRef.current = tl;
      gsap.set(q("[data-draw]"), { drawSVG: "0% 0%" });
      gsap.set(q("[data-warp]"), { drawSVG: "50% 50%" });
      gsap.set(q("[data-over]"), { opacity: 0 });
      gsap.set(logo, { autoAlpha: 1 });
      gsap.set(q("[data-intro-logo] [data-letter]"), { yPercent: 40, opacity: 0 });
      gsap.set(q("[data-intro-logo] [data-coil], [data-intro-logo] [data-tail]"), { drawSVG: "0% 0%" });

      // 1. il filo entra da sinistra
      tl.to(q("[data-lead]"), { drawSVG: "0% 100%", duration: 0.9, ease: "power2.inOut" })
        // 2. si moltiplica nell'ordito
        .to(q("[data-warp]"), { drawSVG: "0% 100%", duration: 0.55, stagger: { each: 0.035, from: "center" } }, "-=0.15")
        .to(q("[data-lead]"), { drawSVG: "100% 100%", duration: 0.5, ease: "power2.in" }, "<")
        // 3. la trama passa sopra e sotto
        .addLabel("trama", "-=0.2");
      q("[data-weft]").forEach((row, j) => {
        tl.to(row, { drawSVG: "0% 100%", duration: 0.32, ease: "power1.inOut" }, `trama+=${j * 0.07}`).to(
          q(`[data-over='${j}']`),
          { opacity: 1, duration: 0.01, stagger: 0.012 },
          `trama+=${j * 0.07 + 0.08}`,
        );
      });
      // 4. la trama si stringe e diventa il wordmark
      tl.to(
        q("[data-weave]"),
        { scaleX: 0.12, scaleY: 0.5, opacity: 0, duration: 0.6, transformOrigin: "50% 50%", ease: "power3.in" },
        "+=0.1",
      )
        .to(q("[data-intro-logo] [data-coil]"), { drawSVG: "0% 100%", duration: 0.7, ease: "power2.out" }, "-=0.25")
        .to(q("[data-intro-logo] [data-tail]"), { drawSVG: "0% 100%", duration: 0.3 }, "-=0.2")
        .to(q("[data-intro-logo] [data-letter]"), { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "ago" }, "<-0.4")
        .addLabel("vola", "+=0.15");

      // 5. il wordmark vola nell'header (Flip) e il sipario si apre
      if (headerLogo) {
        tl.add(Flip.fit(logo, headerLogo, { duration: 0.85, ease: "sarta", scale: true }) as gsap.core.Tween, "vola");
      }
      tl.call(finish, [], "vola+=0.35")
        .to(q("[data-seam]"), { scaleY: 1, duration: 0.35, ease: "power2.out" }, "vola+=0.1")
        .to(q("[data-left]"), { xPercent: -101, duration: 0.95 }, "vola+=0.4")
        .to(q("[data-right]"), { xPercent: 101, duration: 0.95 }, "<")
        .to(q("[data-skip]"), { autoAlpha: 0, duration: 0.3 }, "vola")
        .set(headerLogo, { autoAlpha: 1 })
        .set(logo, { autoAlpha: 0 });
      return release;
    },
    { scope: root, dependencies: [lenis] },
  );

  if (gone) return null;

  return (
    <div ref={root} id="intro" className="fixed inset-0 z-[70] overflow-hidden">
      <noscript>
        <style>{`#intro{display:none}`}</style>
      </noscript>
      {/* pannelli al 99,5%: non del tutto opachi, così il browser dipinge subito l'hero sotto (LCP) */}
      <div data-left className="absolute inset-y-0 left-0 w-1/2 bg-cemento/[0.995]">
        <span data-seam className="absolute inset-y-0 right-0 w-px origin-top scale-y-0 bg-filo" />
      </div>
      <div data-right className="absolute inset-y-0 right-0 w-1/2 bg-cemento/[0.995]">
        <span data-seam className="absolute inset-y-0 left-0 w-px origin-bottom scale-y-0 bg-filo" />
      </div>

      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g fill="none" stroke="var(--filo)" strokeLinecap="round" vectorEffect="non-scaling-stroke">
          <path data-draw data-lead d="M-4 58 C 8 40, 16 66, 26 52 S 40 44, 50 50" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <g data-weave>
            {Array.from({ length: WARP }, (_, i) => (
              <line key={i} data-warp x1={wx(i)} x2={wx(i)} y1="30" y2="70" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            ))}
            {Array.from({ length: WEFT }, (_, j) => (
              <line
                key={j}
                data-draw
                data-weft
                x1={j % 2 ? 68 : 32}
                x2={j % 2 ? 32 : 68}
                y1={wy(j)}
                y2={wy(j)}
                stroke="var(--grafite)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {Array.from({ length: WEFT }, (_, j) =>
              Array.from({ length: WARP }, (_, i) =>
                (i + j) % 2 === 0 ? (
                  <g key={`${i}-${j}`} data-over={j}>
                    <line
                      x1={wx(i)}
                      x2={wx(i)}
                      y1={wy(j) - 1.3}
                      y2={wy(j) + 1.3}
                      stroke="var(--cemento)"
                      strokeWidth="5"
                      vectorEffect="non-scaling-stroke"
                    />
                    <line x1={wx(i)} x2={wx(i)} y1={wy(j) - 1.6} y2={wy(j) + 1.6} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  </g>
                ) : null,
              ),
            )}
          </g>
        </g>
      </svg>

      <div className="absolute inset-0 grid place-items-center px-6">
        <Logo data-intro-logo className="invisible w-[min(78vw,820px)] text-grafite" title="ORDITO" />
      </div>

      <button
        data-skip
        type="button"
        onClick={() => tlRef.current?.progress(1)}
        className="tag absolute bottom-5 right-[calc(var(--metro)+1rem)] z-10 border-b border-current py-1 text-grafite md:bottom-8"
      >
        Salta
      </button>
    </div>
  );
}
