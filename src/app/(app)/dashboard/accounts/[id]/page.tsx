import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAccountDetail } from "@/lib/dashboard-data";
import { AlertFeed } from "@/components/dashboard/alert-feed";
import { ThresholdStepper } from "@/components/dashboard/threshold-stepper";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { ResumeButton } from "@/components/dashboard/resume-button";
import { Badge, Card, ButtonLink } from "@/components/ui/primitives";
import { formatCurrency, formatMetric, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account detail — AdCrewOS" };

const METRIC_COLOR: Record<string, string> = {
  ROAS: "#22c55e",
  CPA: "#0ea5e9",
  CPC: "#06b6d4",
};

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const account = await getAccountDetail(session.user.id, id);
  if (!account) notFound();

  const paused = account.status === "PAUSED";
  const color = METRIC_COLOR[account.metric] ?? "#0ea5e9";
  const l = account.latest;

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted hover:text-text">
        ← Back to cockpit
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-text">{account.name}</h1>
            {account.isDemo && <Badge tone="warn">Demo</Badge>}
            <Badge tone={paused ? "error" : "success"}>{paused ? "Paused" : "Active"}</Badge>
          </div>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">{account.platform}</p>
        </div>
        <div className="flex items-center gap-2">
          {paused && <ResumeButton accountId={account.id} />}
          <ButtonLink href="/dashboard/reports" variant="outline" size="sm">
            Generate report
          </ButtonLink>
        </div>
      </div>

      {/* KPI grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi
          label={`${account.metric} (now)`}
          value={l ? formatMetric(account.metric, l.primary) : "—"}
          accent={color}
        />
        <Kpi label="Spend (24h)" value={formatCurrency(account.spend24h, account.currency)} />
        <Kpi label="Clicks (24h)" value={formatNumber(account.clicks24h)} />
        <Kpi label="Conversions (24h)" value={formatNumber(Math.round(account.conversions24h * 100) / 100)} />
        <Kpi label="CTR" value={l ? `${l.ctr.toFixed(2)}%` : "—"} />
        <Kpi label="CPC" value={l ? formatMetric("CPC", l.cpc) : "—"} />
        <Kpi label="CPA" value={l ? formatMetric("CPA", l.cpa) : "—"} />
        <Kpi label="ROAS" value={l ? formatMetric("ROAS", l.roas) : "—"} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-sm font-semibold text-text">
            {account.metric} — last {account.series.length} polls
          </h2>
          <div className="mt-3">
            <MetricsChart series={account.series} color={color} label={`${account.id}-m`} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-sm font-semibold text-text">Spend per poll</h2>
          <div className="mt-3">
            <MetricsChart
              series={account.series.map((s) => ({ ts: s.ts, value: s.spend }))}
              color="#f97316"
              label={`${account.id}-s`}
            />
          </div>
        </Card>
      </div>

      {/* Guardrails */}
      <Card className="mt-6 p-5">
        <h2 className="font-display text-sm font-semibold text-text">Guardrails</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Rail label={`Target ${account.metric}`}>
            <ThresholdStepper accountId={account.id} field="targetValue" metric={account.metric} value={account.targetValue} />
          </Rail>
          <Rail label="Protective pause at">
            <ThresholdStepper accountId={account.id} field="pauseThreshold" metric={account.metric} value={account.pauseThreshold} />
          </Rail>
          <Rail label="Scale proposal at">
            <ThresholdStepper accountId={account.id} field="scaleThreshold" metric={account.metric} value={account.scaleThreshold} />
          </Rail>
        </div>
        <p className="mt-3 text-xs text-muted">
          Cross the pause line and the engine pauses this account immediately — no approval
          needed. Beat the scale line and you get a one-tap proposal; nothing scales without
          your approval. Use the arrows to adjust any line by 0.1 — changes save automatically
          and take effect on the next poll.
        </p>
      </Card>

      {/* Account-specific activity */}
      <h2 className="mt-10 font-display text-lg font-semibold text-text">Activity for this account</h2>
      <p className="mb-4 text-sm text-muted">Every pause, proposal, and resume — newest first.</p>
      <AlertFeed events={account.events} />
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div
        className="mt-1 font-display text-2xl font-bold text-text"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
    </Card>
  );
}

function Rail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-bg/50 p-4">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
