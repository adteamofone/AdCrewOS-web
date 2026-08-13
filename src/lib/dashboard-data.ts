import { prisma } from "@/lib/prisma";
import type { Metric } from "@prisma/client";
import { metricValue } from "@/lib/engine";

export type AccountSummary = {
  id: string;
  name: string;
  platform: "GOOGLE" | "META";
  status: "ACTIVE" | "PAUSED" | "DISCONNECTED";
  isDemo: boolean;
  currency: string;
  metric: Metric;
  targetValue: number;
  pauseThreshold: number;
  scaleThreshold: number;
  latest: {
    spend: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpa: number;
    roas: number;
    primary: number;
    ts: string;
  } | null;
  spend24h: number;
  series: { ts: string; value: number; spend: number }[];
};

export async function getDashboardData(userId: string) {
  const accounts = await prisma.adAccount.findMany({
    where: { userId },
    include: {
      targets: true,
      metricSnapshots: { orderBy: { ts: "desc" }, take: 120 },
    },
    orderBy: { createdAt: "asc" },
  });

  const summaries: AccountSummary[] = accounts.map((a) => {
    const target = a.targets[0];
    const metric = (target?.metric ?? "ROAS") as Metric;
    const snaps = [...a.metricSnapshots].reverse(); // oldest -> newest
    const latestSnap = a.metricSnapshots[0] ?? null;
    const cutoff = Date.now() - 24 * 3600 * 1000;
    const spend24h = a.metricSnapshots
      .filter((s) => s.ts.getTime() >= cutoff)
      .reduce((sum, s) => sum + s.spend, 0);

    return {
      id: a.id,
      name: a.name,
      platform: a.platform,
      status: a.status,
      isDemo: a.isDemo,
      currency: a.currency,
      metric,
      targetValue: target?.targetValue ?? 0,
      pauseThreshold: target?.pauseThreshold ?? 0,
      scaleThreshold: target?.scaleThreshold ?? 0,
      latest: latestSnap
        ? {
            spend: latestSnap.spend,
            clicks: latestSnap.clicks,
            conversions: latestSnap.conversions,
            ctr: latestSnap.ctr,
            cpc: latestSnap.cpc,
            cpa: latestSnap.cpa,
            roas: latestSnap.roas,
            primary: metricValue(latestSnap, metric),
            ts: latestSnap.ts.toISOString(),
          }
        : null,
      spend24h,
      series: snaps.map((s) => ({
        ts: s.ts.toISOString(),
        value: metricValue(s, metric),
        spend: s.spend,
      })),
    };
  });

  const events = await prisma.automationEvent.findMany({
    where: { adAccount: { userId } },
    include: { adAccount: { select: { name: true, platform: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const totalSpend24h = summaries.reduce((s, a) => s + a.spend24h, 0);
  const pausedCount = summaries.filter((a) => a.status === "PAUSED").length;
  const pendingProposals = events.filter(
    (e) => e.type === "SCALE_PROPOSAL" && e.status === "PENDING",
  ).length;

  return {
    accounts: summaries,
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      status: e.status,
      reason: e.reason,
      metric: e.metric,
      proposedPct: e.proposedPct,
      createdAt: e.createdAt.toISOString(),
      accountName: e.adAccount.name,
      platform: e.adAccount.platform,
    })),
    kpis: { totalSpend24h, pausedCount, pendingProposals, accountCount: summaries.length },
    isDemo: summaries.some((a) => a.isDemo),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

/** Full detail for one account: deeper history + its own event feed. */
export async function getAccountDetail(userId: string, accountId: string) {
  const account = await prisma.adAccount.findFirst({
    where: { id: accountId, userId },
    include: {
      targets: true,
      metricSnapshots: { orderBy: { ts: "desc" }, take: 336 },
    },
  });
  if (!account) return null;

  const target = account.targets[0];
  const metric = (target?.metric ?? "ROAS") as Metric;
  const snaps = [...account.metricSnapshots].reverse(); // oldest -> newest
  const latest = account.metricSnapshots[0] ?? null;
  const cutoff24 = Date.now() - 24 * 3600 * 1000;
  const last24 = account.metricSnapshots.filter((s) => s.ts.getTime() >= cutoff24);
  const spend24h = last24.reduce((s, x) => s + x.spend, 0);
  const clicks24h = last24.reduce((s, x) => s + x.clicks, 0);
  const conversions24h = last24.reduce((s, x) => s + x.conversions, 0);

  const events = await prisma.automationEvent.findMany({
    where: { adAccountId: account.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return {
    id: account.id,
    name: account.name,
    platform: account.platform,
    status: account.status,
    isDemo: account.isDemo,
    currency: account.currency,
    metric,
    targetValue: target?.targetValue ?? 0,
    pauseThreshold: target?.pauseThreshold ?? 0,
    scaleThreshold: target?.scaleThreshold ?? 0,
    latest: latest
      ? {
          spend: latest.spend,
          clicks: latest.clicks,
          conversions: latest.conversions,
          ctr: latest.ctr,
          cpc: latest.cpc,
          cpa: latest.cpa,
          roas: latest.roas,
          primary: metricValue(latest, metric),
          ts: latest.ts.toISOString(),
        }
      : null,
    spend24h,
    clicks24h,
    conversions24h,
    series: snaps.map((s) => ({
      ts: s.ts.toISOString(),
      value: metricValue(s, metric),
      spend: s.spend,
    })),
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      status: e.status,
      reason: e.reason,
      proposedPct: e.proposedPct,
      createdAt: e.createdAt.toISOString(),
      accountName: account.name,
      platform: account.platform,
    })),
  };
}

export type AccountDetail = NonNullable<Awaited<ReturnType<typeof getAccountDetail>>>;
