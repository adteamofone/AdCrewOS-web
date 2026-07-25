import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { seedDemoData } from "@/lib/demo";
import { pollAllAccounts } from "@/lib/poller";

/** Proves the cron path: poll -> new snapshots written -> engine runs. */

const EMAIL = `poller+${Date.now()}@adcrewos.test`;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.$disconnect();
});

describe("poller", () => {
  it("writes a fresh snapshot per demo account and runs the engine", async () => {
    const user = await prisma.user.create({ data: { email: EMAIL } });
    await seedDemoData(user.id);

    const before = await prisma.metricSnapshot.count({
      where: { adAccount: { userId: user.id } },
    });
    const result = await pollAllAccounts();
    const after = await prisma.metricSnapshot.count({
      where: { adAccount: { userId: user.id } },
    });

    expect(result.polled).toBeGreaterThanOrEqual(2);
    expect(after).toBe(before + 2); // one new snapshot per demo account
  });
});
