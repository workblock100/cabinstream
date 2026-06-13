import { SERVICE_ICONS } from "./serviceIcons";
import type { Service } from "@/lib/services";

/** Renders the official brand glyph (simple-icons) or a styled wordmark fallback. */
export function ServiceLogo({ service, size = 56 }: { service: Service; size?: number }) {
  const icon = SERVICE_ICONS[service.slug];

  if (icon) {
    return (
      <svg
        role="img"
        aria-label={service.name}
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
      aria-label={service.name}
      style={{ fontSize: Math.round(size * 0.46), letterSpacing: "-0.03em" }}
      className="inline-flex items-center font-extrabold leading-none whitespace-nowrap"
    >
      {text}
    </span>
  );
}
