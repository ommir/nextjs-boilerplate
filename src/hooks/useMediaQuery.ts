"use client";

import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query and re-render on change.
 * @param query e.g. "(min-width: 768px)".
 * @returns whether the query currently matches (false during SSR).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const update = () => setMatches(mediaQueryList.matches);

    update();
    mediaQueryList.addEventListener("change", update);
    return () => mediaQueryList.removeEventListener("change", update);
  }, [query]);

  return matches;
}
