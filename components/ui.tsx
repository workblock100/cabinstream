import type { SVGProps } from "react";

/** CabinStream brand lockup. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden>
        <defs>
          <linearGradient id="cs-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect x="4" y="9" width="40" height="30" rx="9" fill="url(#cs-logo)" />
        <path d="M20 18.5v11l9-5.5z" fill="#07090d" />
      </svg>
      <span className="text-h3 font-semibold tracking-tight">
        Cabin<span className="brand-text">Stream</span>
      </span>
    </div>
  );
}

type IconProps = SVGProps<SVGSVGElement>;
const base = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const PlayIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor" stroke="none">
    <path d="M7 5v14l12-7z" />
  </svg>
);
export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
export const BackIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
export const ArrowOutIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);
export const SignOutIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M16 17l5-5-5-5M21 12H9M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
  </svg>
);
export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={2.5}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={2.4}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={2.4}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const SkipNextIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M5 5v14l10-7z" />
    <rect x="16.5" y="5" width="2.5" height="14" rx="1.1" />
  </svg>
);
export const ChevronUpIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={2.4}>
    <path d="m6 15 6-6 6 6" />
  </svg>
);
export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={2.4}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const ShuffleIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M16 3h5v5" />
    <path d="M4 20 21 3" />
    <path d="M21 16v5h-5" />
    <path d="M15 15l6 6" />
    <path d="M4 4l5 5" />
  </svg>
);
export const SettingsIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);
