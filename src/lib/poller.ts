import { prisma } from "@/lib/prisma";
import { acquireLock, releaseLock } from "@/lib/redis";
import { runAccountCheck } from "@/lib/engine";
import { appendDemoSnapshot } from "@/lib/demo";
import { alertPause, alertScaleProposal } from "@/lib/alerts";

/**
 * Poll every connected account: refresh metrics -> write MetricSnapshot ->
 * run the automation engine (auto-pause / propose-scale) with alerting.
 * Redis lock dedupes concurrent/overlapping cron runs per account.
 */
export async function pollAllAccounts(): Promise<{ polled: number; actions: number }> {
  const accounts = await prisma.adAccount.findMany({
    where: { status: { not: "DISCONNECTED" } },
    include: { targets: true, user: { select: { email: true, phone: true } } },
  });

  let polled = 0;
  let actions = 0;

  for (const account of accounts) {
    const locked = await acquireLock(`poll:${account.id}`, 120);
    if (!locked) continue;
    try {
      // 1) refresh metrics
      if (account.isDemo) {
        await appendDemoSnapshot(account);
      } else {
        await refreshRealMetrics(account.id);
      }
      polled++;

      // 2) run engine with alerts
      const decision = await runAccountCheck(account, {
        onPause: (acc, d) => alertPause(account.user, acc, d),
        onScaleProposal: (acc, d) => alertScaleProposal(account.user, acc, d),
      });
      if (decision.action !== "none") actions++;
    } finally {
      await releaseLock(`poll:${account.id}`);
    }
  }

  return { polled, actions };
}

async function refreshRealMetrics(accountId: string): Promise<void> {
  const account = await prisma.adAccount.findUniqueOrThrow({ where: { id: accountId } });
  try {
    const { fetchMetrics } = await import("@/lib/platforms/router");
    const m = await fetchMetrics(account);
    await prisma.metricSnapshot.create({ data: { adAccountId: accountId, ...m } });
  } catch (err) {
    await prisma.automationEvent.create({
      data: {
        adAccountId: accountId,
        type: "POLL_ERROR",
        status: "LOGGED",
        reason: `Metric fetch failed: ${err instanceof Error ? err.message : "unknown error"}`,
      },
    });
  }
}
