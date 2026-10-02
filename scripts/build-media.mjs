// Pipeline media: sequenza a frame della giacca + immagini ottimizzate in WebP.
// Uso: node scripts/build-media.mjs   (richiede ffmpeg nel PATH e i sorgenti in raw-media/)
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const RAW = "raw-media";
const OUT = "public/media";
const tmp = `${RAW}/frames`;

// ---------- 1. Sequenza esploso ----------
if (existsSync(`${RAW}/explode.mp4`)) {
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `${RAW}/explode.mp4`, `${tmp}/f%04d.png`]);
  const src = readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
  const last = src.length - 1;

  // Mappatura non lineare: il video apre la giacca in fretta tra i frame ~56 e ~92,
  // quindi quel tratto riceve metà dei frame (e metà dello scroll).
  const knots = [
    [0, 0],
    [0.25, 56],
    [0.75, 92],
    [1, last],
  ];
  const sourceAt = (u) => {
    for (let i = 1; i < knots.length; i++) {
      const [u0, s0] = knots[i - 1];
      const [u1, s1] = knots[i];
      if (u <= u1) return Math.round(s0 + ((u - u0) / (u1 - u0)) * (s1 - s0));
    }
    return last;
  };

  const variants = [
    { dir: "d", count: 120, height: 1600, quality: 72 },
    { dir: "m", count: 60, height: 900, quality: 66 },
  ];
  for (const v of variants) {
    const dir = `${OUT}/jacket-seq/${v.dir}`;
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (let i = 0; i < v.count; i++) {
      const s = sourceAt(i / (v.count - 1));
      await sharp(`${tmp}/${src[s]}`)
        .resize({ height: v.height })
        .webp({ quality: v.quality, effort: 5 })
        .toFile(`${dir}/${String(i).padStart(3, "0")}.webp`);
    }
    console.log(`jacket-seq/${v.dir}: ${v.count} frame`);
  }
  // Colore di fondo del video (per allineare il cemento della sezione)
  const { data } = await sharp(`${tmp}/${src[0]}`).extract({ left: 8, top: 8, width: 16, height: 16 }).raw().toBuffer({ resolveWithObject: true });
  console.log("bg rgb", data[0], data[1], data[2]);
  // Poster per reduced-motion: ultimo frame (pezzi sospesi)
  await sharp(`${tmp}/${src[sourceAt(0.75)]}`).resize({ height: 1600 }).webp({ quality: 78 }).toFile(`${OUT}/jacket-exploded.webp`);
}

// ---------- 2. Immagini ----------
const images = [
  // [sorgente, destinazione, larghezza, qualità]
  ["jacket-cut.png", "jacket-cut.webp", 1200, 80],
  ["exploded.png", "exploded.webp", 1200, 78],
  ["fab-ripstop.png", "fab-ripstop.webp", 1600, 72],
  ["fab-jersey.png", "fab-jersey.webp", 1600, 72],
  ["fab-imbottitura.png", "fab-imbottitura.webp", 1600, 72],
  ["fab-lana.png", "fab-lana.webp", 1600, 72],
  ...[1, 2, 3, 4, 5, 6].map((n) => [`look-${n}.png`, `look-${n}.webp`, 1600, 74]),
  ...["jacket", "tee", "overshirt", "pants", "gilet", "hoodie"].flatMap((p) => [
    [p === "jacket" ? "jacket.png" : `p-${p}.png`, `capi/${p}-a.webp`, 1100, 76],
    [`p-${p}-back.png`, `capi/${p}-back.webp`, 1100, 76],
    [`p-${p}-b.png`, `capi/${p}-b.webp`, 1100, 76],
  ]),
];
mkdirSync(`${OUT}/capi`, { recursive: true });
const sizes = {};
for (const [from, to, w, q] of images) {
  if (!existsSync(`${RAW}/${from}`)) {
    console.warn("manca", from);
    continue;
  }
  const info = await sharp(`${RAW}/${from}`).resize({ width: w, withoutEnlargement: true }).webp({ quality: q, effort: 5 }).toFile(`${OUT}/${to}`);
  sizes[to] = [info.width, info.height];
}
writeFileSync("lib/media-sizes.json", JSON.stringify(sizes, null, 2));
console.log("immagini:", Object.keys(sizes).length);
