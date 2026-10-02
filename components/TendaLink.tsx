"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentProps } from "react";

// Promessa risolta quando la nuova rotta è stata montata (vedi <TendaSignal/>).
let resolvePending: (() => void) | null = null;

/** Da montare una volta nel layout: segnala alla transizione che la nuova pagina è pronta. */
export function TendaSignal() {
  const pathname = usePathname();
  useEffect(() => {
    resolvePending?.();
    resolvePending = null;
  }, [pathname]);
  return null;
}

/**
 * Link con transizione "tendina di tessuto" (View Transitions API sul root):
 * la nuova pagina scende dall'alto con un bordo a frange. Senza supporto o con
 * reduced motion si comporta come un normale <Link>.
 */
export default function TendaLink({ href, onClick, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const url = new URL(href, location.href);
        if (url.origin !== location.origin || url.pathname === pathname) return;
        if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        e.preventDefault();
        document.documentElement.classList.add("vt-tenda");
        const vt = document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              resolvePending = resolve;
              router.push(url.pathname + url.search + url.hash);
              // rete di sicurezza: non bloccare mai la pagina
              setTimeout(resolve, 2500);
            }),
        );
        vt.finished.finally(() => document.documentElement.classList.remove("vt-tenda"));
      }}
    />
  );
}
