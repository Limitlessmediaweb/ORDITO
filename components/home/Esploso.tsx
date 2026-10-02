"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { createSequence } from "@/lib/sequence";
import { deferInit } from "@/lib/deferInit";
import { setTone } from "@/lib/tone";

type Part = {
  n: number;
  nome: string;
  spec: string;
  /** punto sul capo, in frazioni del fotogramma finale */
  a: [number, number];
  /** lato ed altezza dell'etichetta su desktop */
  side: "L" | "R";
  ly: number;
};

const PARTS: Part[] = [
  { n: 1, nome: "Cappuccio", spec: "Staccabile · coulisse Ø 4 mm", a: [0.4, 0.1], side: "L", ly: 0.1 },
  { n: 2, nome: "Guscio", spec: "Nylon ripstop 320 g/m²", a: [0.2, 0.52], side: "L", ly: 0.44 },
  { n: 3, nome: "Fodera", spec: "Taffetà 70 g/m²", a: [0.69, 0.3], side: "R", ly: 0.2 },
  { n: 4, nome: "Imbottitura", spec: "Fibra riciclata 120 g", a: [0.46, 0.4], side: "R", ly: 0.38 },
  { n: 5, nome: "Zip", spec: "YKK [dimostrativo] · doppio cursore", a: [0.5, 0.875], side: "R", ly: 0.62 },
  { n: 6, nome: "Polsini", spec: "Costina elastica 2×2", a: [0.13, 0.905], side: "L", ly: 0.8 },
  { n: 7, nome: "Etichetta", spec: "Tessuta · rosso filo", a: [0.74, 0.87], side: "R", ly: 0.86 },
];
const code = (n: number) => `ORD-JKT-01.${n}`;
const LX = { L: -6, R: 106 };
// sfuma solo i bordi del fotogramma: il fondo del video si fonde con la luce diffusa dietro
const EDGE_FADE = {
  maskImage:
    "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent), linear-gradient(to bottom, transparent, #000 5%, #000 95%, transparent)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

/**
 * Cap. 2 — Anatomia di una giacca. Sequenza a frame su canvas legata allo scroll (piano A).
 * `corto` = versione breve per la pagina del capo (niente ricomposizione).
 */
export default function Esploso({ corto = false }: { corto?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useGSAP(
    // creata dopo l'intro, nei momenti liberi (vedi lib/deferInit)
    (_, contextSafe) =>
      deferInit(
        contextSafe!(() => {
          const q = gsap.utils.selector(root);
          const mm = gsap.matchMedia();

          mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
            const { desktop, mobile } = ctx.conditions as { desktop: boolean; mobile: boolean };
            if (!desktop && !mobile) return;

            const seq = desktop ? createSequence("/media/jacket-seq/d", 120) : createSequence("/media/jacket-seq/m", 60);
            const cv = canvas.current!;
            const c2d = cv.getContext("2d", { alpha: false })!;
            const state = { frame: 0 };
            let drawn = -1;
            let raf = 0;

            const size = () => {
              const r = cv.getBoundingClientRect();
              const dpr = Math.min(window.devicePixelRatio || 1, desktop ? 2 : 2);
              cv.width = Math.round(r.width * dpr);
              cv.height = Math.round(r.height * dpr);
              drawn = -1;
              paint();
            };
            const paint = () => {
              const i = Math.round(state.frame * (seq.count - 1));
              const img = seq.nearest(i);
              if (!img) {
                // nessun frame ancora: stesso grigio del video, mai un rettangolo nero
                c2d.fillStyle = "#ccc8c7";
                c2d.fillRect(0, 0, cv.width, cv.height);
                return;
              }
              const key = seq.frames[i] ? i : -2 - i; // ridisegna quando arriva il frame esatto
              if (key === drawn) return;
              drawn = key;
              c2d.drawImage(img, 0, 0, cv.width, cv.height);
            };
            const schedule = () => {
              if (raf) return;
              raf = requestAnimationFrame(() => {
                raf = 0;
                paint();
              });
            };
            seq.onFrame(schedule);

            // Il caricamento parte alla prima interazione o quando la sezione si avvicina.
            const kick = () => seq.start();
            const evts = ["wheel", "touchstart", "keydown", "scroll", "pointerdown"] as const;
            evts.forEach((e) => window.addEventListener(e, kick, { once: true, passive: true }));
            if (corto) kick();

            size();
            const ro = new ResizeObserver(size);
            ro.observe(cv);

            // ---------- timeline ----------
            gsap.set(q("[data-label]"), { autoAlpha: 0 });
            gsap.set(q("[data-lead]"), { drawSVG: "0% 0%" });
            gsap.set(q("[data-dot]"), { scale: 0 });
            gsap.set(q("[data-dark], [data-spot]"), { opacity: 0 });
            gsap.set(q("[data-count]"), { autoAlpha: 0, y: 20 });

            const OPEN = corto ? 0.7 : 0.55;
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: corto ? "+=220%" : desktop ? "+=380%" : "+=340%",
                pin: q("[data-stage]")[0],
                scrub: desktop ? 0.6 : true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => setTone("esploso", self.isActive && self.progress > OPEN * 0.45 && self.progress < (corto ? 2 : 0.88)),
                onToggle: (self) => !self.isActive && setTone("esploso", false),
              },
            });
            tl.to(state, { frame: 1, duration: OPEN, onUpdate: schedule }, 0);
            tl.to(q("[data-intro-copy]"), { autoAlpha: 0, y: -30, duration: 0.08 }, 0.04);

            // A metà la scena passa da cemento a grafite
            tl.to(q("[data-dark], [data-spot]"), { opacity: 1, duration: 0.1 }, OPEN * 0.42);
            tl.to(q("[data-ink]"), { color: "#f4f1ea", duration: 0.1 }, OPEN * 0.42);

            PARTS.forEach((p, i) => {
              const at = OPEN * 0.38 + i * 0.035;
              tl.to(q(`[data-dot='${p.n}']`), { scale: 1, duration: 0.02, ease: "back.out(3)" }, at)
                .to(q(`[data-lead='${p.n}']`), { drawSVG: "0% 100%", duration: 0.05 }, at)
                .to(q(`[data-label='${p.n}']`), { autoAlpha: 1, duration: 0.02 }, at + 0.02)
                .to(
                  q(`[data-label='${p.n}'] [data-code]`),
                  { scrambleText: { text: code(p.n), chars: "0123456789-/ORDJKT", speed: 0.6 }, duration: 0.06 },
                  at + 0.02,
                );
            });

            if (!corto) {
              // contatore finale
              const n = { c: 0, s: 0 };
              if (mobile) tl.to(q("[data-legend]"), { autoAlpha: 0, duration: 0.03 }, 0.58).set(q("[data-legend]"), { autoAlpha: 1 }, 0.79);
              tl.to(q("[data-count]"), { autoAlpha: 1, y: 0, duration: 0.04 }, 0.6).to(
                n,
                {
                  c: 7,
                  s: 214,
                  duration: 0.08,
                  onUpdate: () => {
                    const el = q("[data-count-n]");
                    if (el[0]) el[0].textContent = String(Math.round(n.c));
                    if (el[1]) el[1].textContent = String(Math.round(n.s));
                  },
                },
                0.6,
              );
              // ricomposizione veloce (sequenza al contrario)
              tl.to(q("[data-label], [data-dot], [data-count]"), { autoAlpha: 0, duration: 0.03 }, 0.76)
                .to(q("[data-lead]"), { drawSVG: "100% 100%", duration: 0.03 }, 0.76)
                .to(state, { frame: 0, duration: 0.13, ease: "power2.inOut", onUpdate: schedule }, 0.78)
                .to(q("[data-dark], [data-spot]"), { opacity: 0, duration: 0.08 }, 0.86)
                .to(q("[data-ink]"), { color: "#141414", duration: 0.08 }, 0.86)
                .to(q("[data-outro-copy]"), { autoAlpha: 1, y: 0, duration: 0.05 }, 0.9)
                .to({}, { duration: 0.06 });
            } else {
              tl.to({}, { duration: 0.2 });
            }

            return () => {
              setTone("esploso", false);
              evts.forEach((e) => window.removeEventListener(e, kick));
              ro.disconnect();
              cancelAnimationFrame(raf);
            };
          });

          // reduced motion: immagine finale statica con etichette visibili
          mm.add(MQ.reduced, () => {
            gsap.set(q("[data-label], [data-count]"), { autoAlpha: 1 });
          });
        }),
      ),
    { scope: root },
  );

  return (
    <section ref={root} id="anatomia" aria-labelledby="anatomia-title" className="relative">
      <div data-stage className="relative h-svh overflow-hidden">
        <div data-dark aria-hidden="true" className="absolute inset-0 bg-grafite" />

        <div data-ink className="relative z-10 flex h-full flex-col items-center justify-center text-grafite">
          <header data-intro-copy className="absolute left-4 top-20 max-w-[18rem] md:left-10 md:top-28">
            <p className="tag text-filo-ink">Cap. 02</p>
            <h2 id="anatomia-title" className="mt-2 font-display text-4xl uppercase leading-none md:text-6xl">
              Anatomia di una giacca
            </h2>
          </header>
          {!corto && (
            <p data-outro-copy className="tag invisible absolute bottom-16 left-1/2 -translate-x-1/2 translate-y-4 text-center">
              Ricomposta. Ogni pezzo al suo posto.
            </p>
          )}

          {/* palco: canvas + etichette nello stesso sistema di coordinate */}
          <div className="relative aspect-[1192/1600] h-[min(84svh,128vw)] md:h-[86svh]">
            <div
              data-spot
              aria-hidden="true"
              className="absolute -inset-x-[40%] -inset-y-[8%] md:-inset-x-[60%] md:-inset-y-[35%] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,#ccc8c7_76%,rgb(204_200_199/0)_100%)] opacity-0"
            />
            <div className="absolute inset-0 overflow-hidden" style={EDGE_FADE}>
              <canvas
                ref={canvas}
                role="img"
                aria-label="La giacca ORD-JKT-01 si scompone nei suoi sette componenti: cappuccio, guscio, fodera, imbottitura, zip, polsini ed etichetta."
                className="h-full w-full motion-reduce:hidden"
              />
              <Image
                src="/media/jacket-exploded.webp"
                alt="Vista esplosa della giacca ORD-JKT-01 con i sette componenti separati"
                fill
                sizes="60vh"
                className="hidden object-cover motion-reduce:block"
              />
            </div>

            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible md:block"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {PARTS.map((p) => {
                const ax = p.a[0] * 100;
                const ay = p.a[1] * 100;
                const lx = LX[p.side];
                const ly = p.ly * 100;
                const elbow = p.side === "L" ? Math.min(ax - 6, 8) : Math.max(ax + 6, 92);
                return (
                  <polyline
                    key={p.n}
                    data-lead={p.n}
                    points={`${ax},${ay} ${elbow},${ly} ${lx},${ly}`}
                    fill="none"
                    stroke="var(--filo)"
                    strokeWidth="1"
                    strokeDasharray="0"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>

            {PARTS.map((p) => (
              <span
                key={p.n}
                data-dot={p.n}
                aria-hidden="true"
                className="absolute grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-filo font-mono text-[10px] text-carta"
                style={{ left: `${p.a[0] * 100}%`, top: `${p.a[1] * 100}%` }}
              >
                {p.n}
              </span>
            ))}

            {/* etichette laterali (desktop) */}
            <ul className="hidden md:block">
              {PARTS.map((p) => (
                <li
                  key={p.n}
                  data-label={p.n}
                  className={`absolute w-56 -translate-y-1/2 ${p.side === "L" ? "-translate-x-full pr-3 text-right" : "pl-3"}`}
                  style={{ left: `${LX[p.side]}%`, top: `${p.ly * 100}%` }}
                >
                  <span data-code className="tag block text-filo">
                    {code(p.n)}
                  </span>
                  <span className="block font-display text-2xl uppercase leading-tight">{p.nome}</span>
                  <span className="tag block opacity-70">{p.spec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* legenda (mobile) */}
          <ol data-legend className="relative z-10 mt-3 grid w-full grid-cols-2 gap-x-4 gap-y-1.5 px-5 md:hidden">
            {PARTS.map((p) => (
              <li key={p.n} data-label={p.n} className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-filo">{p.n}</span>
                <span>
                  <span className="block font-display text-base uppercase leading-none">{p.nome}</span>
                  <span data-code className="tag block text-[0.65rem] opacity-80">
                    {code(p.n)}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          {!corto && (
            <p data-count className="absolute bottom-24 left-5 md:bottom-12 md:left-auto md:right-16 md:text-right">
              <span className="block font-display text-5xl leading-none md:text-7xl">
                <span data-count-n>7</span> <span className="text-filo">·</span> <span data-count-n>214</span>
              </span>
              <span className="tag">componenti · cuciture [dimostrativo]</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
