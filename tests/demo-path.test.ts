import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { seedDemoData } from "@/lib/demo";
import { runAccountCheck } from "@/lib/engine";

/**
 * End-to-end demo-path test against a real Postgres (pglite in CI/dev).
 * Proves: skip-connect -> demo seed -> dashboard-grade data -> engine
 * auto-pauses on breach and proposes scale on beat.
 */

const EMAIL = `demo+${Date.now()}@adcrewos.test`;

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.$disconnect();
});

describe("demo path end-to-end", () => {
  it("seeds two demo accounts with full-fidelity history", async () => {
    const user = await prisma.user.create({ data: { email: EMAIL } });
    await seedDemoData(user.id);

    const accounts = await prisma.adAccount.findMany({
      where: { userId: user.id, isDemo: true },
      include: { targets: true, metricSnapshots: true },
    });
    expect(accounts.length).toBe(2);
    for (const a of accounts) {
      expect(a.targets.length).toBe(1);
      expect(a.metricSnapshots.length).toBeGreaterThan(100);
    }
  });

  it("auto-pauses an account when the latest snapshot breaches the pause threshold", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: EMAIL } });
    const account = await prisma.adAccount.findFirstOrThrow({
      where: { userId: user.id, platform: "META" },
      include: { targets: true },
    });
    // Force a breach: ROAS well below pause threshold.
    await prisma.metricSnapshot.create({
      data: { adAccountId: account.id, spend: 200, roas: 0.9, clicks: 100, conversions: 2 },
    });

    const decision = await runAccountCheck(account);
    expect(decision.action).toBe("pause");

    const refreshed = await prisma.adAccount.findUniqueOrThrow({ where: { id: account.id } });
    expect(refreshed.status).toBe("PAUSED");

    const events = await prisma.automationEvent.findMany({
      where: { adAccountId: account.id, type: "AUTO_PAUSE" },
    });
    expect(events.length).toBe(1);
  });

  it("proposes a scale (does not auto-execute) when a snapshot beats the scale threshold", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: EMAIL } });
    const account = await prisma.adAccount.findFirstOrThrow({
      where: { userId: user.id, platform: "GOOGLE" },
      include: { targets: true },
    });
    // Force a beat: CPA well below scale threshold.
    await prisma.metricSnapshot.create({
      data: { adAccountId: account.id, spend: 100, cpa: 18, conversions: 5.5, clicks: 60 },
    });

    const decision = await runAccountCheck(account);
    expect(decision.action).toBe("propose_scale");

    // Account stays ACTIVE — scaling is approval-gated, never auto-applied.
    const refreshed = await prisma.adAccount.findUniqueOrThrow({ where: { id: account.id } });
    expect(refreshed.status).toBe("ACTIVE");

    const proposal = await prisma.automationEvent.findFirstOrThrow({
      where: { adAccountId: account.id, type: "SCALE_PROPOSAL" },
    });
    expect(proposal.status).toBe("PENDING");
    expect(proposal.proposedPct).toBeGreaterThan(0);
  });
});
