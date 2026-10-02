import { chromium } from "playwright";
const b = await chromium.launch({ channel: "msedge" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("console", (m) => console.log("console:", m.type(), m.text().slice(0, 200)));
await p.goto("http://localhost:3100/", { waitUntil: "domcontentloaded" });
for (const t of [3400, 3800, 4200, 4600, 5200]) {
  await p.waitForTimeout(t === 3400 ? 3400 : 400);
  const s = await p.evaluate(() => ({ intro: !!document.getElementById("intro"), done: window.__orditoIntro, ss: sessionStorage.getItem("ordito:intro") }));
  console.log(t, JSON.stringify(s));
  await p.screenshot({ path: `screenshots/check/intro-${t}.png` });
}
await b.close();
