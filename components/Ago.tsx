"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

const N = 22; // punti del filo

/** Spline Catmull-Rom → curve di Bézier cubiche. */
function spline(p: { x: number; y: number }[]) {
  let d = `M${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Cursore: un ago con un filo rosso che lo segue in ritardo. Solo con puntatore fine. */
export default function Ago() {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.fine, () => {
        const svg = root.current!;
        const needle = svg.querySelector<SVGGElement>("[data-needle]")!;
        const thread = svg.querySelector<SVGPathElement>("[data-thread]")!;
        document.documentElement.classList.add("has-ago");
        gsap.set(svg, { autoAlpha: 1 });

        const mouse = { x: innerWidth / 2, y: innerHeight / 2, seen: false };
        const pts = Array.from({ length: N }, () => ({ x: mouse.x, y: mouse.y }));
        const nx = gsap.quickTo(needle, "x", { duration: 0.12, ease: "power3" });
        const ny = gsap.quickTo(needle, "y", { duration: 0.12, ease: "power3" });
        const rot = gsap.quickTo(needle, "rotation", { duration: 0.5, ease: "power3" });
        let lastX = mouse.x;

        const move = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          mouse.x = e.clientX;
          mouse.y = e.clientY;
          if (!mouse.seen) {
            mouse.seen = true;
            pts.forEach((p) => ((p.x = mouse.x), (p.y = mouse.y)));
            gsap.set(needle, { x: mouse.x, y: mouse.y });
          }
          nx(mouse.x);
          ny(mouse.y);
          rot(gsap.utils.clamp(-25, 25, (mouse.x - lastX) * 1.2));
          lastX = mouse.x;
        };
        const over = (e: Event) => {
          const t = (e.target as HTMLElement).closest("a,button,[data-cursor]");
          gsap.to(needle, { scale: t ? 1.5 : 1, duration: 0.35, overwrite: "auto" });
        };

        const tick = () => {
          // la cruna dell'ago (in alto a destra) è il punto da cui parte il filo
          const nxv = Number(gsap.getProperty(needle, "x"));
          const nyv = Number(gsap.getProperty(needle, "y"));
          const a = ((20 + Number(gsap.getProperty(needle, "rotation"))) * Math.PI) / 180;
          const s = 28.5 * Number(gsap.getProperty(needle, "scale"));
          pts[0].x = nxv + Math.sin(a) * s;
          pts[0].y = nyv - Math.cos(a) * s;
          for (let i = 1; i < N; i++) {
            const a = pts[i - 1];
            const b = pts[i];
            b.x += (a.x - b.x) * 0.32;
            b.y += (a.y - b.y) * 0.32 + 0.6; // un filo di gravità
          }
          thread.setAttribute("d", spline(pts));
        };

        window.addEventListener("pointermove", move, { passive: true });
        document.addEventListener("pointerover", over, { passive: true });
        gsap.ticker.add(tick);
        return () => {
          window.removeEventListener("pointermove", move);
          document.removeEventListener("pointerover", over);
          gsap.ticker.remove(tick);
          document.documentElement.classList.remove("has-ago");
          gsap.set(svg, { autoAlpha: 0 });
        };
      });
    },
    { scope: root },
  );

  return (
    <svg
      ref={root}
      aria-hidden="true"
      className="pointer-events-none invisible fixed inset-0 z-[80] h-full w-full opacity-0"
    >
      <path data-thread fill="none" stroke="var(--filo)" strokeWidth="1.4" strokeLinecap="round" />
      <g data-needle>
        {/* ago: punta in (0,0), cruna in alto */}
        <g transform="rotate(20)">
          <path d="M0 0 L2.2 -26 Q2.4 -32 0 -33 Q-2.4 -32 -2.2 -26 Z" fill="var(--ink, #141414)" />
          <ellipse cx="0" cy="-28.5" rx="0.9" ry="2.6" fill="var(--cemento)" />
        </g>
      </g>
    </svg>
  );
}
