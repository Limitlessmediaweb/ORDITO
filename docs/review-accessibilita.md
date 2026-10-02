# Accessibility Audit: ORDITO
**Standard:** WCAG 2.1 AA | **Data:** 2026-10-02

Metodo: Lighthouse (mobile) su `/`, `/capo/giacca-trama`, `/capo/t-shirt-peso`, `/manifesto`, `/privacy`; navigazione da tastiera con Playwright; controllo manuale di contrasti, alt text, ruoli e `prefers-reduced-motion`. Non è stato fatto un test con screen reader reale (VoiceOver/NVDA): resta da fare.

### Summary
**Problemi trovati:** 8 | **Critici:** 1 | **Maggiori:** 4 | **Minori:** 3. Tutti corretti.

### Findings

#### Perceivable
| # | Issue | WCAG | Severity | Fix applicato |
|---|---|---|---|---|
| 1 | Testo piccolo rosso `#E8432E` su cemento: 2.7:1 | 1.4.3 | 🔴 | Token `filo-ink` #A63019 (4.7:1) per tutto il testo rosso su fondi chiari |
| 2 | Passi della maglietta inattivi a opacità 0.25 (1.7:1) | 1.4.3 | 🟡 | Colore gesso scuro #5F5B54 (4.6:1) al posto dell'opacità |
| 3 | Legenda dell'esploso su mobile: testo chiaro sopra la luce chiara | 1.4.3 | 🟡 | Luce ridotta su mobile e legenda sopra il fondo grafite |
| 4 | Etichette tecniche a 11 px | 1.4.4 (leggibilità) | 🟢 | Portate a 12 px |

#### Operable
| # | Issue | WCAG | Severity | Fix applicato |
|---|---|---|---|---|
| 5 | Card nella collezione orizzontale: il focus poteva finire fuori schermo | 2.4.7 / 2.4.3 | 🟡 | Al `focusin` la pagina scorre fino a portare la card in vista |
| 6 | Il retro delle card si vedeva solo al passaggio del mouse | 2.1.1 | 🟡 | Pulsante "Retro/Fronte" raggiungibile da tastiera anche su desktop (visibile al focus) |
| 7 | Link del menu alti ~30 px | 2.5.5 | 🟢 | `min-h-11` (44 px) |

#### Robust
| # | Issue | WCAG | Severity | Fix applicato |
|---|---|---|---|---|
| 8 | `aria-label` su `span`/`p` generati da SplitText (ruolo non valido) | 4.1.2 | 🟢 | `aria-label` sull'`h1`, SplitText con `aria: "none"`; manifesto con testo `sr-only` |

### Color Contrast Check
| Elemento | Primo piano | Sfondo | Rapporto | Richiesto | Esito |
|---|---|---|---|---|---|
| Testo corrente | #141414 | #D9D6D0 | 13.9:1 | 4.5:1 | ✅ |
| Tag gesso scuro | #5F5B54 | #D9D6D0 | 4.6:1 | 4.5:1 | ✅ |
| Tag rosso (chiaro) | #A63019 | #D9D6D0 | 4.7:1 | 4.5:1 | ✅ |
| Tag rosso (scuro) | #E8432E | #141414 | 4.6:1 | 4.5:1 | ✅ |
| Testo su grafite | #F4F1EA | #141414 | 16.9:1 | 4.5:1 | ✅ |

### Keyboard Navigation
| Elemento | Ordine | Invio/Spazio | Note |
|---|---|---|---|
| "Salta al contenuto" | 1 | va a `#contenuto` | visibile al focus |
| Header (logo, 3 voci) | 2–5 | navigano | focus rosso visibile |
| "Salta" intro | 6 | chiude l'intro | |
| Card: titolo → colori (radio) → Retro | 7+ | cambia colore / gira | i colori sono un `radiogroup` con `aria-checked` |
| Footer | in fondo | | |

### Screen Reader
| Elemento | Annunciato come | Note |
|---|---|---|
| Esploso (canvas) | immagine: "La giacca ORD-JKT-01 si scompone nei suoi sette componenti…" | le etichette sono anche testo vero |
| Maglietta (SVG) | immagine con descrizione del processo | |
| Materia | elenco `sr-only` dei 4 tessuti | i marquee sono `aria-hidden` |
| Elementi decorativi (filo, metro, cursore, intro) | nascosti | `aria-hidden` |

### Movimento
Con `prefers-reduced-motion`: niente intro animata (solo dissolvenza), niente sequenza a frame (immagine finale statica con etichette), niente WebGL, niente Lenis, pin disattivati dove possibile, View Transition in dissolvenza.
