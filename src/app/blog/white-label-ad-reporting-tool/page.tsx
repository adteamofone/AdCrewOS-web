import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "White Label Ad Reporting Tool for Agencies (2026)",
  description:
    "Why client reporting is the highest-leverage feature for solo operators who want more clients — and how white-label PDF reports close the deal.",
};

export default function WhiteLabelAdReportingTool() {
  return (
    <article>
      <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
        White Label Ad Reporting Tool for Agencies
      </h1>
      <p className="mt-3 text-muted">
        The fastest way to get a new client is not a better ad. It is a better report.
      </p>

      <section className="mt-10 max-w-2xl">
        <h2 id="the-leverage" className="font-display text-2xl font-bold text-text">
          The leverage
        </h2>
        <p className="mt-2 text-muted">
          Solo operators do not win on bids. They win on trust, and trust is built in the
          monthly client call. If you are the one pasting metrics into Google Slides, you look
          like a freelancer. If you send a branded report that looks like it came from a
          dedicated team, you look like an operator.
        </p>
        <p className="mt-3 text-muted">
          That is the highest-leverage feature in the category. It is not the auto-pause, not
          the scale. It is the report that carries <b>your</b> logo, <b>your</b> tone, and that
          lands in the client's inbox before 7am.
        </p>
      </section>

      <section className="mt-12">
        <h2 id="why-white-label" className="font-display text-2xl font-bold text-text">
          Why white-label matters
        </h2>
        <p className="mt-2 text-muted">
          Most reporting tools brand the output with their own name. That is fine for the tool,
          but it tells your client "I use a third-party product." With a white-label report you
          keep the relationship, not just the data. Your client never sees a third-party brand,
          so they never think of it as a cost line.
        </p>
      </section>

      <section className="mt-12">
        <h2 id="what-a-good-report-does" className="font-display text-2xl font-bold text-text">
          What a good report does
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
          <li>Shows spend, ROAS, and CPA in one screen — no more than three numbers per campaign.</li>
          <li>Highlights the one thing that happened this week, not a ten-page data dump.</li>
          <li>Contains a recommendation, not just data. The client pays for your judgment, not for numbers.</li>
          <li>Is delivered automatically, so it arrives on time every time.</li>
        </ul>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <p className="text-muted">
          Ready to send reports that win clients?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Start your 7-day trial
          </Link>
          {" "}— $0 for 7 days, cancel anytime.
        </p>
      </section>
    </article>
  );
}
