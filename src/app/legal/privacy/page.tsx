import { LegalShell } from "@/components/marketing/legal-shell";

export const metadata = { title: "Privacy Policy — AdCrewOS" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="Draft — pending legal review">
      <p className="rounded-lg border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
        Placeholder document. This must be reviewed by counsel before launch and is also
        required for Google &amp; Meta app review.
      </p>
      <h2>1. Data we collect</h2>
      <p>
        Account details (email, phone for alerts), OAuth tokens for connected ad accounts
        (encrypted at rest), and advertising performance metrics we retrieve on your behalf.
      </p>
      <h2>2. How we use it</h2>
      <p>
        Solely to operate the Service: to display your performance, send you alerts, and
        execute the automation rules you configure. We do not sell your data.
      </p>
      <h2>3. Google &amp; Meta API data</h2>
      <p>
        Our use and transfer of information received from Google APIs adheres to the Google
        API Services User Data Policy, including the Limited Use requirements. Meta Platform
        data is handled per the Meta Platform Terms and Developer Policies.
      </p>
      <h2>4. Storage &amp; security</h2>
      <p>
        OAuth tokens are encrypted using AES-256-GCM. Access is restricted to the
        authenticated account owner.
      </p>
      <h2>5. Your rights</h2>
      <p>
        You may disconnect accounts and request full deletion of your data at any time.
      </p>
      <h2>6. Contact</h2>
      <p>Questions: privacy@adcrewos.com.</p>
    </LegalShell>
  );
}
