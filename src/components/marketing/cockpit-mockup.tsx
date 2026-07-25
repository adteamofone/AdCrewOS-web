import { Badge } from "@/components/ui/primitives";

/**
 * Abstract "pro cockpit" dashboard mockup — pure CSS/SVG data viz, no stock
 * photography. Used as the hero visual.
 */
export function CockpitMockup() {
  const bars = [38, 52, 44, 61, 48, 70, 58, 82, 64, 91, 76, 88];
  const line = [30, 42, 36, 55, 60, 52, 68, 74, 66, 80, 88, 84];
  const w = 320;
  const h = 90;
  const pts = line
    .map((v, i) => `${(i / (line.length - 1)) * w},${h - (v / 100) * h}`)
    .join(" ");

  return (
    <div className="glow-primary rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        </div>
        <Badge tone="success">● Live · auto-pilot on</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Spend today", value: "$1,284", tone: "text-text" },
          { label: "ROAS", value: "4.6x", tone: "text-success" },
          { label: "CPA", value: "$31.40", tone: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-bg/60 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted">{s.label}</div>
            <div className={`mt-1 font-display text-xl font-bold ${s.tone}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-bg/60 p-3">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
          {bars.map((b, i) => (
            <rect
              key={i}
              x={(i / bars.length) * w + 3}
              y={h - (b / 100) * h}
              width={w / bars.length - 6}
              height={(b / 100) * h}
              rx="2"
              fill="rgba(14,165,233,0.18)"
            />
          ))}
          <polyline points={pts} fill="none" stroke="#22c55e" strokeWidth="2.5" />
        </svg>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3 rounded-lg border border-error/30 bg-error/10 p-2.5 text-sm">
          <span className="font-semibold text-error">Auto-paused</span>
          <span className="text-muted">Search · CPA hit $88 → killed the bleed</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 p-2.5 text-sm">
          <span className="text-muted">
            <span className="font-semibold text-primary">Scale ready</span> · Advantage+ beat 4.2x
          </span>
          <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-text-invert">
            +20%
          </span>
        </div>
      </div>
    </div>
  );
}
