import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { LOGO } from "@/lib/logo-data";

export const alt = "ORDITO — Ogni capo inizia da un filo. Concept di LIMITLESS.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const anton = await readFile(join(process.cwd(), "assets/Anton-Regular.ttf"));
const jacket = `data:image/png;base64,${(await readFile(join(process.cwd(), "assets/og-jacket.png"))).toString("base64")}`;

const logoSvg = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO.viewBox}"><path d="${LOGO.coil}" fill="none" stroke="#E8432E" stroke-width="${LOGO.strokeW}" stroke-linecap="round"/><path d="${LOGO.tail}" fill="none" stroke="#E8432E" stroke-width="${LOGO.strokeW}" stroke-linecap="round"/><g fill="#141414">${LOGO.letters
    .slice(1)
    .map((l) => `<path d="${l.d}"/>`)
    .join("")}</g></svg>`,
).toString("base64")}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#D9D6D0", position: "relative", fontFamily: "Anton" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, height: 3, background: "#E8432E", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", width: 760 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSvg} width={300} height={Math.round((300 * LOGO.height) / LOGO.width)} alt="" />
          <div style={{ display: "flex", flexDirection: "column", fontSize: 104, lineHeight: 0.9, color: "#141414", textTransform: "uppercase" }}>
            <span>Ogni capo</span>
            <span>inizia da un filo.</span>
          </div>
          <span style={{ fontSize: 22, letterSpacing: 4, color: "#5f5b54" }}>CONCEPT — LIMITLESS</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={jacket} height={560} style={{ position: "absolute", right: 70, top: 36 }} alt="" />
      </div>
    ),
    { ...size, fonts: [{ name: "Anton", data: anton, style: "normal", weight: 400 }] },
  );
}
