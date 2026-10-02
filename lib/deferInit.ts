"use client";

import { ScrollTrigger } from "@/lib/gsap";

/**
 * Coda di inizializzazione per le sezioni sotto la piega.
 * Le timeline con pin costano (ScrollTrigger le "prova" a inizio e fine per misurarle):
 * invece di crearle tutte insieme all'avvio, una per volta nei momenti liberi,
 * in ordine di pagina, con un solo refresh finale. L'intro trattiene la coda finché non finisce.
 */
type Job = { run: () => void; cancelled: boolean };
const queue: Job[] = [];
let holds = 0;
let pumping = false;

const later = (cb: () => void) => {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 400 });
  else setTimeout(cb, 32);
};

function pump() {
  if (pumping || holds > 0) return;
  pumping = true;
  let ran = false;
  const step = () => {
    if (holds > 0) {
      pumping = false;
      return;
    }
    const job = queue.shift();
    if (!job) {
      pumping = false;
      if (ran) ScrollTrigger.refresh();
      return;
    }
    if (!job.cancelled) {
      job.run();
      ran = true;
    }
    later(step);
  };
  later(step);
}

export function deferInit(run: () => void) {
  const job: Job = { run, cancelled: false };
  queue.push(job);
  pump();
  return () => {
    job.cancelled = true;
  };
}

export function holdInit() {
  holds++;
}

export function releaseInit() {
  holds = Math.max(0, holds - 1);
  pump();
}

/**
 * Rilascia la coda alla prima interazione (scroll, tocco, tasto) oppure dopo qualche secondo
 * di quiete: il lavoro pesante non si sovrappone all'ingresso dell'hero.
 */
export function releaseAfterQuiet(ms = 6000) {
  const evts = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    clearTimeout(id);
    evts.forEach((e) => window.removeEventListener(e, go));
    releaseInit();
  };
  const id = window.setTimeout(go, ms);
  evts.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
}
