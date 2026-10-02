// Registra i video per i social con Playwright (Edge), poi li converte in MP4 H.264 yuv420p.
// Uso: node scripts/record.mjs [base-url]   (default http://localhost:3200)
import { chromium } from "playwright";
import { mkdirSync, renameSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BASE = process.argv[2] ?? "http://localhost:3200";
mkdirSync("screenshots", { recursive: true });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "msedge" });

/** Scorre in modo fluido, a velocità costante (px/s), dentro la pagina. */
async function glide(page, from, to, pxPerSec) {
  await page.evaluate(
    ({ from, to, pxPerSec }) =>
      new Promise((resolve) => {
        let y = from;
        let last = performance.now();
        const step = (now) => {
          const dt = Math.min(50, now - last);
          last = now;
          y = Math.min(to, y + (pxPerSec * dt) / 1000);
          window.scrollTo(0, y);
          if (y >= to) resolve();
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    { from, to, pxPerSec },
  );
}

async function record({ name, viewport, scale, mobile, run }) {
  const dir = `screenshots/_rec-${name}`;
  rmSync(dir, { recursive: true, force: true });
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    isMobile: mobile,
    hasTouch: mobile,
    recordVideo: { dir, size: { width: viewport.width * scale, height: viewport.height * scale } },
  });
  const page = await ctx.newPage();
  await run(page);
  const video = page.video();
  await ctx.close();
  const src = await video.path();
  renameSync(src, `screenshots/${name}.webm`);
  rmSync(dir, { recursive: true, force: true });
  // via l'ultimo mezzo secondo (chiusura del contesto = frame nero)
  const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `screenshots/${name}.webm`]).toString());
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", `screenshots/${name}.webm`, "-t", String(Math.max(1, dur - 0.6)),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "18",
    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-movflags", "+faststart",
    `screenshots/${name}.mp4`,
  ]);
  console.log("ok", name);
}

// 1. Home mobile: intro + scroll lento di tutta la home
await record({
  name: "home-mobile",
  viewport: { width: 390, height: 844 },
  scale: 2,
  mobile: true,
  run: async (page) => {
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(5600); // intro
    await page.mouse.wheel(0, 1); // prima interazione: prepara le sezioni
    await page.waitForTimeout(1800);
    const end = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    await glide(page, 0, end, 520);
    await page.waitForTimeout(1500);
  },
});

// 2. Esploso desktop: solo capitoli 2 e 3
await record({
  name: "esploso-desktop",
  viewport: { width: 1440, height: 900 },
  scale: 1,
  mobile: false,
  run: async (page) => {
    await page.addInitScript(() => sessionStorage.setItem("ordito:intro", "1"));
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 1);
    await page.waitForTimeout(3500); // sequenza a frame in cache
    const [from, to] = await page.evaluate(() => {
      const a = document.getElementById("anatomia").getBoundingClientRect().top + scrollY;
      const m = document.getElementById("materia").getBoundingClientRect().top + scrollY;
      return [a - innerHeight * 0.4, m - innerHeight * 0.5];
    });
    await page.evaluate((y) => window.scrollTo(0, y), from);
    await page.waitForTimeout(1200);
    await glide(page, from, to, 380);
    await page.waitForTimeout(1200);
  },
});

await browser.close();
