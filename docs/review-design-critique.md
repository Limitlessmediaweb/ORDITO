# Design Critique: ORDITO (concept)

Fonte: screenshot Playwright 1440×900 e 390×844 su tutti i capitoli (inizio, metà e fine dei pin).

### Overall Impression
Il racconto funziona: intro tessuta → giacca che si apre → maglietta tagliata e cucita → materia al buio. Il linguaggio "tavola tecnica" (quote, codici, crocini, metro) è coerente ovunque. La debolezza maggiore era il mobile: alcune leggibilità e composizioni pensate prima per desktop.

### Usability
| Finding | Severity | Recommendation |
|---|---|---|
| Esploso mobile: nomi della legenda in carta sopra la parte bassa (chiara) della luce diffusa: illeggibili | 🔴 | Ridurre l'estensione verticale della luce su mobile e dare alla legenda un fondo grafite |
| Voci di menu nell'header alte ~30 px: sotto i 44 px consigliati per il tocco | 🟡 | `min-h-11` sui link |
| Prezzo nelle card mobile va a capo ("€ / 340") | 🟡 | `whitespace-nowrap` |
| Il "filo" globale passa sopra i contenuti: su mobile può disturbare la lettura | 🟢 | Opacità ridotta su mobile (già 25%) |

### Visual Hierarchy
- **Cosa attira l'occhio**: su desktop il titolo gigante con la giacca davanti, corretto. Su mobile titolo e giacca erano impilati senza sovrapposizione, quindi l'effetto "giacca davanti al titolo" si perdeva.
- **Flusso di lettura**: capitolo (tag rosso) → titolo display → contenuto animato. Chiaro e ripetuto in ogni sezione.
- **Enfasi**: giusta. Il rosso è usato solo per filo, codici e parole chiave.

### Consistency
| Element | Issue | Recommendation |
|---|---|---|
| Rosso | `#E8432E` su cemento non regge il testo piccolo (2.7:1) | Token `filo-ink` (#A63019) per il testo su fondi chiari, `filo` per fili, linee e testo su grafite (già applicato) |
| Etichette tecniche | Corpi tra 0.6 e 0.7 rem | Minimo 0.65 rem su mobile |

### Accessibility
- **Contrasto**: AA su tutti i testi dopo il fix di `filo-ink` (Lighthouse a11y 100).
- **Target touch**: pallini colorway 44 px ✔, link footer 44 px ✔, menu header da portare a 44 px.
- **Leggibilità**: ok. Display grande con line-height stretto, mono per i dati.

### What Works Well
- La continuità hero → esploso: è la stessa giacca, e la scena si "spegne" in grafite con la luce diffusa.
- La maglietta in SVG racconta tutto il processo senza una foto: è il pezzo più "ma come hanno fatto".
- Il Flip dall'ultima foto del lookbook alla card del manifesto lega due capitoli senza stacco.

### Priority Recommendations
1. **Legenda esploso su mobile leggibile.** È il cuore del capitolo più importante.
2. **Composizione hero mobile.** Titolo più grande e giacca sovrapposta alla seconda riga, così si ritrova lo strato "giacca davanti al titolo".
3. **Target touch e prezzi**: piccoli fix di robustezza.
