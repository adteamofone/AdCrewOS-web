"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { resumeAccount } from "@/app/actions";
import { formatCurrency, formatMetric } from "@/lib/utils";
import { ThresholdStepper } from "@/components/dashboard/threshold-stepper";
import type { AccountSummary } from "@/lib/dashboard-data";

const METRIC_COLOR: Record<string, string> = {
  ROAS: "#22c55e",
  CPA: "#0ea5e9",
  CPC: "#06b6d4",
};

export function AccountCard({ account }: { account: AccountSummary }) {
  const [pending, startTransition] = useTransition();
  const paused = account.status === "PAUSED";
  const primary = account.latest?.primary ?? 0;
  const color = METRIC_COLOR[account.metric] ?? "#0ea5e9";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/accounts/${account.id}`}
              className="font-display font-semibold text-text hover:text-primary hover:underline"
            >
              {account.name}
            </Link>
            {account.isDemo && <Badge tone="warn">Demo</Badge>}
          </div>
          <div className="mt-0.5 text-xs uppercase tracking-wide text-muted">{account.platform}</div>
        </div>
        <Badge tone={paused ? "error" : "success"}>{paused ? "Paused" : "Active"}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label={account.metric} value={formatMetric(account.metric, primary)} accent={color} />
        <Stat label="Spend 24h" value={formatCurrency(account.spend24h, account.currency)} />
      </div>

      <div className="mt-4">
        <MetricsChart series={account.series} color={color} label={account.id} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-border bg-bg/50 p-2.5">
        <Guardrail label="Target">
          <ThresholdStepper accountId={account.id} field="targetValue" metric={account.metric} value={account.targetValue} size="sm" />
        </Guardrail>
        <Guardrail label="Pause @">
          <ThresholdStepper accountId={account.id} field="pauseThreshold" metric={account.metric} value={account.pauseThreshold} size="sm" />
        </Guardrail>
        <Guardrail label="Scale @">
          <ThresholdStepper accountId={account.id} field="scaleThreshold" metric={account.metric} value={account.scaleThreshold} size="sm" />
        </Guardrail>
      </div>

      <div className="mt-3 flex items-center justify-end text-xs text-muted">
        <span className="flex items-center gap-2">
          {paused && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => startTransition(() => resumeAccount(account.id))}
            >
              Resume
            </Button>
          )}
          <Link
            href={`/dashboard/accounts/${account.id}`}
            className="text-primary hover:underline"
          >
            Details →
          </Link>
        </span>
      </div>
    </Card>
  );
}

function Guardrail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg/50 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-display text-lg font-bold" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
    </div>
  );
}
