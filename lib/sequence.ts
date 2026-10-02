"use client";

/**
 * Caricatore progressivo per la sequenza a frame:
 * prima il frame 0, poi uno ogni 8, poi il resto. Il disegno usa sempre il frame
 * già caricato più vicino a quello richiesto, così lo scroll non scatta mai.
 */
export type Sequence = {
  count: number;
  frames: (HTMLImageElement | null)[];
  start: () => void;
  nearest: (i: number) => HTMLImageElement | null;
  onFrame: (cb: () => void) => void;
};

export function createSequence(base: string, count: number): Sequence {
  const frames: (HTMLImageElement | null)[] = Array(count).fill(null);
  let started = false;
  const listeners: (() => void)[] = [];

  const order: number[] = [0];
  for (let i = 8; i < count; i += 8) order.push(i);
  if (!order.includes(count - 1)) order.push(count - 1);
  for (let i = 1; i < count; i++) if (!order.includes(i)) order.push(i);

  const load = (i: number) =>
    new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.src = `${base}/${String(i).padStart(3, "0")}.webp`;
      const ok = () => {
        frames[i] = img;
        listeners.forEach((l) => l());
        resolve();
      };
      img.onload = () => (img.decode ? img.decode().then(ok, ok) : ok());
      img.onerror = () => resolve();
    });

  const start = () => {
    if (started) return;
    started = true;
    // 6 richieste in parallelo, rispettando l'ordine di priorità
    let cursor = 0;
    const worker = async () => {
      while (cursor < order.length) await load(order[cursor++]);
    };
    load(order[cursor++]).then(() => Promise.all(Array.from({ length: 6 }, worker)));
  };

  const nearest = (i: number) => {
    if (frames[i]) return frames[i];
    for (let d = 1; d < count; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  };

  return { count, frames, start, nearest, onFrame: (cb) => listeners.push(cb) };
}
