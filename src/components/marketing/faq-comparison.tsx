"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/primitives";

/**
 * Two things that remove friction before signup:
 *   1) An FAQ that answers the objections travel agencies have
 *   2) A comparison table that separates you from the "just use Excel" crowd
 *
 * Keep these short and specific. For an audit, the reader counts as a
 * first-time visitor who is on the fence.
 */

const FAQS = [
  {
    q: "How is this different from just leaving my ads on autopilot in Ads Manager?",
    a:
      "Meta and Google have basic automated rules, but nothing except AdCrewOS also scales your winners and sends you a white-label report. Ads Manager will also happily keep burning budget on a campaign that just stopped working.",
  },
  {
    q: "Can I keep using my own ad accounts?",
    a: "Yes. We connect via Google Ads and Meta Ads APIs. If you can't use OAuth, you can skip the connect and run the full product on our demo data.",
  },
  {
    q: "What happens if it pauses the wrong campaign?",
    a: "You can't be wrong. Every action is visible in the live command center, and scale approvals require a one-tap yes. You stay in control at all times.",
  },
  {
    q: "What does the 7-day trial cost?",
    a: "Nothing. $0 for 7 days. No credit card, no lock-in, cancel anytime. The free Watchdog plan is free forever.",
  },
  {
    q: "Do you handle the client reports?",
    a: "Yes. On the Agency plan and above, every client report is branded with your logo and sent to their inbox — you never see a third-party tool's name.",
  },
];

const COMPARISON = [
  {
    name: "Spreadsheets",
    price: "Free",
    stop: "Manual, slow, you miss breaches",
    auto: "No",
    reports: "Yes, but it eats your Sunday",
  },
  {
    name: "Google / Meta rules",
    price: "Free (in-platform)",
    stop: "Basic; no cross-platform view",
    auto: "Limited",
    reports: "No — you build it",
  },
  {
    name: "AdZooma / Synter",
    price: "$0–$29/mo",
    stop: "Good for solo; no white-label reports",
    auto: "Yes",
    reports: "No",
  },
  {
    name: "AdCrewOS",
    price: "$89/mo",
    stop: "Cross-platform + white-label reports + live command center",
    auto: "Yes (auto-pause + one-tap scale)",
    reports: "Yes, white-label PDF",
  },
];

export function FaqAndComparison() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <Badge tone="primary" className="mb-4">FAQ</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((f, i) => (
              <div
                key={f.q}
                className="border border-border rounded-xl transition hover:border-primary/40"
              >
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="font-semibold text-text">{f.q}</span>
                  <span className={`text-primary transition ${open === i ? "rotate-180" : ""}`}>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.23 8.25a.75.75 0 0 1 .02-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Badge tone="primary" className="mb-4">Comparison</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Spreadsheets are the niche
          </h2>
          <p className="mt-3 text-muted">
            Everyone says "just use a spreadsheet." Here is what that costs you, and exactly what
            AdCrewOS adds.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-semibold text-text">Approach</th>
                  <th className="pb-3 font-semibold text-text">Price</th>
                  <th className="pb-3 font-semibold text-text">Stops budget bleed?</th>
                  <th className="pb-3 font-semibold text-text">Automates decisions?</th>
                  <th className="pb-3 font-semibold text-text">Client reports?</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((r) => (
                  <tr key={r.name} className="border-b border-border last:border-0">
                    <td className="py-3 font-semibold text-text">{r.name}</td>
                    <td className="py-3 text-muted">{r.price}</td>
                    <td className="py-3 text-muted">{r.stop}</td>
                    <td className="py-3 text-muted">{r.auto}</td>
                    <td className="py-3 text-muted">{r.reports}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ButtonLink href="/signup" className="mt-6 w-full" size="lg">
            Start your 7-day trial
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
