"use client";

// Registro condiviso del tono (chiaro/scuro) della pagina: più sorgenti possono chiedere "scuro".
const dark = new Set<string>();

export function setTone(source: string, isDark: boolean) {
  if (isDark) dark.add(source);
  else dark.delete(source);
  document.documentElement.dataset.tone = dark.size ? "dark" : "light";
}

export function resetTone() {
  dark.clear();
  document.documentElement.dataset.tone = "light";
}
