import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad Budget Automation Software: What to Automate First",
  description:
    "The three biggest leaks in small ad spend — and the exact automation you need to stop them before they cost you.",
};

export default function AdBudgetAutomationSoftware() {
  return (
    <article>
      <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Ad Budget Automation Software: What to Automate First
      </h1>
      <p className="mt-3 text-muted">
        Budget automation is not about being clever with bids. It is about not losing money to
        things that are obvious, but slow, to catch.
      </p>

      <section className="mt-10 max-w-2xl">
        <h2 id="three-leaks" className="font-display text-2xl font-bold text-text">
          The three leaks
        </h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-muted">
          <li>
            <b>Overnight spend bleed.</b> A campaign that turns at 2am keeps burning until
            morning. This is the one that pays for automation on day one.
          </li>
          <li>
            <b>Inefficient bids on a turning campaign.</b> When a campaign stops converting,
            every extra dollar is wasted. Automation shrinks the window to zero.
          </li>
          <li>
            <b>Reporting hell.</b> Spending your weekly evening copying metrics into slides
            instead of finding the next win.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 id="in-order" className="font-display text-2xl font-bold text-text">
          In this order
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-muted">
          <li>
            <b>Set a protective floor.</b> Pick CPC, CPA, or ROAS per account. Let the tool
            pause the moment a breach hits. This is the single highest-leverage action.
          </li>
          <li>
            <b>Approve scale with one tap.</b> When performance beats target, scale it up by
            20%. The alternative is watching the money ride away.
          </li>
          <li>
            <b>Automate the client report.</b> Send a branded PDF to your clients before 7am.
            That is your best sales tool.
          </li>
        </ol>
      </section>

      <section className="mt-12">
        <h2 id="how-automation-saves-money" className="font-display text-2xl font-bold text-text">
          How it saves money
        </h2>
        <p className="mt-2 text-muted">
          The math is simple. If a campaign bleeds $100 overnight, or burns $200 on a
          non-converting search term while you were asleep, no amount of evening work fixes
          that. Automation prevents the loss. The question is not whether you can afford a tool
          — it is whether you can afford to stay manual.
        </p>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <p className="text-muted">
          See how this works in practice:{" "}
          <Link href="/blog/best-software-for-solo-ad-agencies" className="font-semibold text-primary hover:underline">
            read the full comparison
          </Link>
          {" "}or{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            start a 7-day trial
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
