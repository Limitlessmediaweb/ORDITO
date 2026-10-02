"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ, prefersReduced } from "@/lib/gsap";
import { deferInit } from "@/lib/deferInit";
import { glBus, webglOk } from "@/lib/glbus";
import { useNear } from "@/lib/useNear";
import type { FabricState } from "@/components/gl/FabricGL";

const FabricGL = dynamic(() => import("@/components/gl/FabricGL"), { ssr: false });

const TESSUTI = [
  { nome: "Nylon ripstop", spec: "320 g/m² · ORD-MAT-01 · Guscio", img: "/media/fab-ripstop.webp", alt: "Macro del nylon ripstop nero: la griglia di rinforzo quadrata" },
  { nome: "Heavy jersey", spec: "240 g/m² · ORD-MAT-02 · T-shirt", img: "/media/fab-jersey.webp", alt: "Macro del cotone heavy jersey color carta, con le maglie a V" },
  { nome: "Imbottitura", spec: "120 g · ORD-MAT-03 · Fibra riciclata", img: "/media/fab-imbottitura.webp", alt: "Macro dell'imbottitura: fibre bianche che escono da una cucitura trapuntata" },
  { nome: "Lana cotta", spec: "560 g/m² · ORD-MAT-04 · Sovracamicia", img: "/media/fab-lana.webp", alt: "Macro della lana cotta antracite attraversata da un filo rosso" },
];

const URLS = TESSUTI.map((t) => t.img);

