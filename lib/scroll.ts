/** scrollTo that respects prefers-reduced-motion — an instant jump for users
 *  who opted out of motion (matters for passengers prone to car motion
 *  sickness, the whole in-drive use case). Mirrors the reduced-motion gating
 *  already used in Hero.tsx and app/globals.css. */
export function comfortScrollTo(top: number): void {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}
