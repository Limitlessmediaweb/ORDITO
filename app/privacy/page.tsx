import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy (bozza)",
  description: "Informativa privacy in bozza del concept ORDITO.",
};

export default function PrivacyPage() {
  return (
    <main id="contenuto" className="pt-28 md:pt-36">
      <article className="mx-auto max-w-2xl px-4 pb-24 md:px-0">
        <p className="tag inline-block border border-filo-ink px-2 py-1 text-filo-ink">Bozza · non definitiva</p>
        <h1 className="mt-6 font-display text-6xl uppercase leading-none md:text-8xl">Privacy</h1>
        <div className="mt-10 space-y-6 text-lg leading-relaxed">
          <p>
            ORDITO è un concept dimostrativo realizzato da LIMITLESS: non è un negozio, non vende prodotti e non raccoglie
            dati personali tramite moduli, account o pagamenti.
          </p>
          <h2 className="font-display text-3xl uppercase">Dati tecnici</h2>
          <p>
            Il sito non usa cookie di profilazione né strumenti di analisi. Il browser può conservare in locale (sessionStorage)
            un solo valore tecnico per non ripetere l&apos;animazione d&apos;apertura nella stessa sessione.
          </p>
          <h2 className="font-display text-3xl uppercase">Font e media</h2>
          <p>I caratteri tipografici e le immagini sono serviti dallo stesso dominio del sito, senza richieste a servizi terzi.</p>
          <h2 className="font-display text-3xl uppercase">Contatti</h2>
          <p>Per informazioni sul progetto: LIMITLESS. Testo da completare prima di un&apos;eventuale pubblicazione reale.</p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
