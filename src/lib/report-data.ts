import { prisma } from "@/lib/prisma";

export type ReportData = {
  accountName: string;
  platform: string;
  currency: string;
  metric: string;
  periodStart: Date;
  periodEnd: Date;
  totals: {
    spend: number;
    clicks: number;
    conversions: number;
    avgCtr: number;
    avgCpc: number;
    avgCpa: number;
    avgRoas: number;
  };
  automation: { pauses: number; scales: number };
  logoUrl: string | null;
  isAgency: boolean;
};

export async function buildReportData(
  userId: string,
  accountId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<ReportData> {
  const account = await prisma.adAccount.findFirstOrThrow({
    where: { id: accountId, userId },
    include: { targets: true },
  });
  const snaps = await prisma.metricSnapshot.findMany({
    where: { adAccountId: accountId, ts: { gte: periodStart, lte: periodEnd } },
    orderBy: { ts: "asc" },
  });
  const events = await prisma.automationEvent.findMany({
    where: { adAccountId: accountId, createdAt: { gte: periodStart, lte: periodEnd } },
  });
  const [user, brand] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.brandSetting.findUnique({ where: { userId } }),
  ]);

  const n = snaps.length || 1;
  const spend = snaps.reduce((s, x) => s + x.spend, 0);
  const clicks = snaps.reduce((s, x) => s + x.clicks, 0);
  const conversions = snaps.reduce((s, x) => s + x.conversions, 0);
  const avg = (sel: (x: (typeof snaps)[number]) => number) => snaps.reduce((s, x) => s + sel(x), 0) / n;

  const isAgency = user?.tier === "AGENCY";

  return {
    accountName: account.name,
    platform: account.platform,
    currency: account.currency,
    metric: account.targets[0]?.metric ?? "ROAS",
    periodStart,
    periodEnd,
    totals: {
      spend: round2(spend),
      clicks,
      conversions: round2(conversions),
      avgCtr: round2(avg((x) => x.ctr)),
      avgCpc: round2(avg((x) => x.cpc)),
      avgCpa: round2(avg((x) => x.cpa)),
      avgRoas: round2(avg((x) => x.roas)),
    },
    automation: {
      pauses: events.filter((e) => e.type === "AUTO_PAUSE").length,
      scales: events.filter((e) => e.type === "SCALE_APPLIED").length,
    },
    logoUrl: isAgency ? brand?.logoUrl ?? null : null,
    isAgency: Boolean(isAgency),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
