import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CAPI, getCapo, euro } from "@/lib/capi";
import CapoCard from "@/components/CapoCard";
import SplitTitle from "@/components/SplitTitle";
import SchedaTecnica from "@/components/capo/SchedaTecnica";
import EsplosoStrati from "@/components/capo/EsplosoStrati";
import Esploso from "@/components/home/Esploso";
import Reveal from "@/components/Reveal";
import Footer from "@/components/Footer";
import TendaLink from "@/components/TendaLink";

export function generateStaticParams() {
  return CAPI.filter((c) => c.pagina).map((c) => ({ slug: c.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/capo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const capo = getCapo(slug);
  if (!capo) return {};
  return {
    title: `${capo.nome} ${capo.codice}`,
    description: `${capo.nome}: ${capo.materiale} ${capo.grammatura}. ${capo.descrizione}`,
  };
}

export default async function CapoPage({ params }: PageProps<"/capo/[slug]">) {
  const { slug } = await params;
  const capo = getCapo(slug);
  if (!capo || !capo.pagina) notFound();
  const i = CAPI.findIndex((c) => c.slug === slug);
  const next = CAPI.filter((c) => c.pagina)[(CAPI.filter((c) => c.pagina).findIndex((c) => c.slug === slug) + 1) % 3];

  const gallery = [
    { src: capo.colorway[0].img, alt: `${capo.nome}, ${capo.colorway[0].nome.toLowerCase()}, fronte` },
    { src: capo.retro, alt: `${capo.nome}, retro` },
    { src: capo.colorway[1].img, alt: `${capo.nome}, ${capo.colorway[1].nome.toLowerCase()}, fronte` },
  ];

  return (
    <main id="contenuto">
      <section className="grid min-h-svh gap-10 px-4 pb-16 pt-24 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16 md:px-10 md:pt-28">
        <div className="md:sticky md:top-24 md:self-start">
          <CapoCard capo={capo} eager />
        </div>
        <div className="flex flex-col">
          <p className="tag text-filo-ink">
            {capo.codice} · {String(i + 1).padStart(2, "0")}/06
          </p>
          <SplitTitle className="mt-3 font-display text-[18vw] uppercase leading-[0.86] md:text-[8.5vw]">{capo.nome}</SplitTitle>
          <p className="mt-6 max-w-md text-lg leading-snug">{capo.descrizione}</p>
          <p className="mt-6 font-mono text-xl">
            {euro(capo.prezzo)} <span className="tag text-gesso-ink">prezzo dimostrativo</span>
          </p>
          <h2 className="tag mt-14 text-gesso-ink">Scheda tecnica</h2>
          <div className="mt-3">
            <SchedaTecnica righe={capo.scheda} codice={capo.codice} />
          </div>
          <p className="tag mt-6 text-gesso-ink">Concept: questo capo non è in vendita.</p>
        </div>
      </section>

      {capo.slug === "giacca-trama" ? <Esploso corto /> : <EsplosoStrati strati={capo.strati} nome={capo.nome} />}

      <section aria-labelledby="galleria" className="px-4 py-20 md:px-10 md:py-32">
        <h2 id="galleria" className="font-display text-4xl uppercase md:text-6xl">
          Galleria
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
          {gallery.map((g, k) => (
            <li key={g.src} className={k === 1 ? "md:mt-24" : undefined}>
              <Reveal className="aspect-[3/4] bg-[#cfccc6]">
                <div className="relative size-full">
                  <Image src={g.src} alt={g.alt} fill sizes="(max-width: 768px) 92vw, 30vw" className="object-cover" />
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-grafite/15 px-4 py-16 md:px-10">
        <p className="tag text-gesso-ink">Prossimo capo</p>
        <TendaLink
          href={`/capo/${next.slug}`}
          className="group mt-2 inline-flex items-baseline gap-4 font-display text-[14vw] uppercase leading-none md:text-[7vw]"
        >
          {next.nome}
          <span className="text-filo-ink transition-transform duration-500 group-hover:translate-x-3">→</span>
        </TendaLink>
      </section>
      <Footer />
    </main>
  );
}
