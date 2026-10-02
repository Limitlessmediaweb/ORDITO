# ORDITO — Ogni capo inizia da un filo.

Concept di sito-esperienza per un brand italiano di abbigliamento tecnico-urbano **inventato**, realizzato da LIMITLESS per portfolio e social. Mostra come sono fatti i capi: scorrendo, si scompongono nei loro pezzi e si ricompongono. Niente e-commerce: prezzi, codici, grammature e dati sono dimostrativi.

## Avvio

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint
```

Variabili d'ambiente (opzionali):
- `NEXT_PUBLIC_LIMITLESS_URL` (default `https://www.limitlessmedia.it`): link del credito nel footer
- `NEXT_PUBLIC_SITE_URL`: URL assoluto usato per `metadataBase` e Open Graph

Script di supporto:
- `node scripts/build-logo.mjs`: rigenera il wordmark (`public/brand/logo.svg` e `lib/logo-data.ts`) da Anton
- `node scripts/build-media.mjs`: rigenera sequenza a frame e WebP da `raw-media/` (richiede ffmpeg; `raw-media/` non è versionata)
- `node scripts/shots.mjs <url> <w>x<h> <prefisso> <y1,y2,…>`: screenshot Playwright in più punti dello scroll
- `node scripts/record.mjs [url]`: registra i video social in `screenshots/` e li converte in MP4 H.264 yuv420p

Playwright usa **Microsoft Edge** (`channel: "msedge"`): il download di Chromium andava in timeout su questa macchina. Si può cambiare con `PW_CHANNEL=chrome`.

## Stack

Next.js 16.3 (App Router, Turbopack) · React 19.2 · TypeScript · Tailwind CSS 4 (token in `@theme`) · GSAP 3.15 con `@gsap/react` (ScrollTrigger, SplitText, ScrambleText, DrawSVG, MorphSVG, MotionPath, Flip, CustomEase: tutti gratuiti dalla 3.13, verificato) · Lenis · Three.js con `@react-three/fiber` e `@react-three/drei` (un solo `<Canvas>`, `View`) · `next/font` · `next/image`.

## Struttura

| Percorso | Cosa |
|---|---|
| `app/page.tsx` | Home: Intro → Hero → Anatomia (esploso) → Maglietta → Materia → Collezione → Lookbook + Manifesto → Footer |
| `app/capo/[slug]` | 3 capi (giacca, t-shirt, sovracamicia): card colorway, scheda tecnica animata, esploso corto, galleria |
| `app/manifesto`, `app/privacy` (bozza), `app/not-found.tsx` ("Filo spezzato.") | |
| `app/opengraph-image.tsx` | Immagine OG generata (wordmark + giacca) |
| `components/home/*` | I capitoli |
| `components/gl/*` | Canvas WebGL condiviso e vista del tessuto con shader |
| `lib/deferInit.ts` | Coda di inizializzazione differita delle sezioni pesanti |
| `lib/sequence.ts` | Preload progressivo della sequenza a frame |
| `docs/` | Review: design, accessibilità, codice |

## Esploso: piano A o B?

**Piano A: sequenza a frame su `<canvas>`.** Il video generato (start = giacca intera, end = vista esplosa, camera fissa) è coerente: stessa giacca, stessa luce, nessun taglio. Ha un solo difetto: l'apertura avviene quasi tutta tra i frame ~56 e ~92. Per questo la pipeline rimappa i frame in modo non lineare (metà dei frame e metà dello scroll vanno al tratto veloce). Così lo scroll resta uniforme.

- 120 frame WebP a 1600 px di altezza (desktop, 7,6 MB) e 60 frame a 900 px (mobile, 1,6 MB).
- Preload: frame 0, poi uno ogni 8, poi il resto, con 6 richieste in parallelo. Il disegno usa sempre il frame già caricato più vicino: niente scatti né buchi.
- La ricomposizione è la stessa sequenza al contrario (il video inverso generato non serve: stesso risultato a metà peso).

Il piano B (R3F 2.5D con PNG scontornati) non è servito. Sono stati generati 2 componenti di prova su 7 (guscio e imbottitura, in `raw-media/`), i prompt degli altri sono sotto. Per le pagine di t-shirt e sovracamicia, che non hanno un video, c'è un "esploso corto" 2.5D in CSS 3D (`components/capo/EsplosoStrati.tsx`).

## Asset (Higgsfield)

