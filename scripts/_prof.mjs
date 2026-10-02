import { chromium } from "playwright";
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
await cdp.send("Profiler.start");
await p.goto("http://localhost:3200/", { waitUntil: "load" });
await p.waitForTimeout(6000);
const { profile } = await cdp.send("Profiler.stop");
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map();
const dt = profile.timeDeltas;
profile.samples.forEach((id, i) => self.set(id, (self.get(id) || 0) + (dt[i] || 0)));
// tempo totale (inclusivo) per funzione
const parent = new Map();
for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
const incl = {};
for (const [id, t] of self) {
  const seen = new Set();
  let cur = id;
  while (cur) {
    const n = byId.get(cur);
    const cf = n.callFrame;
    const k = `${cf.functionName || "(anon)"} ${cf.url.split("/").pop()}:${cf.lineNumber}:${cf.columnNumber}`;
    if (!seen.has(k)) {
      incl[k] = (incl[k] || 0) + t;
      seen.add(k);
    }
    cur = parent.get(cur);
  }
}
const selfAgg = {};
for (const [id, t] of self) {
  const cf = byId.get(id).callFrame;
  const k = `${cf.functionName || "(anon)"} ${cf.url.split("/").pop()}:${cf.lineNumber}`;
  selfAgg[k] = (selfAgg[k] || 0) + t;
}
console.log("SELF");
Object.entries(selfAgg).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([k, v]) => console.log(Math.round(v / 1000), k));
console.log("INCL");
Object.entries(incl).filter(([k]) => !/^\(root\)|^\(program\)|^\(idle\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 30).forEach(([k, v]) => console.log(Math.round(v / 1000), k));
await b.close();
