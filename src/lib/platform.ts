import type { AdAccount } from "@prisma/client";

/**
 * Platform action layer — pause campaigns / apply budget changes.
 *
 * Demo accounts are a no-op at the API boundary (state changes live in our DB).
 * Real accounts route to the Google Ads / Meta Marketing clients. Those live
 * calls require connected OAuth tokens + platform approval; until wired they
 * throw a clear, catchable error so the engine can log a POLL_ERROR without
 * corrupting local state.
 */

export async function pauseAccountCampaigns(account: AdAccount): Promise<void> {
  if (account.isDemo) return;
  const { pauseCampaigns } = await import("@/lib/platforms/router");
  await pauseCampaigns(account);
}

export async function applyScale(account: AdAccount, pct: number): Promise<void> {
  if (account.isDemo) return;
  const { scaleBudgets } = await import("@/lib/platforms/router");
  await scaleBudgets(account, pct);
}