/** Cap. 4 — Materia: quattro macro a tutto schermo, distorte da una "mano" WebGL. */
export default function Materia() {
  const root = useRef<HTMLElement>(null);
  const state = useRef<FabricState>({ progress: 0, mx: 0.5, my: 0.5, strength: 0, vel: 0 });
  const [gl, setGl] = useState(false);
  const [ready, setReady] = useState(false);
  const near = useNear(root, "120% 0px");

  // carica three.js solo quando la sezione si avvicina
  useEffect(() => {
    if (prefersReduced() || !webglOk()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        glBus.need();
        setGl(true);
        io.disconnect();
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  useGSAP(
    // creata nei momenti liberi dopo l'intro (vedi lib/deferInit)
    (_, contextSafe) =>
      deferInit(
        contextSafe!(() => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile, fine: MQ.fine }, (ctx) => {
        const { desktop, mobile, fine } = ctx.conditions as { desktop: boolean; mobile: boolean; fine: boolean };
        if (!desktop && !mobile) return;
        const s = state.current;
        const imgs = q("[data-fab-img]");
        const names = q("[data-fab-name]");
        gsap.set(imgs, { opacity: (i) => (i === 0 ? 1 : 0) });
        gsap.set(names, { autoAlpha: (i) => (i === 0 ? 1 : 0) });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: mobile ? "+=300%" : "+=400%",
            pin: q("[data-stage]")[0],
            scrub: true,
            anticipatePin: 1,
            onToggle: (self) => glBus.setActive("materia", self.isActive),
            onUpdate: (self) => {
              if (!fine) {
                // touch: l'effetto parte allo scroll
                s.vel = Math.min(1, Math.abs(self.getVelocity()) / 1800);
                s.strength = s.vel * 0.9;
                s.mx = 0.5 + Math.sin(self.progress * 9) * 0.25;
                s.my = 0.45;
              }
            },
          },
        });
        // ogni tessuto resta fermo, poi un passaggio breve e condiviso tra shader, immagini e nomi
        [1, 2, 3].forEach((i) => {
          tl.to(s, { progress: i, duration: 0.3, ease: "power1.inOut" }, i - 0.6).to(imgs[i], { opacity: 1, duration: 0.3 }, i - 0.6);
        });
        // nomi giganti: marquee in direzioni opposte
        names.forEach((n, i) => {
          const rows = n.querySelectorAll("[data-row]");
          const at = Math.max(0, i - 0.7);
          tl.fromTo(rows[0], { xPercent: 0 }, { xPercent: -30, duration: 1.4 }, at).fromTo(rows[1], { xPercent: -30 }, { xPercent: 0, duration: 1.4 }, at);
          if (i > 0) tl.to(names[i - 1], { autoAlpha: 0, duration: 0.12 }, i - 0.6).to(n, { autoAlpha: 1, duration: 0.12 }, i - 0.42);
        });
        tl.to({}, { duration: 0.3 });

        let onMove: ((e: PointerEvent) => void) | undefined;
        let onLeave: (() => void) | undefined;
        // touch: la "mano" si spegne quando lo scroll si ferma
        const decay = () => {
          s.vel *= 0.9;
          s.strength = s.vel * 0.9;
        };
        if (!fine) gsap.ticker.add(decay);
        if (fine) {
          const stage = q("[data-stage]")[0] as HTMLElement;
          onMove = (e: PointerEvent) => {
            const r = stage.getBoundingClientRect();
            s.mx = (e.clientX - r.left) / r.width;
            s.my = 1 - (e.clientY - r.top) / r.height;
            s.strength = 1;
          };
          onLeave = () => (s.strength = 0);
          stage.addEventListener("pointermove", onMove);
          stage.addEventListener("pointerleave", onLeave);
        }
        return () => {
          gsap.ticker.remove(decay);
          glBus.setActive("materia", false);
          const stage = q("[data-stage]")[0] as HTMLElement;
          if (onMove) stage?.removeEventListener("pointermove", onMove);
          if (onLeave) stage?.removeEventListener("pointerleave", onLeave);
        };
      });
        }),
      ),
    { scope: root },
  );

  const onReady = useCallback(() => setReady(true), []);

  // quando il WebGL arriva, ricalcola i trigger (il layout non cambia, ma per sicurezza)
  useEffect(() => {
    if (gl) ScrollTrigger.refresh();
  }, [gl]);

  return (
    <section ref={root} id="materia" data-tone="dark" aria-labelledby="materia-title" className="relative text-carta">
      <div data-stage className="relative z-[2] h-svh overflow-hidden" data-cursor>
        {/* macro HTML: fallback e reduced-motion */}
        {TESSUTI.map((t, i) => (
          <div key={t.nome} data-fab-img className={`absolute inset-0 transition-[visibility] ${ready ? "invisible" : ""}`} style={{ opacity: i === 0 ? 1 : 0 }}>
            {near && <Image src={t.img} alt={t.alt} fill sizes="100vw" className="object-cover" />}
          </div>
        ))}
        {gl && <FabricGL urls={URLS} state={state} onReady={onReady} className="absolute inset-0" />}
        <div aria-hidden="true" className="absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(20_20_20/0.55))]" />

        <div className="relative z-[4] flex h-full flex-col justify-between px-4 pb-14 pt-20 md:px-10 md:pt-28">
          <header>
            <p className="tag text-filo">Cap. 04</p>
            <h2 id="materia-title" className="mt-2 font-display text-4xl uppercase leading-none md:text-6xl">
              Materia
            </h2>
            <p className="mt-3 max-w-xs text-sm text-carta/80">
              Materiali dichiarati, grammature vere. <span className="hidden md:inline">Passa la mano sul tessuto.</span>
            </p>
          </header>

          <div className="relative h-[46vw] max-h-[60svh] md:h-[30vw]">
            {TESSUTI.map((t, i) => (
              <div key={t.nome} data-fab-name className="absolute inset-0 flex flex-col justify-center overflow-hidden" style={{ visibility: i === 0 ? "visible" : "hidden" }}>
                <p data-row aria-hidden={i > 0 ? true : undefined} className="whitespace-nowrap font-display text-[19vw] uppercase leading-[0.85] md:text-[15vw]">
                  {`${t.nome} — `.repeat(3)}
                </p>
                <p data-row aria-hidden="true" className="tag whitespace-nowrap text-[3.2vw] text-filo md:text-[1.6vw]">
                  {`${t.spec} · `.repeat(6)}
                </p>
              </div>
            ))}
          </div>

          <ul className="sr-only">
            {TESSUTI.map((t) => (
              <li key={t.nome}>
                {t.nome}: {t.spec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
