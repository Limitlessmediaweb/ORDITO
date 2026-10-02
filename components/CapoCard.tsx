"use client";

import Image from "next/image";
import TendaLink from "./TendaLink";
import { useRef, useState } from "react";
import { gsap, Flip, useGSAP, MQ, prefersReduced } from "@/lib/gsap";
import { useNear } from "@/lib/useNear";
import { euro, type Capo } from "@/lib/capi";

/**
 * Card di un capo: inclinazione al cursore (TiltCard), retro che si espande con Flip,
 * colorway con transizione liquida (maschera circolare che parte dal pallino).
 */
export default function CapoCard({ capo, eager = false }: { capo: Capo; eager?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [cw, setCw] = useState(0);
  const [back, setBack] = useState(false);
  const busy = useRef(false);
  const near = useNear(root, "60% 100%");
  const show = eager || near;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.fine, () => {
        const el = root.current!;
        const tilt = el.querySelector("[data-tilt]")!;
        const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.6, ease: "power3" });
        const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.6, ease: "power3" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 14);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
        };
        const enter = () => toggleBack(true);
        const leave = () => {
          rx(0);
          ry(0);
          toggleBack(false);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: root },
  );

  // Retro: la miniatura nell'angolo si espande a tutta card (Flip) e viceversa
  // (handler di evento: usano i ref solo fuori dal render)
  function toggleBack(on: boolean) {
    const thumb = root.current?.querySelector<HTMLElement>("[data-back]");
    if (!thumb) return;
    const state = Flip.getState(thumb);
    thumb.dataset.open = on ? "1" : "0";
    setBack(on);
    if (prefersReduced()) return;
    Flip.from(state, { duration: 0.6, ease: "sarta", absolute: true, scale: true });
  }

  // Colorway: il nuovo colore si espande da un cerchio centrato sul pallino premuto
  function pick(i: number, e: React.MouseEvent<HTMLButtonElement>) {
    if (i === cw || busy.current) return;
    const media = root.current!.querySelector<HTMLElement>("[data-media]")!;
    const layer = root.current!.querySelector<HTMLElement>(`[data-cw='${i}']`)!;
    const m = media.getBoundingClientRect();
    const b = e.currentTarget.getBoundingClientRect();
    const x = b.left + b.width / 2 - m.left;
    const y = b.top + b.height / 2 - m.top;
    const r = Math.hypot(Math.max(x, m.width - x), Math.max(y, m.height - y));
    busy.current = true;
    gsap.set(layer, { zIndex: 3, visibility: "visible" });
    gsap.fromTo(
      layer,
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      {
        clipPath: `circle(${r}px at ${x}px ${y}px)`,
        duration: prefersReduced() ? 0.01 : 0.85,
        ease: "power3.inOut",
        onComplete: () => {
          root.current!.querySelectorAll<HTMLElement>("[data-cw]").forEach((l) => {
            const n = Number(l.dataset.cw);
            gsap.set(l, { zIndex: n === i ? 2 : 1, visibility: n === i ? "visible" : "hidden", clipPath: "none" });
          });
          busy.current = false;
          setCw(i);
        },
      },
    );
  }

  const cap = capo.colorway[cw];
  const title = <span className="font-display text-3xl uppercase leading-none md:text-4xl">{capo.nome}</span>;

  return (
    <article ref={root} className="group relative flex w-full flex-col [perspective:1000px]" data-cursor>
      <div data-tilt className="relative [transform-style:preserve-3d]">
        <div data-media className="crocini relative aspect-[3/4] overflow-hidden bg-[#cfccc6] text-grafite">
          {capo.colorway.map((c, i) => (
            <div
              key={c.nome}
              data-cw={i}
              className="absolute inset-0"
              style={{ zIndex: i === 0 ? 2 : 1, visibility: i === 0 ? "visible" : "hidden" }}
            >
              {show && (i === 0 || near) && (
                <Image
                  src={c.img}
                  alt={`${capo.nome}, colore ${c.nome.toLowerCase()}, vista frontale`}
                  fill
                  sizes="(max-width: 768px) 78vw, 30vw"
                  loading={eager ? "eager" : "lazy"}
                  className="object-cover"
                />
              )}
            </div>
          ))}

          {/* retro: miniatura che diventa piena con Flip */}
          <div
            data-back
            data-open="0"
            className="absolute bottom-3 right-3 z-[4] aspect-[3/4] w-[24%] overflow-hidden border border-grafite/20 data-[open='1']:inset-0 data-[open='1']:w-full data-[open='1']:border-0"
          >
            {show && <Image src={capo.retro} alt={`${capo.nome}, vista dal retro`} fill sizes="30vw" className="object-cover" />}
          </div>

          <p className="tag absolute left-3 top-3 z-[5]">{capo.codice}</p>
          <p className="tag absolute right-3 top-3 z-[5]" aria-live="polite">
            {back ? "Retro" : "Fronte"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          {capo.pagina ? (
            <TendaLink
              href={`/capo/${capo.slug}`}
              className="after:absolute after:inset-0 after:z-[6] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-filo"
            >
              {title}
            </TendaLink>
          ) : (
            title
          )}
          <p className="tag mt-1 text-gesso-ink">
            {capo.materiale} · {capo.grammatura}
          </p>
        </div>
        <p className="whitespace-nowrap font-mono text-sm">
          {euro(capo.prezzo)}
          <span className="sr-only"> (prezzo dimostrativo)</span>
        </p>
      </div>

      <div className="relative z-[7] mt-3 flex items-center gap-3">
        <span className="tag text-gesso-ink">{cap.nome}</span>
        <div role="radiogroup" aria-label={`Colore di ${capo.nome}`} className="flex gap-2">
          {capo.colorway.map((c, i) => (
            <button
              key={c.nome}
              type="button"
              role="radio"
              aria-checked={i === cw}
              aria-label={c.nome}
              onClick={(e) => pick(i, e)}
              className="grid size-11 place-items-center rounded-full"
            >
              <span
                className={`block size-5 rounded-full border transition-transform duration-300 ${i === cw ? "scale-110 border-filo ring-2 ring-filo ring-offset-2 ring-offset-cemento" : "border-grafite/30"}`}
                style={{ background: c.hex }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => toggleBack(!back)}
          aria-pressed={back}
          className="tag ml-auto min-h-11 border-b border-current md:opacity-0 md:focus-visible:opacity-100"
        >
          {back ? "Fronte" : "Retro"}
        </button>
      </div>
    </article>
  );
}