Generati con Higgsfield MCP (GPT Image 2.5, qualità alta, 2K; video FLUX 3 Video 1080p, 6 s, senza audio). Sorgenti in `raw-media/` (non versionata), versioni ottimizzate in `public/media/`.

| Asset | File | Prompt (sintesi fedele) |
|---|---|---|
| Giacca intera | `jacket.png` → `jacket-cut.webp` (scontornata con `remove_background`) | *Studio product photograph, ghost mannequin technical urban jacket, front view, centered. Black matte nylon ripstop padded jacket, horizontal quilted baffles, two-way zip closed, hood with drawcords, adjustable cuffs, chest zip pocket, small woven red label at left hem. Uniform concrete-grey seamless background #D9D6D0, soft diffused side light, catalog, 85mm.* |
| Vista esplosa (end frame) | `exploded.png` | *Exploded view of the EXACT same jacket (riferimento: giacca intera), same framing/background/light: outer shell, white quilted padding, grey lining, detached hood, zip strip, two cuffs, red label, floating and aligned on the vertical axis, soft shadows, no text.* |
| Video esploso | `explode.mp4` → `jacket-seq/` | *Locked-off static camera… the jacket smoothly deconstructs into its components like an animated engineering exploded diagram: hood lifts, zip slides forward, shell parts, padding and lining separate in depth, cuffs detach, red label floats. Slow, mechanical, centered.* (start = giacca, end = esploso) |
| Video inverso | `6f945b9b-…` su Higgsfield | Stesso prompt al contrario (end → start). Non usato, vedi sopra |
| Componenti (piano B) | `comp-shell.png`, `comp-padding.png` | *Isolated product cutout on fully transparent background: ONLY the [outer shell / white diamond-quilted padding] of the jacket from the reference…* Da generare se servisse il piano B: `hood`, `zip`, `lining`, `cuffs`, `label` con lo stesso prompt |
| Macro tessuti ×4 | `fab-*.webp` | *Extreme macro photograph of* black nylon ripstop (griglia) / heavyweight off-white cotton jersey (maglie a V, orlo a doppio ago) / white synthetic padding fibers da una cucitura trapuntata / charcoal boiled wool con un filo rosso in diagonale, *soft raking side light, fills the frame* |
| Lookbook ×6 | `look-1…6.webp` | *Editorial fashion photograph, vertical 4:5,* modelli con capi ORDITO su scale, muri, sottopassi, gradini e tetti di cemento, *hard light, muted cement palette, medium format film look* |
| Collezione ×18 | `capi/*-a`, `*-back`, `*-b` | Ghost mannequin con lo stesso set della giacca: t-shirt heavy, sovracamicia in lana cotta, pantalone tecnico, gilet trapuntato, felpa. Per ognuno: fronte, retro (riferimento: fronte) e secondo colore (riferimento: fronte) |

Crediti spesi: circa 180 su 1200.

## Decisioni

