import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { runAccountCheck } from "@/lib/engine";

/**
 * Proves the free Watchdog (monitor-only) tier behavior:
 *  - a breach ALERTS + logs a MONITOR_ALERT event
 *  - but the account is NOT auto-paused (stays ACTIVE)
 *  - and no SCALE_PROPOSAL is ever created
 * Contrast: the same breach in full mode DOES pause.
 */

const EMAIL_BASE = `watchdog+${Date.now()}`;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: EMAIL_BASE } } });
  await prisma.$disconnect();
});

async function makeAccount() {
  const user = await prisma.user.create({ data: { email: `${EMAIL_BASE}-${Math.random().toString(36).slice(2)}@adcrewos.test` } });
  const account = await prisma.adAccount.create({
    data: {
      userId: user.id,
      platform: "GOOGLE",
      externalId: `wd-${Date.now()}`,
      isDemo: true,
      status: "ACTIVE",
      name: "Watchdog Test Account",
    },
  });
  await prisma.target.create({
    data: {
      adAccountId: account.id,
      metric: "CPA",
      targetValue: 40,
      pauseThreshold: 75,
      scaleThreshold: 30,
    },
  });
  // A snapshot that breaches the pause threshold (CPA 90 > 75).
  await prisma.metricSnapshot.create({
    data: {
      adAccountId: account.id,
      spend: 100,
      clicks: 50,
      conversions: 1,
      ctr: 5,
      cpc: 2,
      cpa: 90,
      roas: 1,
    },
  });
  return account.id;
}

describe("Watchdog monitor-only mode", () => {
  it("alerts + logs but never pauses on a breach", async () => {
    const accountId = await makeAccount();
    const account = await prisma.adAccount.findUniqueOrThrow({
      where: { id: accountId },
      include: { targets: true },
    });

    let alerted = 0;
    const decision = await runAccountCheck(
      account,
      { onMonitorAlert: async () => { alerted++; } },
      { monitorOnly: true },
    );

    expect(decision.action).toBe("pause"); // breach detected
    expect(alerted).toBe(1); // alert fired

    const after = await prisma.adAccount.findUniqueOrThrow({ where: { id: accountId } });
    expect(after.status).toBe("ACTIVE"); // NOT paused

    const monitorEvents = await prisma.automationEvent.count({
      where: { adAccountId: accountId, type: "MONITOR_ALERT" },
    });
    expect(monitorEvents).toBe(1);

    const pauses = await prisma.automationEvent.count({
      where: { adAccountId: accountId, type: "AUTO_PAUSE" },
    });
    expect(pauses).toBe(0);
  });

  it("full mode pauses on the same breach", async () => {
    const accountId = await makeAccount();
    const account = await prisma.adAccount.findUniqueOrThrow({
      where: { id: accountId },
      include: { targets: true },
    });

    const decision = await runAccountCheck(account, {}, { monitorOnly: false });
    expect(decision.action).toBe("pause");

    const after = await prisma.adAccount.findUniqueOrThrow({ where: { id: accountId } });
    expect(after.status).toBe("PAUSED");
  });
});
