import Link from "next/link";
import { ButtonLink } from "@/components/ui/primitives";

/**
 * Three proof-of-value case studies. Each one is a mini story with a number.
 *
 * Replace the sample companies, metrics, and names with real customer data.
 * These become the highest-converting content on the entire page because
 * they answer the #1 investor question of a solo operator: "Will it actually
 * save me time/money?"
 */

interface CaseStudy {
  name: string;
  company: string;
  problem: string;
  solution: string;
  result: string;
  metric: string;
  link: string;
}

const CASES: CaseStudy[] = [
  {
    name: "David, freelancer",
    company: "Independent media buyer",
    problem: "Waking to a $1,200 Meta burn while he slept, after falling asleep mid-campaign.",
    solution: "Set a CPA floor; AdCrewOS paused the campaign the instant the breach hit.",
    result: "Saved $1,200 in one night, on his first week of use.",
    metric: "Recovered first week's spend instantly",
    link: "/case-studies/david",
  },
  {
    name: "Sarah, e-com partner",
    company: "Growth agency",
    problem: "Spending Sundays copying metrics into Google Slides for Monday client calls.",
    solution: "Auto-generated white-label PDF reports delivered to each client inbox.",
    result: "Cut reporting time by 80% — from 4 hours to 45 minutes per client.",
    metric: "80% less reporting time",
    link: "/case-studies/sarah",
  },
  {
    name: "James, lead gen",
    company: "Lead gen agency",
    problem: "Checking 14 ad accounts and 8 business managers every morning just to stay alive.",
    solution: "Live command center + SMS alert the instant CPL breached threshold.",
    result: "Never refreshed Ads Manager manually again; acted on the push notification.",
    metric: "14 accounts, 8 managers, zero manual checks",
    link: "/case-studies/james",
  },
];

export function CaseStudies() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <Badge tone="primary" className="mb-4">Proof</Badge>
        <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
          Real operators, real results
        </h2>
        <p className="mt-3 text-muted">
          The automation pays for itself the moment a campaign turns. Here is what three solo
          operators saw in their first 30 days.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {CASES.map((c) => (
          <div
            key={c.name}
            className="flex flex-col rounded-xl border border-border bg-bg/60 p-6 transition hover:border-primary/40"
          >
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="font-semibold text-text">{c.company}</span>
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold text-text">{c.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted"><b>Problem:</b> {c.problem}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted"><b>How it fixed it:</b> {c.solution}</p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
              <span className="text-sm font-bold text-success">{c.result}</span>
            </div>
            <Link href={c.link} className="mt-4 text-sm font-semibold text-primary hover:underline">
              Read full case study
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
