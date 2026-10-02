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
      if (ran) refreshInPageOrder();
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

/**
 * I trigger creati prima delle sezioni differite (tono, footer…) vanno ricalcolati DOPO i pin
 * che stanno sopra di loro nella pagina: si ordinano per posizione nel DOM, i pin prima.
 */
export function refreshInPageOrder() {
  ScrollTrigger.sort((a: ScrollTrigger, b: ScrollTrigger) => {
    const ta = a.trigger as Element | undefined;
    const tb = b.trigger as Element | undefined;
    if (!ta || !tb) return ta ? 1 : tb ? -1 : 0;
    if (ta === tb || ta.contains(tb) || tb.contains(ta)) return (b.pin ? 1 : 0) - (a.pin ? 1 : 0);
    return ta.compareDocumentPosition(tb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
  ScrollTrigger.refresh();
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
