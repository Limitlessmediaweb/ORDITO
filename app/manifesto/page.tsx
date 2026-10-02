import type { Metadata } from "next";
import SplitTitle from "@/components/SplitTitle";
import Cucito from "@/components/Cucito";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "Non vendiamo capi finiti. Mostriamo come si finiscono. Il manifesto di ORDITO.",
};

const PRINCIPI = [
  ["01", "Materiali dichiarati", "Ogni capo porta scritto cosa contiene e quanto pesa. Grammatura, fibra, provenienza."],
  ["02", "Lavorazione esposta", "Mostriamo i pezzi prima che diventino un capo: tagli, cuciture, strati."],
  ["03", "Pochi capi, rifatti", "Una collezione corta che cambia piano piano, invece di tante che cambiano in fretta."],
  ["04", "Riparabile", "Cuciture accessibili, componenti sostituibili. Un capo finito si può ancora rifinire."],
];

export default function ManifestoPage() {
  return (
    <main id="contenuto" className="pt-28 md:pt-36">
      <section className="px-4 md:px-10">
        <p className="tag text-filo-ink">Manifesto · ORDITO</p>
        <SplitTitle className="mt-4 font-display text-[17vw] uppercase leading-[0.86] md:text-[11vw]">
          Mostriamo come si finiscono.
        </SplitTitle>
      </section>

      <section aria-label="Testo del manifesto" className="px-4 py-24 md:px-10 md:py-40">
        <Cucito
          className="max-w-[18ch] font-display text-[12vw] uppercase leading-[0.95] md:text-[6.4vw]"
          righe={[
            "L'ordito sono i fili tesi del telaio.",
            "Tutto il resto ci passa sopra e sotto.",
            "Non vendiamo capi finiti.",
            "Mostriamo come si finiscono.",
          ]}
        />
      </section>

      <section aria-labelledby="principi" className="border-t border-grafite/15 px-4 py-20 md:px-10">
        <h2 id="principi" className="tag text-gesso-ink">
          Principi
        </h2>
        <ol className="mt-8 grid gap-10 md:grid-cols-4 md:gap-8">
          {PRINCIPI.map(([n, t, d]) => (
            <li key={n} className="crocini relative border-t border-grafite pt-6">
              <p className="font-mono text-sm text-filo-ink">{n}</p>
              <h3 className="mt-3 font-display text-3xl uppercase leading-none">{t}</h3>
              <p className="mt-3 max-w-xs text-base leading-snug">{d}</p>
            </li>
          ))}
        </ol>
        <p className="tag mt-16 text-gesso-ink">ORDITO è un brand inventato, creato come concept da LIMITLESS.</p>
      </section>
      <Footer />
    </main>
  );
}
