import TendaLink from "./TendaLink";
import Logo from "./Logo";

const NAV = [
  { href: "/#collezione", label: "Collezione" },
  { href: "/#materia", label: "Materia" },
  { href: "/manifesto", label: "Manifesto" },
];

export default function Header() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex items-start justify-between pl-4 pr-[calc(var(--metro)+0.75rem)] pt-4 text-[var(--ink)] transition-colors duration-500 md:pl-8 md:pr-[calc(var(--metro)+1.5rem)] md:pt-6">
      <a href="#contenuto" className="sr-only-focusable pointer-events-auto absolute left-4 top-16 bg-grafite px-3 py-2 text-carta tag">
        Salta al contenuto
      </a>
      <TendaLink href="/" aria-label="ORDITO, torna alla home" className="pointer-events-auto block">
        <Logo data-header-logo title="ORDITO" className="h-7 w-auto md:h-9" />
      </TendaLink>
      <nav aria-label="Principale" className="pointer-events-auto">
        <ul className="flex gap-4 md:gap-8">
          {NAV.map((n) => (
            <li key={n.href}>
              <TendaLink href={n.href} className="tag group relative inline-flex min-h-11 items-center">
                {n.label}
                <span className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-filo transition-transform duration-500 ease-[var(--ease-sarta)] group-hover:scale-x-100" />
              </TendaLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
