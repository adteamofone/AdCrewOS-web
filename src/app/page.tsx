import Link from "next/link";
import { ButtonLink, Card, Badge } from "@/components/ui/primitives";
import { Logo } from "@/components/brand/logo";
import { CockpitMockup } from "@/components/marketing/cockpit-mockup";
import { PLANS } from "@/lib/plans";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

      <div className="relative">
        <SiteNav />
        <Hero />
        <LogoBand />
        <Problem />
        <HowItWorks />
        <Pricing />
        <AgencySection />
        <FinalCta />
        <Footer />
      </div>
    </div>
  );
}

function SiteNav() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Logo />
      <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
        <a href="#how" className="hover:text-text">How it works</a>
        <a href="#pricing" className="hover:text-text">Pricing</a>
        <a href="#agency" className="hover:text-text">For agencies</a>
      </nav>
      <div className="flex items-center gap-3">
        <Link href="/signup" className="text-sm text-muted hover:text-text">Log in</Link>
        <ButtonLink href="/signup" size="sm">Start free</ButtonLink>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-10 pb-16 md:grid-cols-2 md:pt-20">
      <div>
        <Badge tone="primary" className="mb-5">
          Autonomous ad ops · Google &amp; Meta
        </Badge>
        <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-text sm:text-5xl md:text-6xl">
          Your ad budget doesn&apos;t sleep.
          <span className="block text-primary">Now you can.</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted">
          AdCrewOS watches every dollar across Google &amp; Meta around the clock. It kills
          the bleed the second a campaign turns — and scales the winners on your one-tap
          say-so. No agency. No 2am dashboard checks.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ButtonLink href="/signup" size="lg">Start your 7-day trial</ButtonLink>
          <ButtonLink href="#how" size="lg" variant="outline">See how it works</ButtonLink>
        </div>
        <p className="mt-4 text-sm text-muted">
          7 days free · Cancel anytime · Live in under 4 minutes
        </p>
      </div>
      <CockpitMockup />
    </section>
  );
}

function LogoBand() {
  const stats = [
    { k: "24/7", v: "eyes on spend" },
    { k: "~12 min", v: "polling cadence" },
    { k: "1-tap", v: "scale approvals" },
    { k: "0", v: "spreadsheets" },
  ];
  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-8 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.v} className="text-center">
            <div className="font-display text-2xl font-bold text-text">{s.k}</div>
            <div className="text-sm text-muted">{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    {
      title: "Overnight budget bleed",
      body: "A winning campaign quietly turns at 1am. By the time you check, $600 is gone. AdCrewOS pauses it the moment it breaches your line.",
    },
    {
      title: "Dashboard anxiety",
      body: "You refresh Ads Manager 14 times a day and still feel behind. Trade the anxiety for SMS the instant something actually needs you.",
    },
    {
      title: "The agency trap",
      body: "$2k/mo retainers to press pause for you. Keep the control and the margin — the automation does the grunt work.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
        The money leaks while you&apos;re living your life.
      </h2>
      <p className="mt-3 max-w-2xl text-muted">
        Solo operators don&apos;t lose to bad strategy. They lose to the hours between checks.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((i) => (
          <Card key={i.title} className="p-6">
            <h3 className="font-display text-lg font-semibold text-text">{i.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{i.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Connect Google & Meta",
      body: "Secure OAuth in two clicks. No account access? Skip and run the full product on realistic demo data.",
    },
    {
      n: "02",
      title: "Set your lines",
      body: "Per account, pick CPC, CPA or ROAS and set two thresholds: a protective floor and a scale trigger.",
    },
    {
      n: "03",
      title: "Let it run",
      body: "Breach the floor → auto-pause + SMS. Beat the trigger → one-tap approve a budget bump. That's it.",
    },
  ];
  return (
    <section id="how" className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Badge tone="primary" className="mb-4">How it works</Badge>
        <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
          Set the rules once. It runs the floor.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="font-display text-5xl font-black text-primary/25">{s.n}</div>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [PLANS.WATCHDOG, PLANS.SOLO, PLANS.PRO, PLANS.AGENCY] as const;
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
          Priced like a tool. Works like a team.
        </h2>
        <p className="mt-3 text-muted">
          Start free and watch your spend. Upgrade to let it act for you — paid plans include a
          7-day free trial. Monthly. Cancel anytime.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => {
          const isPopular = p.tier === "PRO";
          const isFree = !p.paid;
          return (
            <Card
              key={p.tier}
              className={isPopular ? "relative border-primary/50 p-6 glow-primary" : "p-6"}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-text">{p.name}</h3>
                {isPopular && <Badge tone="primary">Most popular</Badge>}
                {isFree && <Badge tone="success">Free forever</Badge>}
              </div>
              <p className="mt-1 min-h-[2.5rem] text-sm text-muted">{p.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-extrabold text-text">{p.priceLabel}</span>
                {p.paid && <span className="text-muted">/mo</span>}
              </div>
              <ul className="mt-5 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-text/90">
                    <span className="mt-0.5 text-success">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={`/signup?tier=${p.tier}`}
                className="mt-6 w-full"
                variant={isPopular ? "primary" : "outline"}
              >
                {isFree ? "Start free" : "Start 7-day trial"}
              </ButtonLink>
            </Card>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Founding members lock their price for life. Pricing shown may be adjusted before general
        availability.
      </p>
    </section>
  );
}

function AgencySection() {
  return (
    <section id="agency" className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2">
        <div>
          <Badge tone="primary" className="mb-4">For one-person shops</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            You have a bandwidth ceiling. Not a client ceiling.
          </h2>
          <p className="mt-4 text-muted">
            Every new client used to mean more midnight monitoring. Run up to 10 accounts per
            platform, each with its own targets and thresholds — and hand clients a report with
            your logo on it, not ours.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-text/90">
            <li className="flex gap-2.5"><span className="text-success">✓</span> Per-client targets &amp; protective floors</li>
            <li className="flex gap-2.5"><span className="text-success">✓</span> White-labeled PDF reports</li>
            <li className="flex gap-2.5"><span className="text-success">✓</span> One alert feed across the whole book</li>
          </ul>
        </div>
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {["Northwind Co.", "Peak Fitness", "Lumen Skincare", "Orbit SaaS"].map((c, i) => (
              <div key={c} className="rounded-lg border border-border bg-bg/60 p-4">
                <div className="text-sm font-semibold text-text">{c}</div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted">ROAS</span>
                  <span className={i % 2 ? "text-success" : "text-primary"}>{(3.4 + i * 0.6).toFixed(1)}x</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-primary" style={{ width: `${55 + i * 12}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 text-center">
      <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-text sm:text-5xl">
        Stop babysitting your budget.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-muted">
        Wire up your accounts in minutes and let AdCrewOS hold the line — starting tonight.
      </p>
      <div className="mt-8 flex justify-center">
        <ButtonLink href="/signup" size="lg">Start your 7-day trial</ButtonLink>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted md:flex-row">
        <Logo />
        <div className="flex items-center gap-6">
          <Link href="/legal/terms" className="hover:text-text">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-text">Privacy</Link>
          <span>© {new Date().getFullYear()} AdCrewOS</span>
        </div>
      </div>
    </footer>
  );
}
