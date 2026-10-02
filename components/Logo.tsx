import { forwardRef, type SVGProps } from "react";
import { LOGO } from "@/lib/logo-data";

type Props = SVGProps<SVGSVGElement> & { title?: string };

/** Wordmark ORDITO: la prima O è un filo rosso avvolto, le altre lettere sono vettoriali (Anton). */
const Logo = forwardRef<SVGSVGElement, Props>(function Logo({ title = "ORDITO", ...rest }, ref) {
  return (
    <svg ref={ref} viewBox={LOGO.viewBox} role="img" aria-label={title} {...rest}>
      <path
        data-coil
        d={LOGO.coil}
        fill="none"
        stroke="var(--filo)"
        strokeWidth={LOGO.strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path data-tail d={LOGO.tail} fill="none" stroke="var(--filo)" strokeWidth={LOGO.strokeW} strokeLinecap="round" />
      <g fill="currentColor">
        {LOGO.letters.slice(1).map((l, i) => (
          <path key={i} data-letter d={l.d} />
        ))}
      </g>
    </svg>
  );
});

export default Logo;
