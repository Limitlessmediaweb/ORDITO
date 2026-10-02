"use client";

import { useEffect, useState } from "react";

/** Chiave che cambia quando la larghezza della finestra cambia (debounce), per ricostruire timeline con misure fisse. */
export function useViewportKey(delay = 250) {
  const [key, setKey] = useState(0);
  useEffect(() => {
    let w = innerWidth;
    let id = 0;
    const on = () => {
      clearTimeout(id);
      id = window.setTimeout(() => {
        if (innerWidth !== w) {
          w = innerWidth;
          setKey((k) => k + 1);
        }
      }, delay);
    };
    window.addEventListener("resize", on);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", on);
    };
  }, [delay]);
  return key;
}
