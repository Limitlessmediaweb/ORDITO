import FiloSpezzato from "@/components/FiloSpezzato";
import TendaLink from "@/components/TendaLink";

export default function NotFound() {
  return (
    <main id="contenuto" className="flex min-h-svh flex-col items-center justify-center px-4 pb-16 pt-24 text-center">
      <FiloSpezzato />
      <p className="tag -mt-10 text-filo md:-mt-24">Errore 404</p>
      <h1 className="mt-3 font-display text-[18vw] uppercase leading-none md:text-[9vw]">Filo spezzato.</h1>
      <p className="mt-4 max-w-sm text-base">Questa pagina non è mai stata cucita. Riprendiamo dal primo filo.</p>
      <TendaLink href="/" className="tag mt-8 inline-flex min-h-11 items-center gap-2 border-b border-current">
        Torna alla home <span className="text-filo">→</span>
      </TendaLink>
    </main>
  );
}
