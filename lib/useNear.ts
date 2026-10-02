"use client";

import { useEffect, useState, type RefObject } from "react";

/** true quando l'elemento entra (con margine) vicino al viewport; resta true. */
export function useNear(ref: RefObject<Element | null>, rootMargin = "100% 0px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, near]);
  return near;
}
