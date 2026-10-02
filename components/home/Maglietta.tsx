"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

// Geometria della t-shirt assemblata (viewBox 1000×1000)
const FRONT = "M430 290 Q500 345 570 290 L660 312 Q652 372 665 430 L665 760 L335 760 L335 430 Q348 372 340 312 Z";
const BACK = "M430 290 Q500 306 570 290 L660 312 Q652 372 665 430 L665 760 L335 760 L335 430 Q348 372 340 312 Z";
const SLEEVE_R = "M660 312 L772 352 Q779 361 775 371 L742 468 L665 430 Q652 372 660 312 Z";
const SLEEVE_L = "M340 312 L228 352 Q221 361 225 371 L258 468 L335 430 Q348 372 340 312 Z";
const COLLAR_RING = "M430 290 Q500 345 570 290 Q500 302 430 290";
const COLLAR_STRIP = "M560 820 Q670 820 780 820 Q670 820 560 820";
const COLLAR_BOX = "M556 812 L784 812 L784 828 L556 828 Z";

/** Posizione di ogni pezzo sul tessuto (piazzamento del cartamodello). */
const LAYOUT: Record<string, { x: number; y: number; rotation: number }> = {
  back: { x: 125, y: -90, rotation: 0 },
  front: { x: -235, y: -90, rotation: 0 },
  sleeveR: { x: -529, y: 405, rotation: 90 },
  sleeveL: { x: 98, y: 405, rotation: -90 },
};

const PIECES = [
  { id: "back", d: BACK, label: "Dietro", mobile: false },
  { id: "sleeveR", d: SLEEVE_R, label: "Manica dx", mobile: true },
  { id: "sleeveL", d: SLEEVE_L, label: "Manica sx", mobile: true },
  { id: "front", d: FRONT, label: "Davanti", mobile: true },
];

const SEAMS = [
  { d: "M343 320 L432 298", mobile: true },
  { d: "M568 298 L657 320", mobile: true },
  { d: "M653 318 Q645 372 658 426", mobile: true },
  { d: "M347 318 Q355 372 342 426", mobile: true },
  { d: "M658 436 L658 752", mobile: false },
  { d: "M342 436 L342 752", mobile: false },
  { d: "M342 744 L658 744", mobile: false },
  { d: "M767 368 L735 462", mobile: false },
  { d: "M233 368 L265 462", mobile: false },
];

const STEPS = ["Srotolare", "Tagliare", "Cucire", "Chiudere", "Stampare"];

