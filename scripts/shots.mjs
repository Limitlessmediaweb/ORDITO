// Screenshot Playwright in più punti dello scroll.
// Uso: node scripts/shots.mjs <url> <w>x<h> <prefisso> [y1,y2,...] (y in px o in "vh": es. 150vh)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [url = "http://localhost:3100/", vp = "1440x900", prefix = "shot", list = "0", wait = "4500"] = process.argv.slice(2);
const [w, h] = vp.split("x").map(Number);
mkdirSync("screenshots/check", { recursive: true });

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "msedge" });
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 768 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(Number(wait));
// prima interazione: rilascia le sezioni differite, poi si torna in cima
await page.mouse.move(w / 2, h / 2);
await page.mouse.wheel(0, 2);
await page.waitForTimeout(2500);
await page.evaluate(() => window.scrollTo(0, 0));
for (const raw of list.split(",")) {
  const y = raw.endsWith("vh") ? (parseFloat(raw) / 100) * h : Number(raw);
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.mouse.wheel(0, 1);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `screenshots/check/${prefix}-${raw}.png` });
}
const info = await page.evaluate(() => ({
  sw: document.documentElement.scrollWidth,
  cw: document.documentElement.clientWidth,
  sh: document.documentElement.scrollHeight,
}));
console.log(JSON.stringify(info), errors.length ? "\nERRORI:\n" + errors.slice(0, 10).join("\n") : "nessun errore");
await browser.close();
