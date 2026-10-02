"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, Flip, useGSAP, MQ } from "@/lib/gsap";
import { setTone } from "@/lib/tone";
import { useViewportKey } from "@/lib/useViewportKey";

const LOOKS = [
  { img: "/media/look-1.webp", alt: "Modella con la giacca imbottita nera su una scala di cemento, luce dura", cap: "Look 01 — ORD-JKT-01 · Scale" },
  { img: "/media/look-2.webp", alt: "Modella con la t-shirt pesante color carta appoggiata a un muro di cemento", cap: "Look 02 — ORD-TEE-01 · Muro" },
  { img: "/media/look-3.webp", alt: "Mani che regolano la coulisse di una giacca tecnica nera con cappuccio", cap: "Look 03 — Coulisse · Dettaglio" },
  { img: "/media/look-4.webp", alt: "Modella che cammina in un sottopassaggio con la sovracamicia in lana cotta", cap: "Look 04 — ORD-OVS-01 · Sottopasso" },
  { img: "/media/look-5.webp", alt: "Due modelli seduti su gradini di cemento con giacche tecniche e t-shirt grigie", cap: "Look 05 — Gradini" },
  { img: "/media/look-6.webp", alt: "Modella di spalle su un tetto di cemento con il cappuccio della giacca alzato", cap: "Look 06 — ORD-JKT-01 · Tetto" },
];

const RIGHE = [
  ["Non", "vendiamo", "capi", "finiti."],
  ["Mostriamo", "come", "si", "finiscono."],
];

/**
 * Cap. 6 e 7 — Lookbook e Manifesto in un unico palco fissato:
 * le foto si svelano a maschera, il testo cinetico scorre a velocità diverse,
 * l'ultima foto si rimpicciolisce (Flip) e diventa la card accanto al manifesto cucito.
 */
