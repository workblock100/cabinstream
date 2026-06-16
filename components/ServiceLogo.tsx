import { SERVICE_ICONS } from "./serviceIcons";
import type { Service } from "@/lib/services";

/** Renders the official brand glyph (simple-icons) or a styled wordmark fallback.
 *  Pass `decorative` where the brand name is already announced by an adjacent
 *  accessible name (tile/slide/launch heading) so screen readers don't repeat it. */
export function ServiceLogo({
  service,
  size = 56,
  decorative = false,
}: {
  service: Service;
  size?: number;
  decorative?: boolean;
}) {
  const icon = SERVICE_ICONS[service.slug];

  if (icon) {
    return (
      <svg
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : service.name}
        aria-hidden={decorative || undefined}
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
      >
        <path d={icon.path} />
      </svg>
    );
  }

  const text = service.wordmark ?? service.name;
  return (
    <span
      aria-label={decorative ? undefined : service.name}
      aria-hidden={decorative || undefined}
      style={{ fontSize: Math.round(size * 0.46), letterSpacing: "-0.03em" }}
      className="inline-flex items-center font-extrabold leading-none whitespace-nowrap"
    >
      {text}
    </span>
  );
}
