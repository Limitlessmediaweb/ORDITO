"use client";

// Piccolo bus condiviso tra le sezioni e l'unico <Canvas> WebGL.
type Listener = () => void;
const listeners = new Set<Listener>();
const active = new Set<string>();
let needed = false;

export const glBus = {
  get needed() {
    return needed;
  },
  get active() {
    return active.size > 0;
  },
  /** una sezione chiede che il canvas venga caricato */
  need() {
    if (needed) return;
    needed = true;
    listeners.forEach((l) => l());
  },
  /** una vista è (in)visibile: il render loop gira solo se almeno una è attiva */
  setActive(id: string, on: boolean) {
    const before = active.size > 0;
    if (on) active.add(id);
    else active.delete(id);
    if (before !== active.size > 0) listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
};

export const webglOk = () => {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};
