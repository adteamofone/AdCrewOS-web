import { LegalShell } from "@/components/marketing/legal-shell";

export const metadata = { title: "Terms of Service — AdCrewOS" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="Draft — pending legal review">
      <p className="rounded-lg border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
        Placeholder document. This must be reviewed by counsel before launch and is also
        required for Google &amp; Meta app review.
      </p>
      <h2>1. Agreement</h2>
      <p>
        These Terms govern your access to and use of AdCrewOS (the &quot;Service&quot;), operated
        by Ad Team of One. By creating an account you agree to these Terms.
      </p>
      <h2>2. The Service</h2>
      <p>
        AdCrewOS connects to your Google Ads and Meta advertising accounts to monitor
        performance and, based on thresholds you configure, automatically pause campaigns
        or propose budget changes. Automated actions execute according to your settings.
      </p>
      <h2>3. Your responsibilities</h2>
      <p>
        You are responsible for the accuracy of the thresholds and targets you set and for
        any ad spend incurred on your connected accounts. AdCrewOS provides automation
        tooling; you retain ownership and ultimate control of your advertising accounts.
      </p>
      <h2>4. Billing</h2>
      <p>
        Paid plans are billed monthly through Stripe following a 7-day free trial. You may
        cancel at any time through the customer billing portal.
      </p>
      <h2>5. Disconnection &amp; data deletion</h2>
      <p>
        You may disconnect any ad account and request deletion of your data at any time, in
        accordance with Google and Meta platform terms.
      </p>
      <h2>6. Disclaimer</h2>
      <p>
        The Service is provided &quot;as is.&quot; AdCrewOS is not liable for advertising outcomes
        or spend resulting from your configured automation rules.
      </p>
    </LegalShell>
  );
}