- **Cartella**: il progetto sta in `Desktop/SITI WEB/ordito-site`, accanto agli altri siti LIMITLESS.
- **Skill**: `frontend-design` non è installata, quindi saltata. Usate: `modern-web-guidance` (View Transitions), `design:design-critique`, `design:accessibility-review`, `engineering:code-review`. I report sono in `docs/`.
- **Rosso testo**: `#E8432E` resta il colore di fili e linee. Per il testo su fondi chiari si usa `filo-ink` `#A63019` (4,7:1 su cemento, AA), sul grafite il rosso originale (4,6:1).
- **Fondo cemento ↔ grafite**: un velo fisso grafite la cui *opacità* segue lo scroll (niente transizioni di `background-color`). Il tono di header, badge e cursore passa da un registro condiviso (`lib/tone.ts`).
- **Esploso al buio**: il fondo grigio del video non si può scontornare bene (ombre morbide, imbottitura bianca). La scena allora si spegne in grafite e il fotogramma resta dentro una "luce diffusa" dello stesso grigio, con i bordi sfumati. Su mobile la luce è più bassa, per non coprire la legenda.
- **Maglietta**: tutta in SVG nel viewBox 1000×1000. Laser con MotionPath, cuciture tratteggiate svelate da una maschera disegnata con DrawSVG, colletto che si chiude con MorphSVG, serigrafia in 3 passaggi con racla e fuori registro. Su mobile: niente pezzo "dietro", 4 cuciture invece di 9, zoom sulla maglia assemblata.
- **Materia**: un solo `<Canvas>` fisso (drei `View`), caricato con `dynamic import` solo quando la sezione è a 1,5 viewport. Il render loop gira solo con la sezione attiva e il canvas viene nascosto fuori sezione. Lo shader fa una "mano" gaussiana che spinge il tessuto, con pieghe e luce radente. Il cambio di tessuto si sfilaccia lungo fili verticali (l'ordito). Su touch l'effetto è guidato dalla velocità di scroll e si spegne da solo.
- **Lookbook + Manifesto**: un unico palco fissato, così il Flip dell'ultima foto nella card è continuo. La foto si scala con i valori di `Flip.fit` e l'immagine interna compensa la scala non uniforme, quindi resta in "cover" senza deformarsi.
- **Colorway**: maschera circolare con `clip-path: circle()` che parte dal pallino premuto. È l'unica animazione non transform/opacity insieme ai reveal a maschera del lookbook: è solo paint, non layout.
- **Transizione pagine**: View Transitions API sul *root* (`document.startViewTransition` + `router.push`). La nuova pagina scende come una tendina con il bordo a frange (maschera SVG animata con `@property`). Il componente React `<ViewTransition>` avrebbe applicato la tendina a snapshot alti quanto tutta la pagina. Senza supporto, o con reduced motion, è un link normale.
- **Prestazioni**:
  - le sezioni con pin più pesanti (esploso, maglietta, materia, collezione, lookbook) si creano dopo l'intro, una per volta nei momenti liberi, in ordine di pagina, con un solo refresh finale (`lib/deferInit.ts`);
  - le immagini nascoste (fallback di Materia, colorway, retro) si montano solo in prossimità;
  - la sequenza parte alla prima interazione;
  - i pannelli dell'intro sono opachi al 99,5% per non coprire del tutto l'hero.
- **Hero mobile**: titolo e giacca impilati invece che sovrapposti. A 390 px la giacca è larga quanto lo schermo e coprirebbe tutto il titolo.
- **Metro da sarta**: occupa una colonna fissa a destra, e `main` riserva quello spazio (`--metro`), così non copre i contenuti.
- **Frame a 1600/900 px di altezza**: il video è 1216×1632, quindi la versione desktop non viene ingrandita.

## Verifica

| Controllo | Risultato |
|---|---|
| `npm run build` / `npm run lint` / `tsc` | puliti |
| Lighthouse mobile home (simulato, 3 run) | **Performance 87–89**, Accessibilità 100, Best practices 96, SEO 63 (solo per il `noindex` voluto) |
| Metriche | LCP osservato 0,25–0,33 s (simulato ~3,5 s, effetto del modello Lantern sul JS di idratazione), TBT 150–180 ms, CLS ≈ 0,0003 |
| Peso iniziale | **422 KB** prima dello scroll (obiettivo < 1,5 MB) |
| Accessibilità altre pagine | 100 su capo, manifesto, privacy |
| Scroll orizzontale indesiderato | nessuno (`scrollWidth = 390` su mobile) |
| Screenshot | 390×844 e 1440×900 in più punti di ogni capitolo (`screenshots/check`, non versionata) |
| Video | `screenshots/home-mobile.mp4` (780×1688, 44 s) e `screenshots/esploso-desktop.mp4` (1440×900, 26 s), H.264 yuv420p |

Con throttling CPU reale ×4 (`--throttling-method=devtools`) la home scende molto, perché la costruzione delle timeline con pin costa. Il dato è indicativo: va verificato su un iPhone reale (vedi sotto).

## Cosa migliorare

1. **Test su iPhone reale** (Safari): fluidità dei pin, View Transition (Safari ≥ 18) e WebGL. Le misure qui sono di Edge in emulazione.
2. **Costo dei pin**: le timeline della maglietta (MotionPath + DrawSVG) e del lookbook si possono "precuocere" (lunghezze dei path calcolate a build time) per ridurre l'init.
3. **Esploso**: generare il video con uno sfondo neutro più facile da scontornare (o con alpha), per avere la giacca "nel buio" senza luce diffusa.
4. **Piano B completo**: generare gli altri 5 componenti PNG e tenere l'esploso 2.5D come fallback per i dispositivi lenti (`deviceMemory` basso).
5. **Audio** opzionale (forbici, macchina da cucire) con un toggle.
6. **Contenuti**: privacy definitiva, Instagram reale, testi revisionati da un copywriter.
7. **Screen reader**: test reale con VoiceOver/NVDA (finora solo audit automatico e da tastiera).
