"use client";

import TendaLink from "./TendaLink";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReduced } from "@/lib/gsap";
import { LOGO } from "@/lib/logo-data";

const LIMITLESS = process.env.NEXT_PUBLIC_LIMITLESS_URL || "https://www.limitlessmedia.it";
const THREADS = 9; // fili per lettera

type Thread = {
  el: SVGPathElement;
  letter: number;
  ax: number;
  ay: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  k: number;
  damp: number;
  off: [number, number];
};

/** Cap. 8 — Footer: il wordmark gigante si sfilaccia in fili che seguono il cursore. */
export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      const s = svg.current!;
      const letters = Array.from(s.querySelectorAll<SVGGraphicsElement>("[data-fray]"));
      const layer = s.querySelector<SVGGElement>("[data-threads]")!;
      const threads: Thread[] = [];
      const pull = letters.map(() => ({ v: 0 }));

      // ancore: punti campionati sul contorno di ogni lettera
      letters.forEach((l, li) => {
        const shape = (l.querySelector("path") ?? l) as SVGPathElement;
        const len = shape.getTotalLength();
        for (let i = 0; i < THREADS; i++) {
          const p = shape.getPointAtLength(((i + Math.random() * 0.6) / THREADS) * len);
          const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
          el.setAttribute("fill", "none");
          el.setAttribute("stroke", i % 3 === 0 ? "var(--filo)" : "var(--carta)");
          el.setAttribute("stroke-width", String(4 + Math.random() * 4));
          el.setAttribute("stroke-linecap", "round");
          layer.appendChild(el);
          threads.push({
            el,
            letter: li,
            ax: p.x,
            ay: p.y,
            x: p.x,
            y: p.y,
            vx: 0,
            vy: 0,
            k: 0.035 + Math.random() * 0.05,
            damp: 0.8 + Math.random() * 0.1,
            off: [(Math.random() - 0.5) * 160, (Math.random() - 0.5) * 160],
          });
        }
      });

      const mouse = { x: 0, y: 0, inside: false };
      const toSvg = (cx: number, cy: number) => {
        const m = s.getScreenCTM();
        if (!m) return { x: 0, y: 0 };
        const p = new DOMPoint(cx, cy).matrixTransform(m.inverse());
        return { x: p.x, y: p.y };
      };
      const boxes = letters.map((l) => l.getBBox());
      const move = (e: PointerEvent) => {
        const p = toSvg(e.clientX, e.clientY);
        mouse.x = p.x;
        mouse.y = p.y;
        mouse.inside = true;
      };
      const leave = () => (mouse.inside = false);
      s.addEventListener("pointermove", move);
      s.addEventListener("pointerleave", leave);

      const shift = letters.map((l) => ({
        x: gsap.quickTo(l, "x", { duration: 0.8, ease: "power3" }),
        y: gsap.quickTo(l, "y", { duration: 0.8, ease: "power3" }),
        o: gsap.quickTo(l, "opacity", { duration: 0.5 }),
      }));

      const tick = () => {
        letters.forEach((_, li) => {
          const b = boxes[li];
          const cx = b.x + b.width / 2;
          const cy = b.y + b.height / 2;
          const d = Math.hypot(mouse.x - cx, (mouse.y - cy) * 0.6);
          const target = mouse.inside ? gsap.utils.clamp(0, 1, 1 - (d - b.width * 0.3) / (b.width * 1.4)) : 0;
          pull[li].v += (target - pull[li].v) * 0.12;
          const k = pull[li].v;
          shift[li].x((mouse.x - cx) * 0.06 * k);
          shift[li].y((mouse.y - cy) * 0.06 * k);
          shift[li].o(1 - k * 0.35);
        });
        for (const t of threads) {
          const k = pull[t.letter].v;
          // il capo libero insegue il cursore (con un offset per filo), oppure torna all'ancora
          const tx = t.ax + (mouse.x + t.off[0] - t.ax) * k * 0.85;
          const ty = t.ay + (mouse.y + t.off[1] - t.ay) * k * 0.85;
          t.vx = (t.vx + (tx - t.x) * t.k) * t.damp;
          t.vy = (t.vy + (ty - t.y) * t.k) * t.damp;
          t.x += t.vx;
          t.y += t.vy;
          const dx = t.x - t.ax;
          const dy = t.y - t.ay;
          const len = Math.hypot(dx, dy);
          if (len < 1.5) {
            t.el.setAttribute("d", "");
            continue;
          }
          // il filo pende un po' (gravità) e si piega col movimento
          const mx = t.ax + dx / 2 - t.vy * 2;
          const my = t.ay + dy / 2 + len * 0.18 + t.vx * 2;
          t.el.setAttribute(
            "d",
            `M${t.ax.toFixed(1)} ${t.ay.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${t.x.toFixed(1)} ${t.y.toFixed(1)}`,
          );
        }
      };

      // gira solo quando il footer è visibile
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (st) => (st.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
      });
      // al primo ingresso, uno strattone automatico (utile su touch)
      ScrollTrigger.create({
        trigger: s,
        start: "top 75%",
        once: true,
        onEnter: () => {
          const b = s.viewBox.baseVal;
          mouse.x = b.x + b.width * 0.55;
          mouse.y = b.y + b.height * 0.45;
          mouse.inside = true;
          gsap.delayedCall(0.9, () => (mouse.inside = false));
        },
      });

      return () => {
        gsap.ticker.remove(tick);
        s.removeEventListener("pointermove", move);
        s.removeEventListener("pointerleave", leave);
        threads.forEach((t) => t.el.remove());
      };
    },
    { scope: root },
  );

  const nav = [
    { href: "/#collezione", label: "Collezione" },
    { href: "/#materia", label: "Materia" },
    { href: "/#lookbook", label: "Lookbook" },
    { href: "#", label: "Instagram" },
  ];

  return (
    <footer
      ref={root}
      data-tone="dark"
      data-velo="off"
      className="relative z-[2] overflow-hidden bg-grafite px-4 pb-20 pt-24 text-carta md:px-10 md:pt-32"
    >
      <div className="flex flex-col justify-between gap-10 md:flex-row">
        <p className="max-w-sm font-display text-3xl uppercase leading-none md:text-5xl">Ogni capo inizia da un filo.</p>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-1">
            {nav.map((n) => (
              <li key={n.label}>
                <TendaLink href={n.href} className="tag inline-flex min-h-11 items-center hover:text-filo">
                  {n.label}
                </TendaLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <svg
        ref={svg}
        viewBox={LOGO.viewBox}
        className="mt-16 block w-full touch-pan-y overflow-visible md:mt-24"
        role="img"
        aria-label="ORDITO"
        data-cursor
      >
        <g data-fray>
          <path d={LOGO.coil} fill="none" stroke="var(--filo)" strokeWidth={LOGO.strokeW} strokeLinecap="round" />
        </g>
        <path d={LOGO.tail} fill="none" stroke="var(--filo)" strokeWidth={LOGO.strokeW} strokeLinecap="round" />
        {LOGO.letters.slice(1).map((l, i) => (
          <g key={i} data-fray>
            <path d={l.d} fill="var(--carta)" />
          </g>
        ))}
        <g data-threads />
      </svg>

      <div className="mt-10 flex flex-col gap-2 border-t border-carta/20 pt-6 md:flex-row md:items-center md:justify-between">
        <p className="tag text-carta/70">ORDITO è un brand inventato · concept di portfolio · prezzi e dati dimostrativi</p>
        <p className="tag flex gap-6">
          <TendaLink href="/privacy" className="inline-flex min-h-11 items-center hover:text-filo">
            Privacy
          </TendaLink>
          <a href={LIMITLESS} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-filo">
            Realizzato da LIMITLESS ↗
          </a>
        </p>
      </div>
    </footer>
  );
}