/** Cap. 3 — Nasce una maglietta: tutto in SVG, legato allo scroll. */
export default function Maglietta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile, reduced: MQ.reduced }, (ctx) => {
        const { mobile, reduced } = ctx.conditions as { desktop: boolean; mobile: boolean; reduced: boolean };
        const pieces = PIECES.filter((p) => !mobile || p.mobile);
        const seams = q("[data-seam-reveal]").filter((_, i) => !mobile || SEAMS[i].mobile);

        // ---------- stato iniziale ----------
        pieces.forEach((p) => gsap.set(q(`[data-piece='${p.id}']`), { ...LAYOUT[p.id], transformOrigin: "50% 50%" }));
        gsap.set(q("[data-cut]"), { drawSVG: "0% 0%", opacity: 1 });
        gsap.set(q("[data-laser], [data-collar-laser], [data-needle-dot]"), { autoAlpha: 0 });
        gsap.set(q("[data-fill]"), { opacity: 0 });
        gsap.set(q("[data-shadow]"), { opacity: 0 });
        gsap.set(q("[data-fabric-clip]"), { scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(q("[data-roll]"), { x: 0 });
        gsap.set(q("[data-collar]"), { morphSVG: COLLAR_STRIP, opacity: 0 });
        gsap.set(q("[data-collar-cut]"), { drawSVG: "0% 0%" });
        gsap.set(q("[data-seam-reveal]"), { drawSVG: "0% 0%" });
        gsap.set(q("[data-volume]"), { opacity: 0 });
        gsap.set(q("[data-print-clip]"), { scaleY: 0, transformOrigin: "50% 0%" });
        gsap.set(q("[data-print-layer]"), { x: 7 });
        gsap.set(q("[data-squeegee]"), { autoAlpha: 0, y: 0 });
        gsap.set(q("[data-final]"), { autoAlpha: 0, y: 16 });
        gsap.set(q("[data-step]"), { opacity: 0.25 });
        if (mobile) gsap.set(q("[data-piece='back'], [data-desktop-only]"), { display: "none" });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          paused: reduced,
          scrollTrigger: reduced
            ? undefined
            : {
                trigger: root.current,
                start: "top top",
                end: mobile ? "+=230%" : "+=250%",
                pin: q("[data-stage]")[0],
                scrub: mobile ? true : 0.6,
                anticipatePin: 1,
              },
        });
        const step = (i: number, at: number | string) =>
          tl.to(q("[data-step]"), { opacity: (k) => (k === i ? 1 : 0.25), duration: 0.2, ease: "none" }, at);

        // 1. il rotolo si srotola
        step(0, 0);
        tl.to(q("[data-roll]"), { x: 880, scaleX: 0.55, duration: 1.2, ease: "power1.inOut" }, 0)
          .to(q("[data-fabric-clip]"), { scaleX: 1, duration: 1.2, ease: "power1.inOut" }, 0)
          .to(q("[data-roll]"), { autoAlpha: 0, duration: 0.2 }, 1.2);

        // 2. il laser rosso taglia le sagome
        step(1, 1.25);
        let t = 1.3;
        pieces.forEach((p) => {
          const dur = p.id === "front" || p.id === "back" ? 0.75 : 0.4;
          const cut = q(`[data-piece='${p.id}'] [data-cut]`)[0];
          const laser = q(`[data-piece='${p.id}'] [data-laser]`)[0];
          tl.set(laser, { autoAlpha: 1 }, t)
            .to(cut, { drawSVG: "0% 100%", duration: dur, ease: "none" }, t)
            .to(laser, { motionPath: { path: cut as unknown as SVGPathElement, align: cut as unknown as SVGPathElement, alignOrigin: [0.5, 0.5] }, duration: dur, ease: "none" }, t)
            .set(laser, { autoAlpha: 0 }, t + dur);
          t += dur + 0.05;
        });
        tl.set(q("[data-collar-laser]"), { autoAlpha: 1 }, t)
          .to(q("[data-collar-cut]"), { drawSVG: "0% 100%", duration: 0.3, ease: "none" }, t)
          .to(q("[data-collar-laser]"), { motionPath: { path: COLLAR_BOX, alignOrigin: [0.5, 0.5] }, duration: 0.3, ease: "none" }, t)
          .set(q("[data-collar-laser]"), { autoAlpha: 0 }, t + 0.3);
        t += 0.4;

        // i pezzi si staccano dal tessuto
        tl.set(q("[data-fill]"), { opacity: 1 }, t)
          .set(q("[data-collar]"), { opacity: 1 }, t)
          .to(q("[data-fabric]"), { opacity: 0, y: 40, duration: 0.5 }, t)
          .to(q("[data-cut], [data-collar-cut]"), { opacity: 0, duration: 0.3 }, t + 0.1)
          .to(q("[data-shadow]"), { opacity: 1, duration: 0.3 }, t)
          .to(q("[data-lift]"), { scale: 1.03, duration: 0.3, transformOrigin: "50% 50%" }, t);
        t += 0.55;

        // 3. volano al loro posto
        step(2, t);
        pieces.forEach((p, i) => {
          tl.to(q(`[data-piece='${p.id}']`), { x: 0, y: 0, rotation: 0, duration: 0.8, ease: "sarta" }, t + i * 0.12);
        });
        tl.to(q("[data-lift]"), { scale: 1, duration: 0.4 }, t + 0.6);
        tl.to(q("[data-collar]"), { morphSVG: COLLAR_RING, duration: 0.8, ease: "sarta" }, t + 0.35);
        tl.to(q("[data-shadow]"), { opacity: 0, duration: 0.3 }, t + 0.8);
        if (mobile) tl.to(q("[data-zoom], [data-squeegee-wrap]"), { scale: 1.45, y: -60, svgOrigin: "500 520", duration: 0.8, ease: "sarta" }, t + 0.4);
        t += 1.2;

        // le cuciture si disegnano punto per punto
        seams.forEach((s) => {
          const dur = mobile ? 0.22 : 0.18;
          const needle = q("[data-needle-dot]")[0];
          tl.set(needle, { autoAlpha: 1 }, t)
            .to(s, { drawSVG: "0% 100%", duration: dur, ease: "none" }, t)
            .to(needle, { motionPath: { path: s as unknown as SVGPathElement, align: s as unknown as SVGPathElement, alignOrigin: [0.5, 0.5] }, duration: dur, ease: "none" }, t);
          t += dur + 0.02;
        });
        tl.set(q("[data-needle-dot]"), { autoAlpha: 0 }, t);

        // 4. il colletto si chiude, la maglia prende volume
        step(3, t);
        tl.to(q("[data-volume]"), { opacity: 1, duration: 0.6, stagger: 0.08 }, t);
        t += 0.7;

        // 5. serigrafia a strati
        step(4, t);
        q("[data-print-pass]").forEach((_, i) => {
          const at = t + i * 0.45;
          tl.set(q("[data-squeegee]"), { autoAlpha: 1, y: 0 }, at)
            .to(q("[data-squeegee]"), { y: 190, duration: 0.4, ease: "power1.inOut" }, at)
            .to(q("[data-print-clip]")[i], { scaleY: 1, duration: 0.4, ease: "power1.inOut" }, at)
            .to(q("[data-print-layer]")[i], { x: 0, duration: 0.25 }, at + 0.3)
            .set(q("[data-squeegee]"), { autoAlpha: 0 }, at + 0.42);
        });
        t += 1.45;

        // 6. etichetta finale
        tl.to(q("[data-final]"), { autoAlpha: 1, y: 0, duration: 0.3 }, t).to(
          q("[data-final-code]"),
          { scrambleText: { text: "ORD-TEE-01", chars: "ORDTE-0123456789", speed: 0.5 }, duration: 0.4, ease: "none" },
          t,
        );
        tl.to({}, { duration: 0.6 });

        if (reduced) tl.progress(1);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="maglietta" aria-labelledby="maglietta-title" className="relative">
      <div data-stage className="relative flex h-svh flex-col overflow-hidden md:flex-row">
        <div className="relative z-10 shrink-0 px-5 pt-20 md:w-[30%] md:px-10 md:pt-28">
          <p className="tag text-filo">Cap. 03</p>
          <h2 id="maglietta-title" className="mt-2 font-display text-4xl uppercase leading-none md:text-6xl">
            Nasce una maglietta
          </h2>
          <ol className="mt-4 flex flex-wrap gap-x-3 gap-y-1 md:mt-10 md:block md:space-y-2">
            {STEPS.map((s, i) => (
              <li key={s} data-step className="tag flex items-center gap-2 md:text-sm">
                <span className="text-filo">0{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        <div className="relative min-h-0 flex-1">
          <svg
            viewBox="0 0 1000 1000"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Un rotolo di cotone si srotola, un laser taglia davanti, dietro, due maniche e colletto, i pezzi si cuciono in una t-shirt che viene serigrafata."
          >
            <defs>
              <pattern id="jersey" width="8" height="10" patternUnits="userSpaceOnUse">
                <rect width="8" height="10" fill="#f4f1ea" />
                <path d="M0 0 L4 5 L8 0 M0 5 L4 10 L8 5" fill="none" stroke="#d2c9b6" strokeWidth="1" />
              </pattern>
              <linearGradient id="roll-shade" x1="0" x2="1">
                <stop offset="0" stopColor="#cfc8b8" />
                <stop offset="0.45" stopColor="#f7f4ee" />
                <stop offset="1" stopColor="#bdb5a3" />
              </linearGradient>
              <linearGradient id="shade-x" x1="0" x2="1">
                <stop offset="0" stopColor="#141414" stopOpacity="0.2" />
                <stop offset="0.22" stopColor="#141414" stopOpacity="0" />
                <stop offset="0.78" stopColor="#141414" stopOpacity="0" />
                <stop offset="1" stopColor="#141414" stopOpacity="0.22" />
              </linearGradient>
              <radialGradient id="shade-r" cx="0.45" cy="0.3" r="0.7">
                <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <pattern id="halftone" width="9" height="9" patternUnits="userSpaceOnUse">
                <circle cx="4.5" cy="4.5" r="1.6" fill="#f4f1ea" />
              </pattern>
              <clipPath id="fabric-clip">
                <rect data-fabric-clip x="60" y="160" width="880" height="720" />
              </clipPath>
              <mask id="seam-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
                {SEAMS.map((s, i) => (
                  <path
                    key={i}
                    data-seam-reveal
                    d={s.d}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="8"
                    strokeLinecap="round"
                    {...(!s.mobile ? { "data-desktop-only": "" } : {})}
                  />
                ))}
              </mask>
              <clipPath id="front-clip">
                <path d={FRONT} />
              </clipPath>
              {[0, 1, 2].map((i) => (
                <clipPath key={i} id={`print-clip-${i}`}>
                  <rect data-print-clip x="350" y="380" width="300" height="200" />
                </clipPath>
              ))}
            </defs>

            <g data-zoom>
            {/* ombra a terra (volume) */}
            <ellipse data-volume cx="500" cy="792" rx="230" ry="16" fill="#141414" fillOpacity="0.13" />

            {/* tessuto e rotolo */}
            <g data-fabric>
              <g clipPath="url(#fabric-clip)">
                <rect x="60" y="160" width="880" height="720" fill="url(#jersey)" />
                <rect x="60" y="160" width="880" height="720" fill="none" stroke="#c9c1af" strokeWidth="2" />
                <path d="M60 172 H940 M60 868 H940" stroke="#e8432e" strokeOpacity="0.5" strokeDasharray="2 10" strokeWidth="2" />
              </g>
              <g data-roll>
                <rect x="40" y="148" width="44" height="744" rx="22" fill="url(#roll-shade)" />
                <ellipse cx="62" cy="152" rx="22" ry="7" fill="#e9e3d6" stroke="#bdb5a3" />
              </g>
            </g>

            {/* pezzi del cartamodello */}
            {PIECES.map((p) => (
              <g key={p.id} data-piece={p.id}>
                <g data-lift>
                  <path data-shadow d={p.d} fill="#141414" fillOpacity="0.12" transform="translate(10 14)" />
                  <path data-fill d={p.d} fill="url(#jersey)" stroke="#d0c8b6" strokeWidth="1.5" />
                  {p.id === "back" && <path data-fill d="M430 290 Q500 306 570 290 Q500 345 430 290 Z" fill="#e2dccf" />}
                </g>
                <path data-cut d={p.d} fill="none" stroke="var(--filo)" strokeWidth="2.5" />
                <g data-laser>
                  <circle r="14" fill="var(--filo)" opacity="0.25" />
                  <circle r="5" fill="var(--filo)" />
                </g>
              </g>
            ))}

            {/* colletto: striscia tagliata che si chiude ad anello (MorphSVG) */}
            <path data-collar-cut d={COLLAR_BOX} fill="none" stroke="var(--filo)" strokeWidth="2.5" />
            <g data-collar-laser>
              <circle r="14" fill="var(--filo)" opacity="0.25" />
              <circle r="5" fill="var(--filo)" />
            </g>
            <path data-collar d={COLLAR_STRIP} fill="none" stroke="#e4ddcd" strokeWidth="14" strokeLinecap="round" />

            {/* volume */}
            <g clipPath="url(#front-clip)">
              <rect data-volume x="330" y="280" width="340" height="490" fill="url(#shade-x)" />
              <rect data-volume x="330" y="280" width="340" height="490" fill="url(#shade-r)" />
              <path data-volume d="M392 520 Q408 620 396 740 M612 470 Q600 590 618 742 M470 690 Q520 708 560 690" fill="none" stroke="#141414" strokeOpacity="0.06" strokeWidth="12" strokeLinecap="round" />
            </g>
            <path data-volume d={SLEEVE_R} fill="#141414" fillOpacity="0.07" />
            <path data-volume d={SLEEVE_L} fill="#141414" fillOpacity="0.07" />

            {/* cuciture tratteggiate rosse, svelate dalla maschera */}
            <g mask="url(#seam-mask)" fill="none" stroke="var(--filo)" strokeWidth="2.6" strokeDasharray="7 5" strokeLinecap="round">
              {SEAMS.map((s, i) => (
                <path key={i} d={s.d} />
              ))}
            </g>
            <circle data-needle-dot r="4" fill="var(--grafite)" />

            {/* serigrafia: tre passaggi d'inchiostro */}
            <g data-print-pass>
              <g clipPath="url(#print-clip-0)">
                <g data-print-layer>
                  <circle cx="500" cy="470" r="72" fill="var(--filo)" />
                </g>
              </g>
            </g>
            <g data-print-pass>
              <g clipPath="url(#print-clip-1)">
                <g data-print-layer>
                  <circle cx="500" cy="470" r="72" fill="url(#halftone)" opacity="0.55" />
                  <path d="M436 520 C 470 430, 530 520, 566 420" fill="none" stroke="#f4f1ea" strokeWidth="3" />
                </g>
              </g>
            </g>
            <g data-print-pass>
              <g clipPath="url(#print-clip-2)">
                <g data-print-layer>
                  <text x="500" y="492" textAnchor="middle" fill="var(--grafite)" style={{ fontFamily: "var(--font-anton)", fontSize: 62, letterSpacing: 2 }}>
                    ORDITO
                  </text>
                  <text x="500" y="560" textAnchor="middle" fill="var(--grafite)" style={{ fontFamily: "var(--font-jetbrains)", fontSize: 11, letterSpacing: 2 }}>
                    OGNI CAPO INIZIA DA UN FILO
                  </text>
                </g>
              </g>
            </g>
            </g>
            <g data-squeegee-wrap>
            <g data-squeegee>
              <rect x="350" y="372" width="300" height="10" rx="5" fill="var(--grafite)" />
            </g>
            </g>
          </svg>

          <p data-final className="tag absolute inset-x-5 bottom-16 text-center md:bottom-14">
            <span data-final-code className="text-filo">ORD-TEE-01</span> · Cotone heavy jersey 240 g/m² · Made in Italy [dimostrativo]
          </p>
        </div>
      </div>
    </section>
  );
}
