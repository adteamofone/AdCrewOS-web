import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SignupForm } from "@/components/auth/signup-form";
import { CockpitMockup } from "@/components/marketing/cockpit-mockup";

export const metadata = { title: "Start free — AdCrewOS" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; checkout?: string }>;
}) {
  const sp = await searchParams;
  const validTiers = ["WATCHDOG", "SOLO", "PRO", "AGENCY"] as const;
  const tier = (validTiers as readonly string[]).includes(sp.tier ?? "")
    ? (sp.tier as (typeof validTiers)[number])
    : "SOLO";
  const canceled = sp.checkout === "canceled";

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[420px] w-[720px] rounded-full bg-primary/15 blur-[130px]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-10 md:grid-cols-2">
        <div>
          <Link href="/"><Logo className="mb-8" /></Link>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Put your budget on autopilot.
          </h1>
          <p className="mt-3 max-w-md text-muted">
            7 days free. No agency retainer. Cancel anytime. Your first protective pause could
            pay for the year.
          </p>
          <div className="mt-8 hidden md:block">
            <CockpitMockup />
          </div>
        </div>
        <SignupForm defaultTier={tier} canceled={canceled} />
      </div>
    </div>
  );
}
