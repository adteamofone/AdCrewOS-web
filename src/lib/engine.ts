import { prisma } from "@/lib/prisma";
import type {
  AdAccount,
  Metric,
  MetricSnapshot,
  Target,
} from "@prisma/client";

/**
 * AdCrewOS automation engine — "Hybrid" mode (v1, no toggle).
 *
 * Per poll, for each account we read the latest MetricSnapshot and compare the
 * account's live metric against its Target:
 *   - PROTECTIVE breach of pauseThreshold  -> auto-pause immediately + alert + log
 *   - BEAT of scaleThreshold               -> propose a scale (approval-gated), never auto-execute
 *
 * Metric direction matters:
 *   CPC / CPA : lower is better  -> breach when observed >= pauseThreshold
 *                                   beat   when observed <= scaleThreshold
 *   ROAS      : higher is better -> breach when observed <= pauseThreshold
 *                                   beat   when observed >= scaleThreshold
 */

export const DEFAULT_SCALE_PCT = 20;

export function metricIsHigherBetter(metric: Metric): boolean {
  return metric === "ROAS";
}

export function metricValue(snapshot: MetricSnapshot, metric: Metric): number {
  switch (metric) {
    case "CPC":
      return snapshot.cpc;
    case "CPA":
      return snapshot.cpa;
    case "ROAS":
      return snapshot.roas;
  }
}

export type Decision =
  | { action: "none" }
  | {
      action: "pause";
      metric: Metric;
      observed: number;
      threshold: number;
      reason: string;
    }
  | {
      action: "propose_scale";
      metric: Metric;
      observed: number;
      threshold: number;
      proposedPct: number;
      reason: string;
    };

function fmt(metric: Metric, v: number): string {
  if (metric === "ROAS") return `${v.toFixed(2)}x`;
  return `$${v.toFixed(2)}`;
}

export function evaluate(target: Target, snapshot: MetricSnapshot): Decision {
  const metric = target.metric;
  const observed = metricValue(snapshot, metric);
  const higherBetter = metricIsHigherBetter(metric);

  const breach = higherBetter
    ? observed <= target.pauseThreshold
    : observed >= target.pauseThreshold;

  if (breach) {
    return {
      action: "pause",
      metric,
      observed,
      threshold: target.pauseThreshold,
      reason:
        `${metric} hit ${fmt(metric, observed)} ` +
        `(${higherBetter ? "below" : "above"} protective threshold ` +
        `${fmt(metric, target.pauseThreshold)}). Auto-paused to stop the bleed.`,
    };
  }

  const beat = higherBetter
    ? observed >= target.scaleThreshold
    : observed <= target.scaleThreshold;

  if (beat) {
    return {
      action: "propose_scale",
      metric,
      observed,
      threshold: target.scaleThreshold,
      proposedPct: DEFAULT_SCALE_PCT,
      reason:
        `${metric} is running at ${fmt(metric, observed)}, beating your scale ` +
        `target of ${fmt(metric, target.scaleThreshold)}. Recommend +${DEFAULT_SCALE_PCT}% budget.`,
    };
  }

  return { action: "none" };
}

type Alerts = {
  onPause?: (account: AdAccount, decision: Extract<Decision, { action: "pause" }>) => Promise<void>;
  onScaleProposal?: (
    account: AdAccount,
    decision: Extract<Decision, { action: "propose_scale" }>,
  ) => Promise<void>;
  /** Fired on a breach when running in monitor-only mode (Watchdog tier). */
  onMonitorAlert?: (
    account: AdAccount,
    decision: Extract<Decision, { action: "pause" }>,
  ) => Promise<void>;
};

export type EngineOptions = {
  /**
   * Monitor-only (Watchdog / free tier): detect + alert + log on a breach, but
   * never auto-pause and never propose a scale. The operator stays hands-on.
   */
  monitorOnly?: boolean;
};

/**
 * Run the engine for a single account. Idempotent within a poll:
 *  - won't re-pause an already-paused account
 *  - won't stack scale proposals while one is PENDING
 *
 * In `monitorOnly` mode no platform action is taken: a breach logs a
 * MONITOR_ALERT + fires an alert, and scale beats are ignored.
 */
export async function runAccountCheck(
  account: AdAccount & { targets: Target[] },
  alerts: Alerts = {},
  opts: EngineOptions = {},
): Promise<Decision> {
  const target = account.targets[0];
  if (!target) return { action: "none" };

  const snapshot = await prisma.metricSnapshot.findFirst({
    where: { adAccountId: account.id },
    orderBy: { ts: "desc" },
  });
  if (!snapshot) return { action: "none" };

  const decision = evaluate(target, snapshot);

  // Watchdog / monitor-only: alert on breach, never act.
  if (opts.monitorOnly) {
    if (decision.action === "pause") {
      // Dedupe: only one open MONITOR_ALERT per account until it recovers.
      const recentAlert = await prisma.automationEvent.findFirst({
        where: { adAccountId: account.id, type: "MONITOR_ALERT" },
        orderBy: { createdAt: "desc" },
      });
      const alreadyAlerted =
        recentAlert &&
        Date.now() - new Date(recentAlert.createdAt).getTime() < 6 * 60 * 60 * 1000;
      if (alreadyAlerted) return { action: "none" };

      await prisma.automationEvent.create({
        data: {
          adAccountId: account.id,
          type: "MONITOR_ALERT",
          status: "LOGGED",
          reason: decision.reason.replace(
            "Auto-paused to stop the bleed.",
            "Heads up — this breached your limit. Upgrade to auto-pause it for you.",
          ),
          metric: decision.metric,
          observed: decision.observed,
          threshold: decision.threshold,
        },
      });
      await alerts.onMonitorAlert?.(account, decision);
      return decision;
    }
    return { action: "none" };
  }

  if (decision.action === "pause") {
    if (account.status === "PAUSED") return { action: "none" };

    // Execute the protective pause on the platform (no-op for demo accounts).
    try {
      const { pauseAccountCampaigns } = await import("@/lib/platform");
      await pauseAccountCampaigns(account);
    } catch (err) {
      // Log but still mark paused locally so the operator sees the intent.
      await prisma.automationEvent.create({
        data: {
          adAccountId: account.id,
          type: "POLL_ERROR",
          status: "LOGGED",
          reason: `Pause requested but platform call failed: ${
            err instanceof Error ? err.message : "unknown error"
          }`,
        },
      });
    }

    await prisma.$transaction([
      prisma.adAccount.update({
        where: { id: account.id },
        data: { status: "PAUSED" },
      }),
      prisma.automationEvent.create({
        data: {
          adAccountId: account.id,
          type: "AUTO_PAUSE",
          status: "LOGGED",
          reason: decision.reason,
          metric: decision.metric,
          observed: decision.observed,
          threshold: decision.threshold,
        },
      }),
    ]);
    await alerts.onPause?.(account, decision);
    return decision;
  }

  if (decision.action === "propose_scale") {
    const existing = await prisma.automationEvent.findFirst({
      where: {
        adAccountId: account.id,
        type: "SCALE_PROPOSAL",
        status: "PENDING",
      },
    });
    if (existing) return { action: "none" };

    await prisma.automationEvent.create({
      data: {
        adAccountId: account.id,
        type: "SCALE_PROPOSAL",
        status: "PENDING",
        reason: decision.reason,
        metric: decision.metric,
        observed: decision.observed,
        threshold: decision.threshold,
        proposedPct: decision.proposedPct,
      },
    });
    await alerts.onScaleProposal?.(account, decision);
    return decision;
  }

  return { action: "none" };
}