export default function LookbookManifesto() {
  const root = useRef<HTMLDivElement>(null);
  const vk = useViewportKey();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const { desktop, mobile } = ctx.conditions as { desktop: boolean; mobile: boolean };
        if (!desktop && !mobile) return;
        const looks = q("[data-look]");
        const inner = q("[data-look-img]");
        const caps = q("[data-look-cap]");
        const last = looks[looks.length - 1] as HTMLElement;
        const card = q("[data-card]")[0] as HTMLElement;

        gsap.set(looks.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(inner, { scale: 1.25 });
        gsap.set(caps, { autoAlpha: 0 });
        gsap.set(caps[0], { autoAlpha: 1 });
        gsap.set(q("[data-word]"), { yPercent: 105 });
        gsap.set(q("[data-dash]"), { scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(q("[data-card-cap]"), { autoAlpha: 0 });
        gsap.set(q("[data-manifesto-head]"), { autoAlpha: 0, y: 20 });

        const N = LOOKS.length;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: mobile ? "+=520%" : "+=640%",
            pin: q("[data-stage]")[0],
            scrub: mobile ? true : 0.6,
            anticipatePin: 1,
            onUpdate: (s) => setTone("lookbook", s.isActive && s.progress < 0.72),
            onToggle: (s) => !s.isActive && setTone("lookbook", false),
          },
        });

        // foto: reveal a maschera dal basso + zoom-out interno
        tl.to(inner[0], { scale: 1, duration: 1 }, 0);
        for (let i = 1; i < N; i++) {
          const at = i;
          tl.to(looks[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" }, at)
            .to(inner[i], { scale: 1, duration: 1.2 }, at)
            .to(caps[i - 1], { autoAlpha: 0, duration: 0.1 }, at)
            .to(caps[i], { autoAlpha: 1, duration: 0.1 }, at + 0.5);
        }
        // testo cinetico: tre righe a velocità diverse
        const kin = q("[data-kin]");
        tl.fromTo(kin[0], { xPercent: 0 }, { xPercent: -45, duration: N }, 0)
          .fromTo(kin[1], { xPercent: -50 }, { xPercent: -10, duration: N }, 0)
          .fromTo(kin[2], { xPercent: -5 }, { xPercent: -30, duration: N }, 0);

        // l'ultima foto si rimpicciolisce e diventa la card (Flip)
        const shrinkAt = N + 0.2;
        // Flip.fit calcola posizione e scala verso la card; l'immagine interna compensa la scala
        // non uniforme così la foto resta in "cover" senza deformarsi.
        const fit = Flip.fit(last, card, { scale: true, getVars: true }) as gsap.TweenVars;
        const sx = Number(fit.scaleX ?? 1);
        const sy = Number(fit.scaleY ?? 1);
        const cover = Math.max(sx, sy);
        tl.to(q("[data-kin-wrap], [data-look-cap]"), { autoAlpha: 0, duration: 0.25 }, shrinkAt - 0.1)
          .set(looks.slice(0, -1), { autoAlpha: 0 }, shrinkAt)
          .to(last, { ...fit, duration: 1, ease: "power2.inOut" }, shrinkAt)
          .to(inner[N - 1], { scaleX: cover / sx, scaleY: cover / sy, duration: 1, ease: "power2.inOut" }, shrinkAt)
          .to(q("[data-card-cap]"), { autoAlpha: 1, duration: 0.2 }, shrinkAt + 0.9)
          .to(q("[data-manifesto-head]"), { autoAlpha: 1, y: 0, duration: 0.3 }, shrinkAt + 0.6);

        // manifesto: il testo si "cuce" riga per riga
        let at = shrinkAt + 1.1;
        q("[data-riga]").forEach((riga) => {
          const words = riga.querySelectorAll("[data-word]");
          const dash = riga.querySelector("[data-dash]");
          tl.to(dash, { scaleX: 1, duration: 0.9, ease: "none" }, at).to(words, { yPercent: 0, duration: 0.25, stagger: 0.2, ease: "power2.out" }, at + 0.05);
          at += 1.05;
        });
        tl.to({}, { duration: 0.6 });

        return () => setTone("lookbook", false);
      });

      mm.add(MQ.reduced, () => {
        gsap.set(q("[data-look]"), { clipPath: "none" });
      });
    },
    { scope: root, dependencies: [vk], revertOnUpdate: true },
  );

  return (
    <div ref={root} id="lookbook" className="relative">
      <div data-stage className="relative h-svh overflow-hidden motion-reduce:h-auto">
        {/* ---- Cap. 7 Manifesto (sotto) ---- */}
        <section aria-labelledby="manifesto-title" className="absolute inset-0 flex flex-col justify-center bg-cemento px-5 md:px-10 motion-reduce:relative motion-reduce:py-24">
          <header data-manifesto-head className="absolute left-5 top-20 md:left-10 md:top-28">
            <p className="tag text-filo">Cap. 07</p>
            <h2 id="manifesto-title" className="mt-2 font-display text-4xl uppercase leading-none md:text-6xl">
              Manifesto
            </h2>
          </header>
          <p className="max-w-[62vw] font-display text-[13vw] uppercase leading-[0.92] md:max-w-[60vw] md:text-[6.6vw]" aria-label="Non vendiamo capi finiti. Mostriamo come si finiscono.">
            {RIGHE.map((r, i) => (
              <span key={i} data-riga aria-hidden="true" className="relative block pb-[0.12em]">
                <span className="flex flex-wrap gap-x-[0.22em]">
                  {r.map((w) => (
                    <span key={w} className="inline-block overflow-hidden pb-[0.04em]">
                      <span data-word className={`inline-block ${w.startsWith("fini") ? "text-filo" : ""}`}>
                        {w}
                      </span>
                    </span>
                  ))}
                </span>
                <span data-dash className="absolute bottom-0 left-0 h-0 w-full border-t-[3px] border-dashed border-filo" />
              </span>
            ))}
          </p>
          <div
            data-card
            className="absolute bottom-24 right-6 aspect-[4/5] w-[40vw] md:bottom-auto md:right-[8vw] md:top-1/2 md:w-[22vw] md:-translate-y-1/2"
          />
          <p data-card-cap className="tag absolute bottom-16 right-6 md:bottom-[calc(50%-17vw)] md:right-[8vw]">
            Look 06 · Tetto, luce piatta
          </p>
        </section>

        {/* ---- Cap. 6 Lookbook (sopra) ---- */}
        <section aria-labelledby="lookbook-title" className="absolute inset-0 motion-reduce:relative motion-reduce:grid motion-reduce:gap-2">
          <h2 id="lookbook-title" className="sr-only">
            Lookbook
          </h2>
          {LOOKS.map((l, i) => (
            <figure
              key={l.img}
              data-look
              className="absolute inset-0 overflow-hidden bg-grafite will-change-[clip-path] motion-reduce:relative motion-reduce:aspect-[4/5]"
            >
              <div data-look-img className="absolute inset-0">
                <Image src={l.img} alt={l.alt} fill sizes="100vw" className="object-cover" priority={false} />
              </div>
              <figcaption data-look-cap className="tag absolute bottom-6 left-5 z-[2] text-carta md:bottom-8 md:left-10">
                {i === 0 && <span className="mr-3 text-filo">Cap. 06 · Lookbook</span>}
                {l.cap} [dimostrativo]
              </figcaption>
            </figure>
          ))}
          <div data-kin-wrap aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] flex flex-col justify-center gap-[2vh] overflow-hidden mix-blend-difference text-carta motion-reduce:hidden">
            <p data-kin className="whitespace-nowrap font-display text-[24vw] uppercase leading-[0.85] md:text-[17vw]">
              Cemento · Luce dura · Cemento ·
            </p>
            <p data-kin className="whitespace-nowrap font-display text-[24vw] uppercase leading-[0.85] text-transparent [-webkit-text-stroke:1.5px_var(--carta)] md:text-[17vw]">
              Ordito · Strati · Ordito · Strati ·
            </p>
            <p data-kin className="tag whitespace-nowrap text-[3.4vw] md:text-[1.4vw]">
              {"FW—27 · 6 look · Milano · fotografia dimostrativa · ".repeat(4)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
