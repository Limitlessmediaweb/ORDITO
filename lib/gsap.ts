"use client";

// Registrazione unica dei plugin GSAP (tutti gratuiti da GSAP 3.13).
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    SplitText,
    ScrambleTextPlugin,
    DrawSVGPlugin,
    MorphSVGPlugin,
    MotionPathPlugin,
    Flip,
    Observer,
    CustomEase,
  );
  CustomEase.create("sarta", "0.7,0,0.2,1");
  CustomEase.create("ago", "0.22,1,0.36,1");
  gsap.defaults({ ease: "ago", duration: 1 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Query condivise per gsap.matchMedia() */
export const MQ = {
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  fine: "(pointer: fine) and (prefers-reduced-motion: no-preference)",
} as const;

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia(MQ.reduced).matches;

export { gsap, ScrollTrigger, SplitText, Flip, Observer, useGSAP };
