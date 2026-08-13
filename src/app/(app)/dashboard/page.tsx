import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { AccountCard } from "@/components/dashboard/account-card";
import { AlertFeed } from "@/components/dashboard/alert-feed";
import { SeedDemoButton } from "@/components/dashboard/seed-demo-button";
import { Badge, Card, ButtonLink } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(session.user.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Cockpit</h1>
          <p className="text-sm text-muted">Your accounts, live. The engine holds the floor 24/7.</p>
        </div>
        <div className="flex items-center gap-2">
          {data.isDemo && <Badge tone="warn">Demo mode</Badge>}
          <ButtonLink href="/settings" variant="outline" size="sm">Connect account</ButtonLink>
        </div>
      </div>

      {data.isDemo && (
        <div className="mt-4 rounded-lg border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
          You&apos;re viewing <strong>synthetic demo data</strong> running through the real
          automation engine. Connect a live Google or Meta account in Settings to go live.
        </div>
      )}

      {data.accounts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Accounts" value={String(data.kpis.accountCount)} />
            <Kpi label="Spend (24h)" value={formatCurrency(data.kpis.totalSpend24h)} />
            <Kpi label="Auto-paused" value={String(data.kpis.pausedCount)} tone={data.kpis.pausedCount ? "error" : "muted"} />
            <Kpi label="Scale proposals" value={String(data.kpis.pendingProposals)} tone={data.kpis.pendingProposals ? "primary" : "muted"} />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {data.accounts.map((a) => (
              <AccountCard key={a.id} account={a} />
            ))}
          </div>

          <h2 className="mt-10 font-display text-lg font-semibold text-text">Alert feed</h2>
          <p className="mb-4 text-sm text-muted">Protective pauses log automatically. Scale proposals wait for your tap.</p>
          <AlertFeed events={data.events} />
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, tone = "muted" }: { label: string; value: string; tone?: "muted" | "error" | "primary" }) {
  const color = tone === "error" ? "text-error" : tone === "primary" ? "text-primary" : "text-text";
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${color}`}>{value}</div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="mt-8 flex flex-col items-center gap-4 p-12 text-center">
      <h2 className="font-display text-xl font-semibold text-text">No accounts yet</h2>
      <p className="max-w-md text-sm text-muted">
        Connect Google or Meta to go live — or load realistic demo data to explore the full
        cockpit and watch the automation engine in action.
      </p>
      <div className="flex items-center gap-3">
        <SeedDemoButton />
        <ButtonLink href="/settings" variant="outline">Connect an account</ButtonLink>
      </div>
    </Card>
  );
}
