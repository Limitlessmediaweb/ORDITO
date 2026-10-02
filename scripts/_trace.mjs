import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await b.startTracing(p, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "v8.execute", "blink.user_timing"] });
await p.goto("http://localhost:3200/", { waitUntil: "load" });
await p.waitForTimeout(7000);
const buf = await b.stopTracing();
writeFileSync("raw-media/trace.json", buf);
const ev = JSON.parse(buf.toString()).traceEvents;
const t0 = ev.find((e) => e.name === "navigationStart")?.ts ?? ev[0].ts;
const tasks = ev.filter((e) => e.name === "RunTask" && e.dur > 80000).map((e) => ({ s: Math.round((e.ts - t0) / 1000), d: Math.round(e.dur / 1000), ts: e.ts, end: e.ts + e.dur, tid: e.tid }));
for (const t of tasks) {
  const inside = ev.filter((e) => e.tid === t.tid && e.ts >= t.ts && e.ts <= t.end && e.dur > 15000 && e.name !== "RunTask");
  const agg = {};
  for (const e of inside) {
    const k = e.name + (e.args?.data?.functionName ? ":" + e.args.data.functionName : "") + (e.args?.data?.url ? "@" + e.args.data.url.slice(-30) : "");
    agg[k] = Math.max(agg[k] || 0, Math.round(e.dur / 1000));
  }
  console.log("TASK", t.s, "ms dur", t.d, JSON.stringify(Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 8)));
}
await b.close();
