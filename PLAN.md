# ORDITO — Piano di lavoro

Concept per il portfolio LIMITLESS. Sito-esperienza, niente e-commerce reale.

## Task

- [x] 1. Setup: Next.js (App Router, TS, Tailwind v4 `@theme`), GSAP + @gsap/react, Lenis, R3F/drei, font (Anton, Space Grotesk, JetBrains Mono), git.
- [x] 2. Asset Higgsfield: giacca intera, frame esploso, video esploso (start→end) + inverso, 7 componenti con sfondo rimosso, 4 macro tessuti, 6 lookbook.
- [x] 3. Pipeline media: script ffmpeg → `public/media/jacket-seq/{d,m}/` (120 frame 1600px / 60 frame 900px, WebP), immagini ottimizzate in WebP.
- [x] 4. Fondamenta: token in `@theme`, layout (lang it, metadata, noindex, OG generata), Lenis↔ScrollTrigger, registrazione plugin GSAP, matchMedia (mobile/desktop/reduced).
- [x] 5. Globali: wordmark SVG (`public/brand/logo.svg`), header, badge "Concept – LIMITLESS", filo rosso trasversale, cursore ago+filo, metro da sarta (progress), transizione pagina (View Transitions, tendina tessuto).
- [x] 6. Cap. 0 Intro: filo → ordito → trama → wordmark → Flip nell'header → sipario. "Salta", sessionStorage, reduced-motion = dissolvenza.
- [x] 7. Cap. 1 Hero: giacca che respira, titolo SplitText dietro, tilt al cursore (desktop), "Scorri per aprirla" con freccia cucita.
- [x] 8. Cap. 2 Esploso: canvas a frame (piano A) con preload progressivo, etichette con linee di quota DrawSVG + ScrambleText, cemento→grafite, contatore, ricomposizione. Piano B: R3F 2.5D con PNG componenti.
- [x] 9. Cap. 3 T-shirt SVG: rotolo, laser, pezzi, cuciture, volume, serigrafia, etichetta. Versione mobile semplificata.
- [x] 10. Cap. 4 Materia: 4 macro full-screen, shader displacement (R3F, `View` condivisa, dynamic import, pausa fuori schermo), marquee opposti.
- [x] 11. Cap. 5 Collezione: scroll orizzontale, TiltCard, retro con Flip, colorway con maschera circolare.
- [x] 12. Cap. 6 Lookbook: reveal clip-path, testo cinetico parallax, ultima immagine → card (Flip).
- [x] 13. Cap. 7 Manifesto (testo cucito) + Cap. 8 Footer (wordmark che si sfilaccia, credito LIMITLESS).
- [x] 14. Pagine: `/capo/[slug]` (3 capi), `/manifesto`, `/privacy` (bozza), 404 "Filo spezzato.".
- [x] 15. Verifica: build + lint, screenshot Playwright 390/1440 in più punti, video webm → mp4, overflow orizzontale.
- [x] 16. Review con skill (design-critique, accessibility-review, code-review) e correzioni.
- [x] 17. README (avvio, asset/prompt, piano A/B, decisioni, migliorie), riepilogo.

## Piani B
- Esploso: se la sequenza video non è coerente (deformazioni, camera che si muove) → R3F 2.5D con PNG.
- Shader materia: se pesante/instabile → clip-path + scale CSS al cursore.
- Fili del footer: se la fisica scatta → lettere che si separano con quickTo senza fili.

## Stato
Tutti i task completati il 2026-10-02. Esploso: piano A (sequenza a frame). Dettagli e decisioni nel README.
