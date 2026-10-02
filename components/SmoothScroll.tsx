"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, prefersReduced } from "@/lib/gsap";

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

/** Lenis sincronizzato col ticker di GSAP e con ScrollTrigger. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReduced()) return;
    const l = new Lenis({ autoRaf: false, lerp: 0.11, wheelMultiplier: 0.9 });
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- istanza esterna, va esposta via context
    setLenis(l);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      setLenis(null);
    };
  }, []);

  // A ogni cambio pagina: in cima e ricalcolo dei trigger. Al primo caricamento ci pensa
  // ScrollTrigger da solo (evento load): niente refresh doppi, che su mobile costano centinaia di ms.
  const prevPath = useRef(pathname);
  useEffect(() => {
    const hash = location.hash;
    const goToHash = () => {
      const el = hash ? document.querySelector(hash) : null;
      if (!el) return;
      if (lenis) lenis.scrollTo(el as HTMLElement, { immediate: true, force: true });
      else el.scrollIntoView();
    };
    if (prevPath.current === pathname) {
      // primo caricamento (o arrivo di Lenis): solo l'eventuale ancora, dopo il load
      if (hash && document.readyState !== "complete")
        window.addEventListener("load", () => requestAnimationFrame(goToHash), { once: true });
      return;
    }
    prevPath.current = pathname;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      goToHash();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}
