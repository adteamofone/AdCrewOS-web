import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Ads Automation Software for Freelancers (2026)",
  description:
    "Why manual Google Ads management burns freelancers, and how automation removes the 2am budget bleed before it costs you.",
};

export default function GoogleAdsAutomationFreelancers() {
  return (
    <article>
      <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Google Ads Automation Software for Freelancers
      </h1>
      <p className="mt-3 text-muted">
        The hardest part of freelancing Google Ads isn't the bidding. It's not knowing what you
        lost while you were asleep.
      </p>

      <section className="mt-10 max-w-2xl">
        <h2 id="the-2am-leak" className="font-display text-2xl font-bold text-text">
          The 2am leak
        </h2>
        <p className="mt-2 text-muted">
          A freelancer runs one or two Google Ads accounts. A search term that used to convert
          stops working. The campaign quietly shifts spend into irrelevant queries. By 6am, that
          day's budget is gone. The freelancer never checked, because checking means eight tabs
          and twenty minutes in Analytics.
        </p>
        <p className="mt-3 text-muted">
          This is not a skill problem. It is a <b>monitoring problem</b>. And monitoring is the
          one thing the ad platforms do not do well.
        </p>
      </section>

      <section className="mt-12">
        <h2 id="what-automation-actually-means" className="font-display text-2xl font-bold text-text">
          What automation actually means for a solo operator
        </h2>
        <p className="mt-2 text-muted">
          Google and Meta ship native automation, but it is designed for the ad platform's
          own campaigns, not for the operator's workflow. The useful forms of automation for a
          freelancer are narrower and more specific:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
          <li><b>Auto-pause on a floor.</b> Set a CPC, CPA, or ROAS ceiling. The campaign pauses the instant a metric breaches — no manual refresh.</li>
          <li><b>One-tap scale.</b> When a campaign beats target, approve a 20% budget bump in under a second.</li>
          <li><b>Cross-platform view.</b> A single screen across Google and Meta so you never jump between accounts.</li>
          <li><b>Alerts, not dashboards.</b> SMS and email the moment something needs attention, with a summary of what happened.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 id="tools" className="font-display text-2xl font-bold text-text">
          What to look for
        </h2>
        <p className="mt-2 text-muted">
          When you evaluate Google Ads automation software, ignore the marketing. The claim
          "AI-powered" means almost nothing in a category where the ad platform itself already
          runs machine learning. What actually matters:
        </p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-muted">
          <li>Can it pause a campaign the instant a metric breaches, without asking?</li>
          <li>Does it show cross-platform data on one screen?</li>
          <li>Does it send alerts the moment something needs a human?</li>
          <li>Can it hand the client a report, so you are not the one building slides?</li>
        </ol>
      </section>

      <section className="mt-12">
        <h2 id="faq" className="font-display text-2xl font-bold text-text">
          FAQ
        </h2>
        <div className="mt-4 space-y-3">
          <details className="group rounded-xl border border-border transition hover:border-primary/40">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-left font-semibold">
              Do I need to connect my Google Ads account?
              <span className="text-primary transition group-open:rotate-180">▾</span>
            </summary>
            <p className="px-5 pb-4 text-sm text-muted">
              No. You can run the full product on our demo data without connecting your accounts.
              Connect OAuth in two clicks when you are ready.
            </p>
          </details>
          <details className="group rounded-xl border border-border transition hover:border-primary/40">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-left font-semibold">
              Is this better than using Google Ads scripts?
              <span className="text-primary transition group-open:rotate-180">▾</span>
            </summary>
            <p className="px-5 pb-4 text-sm text-muted">
              Scripts are a way to build a tool; they are not a tool you can hand a client. For
              a solo operator, a managed platform removes the maintenance and gives you a
              white-label report.
            </p>
          </details>
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <blockquote className="max-w-xl rounded-xl bg-surface/60 p-6 text-muted">
          "The instant push notification when my CPL spiked saved me $800 yesterday alone."
          <footer className="mt-2 text-sm text-text">— James T., lead gen agency</footer>
        </blockquote>
        <p className="mt-4 text-center text-sm text-muted">
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Start your 7-day trial
          </Link>{" "}
          — $0 for 7 days.
        </p>
      </section>
    </article>
  );
}
