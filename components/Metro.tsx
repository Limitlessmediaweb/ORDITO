"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const CM = 150; // un metro da sarta
const PX = 36; // pixel per centimetro

/** Barra di avanzamento: un metro da sarta che scorre sotto un indice rosso. */
export default function Metro() {
  const tape = useRef<SVGSVGElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const setY = gsap.quickSetter(tape.current, "y", "px");
      const update = (p: number) => setY(innerHeight / 2 - p * CM * PX);
      update(0);
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress),
      });
    },
    { scope: wrap },
  );

  const ticks = [];
  for (let mm = 0; mm <= CM * 10; mm += 10) {
    const y = (mm / 10) * PX;
    const cm = mm % 10 === 0;
    const five = mm % 50 === 0;
    if (five) ticks.push(<line key={mm} x1="0" x2="11" y1={y} y2={y} />);
    if (cm && mm > 0)
      ticks.push(
        <text key={`t${mm}`} x="16" y={y + 3} textAnchor="middle" className={five ? "fill-filo" : undefined}>
          {mm / 10}
        </text>,
      );
  }

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="pointer-events-none fixed right-0 top-0 z-[55] h-svh w-[var(--metro)] overflow-hidden border-l border-grafite/20 bg-[#ece6d6]/90"
    >
      <svg
        ref={tape}
        width="30"
        height={CM * PX + 2}
        className="absolute left-0 top-0 stroke-grafite font-mono text-[9px] [&_text]:fill-grafite [&_text]:stroke-none"
        strokeWidth="1"
      >
        <defs>
          <pattern id="metro-mm" width="30" height={PX} patternUnits="userSpaceOnUse">
            <path d={`M0 0.5H8M0 ${PX / 2 + 0.5}H4`} stroke="var(--grafite)" />
          </pattern>
        </defs>
        <rect width="12" height={CM * PX + 2} fill="url(#metro-mm)" stroke="none" />
        {ticks}
      </svg>
      <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-filo" />
    </div>
  );
}
