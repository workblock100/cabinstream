"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Moves focus to #main on client-side route change (skips first render) so
 *  screen-reader / keyboard users land on the new page instead of <body>. */
export function RouteFocus() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const main = document.getElementById("main");
    if (main) main.focus();
  }, [pathname]);
  return null;
}
