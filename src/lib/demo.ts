import { prisma } from "@/lib/prisma";
import type { AdAccount, Metric, Platform } from "@prisma/client";

/**
 * Synthetic data engine for demo accounts. Demo accounts run the IDENTICAL
 * automation engine as real ones — only the data source differs. Snapshots are
 * generated with realistic drift so the dashboard has full fidelity and the
 * engine occasionally trips pause/scale conditions.
 */

type DemoProfile = {
  platform: Platform;
  name: string;
  metric: Metric;
  targetValue: number;
  pauseThreshold: number;
  scaleThreshold: number;
  base: {
    spendPerTick: number; // $ per ~12min tick
    ctr: number; // %
    cpc: number; // $
    convRate: number; // conversions per click
    aov: number; // avg order value for ROAS
  };
};

export const DEMO_PROFILES: DemoProfile[] = [
  {
    platform: "GOOGLE",
    name: "Demo — Search: Brand + Nonbrand",
    metric: "CPA",
    targetValue: 42,
    pauseThreshold: 75, // CPA above $75 -> protective pause
    scaleThreshold: 30, // CPA at/below $30 -> propose scale
    base: { spendPerTick: 14, ctr: 6.2, cpc: 1.9, convRate: 0.052, aov: 120 },
  },
  {
    platform: "META",
    name: "Demo — Advantage+ Prospecting",
    metric: "ROAS",
    targetValue: 3.2,
    pauseThreshold: 1.6, // ROAS below 1.6x -> protective pause
    scaleThreshold: 4.2, // ROAS at/above 4.2x -> propose scale
    base: { spendPerTick: 22, ctr: 2.4, cpc: 0.85, convRate: 0.031, aov: 68 },
  },
];

function jitter(v: number, pct: number): number {
  return v * (1 + (Math.random() * 2 - 1) * pct);
}

/** Compute a single synthetic snapshot's metrics for a profile at a given tick. */
export function synthMetrics(profile: DemoProfile, tickIndex: number) {
  // Daily seasonality: a gentle sine over a 120-tick (~24h) cycle.
  const season = 1 + 0.25 * Math.sin((tickIndex / 120) * Math.PI * 2);
  const spend = Math.max(1, jitter(profile.base.spendPerTick * season, 0.18));
  const cpc = Math.max(0.05, jitter(profile.base.cpc, 0.15));
  const clicks = Math.max(1, Math.round(spend / cpc));
  const impressions = Math.max(clicks, Math.round((clicks / profile.base.ctr) * 100));
  const ctr = (clicks / impressions) * 100;
  const conversions = Math.max(0, jitter(clicks * profile.base.convRate, 0.35));
  const cpa = conversions > 0 ? spend / conversions : spend; // no conv => full spend as CPA
  const revenue = conversions * jitter(profile.base.aov, 0.1);
  const roas = spend > 0 ? revenue / spend : 0;

  return {
    spend: round2(spend),
    clicks,
    conversions: round2(conversions),
    ctr: round2(ctr),
    cpc: round2(cpc),
    cpa: round2(cpa),
    roas: round2(roas),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Occasionally push a profile into a breach or beat so the engine visibly acts. */
export function synthMetricsWithEvents(profile: DemoProfile, tickIndex: number) {
  const m = synthMetrics(profile, tickIndex);
  const roll = Math.random();
  if (profile.metric === "CPA") {
    if (roll < 0.06) return { ...m, cpa: round2(profile.pauseThreshold * 1.15), conversions: round2(m.spend / (profile.pauseThreshold * 1.15)) };
    if (roll > 0.9) return { ...m, cpa: round2(profile.scaleThreshold * 0.85), conversions: round2(m.spend / (profile.scaleThreshold * 0.85)) };
  } else if (profile.metric === "ROAS") {
    if (roll < 0.06) return { ...m, roas: round2(profile.pauseThreshold * 0.85) };
    if (roll > 0.9) return { ...m, roas: round2(profile.scaleThreshold * 1.1) };
  }
  return m;
}

const DEMO_PREFIX = "demo-";

/**
 * Seed demo accounts for a user (respecting their plan cap indirectly — Solo
 * gets 1 per platform). Backfills ~24h of healthy history at 12-min cadence.
 */
export async function seedDemoData(userId: string): Promise<void> {
  const existing = await prisma.adAccount.count({
    where: { userId, isDemo: true },
  });
  if (existing > 0) return;

  const now = Date.now();
  const TICKS = 120; // ~24h at 12min
  const STEP_MS = 12 * 60 * 1000;

  for (const profile of DEMO_PROFILES) {
    const account = await prisma.adAccount.create({
      data: {
        userId,
        platform: profile.platform,
        externalId: `${DEMO_PREFIX}${profile.platform.toLowerCase()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        name: profile.name,
        currency: "USD",
        isDemo: true,
        status: "ACTIVE",
        targets: {
          create: {
            metric: profile.metric,
            targetValue: profile.targetValue,
            pauseThreshold: profile.pauseThreshold,
            scaleThreshold: profile.scaleThreshold,
          },
        },
      },
    });

    const rows = [];
    for (let i = TICKS; i >= 0; i--) {
      const ts = new Date(now - i * STEP_MS);
      // Backfill stays healthy so the initial dashboard looks clean.
      const m = synthMetrics(profile, TICKS - i);
      rows.push({ adAccountId: account.id, ts, ...m });
    }
    await prisma.metricSnapshot.createMany({ data: rows });
  }
}

/** Append one fresh synthetic snapshot for a demo account (used by the poller). */
export async function appendDemoSnapshot(account: AdAccount): Promise<void> {
  const profile =
    DEMO_PROFILES.find((p) => p.platform === account.platform) ??
    DEMO_PROFILES[0];
  const tick = Math.floor(Date.now() / (12 * 60 * 1000)) % 120;
  const m = synthMetricsWithEvents(profile, tick);
  await prisma.metricSnapshot.create({
    data: { adAccountId: account.id, ...m },
  });
}
