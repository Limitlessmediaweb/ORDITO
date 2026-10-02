// Genera il wordmark ORDITO: lettere vettorializzate da Anton + "O" iniziale fatta da un filo avvolto.
// Output: lib/logo-data.ts (per i componenti animati) e public/brand/logo.svg (file statico).
import opentype from "opentype.js";
import { readFileSync, writeFileSync } from "node:fs";

const font = opentype.parse(readFileSync(new URL("./Anton-Regular.ttf", import.meta.url)).buffer);
const SIZE = 1000;
const TRACK = 40;
const word = "ORDITO";
const asc = font.ascender * (SIZE / font.unitsPerEm);

let x = 0;
const letters = [];
for (const ch of word) {
  const g = font.charToGlyph(ch);
  const p = g.getPath(x, asc, SIZE);
  const bb = p.getBoundingBox();
  letters.push({ char: ch, d: p.toPathData(1), x: bb.x1, y: bb.y1, w: bb.x2 - bb.x1, h: bb.y2 - bb.y1 });
  x += g.advanceWidth * (SIZE / font.unitsPerEm) + TRACK;
}
const width = Math.ceil(x - TRACK);
const top = Math.floor(Math.min(...letters.map((l) => l.y)));
const bottom = Math.ceil(Math.max(...letters.map((l) => l.y + l.h)));
const pad = 30;

// Filo avvolto che sostituisce la prima O: spirale ellittica che riempie la fascia della lettera.
const o = letters[0];
const cx = o.x + o.w / 2;
const cy = o.y + o.h / 2;
const band = o.w * 0.3; // spessore del tratto della O di Anton (circa)
const turns = 5;
const steps = turns * 48;
const pts = [];
for (let i = 0; i <= steps; i++) {
  const t = (i / steps) * turns * Math.PI * 2 + Math.PI * 0.32 - turns * Math.PI * 2;
  const k = i / steps;
  // il raggio sale dall'interno all'esterno della fascia, con una leggera irregolarità da filo vero
  const wob = Math.sin(k * 37) * band * 0.035;
  const rx = o.w / 2 - band * 0.9 + k * band * 0.82 + wob;
  const ry = o.h / 2 - band * 0.9 + k * band * 0.82 + wob;
  pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]);
}
// coda libera: esce in basso a destra e scende sotto la linea di base
const last = pts[pts.length - 1];
let coil = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
for (let i = 1; i < pts.length; i++) coil += `L${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
const tail = `M${last[0].toFixed(1)} ${last[1].toFixed(1)}C${(last[0] + o.w * 0.12).toFixed(1)} ${(last[1] + o.h * 0.08).toFixed(1)} ${(o.x + o.w * 1.0).toFixed(1)} ${(bottom + 30).toFixed(1)} ${(o.x + o.w * 1.32).toFixed(1)} ${(bottom + 34).toFixed(1)}`;
const strokeW = +((band / turns) * 0.62).toFixed(1);

const viewBox = `${-pad} ${top - pad} ${width + pad * 2} ${bottom - top + pad * 2 + 40}`;
const data = {
  viewBox,
  width: width + pad * 2,
  height: bottom - top + pad * 2 + 40,
  coil,
  tail,
  strokeW,
  letters: letters.map((l, i) => ({ char: l.char, d: l.d, x: +l.x.toFixed(1), w: +l.w.toFixed(1), coil: i === 0 })),
};

writeFileSync(
  new URL("../lib/logo-data.ts", import.meta.url),
  `// File generato da scripts/build-logo.mjs: non modificare a mano.\nexport const LOGO = ${JSON.stringify(data, null, 2)} as const;\n`,
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="ORDITO">
  <title>ORDITO</title>
  <path d="${coil}" fill="none" stroke="#E8432E" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${tail}" fill="none" stroke="#E8432E" stroke-width="${strokeW}" stroke-linecap="round"/>
  <g fill="#141414">${letters.slice(1).map((l) => `<path d="${l.d}"/>`).join("")}</g>
</svg>
`;
writeFileSync(new URL("../public/brand/logo.svg", import.meta.url), svg);
console.log("logo ok", viewBox, "stroke", strokeW);
