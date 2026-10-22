import { Badge } from "@/components/ui/primitives";

/**
 * App screenshots placeholder.
 *
 * Place 2-4 actual screenshots of your app into the `/public` folder and
 * point the `src` at them. Screenshots of the real product are the single
 * highest-conviction trust signal on a SaaS landing page.
 *
 * Recommended frames for the hero:
 *   1. The live command center (alerts + auto-pause + scale)
 *   2. The threshold stepper (set your floor)
 *   3. The white-label report editor (your logo, PDF)
 *
 * Replace the `src` values with real screenshots. Do NOT use a placeholder
 * box if you can avoid it — a real screenshot beats any stock image.
 */

export function Screenshots() {
  const frames = [
    {
      title: "Live command center",
      sub: "One screen across Google & Meta: spend, alerts, and auto-actions in real time.",
      src: "/screenshots/command-center.png",
    },
    {
      title: "Set your lines",
      sub: "Per account, pick CPC, CPA or ROAS and set a protective floor and a scale trigger.",
      src: "/screenshots/thresholds.png",
    },
    {
      title: "White-label client reports",
      sub: "Send branded PDF reports with your logo — not ours — so clients never see a third-party brand.",
      src: "/screenshots/reports.png",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <Badge tone="primary" className="mb-4">The product, in under 4 minutes</Badge>
        <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
          You set the rules. It runs the floor.
        </h2>
        <p className="mt-3 text-muted">
          Add your Google &amp; Meta accounts, pick your thresholds, and watch it work. No
          spreadsheet, no tab fatigue, no 2am trips to Ads Manager.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {frames.map((f) => (
          <div
            key={f.title}
            className="overflow-hidden rounded-xl border border-border bg-bg"
          >
            <img
              src={f.src}
              alt={f.title}
              className="h-auto w-full object-contain px-4 py-8"
              width={1200}
              height={630}
            />
            <div className="p-4">
              <h3 className="font-display text-lg font-semibold text-text">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
