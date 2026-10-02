import { chromium } from "playwright";
const b = await chromium.launch({ channel: "msedge" });
for (const seen of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await p.addInitScript((seen) => {
    if (seen) sessionStorage.setItem("ordito:intro", "1");
    window.__lcp = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lcp.push([Math.round(e.startTime), e.element?.tagName, e.size, (e.element?.className || "").toString().slice(0, 40)]))).observe({ type: "largest-contentful-paint", buffered: true });
  }, seen);
  await p.goto("http://localhost:3200/", { waitUntil: "load" });
  await p.waitForTimeout(7000);
  console.log(seen ? "intro gia vista" : "con intro", JSON.stringify(await p.evaluate(() => window.__lcp)));
  await ctx.close();
}
await b.close();
