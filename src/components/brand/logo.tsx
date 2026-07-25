import { cn } from "@/lib/utils";

/** AdCrewOS wordmark + gauge mark. Used across marketing + product. */
export function Logo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect width="32" height="32" rx="8" fill="url(#acg)" />
        <path
          d="M8 21a8 8 0 0 1 16 0"
          stroke="#020617"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M16 21l5-6" stroke="#020617" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="16" cy="21" r="1.8" fill="#020617" />
        <defs>
          <linearGradient id="acg" x1="0" y1="0" x2="32" y2="32">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      {showWord && (
        <span className="font-display text-lg font-bold tracking-tight text-text">
          AdCrew<span className="text-primary">OS</span>
        </span>
      )}
    </span>
  );
}
