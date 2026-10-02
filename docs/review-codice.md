# Code Review: ORDITO (app/, components/, lib/)

### Summary
Codice client-side senza backend né input utente. Le animazioni sono incapsulate in `useGSAP` (revert automatico), le sezioni pesanti nascono da una coda differita. Ho trovato 1 problema di correttezza e alcuni rischi minori: corretti o documentati.

### Critical Issues
| # | File | Issue | Severity | Stato |
|---|---|---|---|---|
| 1 | components/home/Intro.tsx | `useGSAP` dipende da `lenis`: se Lenis arriva dopo che l'intro è già finita (componente smontato), il setup girava con `root.current = null` | 🟡 | Corretto: guardia `if (!el) return` |
| 2 | components/home/Intro.tsx | Se il contesto viene rifatto prima della fine, la coda di init (`holdInit`) restava bloccata e le sezioni non nascevano più | 🔴 | Corretto: il cleanup chiama `releaseInit` |
| 3 | lib/deferInit.ts | I trigger creati all'avvio (tono, footer) erano ricalcolati prima dei pin differiti: posizioni sbagliate | 🔴 | Corretto: `ScrollTrigger.sort` in ordine di DOM prima del refresh |
| 4 | components/gl/GLRoot.tsx | Con `frameloop="never"` l'ultimo frame WebGL restava visibile sopra le sezioni successive | 🔴 | Corretto: canvas `visibility: hidden` quando nessuna vista è attiva |

### Suggestions
| # | File | Suggestion | Category |
|---|---|---|---|
| 1 | components/Footer.tsx | Ticker dei fili attivo solo con il footer in vista; nodi `path` rimossi nel cleanup | Performance (già fatto) |
| 2 | components/Ago.tsx | Il filo del cursore fa `setAttribute("d")` a ogni tick anche col mouse fermo: si può saltare l'aggiornamento quando i punti sono fermi | Performance (minore) |
| 3 | lib/sequence.ts | Le immagini già in download non si annullano allo smontaggio: accettabile (sono in cache per il ritorno) | Risorse |
| 4 | components/home/LookbookManifesto.tsx | `Flip.fit(..., getVars)` è calcolato all'init: in caso di resize si ricostruisce tutto via `useViewportKey` | Correttezza (gestito) |
| 5 | components/TendaLink.tsx | Promessa di navigazione con timeout di sicurezza (2,5 s): la pagina non resta mai bloccata dentro la View Transition | Robustezza (gestito) |

### Sicurezza
- Nessun `dangerouslySetInnerHTML`, nessun input, nessuna chiamata di rete a terzi (font self-hosted da `next/font`).
- Link esterno con `rel="noopener noreferrer"`. URL di LIMITLESS da variabile pubblica con default.
- `opengraph-image` legge solo file locali (`assets/`) in fase di build.

### What Looks Good
- Ogni effetto ha il suo cleanup: listener, `gsap.ticker`, ResizeObserver, IntersectionObserver.
- Animazioni solo su `transform`/`opacity`/canvas. Le eccezioni sono documentate: `clip-path` per reveal e colorway, `color` per i passi.
- `prefers-reduced-motion` gestito in ogni sezione via `gsap.matchMedia`.

### Verdict
Approve, dopo le correzioni sopra (già applicate).
